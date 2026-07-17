import { z } from "zod";

// UTC YYYY-MM-DD challenge key.
export const DAILY_CHALLENGE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_DAILY_CHALLENGE_SEED = 2 ** 32 - 1;
export const MAX_DAILY_CHALLENGE_TITLE_LENGTH = 40;
export const MAX_DAILY_CHALLENGE_BLURB_LENGTH = 120;

export const CHALLENGE_MODIFIER_LIMITS = {
  difficultyRampScale: { min: 0.75, max: 1.35, defaultValue: 1 },
  movingShareBias: { min: -0.1, max: 0.2, defaultValue: 0 },
  monsterRateBias: { min: -0.08, max: 0.15, defaultValue: 0 },
  springSpawnProbability: { min: 0.05, max: 0.25, defaultValue: 0.1 },
  powerupSpawnProbability: { min: 0.01, max: 0.08, defaultValue: 0.03 },
  gapBias: { min: -0.05, max: 0.08, defaultValue: 0 },
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function boundedModifierSchema(
  limits: (typeof CHALLENGE_MODIFIER_LIMITS)[keyof typeof CHALLENGE_MODIFIER_LIMITS],
) {
  return z
    .number()
    .finite()
    .default(limits.defaultValue)
    .transform((value) => clamp(value, limits.min, limits.max));
}

export const ChallengeModifiersSchema = z.object({
  difficultyRampScale: boundedModifierSchema(
    CHALLENGE_MODIFIER_LIMITS.difficultyRampScale,
  ),
  movingShareBias: boundedModifierSchema(CHALLENGE_MODIFIER_LIMITS.movingShareBias),
  monsterRateBias: boundedModifierSchema(CHALLENGE_MODIFIER_LIMITS.monsterRateBias),
  springSpawnProbability: boundedModifierSchema(
    CHALLENGE_MODIFIER_LIMITS.springSpawnProbability,
  ),
  powerupSpawnProbability: boundedModifierSchema(
    CHALLENGE_MODIFIER_LIMITS.powerupSpawnProbability,
  ),
  gapBias: boundedModifierSchema(CHALLENGE_MODIFIER_LIMITS.gapBias),
});

export const DailyChallengeSchema = z.object({
  challengeDate: z.string().regex(DAILY_CHALLENGE_DATE_PATTERN),
  seed: z.number().int().min(0).max(MAX_DAILY_CHALLENGE_SEED),
  title: z.string().trim().min(1).max(MAX_DAILY_CHALLENGE_TITLE_LENGTH),
  blurb: z.string().trim().min(1).max(MAX_DAILY_CHALLENGE_BLURB_LENGTH),
  modifiers: ChallengeModifiersSchema,
  source: z.enum(["agent", "fallback"]),
});
