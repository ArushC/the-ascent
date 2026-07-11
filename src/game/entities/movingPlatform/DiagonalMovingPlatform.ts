import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  type DiagonalMovingPlatform as DiagonalMovingPlatformEntity,
} from "../Platform";
import {
  constrainHorizontalMovementToBounds,
  constrainVerticalMovementToBounds,
} from "./movementBounds";
import {
  generateRandomMovingPlatformTravelDistance,
  generateRandomMovingPlatformVelocity,
} from "./random";

const DIAGONAL_MOVING_PLATFORM_COLOR = "orange";

export class DiagonalMovingPlatform implements DiagonalMovingPlatformEntity {
  readonly kind = "diagonalMoving";
  x: number;
  y: number;
  previousY: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityX: number,
    velocityY: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  ) {
    this.x = x;
    this.y = y;
    this.previousY = y;
    this.width = width;
    this.height = height;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
  }

  update(deltaTime: number, canvasWidth: number): void {
    this.x += this.velocityX * deltaTime;
    this.previousY = this.y;
    this.y += this.velocityY * deltaTime;

    constrainHorizontalMovementToBounds(this, canvasWidth);
    constrainVerticalMovementToBounds(this);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = DIAGONAL_MOVING_PLATFORM_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export function createDiagonalMovingPlatform(
  x: number,
  y: number,
  velocityX = generateRandomMovingPlatformVelocity(),
  velocityY = generateRandomMovingPlatformVelocity(),
  travelDistance = generateRandomMovingPlatformTravelDistance(),
): DiagonalMovingPlatform {
  const halfTravelDistance = travelDistance / 2;

  return new DiagonalMovingPlatform(
    x,
    y,
    DEFAULT_PLATFORM_WIDTH,
    DEFAULT_PLATFORM_HEIGHT,
    velocityX,
    velocityY,
    x - halfTravelDistance,
    x + halfTravelDistance,
    y - halfTravelDistance,
    y + halfTravelDistance,
  );
}
