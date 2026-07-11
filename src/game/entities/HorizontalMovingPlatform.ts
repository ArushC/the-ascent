import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  type Platform,
} from "./Platform";

const MOVING_PLATFORM_COLOR = "blue";

export const MIN_MOVING_PLATFORM_SPEED = 0.07;
export const MAX_MOVING_PLATFORM_SPEED = 0.11;

export class HorizontalMovingPlatform implements Platform {
  readonly kind = "horizontalMoving";
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityX: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = velocityX;
  }

  update(deltaTime: number, canvasWidth: number): void {
    this.x += this.velocityX * deltaTime;

    if (this.x < 0) {
      this.x = 0;
      this.velocityX = Math.abs(this.velocityX);
    } else if (this.x + this.width > canvasWidth) {
      this.x = Math.max(0, canvasWidth - this.width);
      this.velocityX = -Math.abs(this.velocityX);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = MOVING_PLATFORM_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export function createHorizontalMovingPlatform(
  x: number,
  y: number,
  velocityX = generateRandomVelocityX(),
): HorizontalMovingPlatform {
  return new HorizontalMovingPlatform(
    x,
    y,
    DEFAULT_PLATFORM_WIDTH,
    DEFAULT_PLATFORM_HEIGHT,
    velocityX,
  );
}

function generateRandomVelocityX(): number {
  const speed =
    MIN_MOVING_PLATFORM_SPEED +
    Math.random() * (MAX_MOVING_PLATFORM_SPEED - MIN_MOVING_PLATFORM_SPEED);
  const direction = Math.random() < 0.5 ? -1 : 1;

  return speed * direction;
}
