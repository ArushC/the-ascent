import {
  isHorizontalMovingPlatform,
  type Platform,
} from "../entities/Platform";

export function updateMovingPlatforms(
  platforms: readonly Platform[],
  deltaTime: number,
  canvasWidth: number,
): void {
  for (const platform of platforms) {
    if (isHorizontalMovingPlatform(platform)) {
      platform.update(deltaTime, canvasWidth);
    }
  }
}
