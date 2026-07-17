import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  type HorizontalMovingPlatform as HorizontalMovingPlatformEntity,
} from "../../platform/Platform";
import { drawPlatformPowerup } from "../../powerup/Powerup";
import { drawPlatformSpring } from "../../spring/Spring";
import { constrainHorizontalMovementToBounds } from "../movementBounds/movementBounds";
import {
  generateRandomMovingPlatformTravelDistance,
  generateRandomMovingPlatformVelocity,
} from "../random/random";
import { createMathRng, type Rng } from "../../../rng/seededRng/SeededRng";

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
  readonly hasSpring: boolean;
  springActivationMs: number;
  hasPowerup: boolean;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityX: number,
    minX: number,
    maxX: number,
    hasSpring = false,
    hasPowerup = false,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = velocityX;
    this.minX = minX;
    this.maxX = maxX;
    this.hasSpring = hasSpring;
    this.springActivationMs = 0;
    this.hasPowerup = hasPowerup;
  }

  update(deltaTime: number, canvasWidth: number): void {
    this.x += this.velocityX * deltaTime;

    constrainHorizontalMovementToBounds(this, canvasWidth);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = HORIZONTAL_MOVING_PLATFORM_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    drawPlatformSpring(ctx, this);
    drawPlatformPowerup(ctx, this);
  }
}

export function createHorizontalMovingPlatform(
  x: number,
  y: number,
  velocityX?: number,
  travelDistance?: number,
  hasSpring = false,
  hasPowerup = false,
  width = DEFAULT_PLATFORM_WIDTH,
  rng: Rng = createMathRng(),
): HorizontalMovingPlatform {
  // Provided values win, missing movement uses rng
  const resolvedVelocityX =
    velocityX ?? generateRandomMovingPlatformVelocity(rng);
  const resolvedTravelDistance =
    travelDistance ?? generateRandomMovingPlatformTravelDistance(rng);
  const halfTravelDistance = resolvedTravelDistance / 2;

  return new HorizontalMovingPlatform(
    x,
    y,
    width,
    DEFAULT_PLATFORM_HEIGHT,
    resolvedVelocityX,
    x - halfTravelDistance,
    x + halfTravelDistance,
    hasSpring,
    hasPowerup,
  );
}
