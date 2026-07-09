import { PLAYER_WIDTH } from "../entities/Player";
import {
  createStaticPlatform,
  STATIC_PLATFORM_WIDTH,
  type StaticPlatform,
} from "../entities/StaticPlatform";
import { GRAVITY, INITIAL_JUMP_VELOCITY } from "./PhysicsSystem";

export const BOTTOM_PLATFORM_OFFSET = 100;

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

export function getTopmostPlatformY(platforms: StaticPlatform[]): number {
  if (platforms.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(...platforms.map((platform) => platform.y));
}

export function spawnNextPlatform(
  topmostY: number,
  canvasWidth: number,
): StaticPlatform {
  const { minGap, maxGap } = getGapBounds();
  const gap = randomBetween(minGap, maxGap);
  const maxX = Math.max(0, canvasWidth - STATIC_PLATFORM_WIDTH);
  const x = Math.random() * maxX;

  return createStaticPlatform(x, topmostY - gap);
}

export function spawnPlatformsAboveCamera(
  currentPlatforms: StaticPlatform[],
  screenTopY: number,
  canvasWidth: number,
  canvasHeight: number,
): StaticPlatform[] {
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
  platforms: StaticPlatform[],
  screenTopY: number,
  canvasHeight: number,
): StaticPlatform[] {
  const screenBottomY = screenTopY + canvasHeight;

  return platforms.filter((platform) => platform.y <= screenBottomY);
}

export function createInitialPlatforms(
  canvasWidth: number,
  canvasHeight: number,
): StaticPlatform[] {
  const playerStartX = (canvasWidth - PLAYER_WIDTH) / 2;
  const bottomPlatformX =
    playerStartX + (PLAYER_WIDTH - STATIC_PLATFORM_WIDTH) / 2;
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
  platforms: StaticPlatform[],
  screenTopY: number,
  canvasWidth: number,
  canvasHeight: number,
): StaticPlatform[] {
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
