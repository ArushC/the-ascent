import { createDiagonalMovingPlatform } from "../../entities/movingPlatform/diagonalMovingPlatform/DiagonalMovingPlatform";
import { createHorizontalMovingPlatform } from "../../entities/movingPlatform/horizontalMovingPlatform/HorizontalMovingPlatform";
import { createVerticalMovingPlatform } from "../../entities/movingPlatform/verticalMovingPlatform/VerticalMovingPlatform";
import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
  getPlatformTopY,
  type Platform,
} from "../../entities/platform/Platform";
import { PLAYER_WIDTH } from "../../entities/player/Player";
import { SPRING_WIDTH } from "../../entities/spring/Spring";
import { createStaticPlatform } from "../../entities/staticPlatform/StaticPlatform";
import {
  createMathRng,
  randomBetween,
  type Rng,
} from "../../rng/seededRng/SeededRng";
import type { ChallengeModifiers } from "../../../../shared/dailyChallenge/types.ts";
import type { DifficultyParams } from "../difficultySystem/DifficultySystem";
import { GRAVITY, INITIAL_JUMP_VELOCITY } from "../physicsSystem/PhysicsSystem";

export const BOTTOM_PLATFORM_OFFSET = 100;
export const STATIC_PLATFORM_SPAWN_WEIGHT = 0.75;
export const HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT = 0.125;
export const VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT = 0.0625;
export const DIAGONAL_MOVING_PLATFORM_SPAWN_WEIGHT = 0.0625;
export const MOVING_PLATFORM_TRAVEL_DISTANCE_RATIO = 0.32;

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

export type GapBounds = {
  minGap: number;
  maxGap: number;
};

export function computeMaxJumpHeight(): number {
  // Jump apex from v^2 = 2ad, using the current launch velocity and gravity.
  return INITIAL_JUMP_VELOCITY ** 2 / (2 * GRAVITY);
}

export function getGapBounds(params: DifficultyParams): GapBounds {
  const maxJumpHeight = computeMaxJumpHeight();

  return {
    minGap: maxJumpHeight * params.minGapRatio,
    maxGap: maxJumpHeight * params.maxGapRatio,
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
  params: DifficultyParams,
  gapBounds = getGapBounds(params),
  rng: Rng = createMathRng(),
  modifiers?: ChallengeModifiers,
): Platform {
  const { minGap, maxGap } = gapBounds;
  const gap = randomBetween(minGap, maxGap, rng);
  const y = topmostY - gap;

  switch (pickPlatformKind(rng(), params)) {
    case "horizontalMoving": {
      const extras = rollPlatformExtras(rng, modifiers);
      const width = getPlatformSpawnWidth(params, extras, rng);
      const travelDistance = getMovingPlatformTravelDistance(
        canvasWidth,
        width,
        gapBounds,
      );
      const x = getRandomPlatformX(canvasWidth, travelDistance, width, rng);

      return createHorizontalMovingPlatform(
        x,
        y,
        undefined,
        travelDistance,
        extras.hasSpring,
        extras.hasPowerup,
        width,
        rng,
      );
    }
    case "verticalMoving": {
      const extras = rollPlatformExtras(rng, modifiers);
      const width = getPlatformSpawnWidth(params, extras, rng);
      const travelDistance = getMovingPlatformTravelDistance(
        canvasWidth,
        width,
        gapBounds,
      );
      const x = getRandomPlatformX(canvasWidth, 0, width, rng);

      return createVerticalMovingPlatform(
        x,
        y,
        undefined,
        travelDistance,
        extras.hasSpring,
        extras.hasPowerup,
        width,
        rng,
      );
    }
    case "diagonalMoving": {
      const extras = rollPlatformExtras(rng, modifiers);
      const width = getPlatformSpawnWidth(params, extras, rng);
      const travelDistance = getMovingPlatformTravelDistance(
        canvasWidth,
        width,
        gapBounds,
      );
      const x = getRandomPlatformX(canvasWidth, travelDistance, width, rng);

      return createDiagonalMovingPlatform(
        x,
        y,
        undefined,
        undefined,
        travelDistance,
        extras.hasSpring,
        extras.hasPowerup,
        width,
        rng,
      );
    }
    case "static": {
      const extras = rollPlatformExtras(rng, modifiers);
      const width = getPlatformSpawnWidth(params, extras, rng);
      const x = getRandomPlatformX(canvasWidth, 0, width, rng);

      return createStaticPlatform(
        x,
        y,
        extras.hasSpring,
        extras.hasPowerup,
        width,
      );
    }
  }
}

export function spawnPlatformsAboveCamera(
  currentPlatforms: readonly Platform[],
  screenTopY: number,
  canvasWidth: number,
  canvasHeight: number,
  params: DifficultyParams,
  rng: Rng = createMathRng(),
  modifiers?: ChallengeModifiers,
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
    const platform = spawnNextPlatform(
      topmostY,
      canvasWidth,
      params,
      getGapBounds(params),
      rng,
      modifiers,
    );
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
  params: DifficultyParams,
  rng: Rng = createMathRng(),
  modifiers?: ChallengeModifiers,
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
    params,
    rng,
    modifiers,
  );
}

export function updatePlatformsForCamera(
  platforms: readonly Platform[],
  screenTopY: number,
  canvasWidth: number,
  canvasHeight: number,
  params: DifficultyParams,
  spawnEnabled = true,
  rng: Rng = createMathRng(),
  modifiers?: ChallengeModifiers,
): Platform[] {
  const visiblePlatforms = removePlatformsBelowCamera(
    platforms,
    screenTopY,
    canvasHeight,
  );

  if (!spawnEnabled) return visiblePlatforms;

  return spawnPlatformsAboveCamera(
    visiblePlatforms,
    screenTopY,
    canvasWidth,
    canvasHeight,
    params,
    rng,
    modifiers,
  );
}

/**
 * Rolls mutually exclusive platform extras.
 * Outcomes: powerup 3%, spring 9.7% (10% after a powerup miss), neither 87.3%.
 */
export function rollPlatformExtras(
  rng: Rng = createMathRng(),
  modifiers?: ChallengeModifiers,
): PlatformExtras {
  const powerupSpawnProbability =
    modifiers?.powerupSpawnProbability ?? POWERUP_SPAWN_PROBABILITY;
  const springSpawnProbability =
    modifiers?.springSpawnProbability ?? SPRING_SPAWN_PROBABILITY;
  const hasPowerup = rng() < powerupSpawnProbability;
  if (hasPowerup) {
    return { hasSpring: false, hasPowerup: true };
  }

  const hasSpring = rng() < springSpawnProbability;

  return {
    hasSpring,
    hasPowerup: false,
  };
}

/**
 * Returns a travel distance that keeps vertical motion safe and horizontal
 * motion comparable within the available canvas width.
 */
export function getMovingPlatformTravelDistance(
  canvasWidth: number,
  platformWidth: number,
  gapBounds: GapBounds,
): number {
  const freeHorizontalRange = Math.max(0, canvasWidth - platformWidth);
  const { minGap } = gapBounds;
  const safeVerticalRange = Math.max(0, (minGap - DEFAULT_PLATFORM_HEIGHT) * 2);

  return Math.min(
    freeHorizontalRange * MOVING_PLATFORM_TRAVEL_DISTANCE_RATIO,
    safeVerticalRange,
  );
}

export function pickPlatformKind(
  roll: number,
  params: DifficultyParams,
): Platform["kind"] {
  if (roll < params.staticWeight) {
    return "static";
  }

  const horizontalThreshold =
    params.staticWeight + params.horizontalMovingWeight;
  if (roll < horizontalThreshold) {
    return "horizontalMoving";
  }

  const verticalThreshold =
    horizontalThreshold + params.verticalMovingWeight;
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
  platformWidth = DEFAULT_PLATFORM_WIDTH,
  rng: Rng = createMathRng(),
): number {
  const maxPlatformX = Math.max(0, canvasWidth - platformWidth);
  const halfTravelDistance = Math.min(
    horizontalTravelDistance / 2,
    maxPlatformX / 2,
  );
  const minX = halfTravelDistance;
  const maxX = maxPlatformX - halfTravelDistance;

  return minX + rng() * Math.max(0, maxX - minX);
}

function getPlatformSpawnWidth(
  params: DifficultyParams,
  extras: PlatformExtras,
  rng: Rng,
): number {
  const width = randomBetween(
    params.minPlatformWidth,
    params.maxPlatformWidth,
    rng,
  );

  return extras.hasSpring ? Math.max(width, SPRING_WIDTH) : width;
}

function getTopmostPlatform(platforms: readonly Platform[]): Platform | null {
  if (platforms.length === 0) return null;

  return platforms.reduce((topmostPlatform, platform) =>
    getPlatformTopY(platform) < getPlatformTopY(topmostPlatform)
      ? platform
      : topmostPlatform,
  );
}
