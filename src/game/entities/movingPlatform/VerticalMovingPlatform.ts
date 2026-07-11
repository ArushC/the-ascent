import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  type VerticalMovingPlatform as VerticalMovingPlatformEntity,
} from "../Platform";
import { constrainVerticalMovementToBounds } from "./movementBounds";
import {
  generateRandomMovingPlatformTravelDistance,
  generateRandomMovingPlatformVelocity,
} from "./random";

const VERTICAL_MOVING_PLATFORM_COLOR = "purple";

export class VerticalMovingPlatform implements VerticalMovingPlatformEntity {
  readonly kind = "verticalMoving";
  x: number;
  y: number;
  previousY: number;
  width: number;
  height: number;
  velocityY: number;
  minY: number;
  maxY: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityY: number,
    minY: number,
    maxY: number,
  ) {
    this.x = x;
    this.y = y;
    this.previousY = y;
    this.width = width;
    this.height = height;
    this.velocityY = velocityY;
    this.minY = minY;
    this.maxY = maxY;
  }

  update(deltaTime: number, _canvasWidth: number): void {
    this.previousY = this.y;
    this.y += this.velocityY * deltaTime;

    constrainVerticalMovementToBounds(this);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = VERTICAL_MOVING_PLATFORM_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export function createVerticalMovingPlatform(
  x: number,
  y: number,
  velocityY = generateRandomMovingPlatformVelocity(),
  travelDistance = generateRandomMovingPlatformTravelDistance(),
): VerticalMovingPlatform {
  const halfTravelDistance = travelDistance / 2;

  return new VerticalMovingPlatform(
    x,
    y,
    DEFAULT_PLATFORM_WIDTH,
    DEFAULT_PLATFORM_HEIGHT,
    velocityY,
    y - halfTravelDistance,
    y + halfTravelDistance,
  );
}
