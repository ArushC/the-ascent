import type { LeaderboardDb } from "../../db.ts";
import { HTTP_STATUS, type JsonResponse } from "../../../http.ts";
import {
  formatZodIssues,
  ScoreSubmissionSchema,
} from "../../../../shared/leaderboard/schemas.ts";
import type { ScoreSubmissionResult } from "../../../../shared/leaderboard/types.ts";

/** POST /scores: validates and records one game-over score run. */
export function recordScore(
  db: LeaderboardDb,
  body: unknown,
): JsonResponse<ScoreSubmissionResult | { error: string; details: string[] }> {
  const validation = ScoreSubmissionSchema.safeParse(body);

  if (!validation.success) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      body: {
        error: "score_submission_validation_failed",
        details: formatZodIssues(validation.error.issues),
      },
    };
  }

  return {
    status: HTTP_STATUS.CREATED,
    body: db.recordScoreRun(validation.data),
  };
}
