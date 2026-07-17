import { describe, expect, it } from "vitest";
import {
  MAX_CIRCULAR_MONSTER_ORBIT_RADIUS,
  MAX_HORIZONTAL_MONSTER_TRAVEL_DISTANCE,
  MAX_MONSTER_SPEED,
  MAX_TRIANGULAR_MONSTER_PATH_SIZE,
  MIN_CIRCULAR_MONSTER_ORBIT_RADIUS,
  MIN_HORIZONTAL_MONSTER_TRAVEL_DISTANCE,
  MIN_MONSTER_SPEED,
  MIN_TRIANGULAR_MONSTER_PATH_SIZE,
} from "../../entities/monster/random/random";
import { DEFAULT_PLATFORM_WIDTH } from "../../entities/platform/Platform";
import {
  MAX_PLATFORM_SPAWN_GAP_RATIO,
  MIN_PLATFORM_SPAWN_GAP_RATIO,
  DIAGONAL_MOVING_PLATFORM_SPAWN_WEIGHT,
  HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT,
  STATIC_PLATFORM_SPAWN_WEIGHT,
  VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT,
} from "../platformSpawner/PlatformSpawner";
import { MONSTER_SPAWN_PROBABILITY } from "../monsterSpawner/MonsterSpawner";
import {
  getDifficultyParams,
  getDifficultyProgress,
  SCORE_RAMP_END,
} from "./DifficultySystem";
import type { ChallengeModifiers } from "../../../../shared/dailyChallenge/types.ts";

// Baseline fixture for tests that vary one modifier at a time.
const BASE_MODIFIERS: ChallengeModifiers = {
  difficultyRampScale: 1,
  movingShareBias: 0,
  monsterRateBias: 0,
  springSpawnProbability: 0.1,
  powerupSpawnProbability: 0.03,
  gapBias: 0,
};

describe("getDifficultyProgress", () => {
  it("clamps scores and applies the ease-out ramp", () => {
    expect(getDifficultyProgress(-1)).toBe(0);
    expect(getDifficultyProgress(0)).toBe(0);
    expect(getDifficultyProgress(SCORE_RAMP_END / 2)).toBe(0.75);
    expect(getDifficultyProgress(SCORE_RAMP_END)).toBe(1);
    expect(getDifficultyProgress(SCORE_RAMP_END + 1)).toBe(1);
  });
});

describe("getDifficultyParams", () => {
  it("matches the existing spawn constants at score 0", () => {
    expect(getDifficultyParams(0)).toEqual({
      staticWeight: STATIC_PLATFORM_SPAWN_WEIGHT,
      horizontalMovingWeight: HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT,
      verticalMovingWeight: VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT,
      diagonalMovingWeight: DIAGONAL_MOVING_PLATFORM_SPAWN_WEIGHT,
      minGapRatio: MIN_PLATFORM_SPAWN_GAP_RATIO,
      maxGapRatio: MAX_PLATFORM_SPAWN_GAP_RATIO,
      minPlatformWidth: DEFAULT_PLATFORM_WIDTH,
      maxPlatformWidth: DEFAULT_PLATFORM_WIDTH,
      monsterSpawnProbability: MONSTER_SPAWN_PROBABILITY,
      minMonsterSpeed: MIN_MONSTER_SPEED,
      maxMonsterSpeed: MAX_MONSTER_SPEED,
      minHorizontalMonsterTravel: MIN_HORIZONTAL_MONSTER_TRAVEL_DISTANCE,
      maxHorizontalMonsterTravel: MAX_HORIZONTAL_MONSTER_TRAVEL_DISTANCE,
      minCircularMonsterOrbitRadius: MIN_CIRCULAR_MONSTER_ORBIT_RADIUS,
      maxCircularMonsterOrbitRadius: MAX_CIRCULAR_MONSTER_ORBIT_RADIUS,
      minTriangularMonsterPathSize: MIN_TRIANGULAR_MONSTER_PATH_SIZE,
      maxTriangularMonsterPathSize: MAX_TRIANGULAR_MONSTER_PATH_SIZE,
      monsterSizeScale: 1,
    });
  });

  it("caps values at the hard profile", () => {
    expect(getDifficultyParams(SCORE_RAMP_END)).toEqual({
      staticWeight: 0.55,
      horizontalMovingWeight: 0.225,
      verticalMovingWeight: 0.1125,
      diagonalMovingWeight: 0.1125,
      minGapRatio: 0.38,
      maxGapRatio: 0.72,
      minPlatformWidth: 70,
      maxPlatformWidth: 90,
      monsterSpawnProbability: 0.28,
      minMonsterSpeed: 0.09,
      maxMonsterSpeed: 0.15,
      minHorizontalMonsterTravel: 36,
      maxHorizontalMonsterTravel: 72,
      minCircularMonsterOrbitRadius: 36,
      maxCircularMonsterOrbitRadius: 72,
      minTriangularMonsterPathSize: 60,
      maxTriangularMonsterPathSize: 96,
      monsterSizeScale: 1.25,
    });
  });

  it("keeps classic output unchanged with neutral modifiers", () => {
    expect(getDifficultyParams(SCORE_RAMP_END / 2)).toEqual(
      getDifficultyParams(SCORE_RAMP_END / 2, BASE_MODIFIERS),
    );
  });

  it("applies ramp scale and gameplay biases when modifiers are present", () => {
    const params = getDifficultyParams(SCORE_RAMP_END / 2, {
      ...BASE_MODIFIERS,
      difficultyRampScale: 1.2,
      movingShareBias: 0.1,
      monsterRateBias: 0.1,
      gapBias: 0.04,
    });

    expect(params.staticWeight).toBeCloseTo(0.47);
    expect(params.horizontalMovingWeight).toBeCloseTo(0.265);
    expect(params.verticalMovingWeight).toBeCloseTo(0.1325);
    expect(params.diagonalMovingWeight).toBeCloseTo(0.1325);
    expect(params.monsterSpawnProbability).toBeCloseTo(0.367);
    expect(params.minGapRatio).toBeCloseTo(0.414);
    expect(params.maxGapRatio).toBeCloseTo(0.748);
    expect(params.minPlatformWidth).toBeCloseTo(72);
  });

  it("clamps modifier-adjusted moving share to playable bounds", () => {
    const easyParams = getDifficultyParams(0, {
      ...BASE_MODIFIERS,
      movingShareBias: -0.1,
    });
    const hardParams = getDifficultyParams(SCORE_RAMP_END, {
      ...BASE_MODIFIERS,
      movingShareBias: 0.2,
    });

    expect(easyParams.staticWeight).toBe(0.85);
    expect(hardParams.staticWeight).toBeCloseTo(0.35);
  });

  it("clamps modifier-adjusted monster rate and gaps to playable bounds", () => {
    const lowParams = getDifficultyParams(0, {
      ...BASE_MODIFIERS,
      monsterRateBias: -1,
      gapBias: -1,
    });
    const highParams = getDifficultyParams(SCORE_RAMP_END, {
      ...BASE_MODIFIERS,
      monsterRateBias: 1,
      gapBias: 1,
    });

    expect(lowParams.monsterSpawnProbability).toBe(0.05);
    expect(highParams.monsterSpawnProbability).toBe(0.45);
    expect(lowParams.minGapRatio).toBeGreaterThanOrEqual(0.25);
    expect(lowParams.maxGapRatio).toBeGreaterThan(lowParams.minGapRatio);
    expect(highParams.maxGapRatio).toBeLessThanOrEqual(0.85);
    expect(highParams.minGapRatio).toBeLessThan(highParams.maxGapRatio);
  });
});
