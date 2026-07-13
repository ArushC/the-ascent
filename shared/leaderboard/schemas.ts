import { z } from "zod";

export const MAX_SCORE = 9_999_999;

export const ScoreSchema = z
  .number()
  .int("Score must be an integer.")
  .min(0, "Score must be non-negative.")
  .max(MAX_SCORE, `Score must be ${MAX_SCORE} or lower.`);

export const PlayerIdSchema = z.uuid("expected UUID");

export const ScoreSubmissionSchema = z.object({
  playerId: PlayerIdSchema,
  score: ScoreSchema,
});

export function formatZodIssues(issues: z.core.$ZodIssue[]): string[] {
  return issues.map((issue) => {
    const field = issue.path.map(String).join(".");
    return field ? `${field}: ${issue.message}` : issue.message;
  });
}
