import type { LeaderboardDb } from "../db.ts";
import { HTTP_STATUS, type JsonResponse } from "../http.ts";
import { validateScoreSubmission } from "../policy.ts";
import type { ScoreSubmissionResult } from "../../shared/leaderboardTypes.ts";

/** POST /scores: validates and records one game-over score run. */
export function recordScore(
  db: LeaderboardDb,
  body: unknown,
): JsonResponse<ScoreSubmissionResult | { error: string; details: string[] }> {
  const validation = validateScoreSubmission(body);

  if (!validation.ok) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      body: {
        error: "score_submission_validation_failed",
        details: validation.details,
      },
    };
  }

  return {
    status: HTTP_STATUS.CREATED,
    body: db.recordScoreRun(validation.submission),
  };
}
