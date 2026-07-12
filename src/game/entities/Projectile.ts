import type { Player } from "./Player";

export const DEFAULT_PROJECTILE_WIDTH = 8;
export const DEFAULT_PROJECTILE_HEIGHT = 16;
export const LARGE_PROJECTILE_WIDTH = DEFAULT_PROJECTILE_WIDTH * 3;
export const LARGE_PROJECTILE_HEIGHT = DEFAULT_PROJECTILE_HEIGHT * 3;
export const PROJECTILE_SPEED = 0.7;

const PROJECTILE_COLOR = "yellow";

export class Projectile {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityY: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityY = velocityY;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = PROJECTILE_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export function createProjectile(player: Player): Projectile {
  const width =
    player.projectile.sizeMode === "large"
      ? LARGE_PROJECTILE_WIDTH
      : DEFAULT_PROJECTILE_WIDTH;
  const height =
    player.projectile.sizeMode === "large"
      ? LARGE_PROJECTILE_HEIGHT
      : DEFAULT_PROJECTILE_HEIGHT;

  return new Projectile(
    player.x + player.width / 2 - width / 2,
    player.y,
    width,
    height,
    -PROJECTILE_SPEED,
  );
}
