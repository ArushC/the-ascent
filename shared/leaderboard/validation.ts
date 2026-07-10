import { PlayerNameSchema, ScoreSchema } from "./schemas.ts";

export {
  MAX_SCORE,
  PLAYER_NAME_MAX_LENGTH,
  PLAYER_NAME_PATTERN,
} from "./schemas.ts";

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validatePlayerName(name: string): ValidationResult {
  return toValidationResult(PlayerNameSchema.safeParse(name));
}

export function normalizePlayerName(name: string): string {
  return PlayerNameSchema.parse(name);
}

export function validateScore(score: number): ValidationResult {
  return toValidationResult(ScoreSchema.safeParse(score));
}

type ParsedResult =
  | ReturnType<typeof PlayerNameSchema.safeParse>
  | ReturnType<typeof ScoreSchema.safeParse>;

function toValidationResult(result: ParsedResult): ValidationResult {
  if (!result.success) {
    return {
      ok: false,
      message: result.error.issues[0]?.message ?? "Invalid value.",
    };
  }

  return { ok: true };
}
