import { createPlayer, type Player } from "./entities/player/Player";
import type { Platform } from "./entities/platform/Platform";
import {
  getMonsterKillPoints,
  type Monster,
} from "./entities/monster/Monster";
import {
  createProjectile,
  type Projectile,
} from "./entities/projectile/Projectile";
import { updatePlatformSpringAnimations } from "./entities/spring/Spring";
import { KeyboardInput } from "./input/keyboardInput/KeyboardInput";
import {
  createPowerupInventory,
  isArmorPowerupReady,
  isBigShotArmed,
  isBigShotPowerupReady,
  isDoubleJumpPowerupReady,
  isRocketPowerupReady,
  isShrinkPowerupReady,
  isSlowMoPowerupReady,
  type PowerupInventory,
} from "./powerups/powerupInventory/PowerupInventory";
import {
  ARMOR_POWERUP_ID,
  BIG_SHOT_POWERUP_ID,
  DOUBLE_JUMP_POWERUP_ID,
  ROCKET_POWERUP_ID,
  SHRINK_POWERUP_ID,
  SLOW_MO_POWERUP_ID,
} from "./powerups/powerupCatalog/PowerupCatalog";
import {
  createPowerupUsageHistory,
  recordPowerupUse,
  type PowerupUsageHistory,
} from "./powerups/powerupUsageHistory/PowerupUsageHistory";
import {
  getPowerupPanelState,
  type PowerupPanelState,
} from "./powerups/powerupPanelState/powerupPanelState";
import {
  playerCollidesWithMonster,
  resolveArmoredMonsterCollision,
  resolveProjectileMonsterCollisions,
  resolvePlatformLanding,
} from "./systems/collisionSystem/CollisionSystem";
import {
  ASCENDED_CLEAR_COLOR,
  createAscensionUiState,
  createAscensionState,
  hasAscensionUiChanged,
  isBlankSpawnActive,
  removeEntitiesAboveCamera,
  updateAscensionForFrame,
  type AscensionState,
  type AscensionUiState,
} from "./systems/ascensionSystem/AscensionSystem";
import { hasMetAscensionWinConditions } from "./systems/ascensionSystem/ascensionWinConditions/AscensionWinConditions";
import { isPlayerBelowScreen, updateCamera } from "./systems/cameraSystem/CameraSystem";
import { getDifficultyParams } from "./systems/difficultySystem/DifficultySystem";
import {
  createInitialPlatforms,
  updatePlatformsForCamera,
} from "./systems/platformSpawner/PlatformSpawner";
import { updateMovingPlatforms } from "./systems/platformMovementSystem/PlatformMovementSystem";
import { updateMonsters } from "./systems/monsterMovementSystem/MonsterMovementSystem";
import {
  createInitialMonsters,
  updateMonstersForCamera,
} from "./systems/monsterSpawner/MonsterSpawner";
import {
  applyHorizontalWrap,
  updatePlayerPhysics,
} from "./systems/physicsSystem/PhysicsSystem";
import {
  removeOffScreenProjectiles,
  updateProjectiles as moveProjectiles,
} from "./systems/projectileSystem/ProjectileSystem";
import { updatePowerups } from "./systems/powerupSystem/PowerupSystem";
import {
  awardBonusPoints,
  createScoreState,
  getScore,
  updateScore,
  type ScoreState,
} from "./systems/scoreSystem/ScoreSystem";
import {
  createMathRng,
  createSeededRng,
  type Rng,
} from "./rng/seededRng/SeededRng";
import type {
  ChallengeModifiers,
  DailyChallenge,
} from "../../shared/dailyChallenge/types.ts";

const MAX_DELTA_MS = 50;
const NORMAL_TIME_SCALE = 1;
const SLOW_MO_TIME_SCALE = 0.4 * NORMAL_TIME_SCALE;

export type GamePhase = "ready" | "playing" | "paused" | "over";
/** Classic is the unmodified base game; daily applies a seeded challenge. */
export type RunMode = "classic" | "daily";

export type GameUiState = {
  phase: GamePhase;
  runMode: RunMode;
  dailyTitle: string | null;
  score: number;
  powerupPanel: PowerupPanelState;
  helpOpen: boolean;
  ascension: AscensionUiState;
};

export type GameControls = {
  beginRun: () => void;
  beginDailyRun: (challenge: DailyChallenge) => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  returnHome: () => void;
  toggleHelp: () => void;
  closeHelp: () => void;
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
  private projectiles: Projectile[] = [];
  private powerupInventory: PowerupInventory = createPowerupInventory();
  private powerupUsageHistory: PowerupUsageHistory =
    createPowerupUsageHistory();
  private readonly keyboardInput = new KeyboardInput();
  private timeScale = NORMAL_TIME_SCALE;
  private screenTopY = 0;
  private scoreState: ScoreState;
  private ascensionState: AscensionState = createAscensionState();
  private hasBouncedOnSpring = false;
  private phase: GamePhase = "ready";
  private helpOpen = false;
  private rng: Rng = createMathRng();
  private runMode: RunMode = "classic";
  private activeChallenge: DailyChallenge | null = null;

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
    this.platforms = createInitialPlatforms(
      canvas.width,
      canvas.height,
      getDifficultyParams(0),
      this.rng,
    );
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

    this.runMode = "classic";
    this.activeChallenge = null;
    this.rng = createMathRng();
    this.timeScale = NORMAL_TIME_SCALE;
    this.helpOpen = false;
    this.setPhase("playing");
  }

  beginDailyRun(challenge: DailyChallenge): void {
    if (this.phase !== "ready") return;

    this.runMode = "daily";
    this.activeChallenge = challenge;
    this.rng = createSeededRng(challenge.seed);
    this.helpOpen = false;
    this.resetWorld();
    this.setPhase("playing");
  }

  pause(): void {
    if (this.phase !== "playing") return;

    this.setPhase("paused");
  }

  resume(): void {
    if (this.phase !== "paused") return;

    this.helpOpen = false;
    this.setPhase("playing");
  }

  restart(): void {
    if (this.phase !== "paused" && this.phase !== "over") return;

    this.rng =
      this.runMode === "daily" && this.activeChallenge
        ? createSeededRng(this.activeChallenge.seed)
        : createMathRng();
    this.helpOpen = false;
    this.resetWorld();
    this.setPhase("playing");
  }

  returnHome(): void {
    if (this.phase === "ready") return;

    this.runMode = "classic";
    this.activeChallenge = null;
    this.rng = createMathRng();
    this.helpOpen = false;
    this.resetWorld();
    this.setPhase("ready");
  }

  toggleHelp(): void {
    if (this.phase === "playing") {
      this.pause();
      this.helpOpen = true;
      this.publishCurrentUiState();
      return;
    }

    this.helpOpen = !this.helpOpen;
    this.publishCurrentUiState();
  }

  closeHelp(): void {
    if (!this.helpOpen) return;

    this.helpOpen = false;
    this.publishCurrentUiState();
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

    if (keyPresses.help) {
      this.toggleHelp();
    }

    if (keyPresses.start) {
      this.beginRun();
    }

    // Armor and rocket mode block shooting while active.
    if (
      keyPresses.shoot &&
      !startedFromReady &&
      this.phase === "playing" &&
      !this.player.armor.equipped &&
      !this.player.rocket.active &&
      this.player.canShoot()
    ) {
      this.projectiles.push(createProjectile(this.player));
      this.player.recordShot();
      if (this.player.projectile.sizeMode === "large") {
        recordPowerupUse(this.powerupUsageHistory, BIG_SHOT_POWERUP_ID);
      }
    }

    if (
      keyPresses.powerupShortcuts.shrink &&
      this.phase === "playing" &&
      isShrinkPowerupReady(this.powerupInventory)
    ) {
      this.player.toggleSize();
      recordPowerupUse(this.powerupUsageHistory, SHRINK_POWERUP_ID);
    }

    if (
      keyPresses.powerupShortcuts.slowMo &&
      this.phase === "playing" &&
      isSlowMoPowerupReady(this.powerupInventory)
    ) {
      this.toggleTimeScale();
      recordPowerupUse(this.powerupUsageHistory, SLOW_MO_POWERUP_ID);
    }

    if (
      keyPresses.powerupShortcuts.armor &&
      this.phase === "playing" &&
      isArmorPowerupReady(this.powerupInventory)
    ) {
      this.player.toggleArmor();
      recordPowerupUse(this.powerupUsageHistory, ARMOR_POWERUP_ID);
    }

    if (
      keyPresses.powerupShortcuts.doubleJump &&
      this.phase === "playing" &&
      isDoubleJumpPowerupReady(this.powerupInventory)
    ) {
      if (this.player.tryAirJump()) {
        recordPowerupUse(this.powerupUsageHistory, DOUBLE_JUMP_POWERUP_ID);
      }
    }

    if (
      keyPresses.powerupShortcuts.bigShot &&
      this.phase === "playing" &&
      isBigShotPowerupReady(this.powerupInventory)
    ) {
      this.player.toggleProjectileSize();
      this.publishCurrentUiState();
    }

    if (
      keyPresses.powerupShortcuts.rocket &&
      this.phase === "playing" &&
      isRocketPowerupReady(this.powerupInventory)
    ) {
      this.player.toggleRocket();
      recordPowerupUse(this.powerupUsageHistory, ROCKET_POWERUP_ID);
    }

    if (keyPresses.pauseOrResume && !startedFromReady) {
      if (this.helpOpen) {
        this.closeHelp();
        return;
      }

      this.applyPauseOrResumeShortcut();
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

    const simDt = deltaTime * this.timeScale;
    const horizontalIntent = this.keyboardInput.getHorizontalIntent();
    const scoreBeforeUpdate = getScore(this.scoreState);
    const ascensionBeforeUpdate = this.getAscensionUiState();

    this.player.updateShootCooldown(simDt);
    this.updateProjectiles(simDt);

    updateMonsters(this.monsters, simDt, this.canvas.width);
    updateMovingPlatforms(this.platforms, simDt, this.canvas.width);
    updatePlatformSpringAnimations(this.platforms, simDt);
    const previousY = this.player.y;
    updatePlayerPhysics(this.player, simDt, horizontalIntent);
    applyHorizontalWrap(this.player, this.canvas.width);
    const powerupUpdate = updatePowerups(
      this.player,
      this.platforms,
      this.powerupInventory,
      simDt,
      this.rng,
    );
    this.powerupInventory = powerupUpdate.inventory;
    if (powerupUpdate.didLoseReadyShrinkPowerup) {
      this.player.resetSize();
    }
    if (powerupUpdate.didLoseReadySlowMoPowerup) {
      this.timeScale = NORMAL_TIME_SCALE;
    }
    if (powerupUpdate.didLoseReadyArmorPowerup) {
      this.player.resetArmor();
    }
    if (powerupUpdate.didLoseReadyBigShotPowerup) {
      this.player.resetProjectileSize();
    }
    if (powerupUpdate.didLoseReadyRocketPowerup) {
      this.player.resetRocket();
    }
    if (resolvePlatformLanding(this.player, this.platforms, previousY)) {
      this.hasBouncedOnSpring = true;
    }

    if (this.player.armor.equipped) {
      resolveArmoredMonsterCollision(this.player, this.monsters);
    } else if (
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
    this.updateAscension();
    const difficultyParams = getDifficultyParams(
      getScore(this.scoreState),
      this.getActiveModifiers(),
    );
    const spawnEnabled = !isBlankSpawnActive(this.ascensionState);
    this.monsters = updateMonstersForCamera(
      this.monsters,
      this.screenTopY,
      this.canvas.width,
      this.canvas.height,
      difficultyParams,
      spawnEnabled,
      this.rng,
    );
    this.platforms = updatePlatformsForCamera(
      this.platforms,
      this.screenTopY,
      this.canvas.width,
      this.canvas.height,
      difficultyParams,
      spawnEnabled,
      this.rng,
      this.getActiveModifiers(),
    );
    this.projectiles = removeOffScreenProjectiles(this.projectiles, {
      screenTopY: this.screenTopY,
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
    });

    if (
      isPlayerBelowScreen(this.player.y, this.screenTopY, this.canvas.height)
    ) {
      this.setPhase("over");
      return;
    }

    if (
      getScore(this.scoreState) !== scoreBeforeUpdate ||
      powerupUpdate.didPanelStateChange ||
      hasAscensionUiChanged(ascensionBeforeUpdate, this.getAscensionUiState())
    ) {
      this.publishCurrentUiState();
    }
  }

  private updateAscension(): void {
    const update = updateAscensionForFrame(
      this.ascensionState,
      hasMetAscensionWinConditions({
        powerupUsageHistory: this.powerupUsageHistory,
        powerupInventory: this.powerupInventory,
        score: getScore(this.scoreState),
        hasBouncedOnSpring: this.hasBouncedOnSpring,
      }),
      this.scoreState.peakY,
      this.canvas.height,
    );

    this.ascensionState = update.state;

    if (update.didBegin) {
      this.clearEntitiesAboveCamera();
    }
  }

  private clearEntitiesAboveCamera(): void {
    this.platforms = removeEntitiesAboveCamera(
      this.platforms,
      this.screenTopY,
    );
    this.monsters = removeEntitiesAboveCamera(this.monsters, this.screenTopY);
  }

  private updateProjectiles(deltaTime: number): void {
    moveProjectiles(this.projectiles, deltaTime);
    const projectileCollisionResult = resolveProjectileMonsterCollisions(
      this.projectiles,
      this.monsters,
    );
    this.projectiles = projectileCollisionResult.projectiles;
    this.monsters = projectileCollisionResult.monsters;
    this.scoreState = awardBonusPoints(
      this.scoreState,
      getMonsterKillPoints(projectileCollisionResult.killCount),
    );
  }

  private toggleTimeScale(): void {
    this.timeScale =
      this.timeScale === NORMAL_TIME_SCALE
        ? SLOW_MO_TIME_SCALE
        : NORMAL_TIME_SCALE;
  }

  private render(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = this.getAscensionUiState().messageReady
      ? ASCENDED_CLEAR_COLOR
      : "black";
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

    for (const projectile of this.projectiles) {
      projectile.draw(ctx);
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
      getDifficultyParams(0, this.getActiveModifiers()),
      this.rng,
      this.getActiveModifiers(),
    );
    this.monsters = createInitialMonsters();
    this.projectiles = [];
    this.powerupInventory = createPowerupInventory();
    this.powerupUsageHistory = createPowerupUsageHistory();
    this.ascensionState = createAscensionState();
    this.hasBouncedOnSpring = false;
    this.timeScale = NORMAL_TIME_SCALE;
    this.screenTopY = 0;
  }

  private setPhase(phase: GamePhase): void {
    if (this.phase === phase) return;

    this.phase = phase;
    this.publishCurrentUiState();
  }

  private publishCurrentUiState(): void {
    const bigShotArmed = isBigShotArmed(
      this.powerupInventory,
      this.player.projectile.sizeMode,
    );

    this.publishUiState({
      phase: this.phase,
      runMode: this.runMode,
      dailyTitle: this.activeChallenge?.title ?? null,
      score: getScore(this.scoreState),
      powerupPanel: getPowerupPanelState(this.powerupInventory, bigShotArmed),
      helpOpen: this.helpOpen,
      ascension: this.getAscensionUiState(),
    });
  }

  private getAscensionUiState(): GameUiState["ascension"] {
    return createAscensionUiState(this.ascensionState);
  }

  private getActiveModifiers(): ChallengeModifiers | undefined {
    return this.activeChallenge?.modifiers;
  }
}
