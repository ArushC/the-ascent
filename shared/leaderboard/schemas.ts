import { z } from "zod";

export const PLAYER_NAME_MAX_LENGTH = 24;
export const PLAYER_NAME_PATTERN = /^[a-zA-Z0-9 _-]+$/;
export const MAX_SCORE = 9_999_999;

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

export const PlayerIdSchema = z.uuid("expected UUID");

export const ScoreSubmissionSchema = z.object({
  playerId: PlayerIdSchema,
  playerName: PlayerNameSchema,
  score: ScoreSchema,
});

export function formatZodIssues(issues: z.core.$ZodIssue[]): string[] {
  return issues.map((issue) => {
    const field = issue.path.map(String).join(".");
    return field ? `${field}: ${issue.message}` : issue.message;
  });
}
