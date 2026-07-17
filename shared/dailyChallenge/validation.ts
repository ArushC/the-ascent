import type { ChallengeModifiers, DailyChallenge } from "./types.ts";
import {
  ChallengeModifiersSchema,
  DailyChallengeSchema,
} from "./zodSchemas.ts";

export {
  CHALLENGE_MODIFIER_LIMITS,
  DAILY_CHALLENGE_DATE_PATTERN,
  MAX_DAILY_CHALLENGE_SEED,
} from "./zodSchemas.ts";

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function clampChallengeModifiers(
  modifiers: Partial<ChallengeModifiers> = {},
): ChallengeModifiers {
  return ChallengeModifiersSchema.parse(modifiers);
}

export function parseDailyChallenge(value: unknown): DailyChallenge {
  return DailyChallengeSchema.parse(value);
}

export function validateDailyChallenge(
  value: unknown,
): ValidationResult {
  const result = DailyChallengeSchema.safeParse(value);

  if (!result.success) {
    return {
      ok: false,
      message: result.error.issues[0]?.message ?? "Invalid daily challenge.",
    };
  }

  return { ok: true };
}
