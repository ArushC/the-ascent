import { z } from "zod";
import { DAILY_CHALLENGE_DATE_PATTERN } from "../dailyChallenge/zodSchemas.ts";
import type { ScoreBoard, ScoreSubmission } from "./types.ts";

export const MAX_SCORE = 9_999_999;

export const ScoreSchema = z
  .number()
  .int("Score must be an integer.")
  .min(0, "Score must be non-negative.")
  .max(MAX_SCORE, `Score must be ${MAX_SCORE} or lower.`);

export const PlayerIdSchema = z.uuid("expected UUID");

export const ScoreModeSchema = z.enum(["classic", "daily"]);
export const ChallengeDateSchema = z
  .string()
  .regex(DAILY_CHALLENGE_DATE_PATTERN, "expected UTC date in YYYY-MM-DD format");

export const ScoreSubmissionSchema = z
  .object({
    playerId: PlayerIdSchema,
    score: ScoreSchema,
    mode: ScoreModeSchema.optional(),
    challengeDate: ChallengeDateSchema.optional(),
  })
  .superRefine(validateScoreBoard)
  .transform((submission) => submission as ScoreSubmission);

export const ScoreRunFilterSchema = z
  .object({
    mode: ScoreModeSchema.optional(),
    challengeDate: ChallengeDateSchema.optional(),
  })
  .superRefine(validateScoreBoard)
  .transform((board) => board as ScoreBoard);

/** Enforces the shared invariant: only daily boards have, and require, a date. */
function validateScoreBoard(
  board: { mode?: "classic" | "daily"; challengeDate?: string },
  context: z.RefinementCtx,
): void {
  if (board.mode === "daily" && !board.challengeDate) {
    context.addIssue({
      code: "custom",
      path: ["challengeDate"],
      message: "Challenge date is required for daily scores.",
    });
  }

  if (board.mode !== "daily" && board.challengeDate) {
    context.addIssue({
      code: "custom",
      path: ["challengeDate"],
      message: "Challenge date is only valid for daily scores.",
    });
  }
}

export function formatZodIssues(issues: z.core.$ZodIssue[]): string[] {
  return issues.map((issue) => {
    const field = issue.path.map(String).join(".");
    return field ? `${field}: ${issue.message}` : issue.message;
  });
}
