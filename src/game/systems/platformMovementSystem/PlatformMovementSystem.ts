import { isMovingPlatform, type Platform } from "../../entities/platform/Platform";

export function updateMovingPlatforms(
  platforms: readonly Platform[],
  deltaTime: number,
  canvasWidth: number,
): void {
  for (const platform of platforms) {
    if (isMovingPlatform(platform)) {
      platform.update(deltaTime, canvasWidth);
    }
  }
}
