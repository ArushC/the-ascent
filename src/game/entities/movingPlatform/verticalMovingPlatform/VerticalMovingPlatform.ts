import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  type VerticalMovingPlatform as VerticalMovingPlatformEntity,
} from "../../platform/Platform";
import { drawPlatformPowerup } from "../../powerup/Powerup";
import { drawPlatformSpring } from "../../spring/Spring";
import { constrainVerticalMovementToBounds } from "../movementBounds/movementBounds";
import {
  generateRandomMovingPlatformTravelDistance,
  generateRandomMovingPlatformVelocity,
} from "../random/random";

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
  readonly hasSpring: boolean;
  springActivationMs: number;
  hasPowerup: boolean;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityY: number,
    minY: number,
    maxY: number,
    hasSpring = false,
    hasPowerup = false,
  ) {
    this.x = x;
    this.y = y;
    this.previousY = y;
    this.width = width;
    this.height = height;
    this.velocityY = velocityY;
    this.minY = minY;
    this.maxY = maxY;
    this.hasSpring = hasSpring;
    this.springActivationMs = 0;
    this.hasPowerup = hasPowerup;
  }

  update(deltaTime: number, _canvasWidth: number): void {
    this.previousY = this.y;
    this.y += this.velocityY * deltaTime;

    constrainVerticalMovementToBounds(this);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = VERTICAL_MOVING_PLATFORM_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    drawPlatformSpring(ctx, this);
    drawPlatformPowerup(ctx, this);
  }
}

export function createVerticalMovingPlatform(
  x: number,
  y: number,
  velocityY = generateRandomMovingPlatformVelocity(),
  travelDistance = generateRandomMovingPlatformTravelDistance(),
  hasSpring = false,
  hasPowerup = false,
  width = DEFAULT_PLATFORM_WIDTH,
): VerticalMovingPlatform {
  const halfTravelDistance = travelDistance / 2;

  return new VerticalMovingPlatform(
    x,
    y,
    width,
    DEFAULT_PLATFORM_HEIGHT,
    velocityY,
    y - halfTravelDistance,
    y + halfTravelDistance,
    hasSpring,
    hasPowerup,
  );
}
