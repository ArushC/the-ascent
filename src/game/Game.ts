import { createPlayer, type Player } from "./entities/Player";
import type { StaticPlatform } from "./entities/StaticPlatform";
import { KeyboardInput, type HorizontalIntent } from "./input/KeyboardInput";
import { resolvePlatformLanding } from "./systems/CollisionSystem";
import { updateCamera } from "./systems/CameraSystem";
import {
  createInitialPlatforms,
  updatePlatformsForCamera,
} from "./systems/PlatformSpawner";
import { updatePlayerPhysics } from "./systems/PhysicsSystem";
import {
  createScoreState,
  getScore,
  updateScore,
  type ScoreState,
} from "./systems/ScoreSystem";

const MAX_DELTA_MS = 50;
const NO_HORIZONTAL_INPUT: HorizontalIntent = 0;
const SCORE_TEXT_COLOR = "white";
const SCORE_TEXT_FONT = "24px sans-serif";
const SCORE_TEXT_SCREEN_X = 16;
const SCORE_TEXT_SCREEN_Y = 32;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private player: Player;
  private staticPlatforms: StaticPlatform[];
  private keyboardInput: KeyboardInput | null = null;
  private screenTopY = 0;
  private scoreState: ScoreState;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.player = createPlayer(canvas);
    this.scoreState = createScoreState(this.player.y);
    this.staticPlatforms = createInitialPlatforms(canvas.width, canvas.height);
  }

  start(): void {
    if (this.running) return;
    this.keyboardInput = new KeyboardInput();
    this.running = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;

    if (this.keyboardInput !== null) {
      this.keyboardInput.destroy();
      this.keyboardInput = null;
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (timestamp: number): void => {
    const deltaTime = Math.min(timestamp - this.lastTimestamp, MAX_DELTA_MS);
    this.lastTimestamp = timestamp;

    this.update(deltaTime);
    this.render();

    if (this.running) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  private update(deltaTime: number): void {
    const horizontalIntent =
      this.keyboardInput?.getHorizontalIntent() ?? NO_HORIZONTAL_INPUT;
    const previousY = this.player.y;

    updatePlayerPhysics(this.player, deltaTime, horizontalIntent);
    resolvePlatformLanding(this.player, this.staticPlatforms, previousY);
    this.screenTopY = updateCamera(
      this.screenTopY,
      this.player.y,
      this.canvas.height,
    );
    this.scoreState = updateScore(this.scoreState, this.player.y);
    this.staticPlatforms = updatePlatformsForCamera(
      this.staticPlatforms,
      this.screenTopY,
      this.canvas.width,
      this.canvas.height,
    );
  }

  private render(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save the unshifted canvas state before applying the camera offset.
    ctx.save();
    ctx.translate(0, -this.screenTopY);

    for (const platform of this.staticPlatforms) {
      platform.draw(ctx);
    }

    this.player.draw(ctx);

    ctx.restore();

    ctx.fillStyle = SCORE_TEXT_COLOR;
    ctx.font = SCORE_TEXT_FONT;
    ctx.fillText(
      `Score: ${getScore(this.scoreState)}`,
      SCORE_TEXT_SCREEN_X,
      SCORE_TEXT_SCREEN_Y,
    );
  }
}
