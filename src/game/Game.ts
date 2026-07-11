import { createPlayer, type Player } from "./entities/Player";
import type { Platform } from "./entities/Platform";
import type { Monster } from "./entities/Monster";
import { updatePlatformSpringAnimations } from "./entities/Spring";
import { KeyboardInput } from "./input/KeyboardInput";
import {
  playerCollidesWithMonster,
  resolvePlatformLanding,
} from "./systems/CollisionSystem";
import { isPlayerBelowScreen, updateCamera } from "./systems/CameraSystem";
import {
  createInitialPlatforms,
  updatePlatformsForCamera,
} from "./systems/PlatformSpawner";
import { updateMovingPlatforms } from "./systems/PlatformMovementSystem";
import { updateMonsters } from "./systems/MonsterMovementSystem";
import {
  createInitialMonsters,
  updateMonstersForCamera,
} from "./systems/MonsterSpawner";
import {
  applyHorizontalWrap,
  updatePlayerPhysics,
} from "./systems/PhysicsSystem";
import {
  createScoreState,
  getScore,
  updateScore,
  type ScoreState,
} from "./systems/ScoreSystem";

const MAX_DELTA_MS = 50;

export type GamePhase = "ready" | "playing" | "paused" | "over";

export type GameUiState = {
  phase: GamePhase;
  score: number;
};

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private readonly publishUiState: (uiState: GameUiState) => void;
  private running = false;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private player: Player;
  private platforms: Platform[];
  private monsters: Monster[];
  private readonly keyboardInput = new KeyboardInput();
  private screenTopY = 0;
  private scoreState: ScoreState;
  private phase: GamePhase = "ready";

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    publishUiState: (uiState: GameUiState) => void,
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.publishUiState = publishUiState;
    this.player = createPlayer(canvas);
    this.scoreState = createScoreState(this.player.y);
    this.platforms = createInitialPlatforms(canvas.width, canvas.height);
    this.monsters = createInitialMonsters();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    this.keyboardInput.destroy();

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  beginRun(): void {
    if (this.phase !== "ready") return;

    this.setPhase("playing");
  }

  pause(): void {
    if (this.phase !== "playing") return;

    this.setPhase("paused");
  }

  resume(): void {
    if (this.phase !== "paused") return;

    this.setPhase("playing");
  }

  restart(): void {
    if (this.phase !== "paused" && this.phase !== "over") return;

    this.resetWorld();
    this.setPhase("playing");
  }

  private tick = (timestamp: number): void => {
    const deltaTime = Math.min(timestamp - this.lastTimestamp, MAX_DELTA_MS);
    this.lastTimestamp = timestamp;

    this.applyKeyboardShortcuts();
    this.update(deltaTime);
    this.render();

    if (this.running) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  private applyKeyboardShortcuts(): void {
    const keyPresses = this.keyboardInput.consumePhaseKeyPresses();

    const startedFromReady = keyPresses.start && this.phase === "ready";

    if (keyPresses.start) {
      this.beginRun();
    }

    if (keyPresses.pauseOrResume && !startedFromReady) {
      this.applyPauseOrResumeShortcut();
    }

    if (keyPresses.restart) {
      this.restart();
    }
  }

  private applyPauseOrResumeShortcut(): void {
    switch (this.phase) {
      case "ready":
        this.beginRun();
        break;
      case "playing":
        this.pause();
        break;
      case "paused":
        this.resume();
        break;
      case "over":
        break;
    }
  }

  private update(deltaTime: number): void {
    if (this.phase !== "playing") return;

    const horizontalIntent = this.keyboardInput.getHorizontalIntent();
    const scoreBeforeUpdate = getScore(this.scoreState);

    updateMonsters(this.monsters, deltaTime, this.canvas.width);
    updateMovingPlatforms(this.platforms, deltaTime, this.canvas.width);
    updatePlatformSpringAnimations(this.platforms, deltaTime);
    const previousY = this.player.y;
    updatePlayerPhysics(this.player, deltaTime, horizontalIntent);
    applyHorizontalWrap(this.player, this.canvas.width);
    resolvePlatformLanding(this.player, this.platforms, previousY);

    if (
      this.monsters.some((monster) =>
        playerCollidesWithMonster(this.player, monster),
      )
    ) {
      this.setPhase("over");
      return;
    }

    this.screenTopY = updateCamera(
      this.screenTopY,
      this.player.y,
      this.canvas.height,
    );
    this.scoreState = updateScore(this.scoreState, this.player.y);
    this.monsters = updateMonstersForCamera(
      this.monsters,
      this.screenTopY,
      this.canvas.width,
      this.canvas.height,
    );
    this.platforms = updatePlatformsForCamera(
      this.platforms,
      this.screenTopY,
      this.canvas.width,
      this.canvas.height,
    );

    if (
      isPlayerBelowScreen(this.player.y, this.screenTopY, this.canvas.height)
    ) {
      this.setPhase("over");
      return;
    }

    if (getScore(this.scoreState) !== scoreBeforeUpdate) {
      this.publishCurrentUiState();
    }
  }

  private render(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save the unshifted canvas state before applying the camera offset.
    ctx.save();
    ctx.translate(0, -this.screenTopY);

    for (const platform of this.platforms) {
      platform.draw(ctx);
    }

    for (const monster of this.monsters) {
      monster.draw(ctx);
    }

    this.player.draw(ctx);

    ctx.restore();
  }

  private resetWorld(): void {
    this.player = createPlayer(this.canvas);
    this.scoreState = createScoreState(this.player.y);
    this.platforms = createInitialPlatforms(
      this.canvas.width,
      this.canvas.height,
    );
    this.monsters = createInitialMonsters();
    this.screenTopY = 0;
  }

  private setPhase(phase: GamePhase): void {
    if (this.phase === phase) return;

    this.phase = phase;
    this.publishCurrentUiState();
  }

  private publishCurrentUiState(): void {
    this.publishUiState({
      phase: this.phase,
      score: getScore(this.scoreState),
    });
  }
}
