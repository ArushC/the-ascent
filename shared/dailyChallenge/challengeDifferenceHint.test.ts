import { describe, expect, it } from "vitest";
import type { ChallengeModifiers } from "./types.ts";
import { getChallengeDifferenceHint } from "./challengeDifferenceHint.ts";
import { CHALLENGE_MODIFIER_LIMITS } from "./zodSchemas.ts";

const NORMAL_MODIFIERS: ChallengeModifiers = {
  difficultyRampScale:
    CHALLENGE_MODIFIER_LIMITS.difficultyRampScale.defaultValue,
  movingShareBias: CHALLENGE_MODIFIER_LIMITS.movingShareBias.defaultValue,
  monsterRateBias: CHALLENGE_MODIFIER_LIMITS.monsterRateBias.defaultValue,
  springSpawnProbability:
    CHALLENGE_MODIFIER_LIMITS.springSpawnProbability.defaultValue,
  powerupSpawnProbability:
    CHALLENGE_MODIFIER_LIMITS.powerupSpawnProbability.defaultValue,
  gapBias: CHALLENGE_MODIFIER_LIMITS.gapBias.defaultValue,
};

describe("getChallengeDifferenceHint", () => {
  it.each([
    [
      "moving platforms",
      { movingShareBias: 0.16 },
      "More moving platforms than normal.",
    ],
    ["monsters", { monsterRateBias: 0.1 }, "More monsters than normal."],
    ["springs", { springSpawnProbability: 0.22 }, "More springs than normal."],
    [
      "scarcity",
      {
        springSpawnProbability: 0.06,
        powerupSpawnProbability: 0.01,
        gapBias: 0.06,
      },
      "Sparser help than normal.",
    ],
    [
      "calm play",
      {
        difficultyRampScale: 0.88,
        movingShareBias: -0.04,
        monsterRateBias: -0.04,
      },
      "Gentler than normal.",
    ],
  ])("describes %s", (_name, changes, expected) => {
    expect(
      getChallengeDifferenceHint({ ...NORMAL_MODIFIERS, ...changes }),
    ).toBe(expected);
  });

  it("uses the largest modifier delta when theme scores are tied", () => {
    expect(
      getChallengeDifferenceHint({
        ...NORMAL_MODIFIERS,
        movingShareBias: 0.02,
        monsterRateBias: 0.01,
      }),
    ).toBe("More moving platforms than normal.");
  });

  it("uses a generic hint for normal modifiers", () => {
    expect(getChallengeDifferenceHint(NORMAL_MODIFIERS)).toBe(
      "Different mix than normal.",
    );
  });

  it("describes a non-flat difficulty-only fallback", () => {
    expect(
      getChallengeDifferenceHint({
        ...NORMAL_MODIFIERS,
        difficultyRampScale: 1.05,
      }),
    ).toBe("Tougher than normal.");
  });
});
