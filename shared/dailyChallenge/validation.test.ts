import { describe, expect, it } from "vitest";
import {
  clampChallengeModifiers,
  parseDailyChallenge,
  validateDailyChallenge,
} from "./validation.ts";

describe("clampChallengeModifiers", () => {
  it("fills default modifiers", () => {
    expect(clampChallengeModifiers()).toEqual({
      difficultyRampScale: 1,
      movingShareBias: 0,
      monsterRateBias: 0,
      springSpawnProbability: 0.1,
      powerupSpawnProbability: 0.03,
      gapBias: 0,
    });
  });

  it("clamps modifiers to the daily challenge limits", () => {
    expect(
      clampChallengeModifiers({
        difficultyRampScale: 9,
        movingShareBias: -9,
        monsterRateBias: 9,
        springSpawnProbability: 9,
        powerupSpawnProbability: -9,
        gapBias: 9,
      }),
    ).toEqual({
      difficultyRampScale: 1.35,
      movingShareBias: -0.1,
      monsterRateBias: 0.15,
      springSpawnProbability: 0.25,
      powerupSpawnProbability: 0.01,
      gapBias: 0.08,
    });
  });
});

describe("DailyChallenge validation", () => {
  it("accepts and trims the planned API response shape", () => {
    expect(
      parseDailyChallenge({
        challengeDate: "2026-07-17",
        seed: 123,
        title: "  Spring Lab  ",
        blurb: "  A bouncy climb.  ",
        modifiers: {},
        source: "fallback",
      }),
    ).toMatchObject({
      challengeDate: "2026-07-17",
      seed: 123,
      title: "Spring Lab",
      blurb: "A bouncy climb.",
      source: "fallback",
    });
  });

  it("rejects invalid daily challenge shapes", () => {
    expect(
      validateDailyChallenge({
        challengeDate: "07-17-2026",
        seed: -1,
        title: "",
        blurb: "A bouncy climb.",
        modifiers: {},
        source: "fallback",
      }).ok,
    ).toBe(false);
  });
});
