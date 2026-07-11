export const DEFAULT_PLATFORM_WIDTH = 90;
export const DEFAULT_PLATFORM_HEIGHT = 14;

export type PlatformKind = "static" | "horizontalMoving";

export interface Platform {
  readonly kind: PlatformKind;
  x: number;
  y: number;
  width: number;
  height: number;
  draw(ctx: CanvasRenderingContext2D): void;
}

export type HorizontalMovingPlatform = Platform & {
  readonly kind: "horizontalMoving";
  velocityX: number;
  update(deltaTime: number, canvasWidth: number): void;
};

export function isHorizontalMovingPlatform(
  platform: Platform,
): platform is HorizontalMovingPlatform {
  return platform.kind === "horizontalMoving";
}
