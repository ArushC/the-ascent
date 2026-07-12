import type { Player } from "./Player";

export const PROJECTILE_WIDTH = 8;
export const PROJECTILE_HEIGHT = 16;
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
  return new Projectile(
    player.x + player.width / 2 - PROJECTILE_WIDTH / 2,
    player.y,
    PROJECTILE_WIDTH,
    PROJECTILE_HEIGHT,
    -PROJECTILE_SPEED,
  );
}
