import {
  CIRCULAR_MONSTER_SIZE,
  HORIZONTAL_MONSTER_HEIGHT,
  HORIZONTAL_MONSTER_WIDTH,
  TRIANGULAR_MONSTER_SIZE,
  type Monster,
} from "../../entities/monster/Monster";
import { createCircularMonster } from "../../entities/monster/circularMonster/CircularMonster";
import { createHorizontalMonster } from "../../entities/monster/horizontalMonster/HorizontalMonster";
import {
  generateRandomHorizontalMonsterTravelDistance,
  generateRandomCircularMonsterOrbitRadius,
  generateRandomTriangularMonsterPathSize,
  generateRandomCircularMonsterAngularVelocity,
  generateRandomMonsterVelocity,
} from "../../entities/monster/random/random";
import { createTriangularMonster } from "../../entities/monster/triangularPathMonster/TriangularPathMonster";
import {
  createMathRng,
  randomBetween,
  type Rng,
} from "../../rng/seededRng/SeededRng";
import type { DifficultyParams } from "../difficultySystem/DifficultySystem";
import {
  getGapBounds,
  getRandomPlatformX,
  SPAWN_LOOKAHEAD_SCREENS,
} from "../platformSpawner/PlatformSpawner";

export const MONSTER_SPAWN_PROBABILITY = 0.15;
export const HORIZONTAL_MONSTER_SPAWN_WEIGHT = 1 / 3;
export const CIRCULAR_MONSTER_SPAWN_WEIGHT = 1 / 3;
export const TRIANGULAR_MONSTER_SPAWN_WEIGHT = 1 / 3;
const MONSTER_SPAWN_WEIGHT_TOTAL =
  HORIZONTAL_MONSTER_SPAWN_WEIGHT +
  CIRCULAR_MONSTER_SPAWN_WEIGHT +
  TRIANGULAR_MONSTER_SPAWN_WEIGHT;

export function createInitialMonsters(): Monster[] {
  return [];
}

export function spawnNextMonster(
  topmostY: number,
  canvasWidth: number,
  params: DifficultyParams,
  gapBounds = getGapBounds(params),
  rng: Rng = createMathRng(),
): Monster {
  const { minGap, maxGap } = gapBounds;
  const y = topmostY - randomBetween(minGap, maxGap, rng);

  return spawnMonsterAtY(y, canvasWidth, params, rng);
}

export function spawnMonstersAboveCamera(
  currentMonsters: readonly Monster[],
  screenTopY: number,
  canvasWidth: number,
  canvasHeight: number,
  params: DifficultyParams,
  rng: Rng = createMathRng(),
): Monster[] {
  const monstersAhead = [...currentMonsters];
  const lookaheadTopY = screenTopY - canvasHeight * SPAWN_LOOKAHEAD_SCREENS;
  const { minGap, maxGap } = getGapBounds(params);
  let topmostY = getTopmostMonsterY(monstersAhead);

  if (!Number.isFinite(topmostY)) {
    topmostY = screenTopY;
  }

  while (topmostY > lookaheadTopY) {
    topmostY -= randomBetween(minGap, maxGap, rng);

    if (rollMonsterSpawn(params, rng)) {
      monstersAhead.push(spawnMonsterAtY(topmostY, canvasWidth, params, rng));
    }
  }

  return monstersAhead;
}

export function removeMonstersBelowCamera(
  monsters: readonly Monster[],
  screenTopY: number,
  canvasHeight: number,
): Monster[] {
  const screenBottomY = screenTopY + canvasHeight;

  return monsters.filter((monster) => monster.y <= screenBottomY);
}

export function updateMonstersForCamera(
  monsters: readonly Monster[],
  screenTopY: number,
  canvasWidth: number,
  canvasHeight: number,
  params: DifficultyParams,
  spawnEnabled = true,
  rng: Rng = createMathRng(),
): Monster[] {
  const visibleMonsters = removeMonstersBelowCamera(
    monsters,
    screenTopY,
    canvasHeight,
  );

  if (!spawnEnabled) return visibleMonsters;

  return spawnMonstersAboveCamera(
    visibleMonsters,
    screenTopY,
    canvasWidth,
    canvasHeight,
    params,
    rng,
  );
}

export function pickMonsterKind(roll: number): Monster["kind"] {
  if (roll < HORIZONTAL_MONSTER_SPAWN_WEIGHT) {
    return "horizontal";
  }

  if (roll < HORIZONTAL_MONSTER_SPAWN_WEIGHT + CIRCULAR_MONSTER_SPAWN_WEIGHT) {
    return "circular";
  }

  return "triangular";
}

export function rollMonsterSpawn(
  params: DifficultyParams,
  rng: Rng = createMathRng(),
): boolean {
  return rng() < params.monsterSpawnProbability;
}

function spawnMonsterAtY(
  y: number,
  canvasWidth: number,
  params: DifficultyParams,
  rng: Rng,
): Monster {
  switch (pickMonsterKind(rng() * MONSTER_SPAWN_WEIGHT_TOTAL)) {
    case "horizontal": {
      const width = HORIZONTAL_MONSTER_WIDTH * params.monsterSizeScale;
      const height = HORIZONTAL_MONSTER_HEIGHT * params.monsterSizeScale;
      const travelDistance = generateRandomHorizontalMonsterTravelDistance(
        params.minHorizontalMonsterTravel,
        params.maxHorizontalMonsterTravel,
        rng,
      );
      const velocityX = generateRandomMonsterVelocity(
        params.minMonsterSpeed,
        params.maxMonsterSpeed,
        rng,
      );
      const x = getRandomPlatformX(canvasWidth, travelDistance, width, rng);

      return createHorizontalMonster(
        x,
        y,
        velocityX,
        travelDistance,
        width,
        height,
        rng,
      );
    }
    case "circular": {
      const size = CIRCULAR_MONSTER_SIZE * params.monsterSizeScale;
      const radius = getClampedOrbitRadius(
        generateRandomCircularMonsterOrbitRadius(
          params.minCircularMonsterOrbitRadius,
          params.maxCircularMonsterOrbitRadius,
          rng,
        ),
        canvasWidth,
        size,
      );
      const angularVelocity = generateRandomCircularMonsterAngularVelocity(
        radius,
        params.minMonsterSpeed,
        params.maxMonsterSpeed,
        rng,
      );
      const centerX = getRandomCenterX(canvasWidth, radius, size, rng);

      return createCircularMonster(
        centerX,
        y,
        radius,
        undefined,
        angularVelocity,
        size,
        rng,
      );
    }
    case "triangular": {
      const size = TRIANGULAR_MONSTER_SIZE * params.monsterSizeScale;
      const pathSize = getClampedTriangularPathSize(
        generateRandomTriangularMonsterPathSize(
          params.minTriangularMonsterPathSize,
          params.maxTriangularMonsterPathSize,
          rng,
        ),
        canvasWidth,
        size,
      );
      const speed = generateRandomMonsterVelocity(
        params.minMonsterSpeed,
        params.maxMonsterSpeed,
        rng,
      );
      const centerX = getRandomCenterX(canvasWidth, pathSize / 2, size, rng);

      return createTriangularMonster(
        centerX,
        y,
        pathSize,
        undefined,
        speed,
        size,
        rng,
      );
    }
  }
}

function getTopmostMonsterY(monsters: readonly Monster[]): number {
  if (monsters.length === 0) return Number.POSITIVE_INFINITY;

  return Math.min(...monsters.map((monster) => monster.y));
}

function getClampedOrbitRadius(
  radius: number,
  canvasWidth: number,
  monsterSize: number,
): number {
  const maxRadius = Math.max(0, (canvasWidth - monsterSize) / 2);

  return Math.min(radius, maxRadius);
}

function getClampedTriangularPathSize(
  pathSize: number,
  canvasWidth: number,
  monsterSize: number,
): number {
  return Math.min(pathSize, Math.max(0, canvasWidth - monsterSize));
}

function getRandomCenterX(
  canvasWidth: number,
  horizontalRadius: number,
  monsterSize: number,
  rng: Rng,
): number {
  const halfSize = monsterSize / 2;
  const minX = horizontalRadius + halfSize;
  const maxX = canvasWidth - horizontalRadius - halfSize;

  if (maxX <= minX) {
    return canvasWidth / 2;
  }

  return minX + rng() * (maxX - minX);
}
