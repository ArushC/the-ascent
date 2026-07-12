import { createDiagonalMovingPlatform } from "../entities/movingPlatform/DiagonalMovingPlatform";
import { createHorizontalMovingPlatform } from "../entities/movingPlatform/HorizontalMovingPlatform";
import { createVerticalMovingPlatform } from "../entities/movingPlatform/VerticalMovingPlatform";
import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  getPlatformTopY,
  type Platform,
} from "../entities/Platform";
import { PLAYER_WIDTH } from "../entities/Player";
import { createStaticPlatform } from "../entities/StaticPlatform";
import { GRAVITY, INITIAL_JUMP_VELOCITY } from "./PhysicsSystem";

export const BOTTOM_PLATFORM_OFFSET = 100;
export const STATIC_PLATFORM_SPAWN_WEIGHT = 0.75;
export const HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT = 0.125;
export const VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT = 0.0625;
export const DIAGONAL_MOVING_PLATFORM_SPAWN_WEIGHT = 0.0625;
export const MOVING_PLATFORM_TRAVEL_DISTANCE_RATIO = 0.32;
const PLATFORM_SPAWN_WEIGHT_TOTAL =
  STATIC_PLATFORM_SPAWN_WEIGHT +
  HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT +
  VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT +
  DIAGONAL_MOVING_PLATFORM_SPAWN_WEIGHT;

export const MIN_PLATFORM_SPAWN_GAP_RATIO = 0.32;
export const MAX_PLATFORM_SPAWN_GAP_RATIO = 0.6;
export const POWERUP_SPAWN_PROBABILITY = 0.03;
export const SPRING_SPAWN_PROBABILITY = 0.1;
// Number of visible screen heights to keep spawned above the camera.
export const SPAWN_LOOKAHEAD_SCREENS = 4;

export type PlatformExtras = {
  hasSpring: boolean;
  hasPowerup: boolean;
};

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
  const topmostPlatform = getTopmostPlatform(platforms);

  return topmostPlatform === null
    ? Number.POSITIVE_INFINITY
    : getPlatformTopY(topmostPlatform);
}

export function spawnNextPlatform(
  topmostY: number,
  canvasWidth: number,
  gapBounds = getGapBounds(),
): Platform {
  const { minGap, maxGap } = gapBounds;
  const gap = randomBetween(minGap, maxGap);
  const y = topmostY - gap;
  const travelDistance = getMovingPlatformTravelDistance(canvasWidth);

  switch (pickPlatformKind(Math.random() * PLATFORM_SPAWN_WEIGHT_TOTAL)) {
    case "horizontalMoving": {
      const x = getRandomPlatformX(canvasWidth, travelDistance);
      const extras = rollPlatformExtras();

      return createHorizontalMovingPlatform(
        x,
        y,
        undefined,
        travelDistance,
        extras.hasSpring,
        extras.hasPowerup,
      );
    }
    case "verticalMoving": {
      const x = getRandomPlatformX(canvasWidth);
      const extras = rollPlatformExtras();

      return createVerticalMovingPlatform(
        x,
        y,
        undefined,
        travelDistance,
        extras.hasSpring,
        extras.hasPowerup,
      );
    }
    case "diagonalMoving": {
      const x = getRandomPlatformX(canvasWidth, travelDistance);
      const extras = rollPlatformExtras();

      return createDiagonalMovingPlatform(
        x,
        y,
        undefined,
        undefined,
        travelDistance,
        extras.hasSpring,
        extras.hasPowerup,
      );
    }
    case "static": {
      const x = getRandomPlatformX(canvasWidth);
      const extras = rollPlatformExtras();

      return createStaticPlatform(
        x,
        y,
        extras.hasSpring,
        extras.hasPowerup,
      );
    }
  }
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
    topmostY = getPlatformTopY(platform);
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
  const bottomPlatform = createStaticPlatform(
    bottomPlatformX,
    bottomPlatformY,
    false,
  );

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

/**
 * Rolls mutually exclusive platform extras.
 * Outcomes: powerup 3%, spring 9.7% (10% after a powerup miss), neither 87.3%.
 */
export function rollPlatformExtras(): PlatformExtras {
  const hasPowerup = Math.random() < POWERUP_SPAWN_PROBABILITY;
  if (hasPowerup) {
    return { hasSpring: false, hasPowerup: true };
  }

  const hasSpring = Math.random() < SPRING_SPAWN_PROBABILITY;

  return {
    hasSpring,
    hasPowerup: false,
  };
}

/**
 * Returns a travel distance that keeps vertical motion safe and horizontal
 * motion comparable within the available canvas width.
 */
export function getMovingPlatformTravelDistance(canvasWidth: number): number {
  const freeHorizontalRange = Math.max(0, canvasWidth - DEFAULT_PLATFORM_WIDTH);
  const { minGap } = getGapBounds();
  const safeVerticalRange = Math.max(0, (minGap - DEFAULT_PLATFORM_HEIGHT) * 2);

  return Math.min(
    freeHorizontalRange * MOVING_PLATFORM_TRAVEL_DISTANCE_RATIO,
    safeVerticalRange,
  );
}

export function pickPlatformKind(roll: number): Platform["kind"] {
  if (roll < STATIC_PLATFORM_SPAWN_WEIGHT) {
    return "static";
  }

  const horizontalThreshold =
    STATIC_PLATFORM_SPAWN_WEIGHT + HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT;
  if (roll < horizontalThreshold) {
    return "horizontalMoving";
  }

  const verticalThreshold =
    horizontalThreshold + VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT;
  if (roll < verticalThreshold) {
    return "verticalMoving";
  }

  return "diagonalMoving";
}

/**
 * Returns a random spawn x whose full horizontal travel path stays onscreen.
 * `horizontalTravelDistance` acts like extra width around the platform center.
 */
export function getRandomPlatformX(
  canvasWidth: number,
  horizontalTravelDistance = 0,
): number {
  const maxPlatformX = Math.max(0, canvasWidth - DEFAULT_PLATFORM_WIDTH);
  const halfTravelDistance = Math.min(
    horizontalTravelDistance / 2,
    maxPlatformX / 2,
  );
  const minX = halfTravelDistance;
  const maxX = maxPlatformX - halfTravelDistance;

  return minX + Math.random() * Math.max(0, maxX - minX);
}

function getTopmostPlatform(platforms: readonly Platform[]): Platform | null {
  if (platforms.length === 0) return null;

  return platforms.reduce((topmostPlatform, platform) =>
    getPlatformTopY(platform) < getPlatformTopY(topmostPlatform)
      ? platform
      : topmostPlatform,
  );
}
