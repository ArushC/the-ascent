import type { DailyChallenge } from "../../../shared/dailyChallenge/types.ts";
import { parseDailyChallenge } from "../../../shared/dailyChallenge/validation.ts";
import { hashDateToSeed } from "../../../src/game/rng/seededRng/SeededRng.ts";

// Presets choose the day's theme/modifiers; the hashed seed drives layout RNG.
type FallbackPresetId =
  | "calm"
  | "movers"
  | "monster_alley"
  | "spring_fest"
  | "starved";

type FallbackPreset = Omit<DailyChallenge, "challengeDate" | "seed" | "source">;

export const FALLBACK_CHALLENGE_PRESETS: Record<
  FallbackPresetId,
  FallbackPreset
> = {
  calm: {
    title: "Calm Current",
    blurb: "Use forgiving gaps and generous spawns to recover.",
    modifiers: {
      difficultyRampScale: 0.88,
      movingShareBias: -0.04,
      monsterRateBias: -0.04,
      springSpawnProbability: 0.12,
      powerupSpawnProbability: 0.04,
      gapBias: -0.03,
    },
  },
  movers: {
    title: "Moving Day",
    blurb: "Time jumps across drifting platforms.",
    modifiers: {
      difficultyRampScale: 1.08,
      movingShareBias: 0.16,
      monsterRateBias: -0.01,
      springSpawnProbability: 0.1,
      powerupSpawnProbability: 0.03,
      gapBias: 0.02,
    },
  },
  monster_alley: {
    title: "Monster Alley",
    blurb: "Fight through the monster lane with the tools you find.",
    modifiers: {
      difficultyRampScale: 1.12,
      movingShareBias: 0.02,
      monsterRateBias: 0.1,
      springSpawnProbability: 0.11,
      powerupSpawnProbability: 0.05,
      gapBias: 0,
    },
  },
  spring_fest: {
    title: "Spring Fest",
    blurb: "Bounce into higher lines and recover from risky landings.",
    modifiers: {
      difficultyRampScale: 1,
      movingShareBias: 0.04,
      monsterRateBias: -0.02,
      springSpawnProbability: 0.22,
      powerupSpawnProbability: 0.03,
      gapBias: 0.03,
    },
  },
  starved: {
    title: "Starved Skies",
    blurb: "Make every landing count across wider gaps.",
    modifiers: {
      difficultyRampScale: 1.18,
      movingShareBias: 0.06,
      monsterRateBias: 0.02,
      springSpawnProbability: 0.06,
      powerupSpawnProbability: 0.01,
      gapBias: 0.06,
    },
  },
};

const FALLBACK_PRESET_IDS = Object.keys(
  FALLBACK_CHALLENGE_PRESETS,
) as FallbackPresetId[];

export function createFallbackChallenge(challengeDate: string): DailyChallenge {
  const seed = hashDateToSeed(challengeDate);
  const presetId = FALLBACK_PRESET_IDS[seed % FALLBACK_PRESET_IDS.length];
  const preset = FALLBACK_CHALLENGE_PRESETS[presetId];

  return parseDailyChallenge({
    challengeDate,
    seed,
    title: preset.title,
    blurb: preset.blurb,
    modifiers: preset.modifiers,
    source: "fallback",
  });
}
