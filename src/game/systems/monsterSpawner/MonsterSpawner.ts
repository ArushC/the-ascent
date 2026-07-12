import {
  CIRCULAR_MONSTER_SIZE,
  TRIANGULAR_MONSTER_SIZE,
  type Monster,
} from "../../entities/monster/Monster";
import { createCircularMonster } from "../../entities/monster/circularMonster/CircularMonster";
import { createHorizontalMonster } from "../../entities/monster/horizontalMonster/HorizontalMonster";
import {
  generateRandomHorizontalMonsterTravelDistance,
  generateRandomCircularMonsterOrbitRadius,
  generateRandomTriangularMonsterPathSize,
} from "../../entities/monster/random/random";
import { createTriangularMonster } from "../../entities/monster/triangularPathMonster/TriangularPathMonster";
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
  gapBounds = getGapBounds(),
): Monster {
  const { minGap, maxGap } = gapBounds;
  const y = topmostY - randomBetween(minGap, maxGap);

  return spawnMonsterAtY(y, canvasWidth);
}

export function spawnMonstersAboveCamera(
  currentMonsters: readonly Monster[],
  screenTopY: number,
  canvasWidth: number,
  canvasHeight: number,
): Monster[] {
  const monstersAhead = [...currentMonsters];
  const lookaheadTopY = screenTopY - canvasHeight * SPAWN_LOOKAHEAD_SCREENS;
  const { minGap, maxGap } = getGapBounds();
  let topmostY = getTopmostMonsterY(monstersAhead);

  if (!Number.isFinite(topmostY)) {
    topmostY = screenTopY;
  }

  while (topmostY > lookaheadTopY) {
    topmostY -= randomBetween(minGap, maxGap);

    if (rollMonsterSpawn()) {
      monstersAhead.push(spawnMonsterAtY(topmostY, canvasWidth));
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
): Monster[] {
  return spawnMonstersAboveCamera(
    removeMonstersBelowCamera(monsters, screenTopY, canvasHeight),
    screenTopY,
    canvasWidth,
    canvasHeight,
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

export function rollMonsterSpawn(): boolean {
  return Math.random() < MONSTER_SPAWN_PROBABILITY;
}

function spawnMonsterAtY(y: number, canvasWidth: number): Monster {
  switch (pickMonsterKind(Math.random() * MONSTER_SPAWN_WEIGHT_TOTAL)) {
    case "horizontal": {
      const travelDistance = generateRandomHorizontalMonsterTravelDistance();
      const x = getRandomPlatformX(canvasWidth, travelDistance);

      return createHorizontalMonster(x, y, undefined, travelDistance);
    }
    case "circular": {
      const radius = getClampedOrbitRadius(
        generateRandomCircularMonsterOrbitRadius(),
        canvasWidth,
      );
      const centerX = getRandomCenterX(
        canvasWidth,
        radius,
        CIRCULAR_MONSTER_SIZE,
      );

      return createCircularMonster(centerX, y, radius);
    }
    case "triangular": {
      const pathSize = getClampedTriangularPathSize(
        generateRandomTriangularMonsterPathSize(),
        canvasWidth,
      );
      const centerX = getRandomCenterX(
        canvasWidth,
        pathSize / 2,
        TRIANGULAR_MONSTER_SIZE,
      );

      return createTriangularMonster(centerX, y, pathSize);
    }
  }
}

function getTopmostMonsterY(monsters: readonly Monster[]): number {
  if (monsters.length === 0) return Number.POSITIVE_INFINITY;

  return Math.min(...monsters.map((monster) => monster.y));
}

function getClampedOrbitRadius(radius: number, canvasWidth: number): number {
  const maxRadius = Math.max(0, (canvasWidth - CIRCULAR_MONSTER_SIZE) / 2);

  return Math.min(radius, maxRadius);
}

function getClampedTriangularPathSize(
  pathSize: number,
  canvasWidth: number,
): number {
  return Math.min(pathSize, Math.max(0, canvasWidth - TRIANGULAR_MONSTER_SIZE));
}

function getRandomCenterX(
  canvasWidth: number,
  horizontalRadius: number,
  monsterSize: number,
): number {
  const halfSize = monsterSize / 2;
  const minX = horizontalRadius + halfSize;
  const maxX = canvasWidth - horizontalRadius - halfSize;

  if (maxX <= minX) {
    return canvasWidth / 2;
  }

  return minX + Math.random() * (maxX - minX);
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
