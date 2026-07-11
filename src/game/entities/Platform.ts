import type { PlatformSpringState } from "./Spring";

export const DEFAULT_PLATFORM_WIDTH = 90;
export const DEFAULT_PLATFORM_HEIGHT = 14;

export type PlatformKind =
  | "static"
  | "horizontalMoving"
  | "verticalMoving"
  | "diagonalMoving";

export interface Platform extends PlatformSpringState {
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
  minX: number;
  maxX: number;
  update(deltaTime: number, canvasWidth: number): void;
};

export type VerticalMovingPlatform = Platform & {
  readonly kind: "verticalMoving";
  velocityY: number;
  previousY: number;
  minY: number;
  maxY: number;
  update(deltaTime: number, canvasWidth: number): void;
};

export type DiagonalMovingPlatform = Platform & {
  readonly kind: "diagonalMoving";
  velocityX: number;
  velocityY: number;
  previousY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  update(deltaTime: number, canvasWidth: number): void;
};

export type MovingPlatform =
  | HorizontalMovingPlatform
  | VerticalMovingPlatform
  | DiagonalMovingPlatform;

export function isHorizontalMovingPlatform(
  platform: Platform,
): platform is HorizontalMovingPlatform {
  return platform.kind === "horizontalMoving";
}

export function isVerticalMovingPlatform(
  platform: Platform,
): platform is VerticalMovingPlatform {
  return platform.kind === "verticalMoving";
}

export function isDiagonalMovingPlatform(
  platform: Platform,
): platform is DiagonalMovingPlatform {
  return platform.kind === "diagonalMoving";
}

export function isMovingPlatform(platform: Platform): platform is MovingPlatform {
  return (
    isHorizontalMovingPlatform(platform) ||
    isVerticalMovingPlatform(platform) ||
    isDiagonalMovingPlatform(platform)
  );
}

export function getPlatformPreviousY(platform: Platform): number {
  if (isVerticalMovingPlatform(platform) || isDiagonalMovingPlatform(platform)) {
    return platform.previousY;
  }

  return platform.y;
}

/**
 * Returns the highest Y position a platform can occupy for spawn gap chaining.
 * World Y decreases upward, so vertical/diagonal platforms use minY.
 */
export function getPlatformTopY(platform: Platform): number {
  if (isVerticalMovingPlatform(platform) || isDiagonalMovingPlatform(platform)) {
    return platform.minY;
  }

  return platform.y;
}
