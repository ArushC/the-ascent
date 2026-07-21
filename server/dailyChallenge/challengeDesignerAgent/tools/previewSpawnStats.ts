import { createSeededRng } from "../../../../src/game/rng/seededRng/SeededRng.ts";
import { getDifficultyParams } from "../../../../src/game/systems/difficultySystem/DifficultySystem.ts";
import { rollPlatformExtras } from "../../../../src/game/systems/platformSpawner/platformExtras.ts";
import { PREVIEW_EXTRA_SAMPLES_PER_BAND, PREVIEW_SCORE_BANDS } from "../constants.ts";
import type { BandSpawnRates, DailyChallenge, SpawnPreview } from "../types.ts";

/** Samples representative spawn behavior without running a full game simulation. */
export function previewSpawnStats(challenge: DailyChallenge): SpawnPreview {
  const rng = createSeededRng(challenge.seed);
  const bands = PREVIEW_SCORE_BANDS.map((score): BandSpawnRates => {
    const params = getDifficultyParams(score, challenge.modifiers);
    let springHits = 0;
    let powerupHits = 0;
    for (let i = 0; i < PREVIEW_EXTRA_SAMPLES_PER_BAND; i += 1) {
      const extras = rollPlatformExtras(rng, challenge.modifiers);
      springHits += Number(extras.hasSpring);
      powerupHits += Number(extras.hasPowerup);
    }
    return {
      score,
      movingShare: 1 - params.staticWeight,
      monsterRate: params.monsterSpawnProbability,
      springRate: springHits / PREVIEW_EXTRA_SAMPLES_PER_BAND,
      powerupRate: powerupHits / PREVIEW_EXTRA_SAMPLES_PER_BAND,
      meanGapRatio: (params.minGapRatio + params.maxGapRatio) / 2,
    };
  });
  const average = (key: keyof Omit<BandSpawnRates, "score">) => bands.reduce((sum, band) => sum + band[key], 0) / bands.length;
  return {
    seed: challenge.seed,
    bands,
    avg: {
      movingShare: average("movingShare"), monsterRate: average("monsterRate"),
      springRate: average("springRate"), powerupRate: average("powerupRate"),
      meanGapRatio: average("meanGapRatio"),
    },
  };
}
