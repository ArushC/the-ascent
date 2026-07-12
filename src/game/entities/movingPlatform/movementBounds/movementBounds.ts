import type {
  DiagonalMovingPlatform as DiagonalMovingPlatformEntity,
  HorizontalMovingPlatform as HorizontalMovingPlatformEntity,
  VerticalMovingPlatform as VerticalMovingPlatformEntity,
} from "../../platform/Platform";

/**
 * Clamps a platform's x-position to its path and the canvas, then reverses
 * horizontal velocity at either edge.
 */
export function constrainHorizontalMovementToBounds(
  platform: HorizontalMovingPlatformEntity | DiagonalMovingPlatformEntity,
  canvasWidth: number,
): void {
  const minX = Math.max(0, platform.minX);
  const maxX = Math.min(platform.maxX, Math.max(0, canvasWidth - platform.width));

  if (platform.x < minX) {
    platform.x = minX;
    platform.velocityX = Math.abs(platform.velocityX);
  } else if (platform.x > maxX) {
    platform.x = maxX;
    platform.velocityX = -Math.abs(platform.velocityX);
  }
}

/**
 * Clamps a platform's y-position to its local path, then reverses vertical
 * velocity at either edge.
 */
export function constrainVerticalMovementToBounds(
  platform: VerticalMovingPlatformEntity | DiagonalMovingPlatformEntity,
): void {
  if (platform.y < platform.minY) {
    platform.y = platform.minY;
    platform.velocityY = Math.abs(platform.velocityY);
  } else if (platform.y > platform.maxY) {
    platform.y = platform.maxY;
    platform.velocityY = -Math.abs(platform.velocityY);
  }
}
