import type { DailyChallenge } from "../../../../shared/dailyChallenge/types.ts";

export const OFFLINE_DAILY_CHALLENGES: readonly DailyChallenge[] = [
  {
    challengeDate: "2026-07-17",
    seed: 0x77ccdff5,
    title: "Skyline Drift",
    blurb: "More movers, wider gaps, and a lighter monster lane.",
    modifiers: {
      difficultyRampScale: 1.1,
      movingShareBias: 0.12,
      monsterRateBias: -0.02,
      springSpawnProbability: 0.14,
      powerupSpawnProbability: 0.04,
      gapBias: 0.04,
    },
    source: "fallback",
  },
];

export const OFFLINE_DAILY_CHALLENGE = OFFLINE_DAILY_CHALLENGES[0];
