import { z } from "zod";
import type { ScoreSubmission } from "../shared/leaderboardTypes.ts";
import { PlayerNameSchema, ScoreSchema } from "../shared/validation.ts";

const PlayerIdSchema = z.string().uuid("expected UUID");
const ScoreSubmissionSchema = z.object({
  playerId: PlayerIdSchema,
  playerName: PlayerNameSchema,
  score: ScoreSchema,
});

type PolicyResult =
  | { ok: true; submission: ScoreSubmission }
  | { ok: false; details: string[] };

export function validateScoreSubmission(body: unknown): PolicyResult {
  const result = ScoreSubmissionSchema.safeParse(body);

  if (!result.success) {
    return { ok: false, details: formatZodIssues(result.error.issues) };
  }

  return { ok: true, submission: result.data };
}

export function isValidPlayerId(playerId: string): boolean {
  return PlayerIdSchema.safeParse(playerId).success;
}

function formatZodIssues(issues: z.ZodIssue[]): string[] {
  return issues.map((issue) => {
    const field = issue.path.join(".");
    return field ? `${field}: ${issue.message}` : issue.message;
  });
}
