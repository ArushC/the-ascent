import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  type HorizontalMovingPlatform as HorizontalMovingPlatformEntity,
} from "../Platform";
import { constrainHorizontalMovementToBounds } from "./movementBounds";
import {
  generateRandomMovingPlatformTravelDistance,
  generateRandomMovingPlatformVelocity,
} from "./random";

const HORIZONTAL_MOVING_PLATFORM_COLOR = "blue";

export class HorizontalMovingPlatform
  implements HorizontalMovingPlatformEntity
{
  readonly kind = "horizontalMoving";
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  minX: number;
  maxX: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityX: number,
    minX: number,
    maxX: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = velocityX;
    this.minX = minX;
    this.maxX = maxX;
  }

  update(deltaTime: number, canvasWidth: number): void {
    this.x += this.velocityX * deltaTime;

    constrainHorizontalMovementToBounds(this, canvasWidth);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = HORIZONTAL_MOVING_PLATFORM_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export function createHorizontalMovingPlatform(
  x: number,
  y: number,
  velocityX = generateRandomMovingPlatformVelocity(),
  travelDistance = generateRandomMovingPlatformTravelDistance(),
): HorizontalMovingPlatform {
  const halfTravelDistance = travelDistance / 2;

  return new HorizontalMovingPlatform(
    x,
    y,
    DEFAULT_PLATFORM_WIDTH,
    DEFAULT_PLATFORM_HEIGHT,
    velocityX,
    x - halfTravelDistance,
    x + halfTravelDistance,
  );
}
