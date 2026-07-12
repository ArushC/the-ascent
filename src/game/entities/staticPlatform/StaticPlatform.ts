import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  type Platform,
} from "../platform/Platform";
import { drawPlatformPowerup } from "../powerup/Powerup";
import { drawPlatformSpring } from "../spring/Spring";
const STATIC_PLATFORM_COLOR = "green";

export class StaticPlatform implements Platform {
  readonly kind = "static";
  x: number;
  y: number;
  width: number;
  height: number;
  readonly hasSpring: boolean;
  springActivationMs: number;
  hasPowerup: boolean;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    hasSpring = false,
    hasPowerup = false,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hasSpring = hasSpring;
    this.springActivationMs = 0;
    this.hasPowerup = hasPowerup;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = STATIC_PLATFORM_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    drawPlatformSpring(ctx, this);
    drawPlatformPowerup(ctx, this);
  }
}

export function createStaticPlatform(
  x: number,
  y: number,
  hasSpring = false,
  hasPowerup = false,
): StaticPlatform {
  return new StaticPlatform(
    x,
    y,
    DEFAULT_PLATFORM_WIDTH,
    DEFAULT_PLATFORM_HEIGHT,
    hasSpring,
    hasPowerup,
  );
}
