import { ScoreSchema } from "./zodSchemas.ts";

export { MAX_SCORE } from "./zodSchemas.ts";

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateScore(score: number): ValidationResult {
  return toValidationResult(ScoreSchema.safeParse(score));
}

type ParsedResult = ReturnType<typeof ScoreSchema.safeParse>;

function toValidationResult(result: ParsedResult): ValidationResult {
  if (!result.success) {
    return {
      ok: false,
      message: result.error.issues[0]?.message ?? "Invalid value.",
    };
  }

  return { ok: true };
}
