import { createHorizontalMovingPlatform } from "../entities/HorizontalMovingPlatform";
import {
  DEFAULT_PLATFORM_WIDTH,
  type Platform,
} from "../entities/Platform";
import { PLAYER_WIDTH } from "../entities/Player";
import { createStaticPlatform } from "../entities/StaticPlatform";
import { GRAVITY, INITIAL_JUMP_VELOCITY } from "./PhysicsSystem";

export const BOTTOM_PLATFORM_OFFSET = 100;
export const MOVING_PLATFORM_SPAWN_CHANCE = 0.25;

export const MIN_PLATFORM_SPAWN_GAP_RATIO = 0.32;
export const MAX_PLATFORM_SPAWN_GAP_RATIO = 0.6;
// Number of visible screen heights to keep spawned above the camera.
export const SPAWN_LOOKAHEAD_SCREENS = 1;

export function computeMaxJumpHeight(): number {
  // Jump apex from v^2 = 2ad, using the current launch velocity and gravity.
  return INITIAL_JUMP_VELOCITY ** 2 / (2 * GRAVITY);
}

export function getGapBounds(): { minGap: number; maxGap: number } {
  const maxJumpHeight = computeMaxJumpHeight();

  return {
    minGap: maxJumpHeight * MIN_PLATFORM_SPAWN_GAP_RATIO,
    maxGap: maxJumpHeight * MAX_PLATFORM_SPAWN_GAP_RATIO,
  };
}

export function getTopmostPlatformY(platforms: readonly Platform[]): number {
  if (platforms.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(...platforms.map((platform) => platform.y));
}

export function spawnNextPlatform(
  topmostY: number,
  canvasWidth: number,
): Platform {
  const { minGap, maxGap } = getGapBounds();
  const gap = randomBetween(minGap, maxGap);
  const maxX = Math.max(0, canvasWidth - DEFAULT_PLATFORM_WIDTH);
  const x = Math.random() * maxX;
  const y = topmostY - gap;

  if (Math.random() < MOVING_PLATFORM_SPAWN_CHANCE) {
    return createHorizontalMovingPlatform(x, y);
  }

  return createStaticPlatform(x, y);
}

export function spawnPlatformsAboveCamera(
  currentPlatforms: readonly Platform[],
  screenTopY: number,
  canvasWidth: number,
  canvasHeight: number,
): Platform[] {
  const platformsAhead = [...currentPlatforms];
  const lookaheadTopY = screenTopY - canvasHeight * SPAWN_LOOKAHEAD_SCREENS;
  let topmostY = getTopmostPlatformY(platformsAhead);

  if (!Number.isFinite(topmostY)) {
    // Recover from an empty platform state by seeding from the camera bottom.
    topmostY = screenTopY + canvasHeight;
  }

  // World Y decreases upward, so keep spawning until topmostY reaches the
  // upper edge of the lookahead region.
  while (topmostY > lookaheadTopY) {
    const platform = spawnNextPlatform(topmostY, canvasWidth);
    platformsAhead.push(platform);
    topmostY = platform.y;
  }

  return platformsAhead;
}

export function removePlatformsBelowCamera(
  platforms: readonly Platform[],
  screenTopY: number,
  canvasHeight: number,
): Platform[] {
  const screenBottomY = screenTopY + canvasHeight;

  return platforms.filter((platform) => platform.y <= screenBottomY);
}

export function createInitialPlatforms(
  canvasWidth: number,
  canvasHeight: number,
): Platform[] {
  const playerStartX = (canvasWidth - PLAYER_WIDTH) / 2;
  const bottomPlatformX =
    playerStartX + (PLAYER_WIDTH - DEFAULT_PLATFORM_WIDTH) / 2;
  const bottomPlatformY = canvasHeight - BOTTOM_PLATFORM_OFFSET;
  const bottomPlatform = createStaticPlatform(bottomPlatformX, bottomPlatformY);

  return spawnPlatformsAboveCamera(
    [bottomPlatform],
    0,
    canvasWidth,
    canvasHeight,
  );
}

export function updatePlatformsForCamera(
  platforms: readonly Platform[],
  screenTopY: number,
  canvasWidth: number,
  canvasHeight: number,
): Platform[] {
  return spawnPlatformsAboveCamera(
    removePlatformsBelowCamera(platforms, screenTopY, canvasHeight),
    screenTopY,
    canvasWidth,
    canvasHeight,
  );
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
