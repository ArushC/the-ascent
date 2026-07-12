export const SCORE_RAMP_END = 10_000;

export type DifficultyParams = {
  staticWeight: number;
  horizontalMovingWeight: number;
  verticalMovingWeight: number;
  diagonalMovingWeight: number;
  minGapRatio: number;
  maxGapRatio: number;
  minPlatformWidth: number;
  maxPlatformWidth: number;
  monsterSpawnProbability: number;
  minMonsterSpeed: number;
  maxMonsterSpeed: number;
  minHorizontalMonsterTravel: number;
  maxHorizontalMonsterTravel: number;
  minCircularMonsterOrbitRadius: number;
  maxCircularMonsterOrbitRadius: number;
  minTriangularMonsterPathSize: number;
  maxTriangularMonsterPathSize: number;
  monsterSizeScale: number;
};

const BASE_MOVING_SHARE = 0.25;
const HARD_MOVING_SHARE = 0.45;
const HORIZONTAL_MOVING_SHARE = 0.5;
const VERTICAL_MOVING_SHARE = 0.25;
const DIAGONAL_MOVING_SHARE = 0.25;

const BASE_MIN_PLATFORM_WIDTH = 90;
const HARD_MIN_PLATFORM_WIDTH = 70;
const MAX_PLATFORM_WIDTH = 90;

const BASE_MIN_GAP_RATIO = 0.32;
const HARD_MIN_GAP_RATIO = 0.38;
const BASE_MAX_GAP_RATIO = 0.6;
const HARD_MAX_GAP_RATIO = 0.72;

const BASE_MONSTER_SPAWN_PROBABILITY = 0.15;
const HARD_MONSTER_SPAWN_PROBABILITY = 0.28;

const BASE_MIN_MONSTER_SPEED = 0.07;
const HARD_MIN_MONSTER_SPEED = 0.09;
const BASE_MAX_MONSTER_SPEED = 0.11;
const HARD_MAX_MONSTER_SPEED = 0.15;

const BASE_MIN_HORIZONTAL_MONSTER_TRAVEL = 24;
const HARD_MIN_HORIZONTAL_MONSTER_TRAVEL = 36;
const BASE_MAX_HORIZONTAL_MONSTER_TRAVEL = 48;
const HARD_MAX_HORIZONTAL_MONSTER_TRAVEL = 72;

const BASE_MIN_CIRCULAR_MONSTER_ORBIT_RADIUS = 24;
const HARD_MIN_CIRCULAR_MONSTER_ORBIT_RADIUS = 36;
const BASE_MAX_CIRCULAR_MONSTER_ORBIT_RADIUS = 48;
const HARD_MAX_CIRCULAR_MONSTER_ORBIT_RADIUS = 72;

const BASE_MIN_TRIANGULAR_MONSTER_PATH_SIZE = 48;
const HARD_MIN_TRIANGULAR_MONSTER_PATH_SIZE = 60;
const BASE_MAX_TRIANGULAR_MONSTER_PATH_SIZE = 72;
const HARD_MAX_TRIANGULAR_MONSTER_PATH_SIZE = 96;

const BASE_MONSTER_SIZE_SCALE = 1;
const HARD_MONSTER_SIZE_SCALE = 1.25;

export function getDifficultyProgress(score: number): number {
  const rawT = clamp(score / SCORE_RAMP_END, 0, 1);

  return rawT * (2 - rawT);
}

export function getDifficultyParams(score: number): DifficultyParams {
  const t = getDifficultyProgress(score);
  const movingShare = lerp(BASE_MOVING_SHARE, HARD_MOVING_SHARE, t);

  return {
    staticWeight: 1 - movingShare,
    horizontalMovingWeight: movingShare * HORIZONTAL_MOVING_SHARE,
    verticalMovingWeight: movingShare * VERTICAL_MOVING_SHARE,
    diagonalMovingWeight: movingShare * DIAGONAL_MOVING_SHARE,
    minGapRatio: lerp(BASE_MIN_GAP_RATIO, HARD_MIN_GAP_RATIO, t),
    maxGapRatio: lerp(BASE_MAX_GAP_RATIO, HARD_MAX_GAP_RATIO, t),
    minPlatformWidth: lerp(
      BASE_MIN_PLATFORM_WIDTH,
      HARD_MIN_PLATFORM_WIDTH,
      t,
    ),
    maxPlatformWidth: MAX_PLATFORM_WIDTH,
    monsterSpawnProbability: lerp(
      BASE_MONSTER_SPAWN_PROBABILITY,
      HARD_MONSTER_SPAWN_PROBABILITY,
      t,
    ),
    minMonsterSpeed: lerp(BASE_MIN_MONSTER_SPEED, HARD_MIN_MONSTER_SPEED, t),
    maxMonsterSpeed: lerp(BASE_MAX_MONSTER_SPEED, HARD_MAX_MONSTER_SPEED, t),
    minHorizontalMonsterTravel: lerp(
      BASE_MIN_HORIZONTAL_MONSTER_TRAVEL,
      HARD_MIN_HORIZONTAL_MONSTER_TRAVEL,
      t,
    ),
    maxHorizontalMonsterTravel: lerp(
      BASE_MAX_HORIZONTAL_MONSTER_TRAVEL,
      HARD_MAX_HORIZONTAL_MONSTER_TRAVEL,
      t,
    ),
    minCircularMonsterOrbitRadius: lerp(
      BASE_MIN_CIRCULAR_MONSTER_ORBIT_RADIUS,
      HARD_MIN_CIRCULAR_MONSTER_ORBIT_RADIUS,
      t,
    ),
    maxCircularMonsterOrbitRadius: lerp(
      BASE_MAX_CIRCULAR_MONSTER_ORBIT_RADIUS,
      HARD_MAX_CIRCULAR_MONSTER_ORBIT_RADIUS,
      t,
    ),
    minTriangularMonsterPathSize: lerp(
      BASE_MIN_TRIANGULAR_MONSTER_PATH_SIZE,
      HARD_MIN_TRIANGULAR_MONSTER_PATH_SIZE,
      t,
    ),
    maxTriangularMonsterPathSize: lerp(
      BASE_MAX_TRIANGULAR_MONSTER_PATH_SIZE,
      HARD_MAX_TRIANGULAR_MONSTER_PATH_SIZE,
      t,
    ),
    monsterSizeScale: lerp(
      BASE_MONSTER_SIZE_SCALE,
      HARD_MONSTER_SIZE_SCALE,
      t,
    ),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
