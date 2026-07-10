import { z } from "zod";

export const PLAYER_NAME_MAX_LENGTH = 24;
export const PLAYER_NAME_PATTERN = /^[a-zA-Z0-9 _-]+$/;
export const MAX_SCORE = 9_999_999;

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export const PlayerNameSchema = z
  .string()
  .trim()
  .min(1, "Enter a player name.")
  .max(PLAYER_NAME_MAX_LENGTH, `Use ${PLAYER_NAME_MAX_LENGTH} characters or fewer.`)
  .regex(
    PLAYER_NAME_PATTERN,
    "Use only letters, numbers, spaces, underscores, or hyphens.",
  );

export const ScoreSchema = z
  .number()
  .int("Score must be an integer.")
  .min(0, "Score must be non-negative.")
  .max(MAX_SCORE, `Score must be ${MAX_SCORE} or lower.`);

export function validatePlayerName(name: string): ValidationResult {
  return toValidationResult(PlayerNameSchema.safeParse(name));
}

export function normalizePlayerName(name: string): string {
  return PlayerNameSchema.parse(name);
}

export function validateScore(score: number): ValidationResult {
  return toValidationResult(ScoreSchema.safeParse(score));
}

function toValidationResult(
  result:
    | { success: true }
    | { success: false; error: { issues: Array<{ message: string }> } },
): ValidationResult {
  if (result.success) {
    return { ok: true };
  }

  return { ok: false, message: result.error.issues[0]?.message ?? "Invalid value." };
}
