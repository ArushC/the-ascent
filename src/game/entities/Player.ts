import { INITIAL_JUMP_VELOCITY } from "../systems/PhysicsSystem";

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40;
const SMALL_PLAYER_WIDTH = PLAYER_WIDTH / 2;
const SMALL_PLAYER_HEIGHT = PLAYER_HEIGHT / 2;
const PLAYER_COLOR = "red";
const ARMOR_STROKE_COLOR = "white";
const ARMOR_STROKE_WIDTH = 3;
export const BIG_SHOT_COOLDOWN_MS = 500;

export type PlayerSizeMode = "default" | "small";
export type ProjectileSizeMode = "default" | "large";
export type PlayerProjectileState = {
  sizeMode: ProjectileSizeMode;
  shootCooldownRemainingMs: number;
};
export type PlayerArmorState = {
  equipped: boolean;
  pendingKnockbackVx: number | null;
};

export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  sizeMode: PlayerSizeMode = "default";
  projectile: PlayerProjectileState = {
    sizeMode: "default",
    shootCooldownRemainingMs: 0,
  };
  airJumpAvailable = true;
  armor: PlayerArmorState = {
    equipped: false,
    pendingKnockbackVx: null,
  };

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityX: number,
    velocityY: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    if (this.armor.equipped) {
      ctx.strokeStyle = ARMOR_STROKE_COLOR;
      ctx.lineWidth = ARMOR_STROKE_WIDTH;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }

  toggleSize(): void {
    this.setSizeMode(this.sizeMode === "default" ? "small" : "default");
  }

  resetSize(): void {
    this.setSizeMode("default");
  }

  toggleArmor(): void {
    this.armor.equipped = !this.armor.equipped;
  }

  resetArmor(): void {
    this.armor.equipped = false;
    this.armor.pendingKnockbackVx = null;
  }

  toggleProjectileSize(): void {
    this.projectile.sizeMode =
      this.projectile.sizeMode === "default" ? "large" : "default";
  }

  resetProjectileSize(): void {
    this.projectile.sizeMode = "default";
  }

  canShoot(): boolean {
    return (
      this.projectile.sizeMode === "default" ||
      this.projectile.shootCooldownRemainingMs <= 0
    );
  }

  recordShot(): void {
    // Default shots are uncapped, so they clear any leftover big-shot cooldown.
    this.projectile.shootCooldownRemainingMs =
      this.projectile.sizeMode === "large" ? BIG_SHOT_COOLDOWN_MS : 0;
  }

  updateShootCooldown(deltaTime: number): void {
    this.projectile.shootCooldownRemainingMs = Math.max(
      0,
      this.projectile.shootCooldownRemainingMs - deltaTime,
    );
  }

  /** Action powerup helper: one mid-air jump per flight while double-jump is ready. */
  tryAirJump(): boolean {
    if (!this.airJumpAvailable) return false;

    this.velocityY = -INITIAL_JUMP_VELOCITY;
    this.airJumpAvailable = false;
    return true;
  }

  refreshAirJump(): void {
    this.airJumpAvailable = true;
  }

  private setSizeMode(sizeMode: PlayerSizeMode): void {
    if (this.sizeMode === sizeMode) return;

    const centerX = this.x + this.width / 2;
    const bottomY = this.y + this.height;
    const width = sizeMode === "small" ? SMALL_PLAYER_WIDTH : PLAYER_WIDTH;
    const height = sizeMode === "small" ? SMALL_PLAYER_HEIGHT : PLAYER_HEIGHT;

    this.sizeMode = sizeMode;
    this.width = width;
    this.height = height;
    this.x = centerX - width / 2;
    this.y = bottomY - height;
  }
}

export function createPlayer(canvas: HTMLCanvasElement): Player {
  return new Player(
    (canvas.width - PLAYER_WIDTH) / 2,
    canvas.height - PLAYER_HEIGHT,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    0,
    -INITIAL_JUMP_VELOCITY,
  );
}
