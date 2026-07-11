import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  type Platform,
} from "./Platform";
const STATIC_PLATFORM_COLOR = "green";

export class StaticPlatform implements Platform {
  readonly kind = "static";
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = STATIC_PLATFORM_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export function createStaticPlatform(x: number, y: number): StaticPlatform {
  return new StaticPlatform(
    x,
    y,
    DEFAULT_PLATFORM_WIDTH,
    DEFAULT_PLATFORM_HEIGHT,
  );
}
