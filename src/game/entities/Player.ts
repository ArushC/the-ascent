import { INITIAL_JUMP_VELOCITY } from "../systems/PhysicsSystem";

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40;
const SMALL_PLAYER_WIDTH = PLAYER_WIDTH / 2;
const SMALL_PLAYER_HEIGHT = PLAYER_HEIGHT / 2;
const PLAYER_COLOR = "red";
const ARMOR_STROKE_COLOR = "white";
const ARMOR_STROKE_WIDTH = 3;
const ROCKET_HULL_STROKE_COLOR = "white";
const ROCKET_HULL_STROKE_WIDTH = 1;
const ROCKET_THRUSTER_COLOR = "orange";
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
export type PlayerRocketState = {
  active: boolean;
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
  rocket: PlayerRocketState = {
    active: false,
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

    if (this.rocket.active) {
      this.drawRocket(ctx);
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

  toggleRocket(): void {
    this.rocket.active = !this.rocket.active;
  }

  resetRocket(): void {
    this.rocket.active = false;
  }

  toggleProjectileSize(): void {
    this.projectile.sizeMode =
      this.projectile.sizeMode === "default" ? "large" : "default";
  }

  resetProjectileSize(): void {
    this.projectile.sizeMode = "default";
  }

  canShoot(): boolean {
    if (this.rocket.active) return false;

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

  private drawRocket(ctx: CanvasRenderingContext2D): void {
    const centerX = this.x + this.width / 2;
    const noseHeight = this.height * 0.3;
    const thrusterWidth = this.width * 0.18;
    const thrusterHeight = this.height * 0.22;
    const thrusterInset = this.width * 0.22;
    const bottomY = this.y + this.height;

    ctx.strokeStyle = ROCKET_HULL_STROKE_COLOR;
    ctx.lineWidth = ROCKET_HULL_STROKE_WIDTH;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = ROCKET_HULL_STROKE_COLOR;
    ctx.beginPath();
    ctx.moveTo(centerX, this.y - noseHeight);
    ctx.lineTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = ROCKET_THRUSTER_COLOR;
    this.drawThruster(
      ctx,
      this.x + thrusterInset,
      bottomY,
      thrusterWidth,
      thrusterHeight,
    );
    this.drawThruster(
      ctx,
      this.x + this.width - thrusterInset - thrusterWidth,
      bottomY,
      thrusterWidth,
      thrusterHeight,
    );
  }

  private drawThruster(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width / 2, y + height);
    ctx.closePath();
    ctx.fill();
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
