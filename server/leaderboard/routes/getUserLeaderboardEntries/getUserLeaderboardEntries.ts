import type { LeaderboardDb } from "../../db.ts";
import { HTTP_STATUS, type JsonResponse } from "../../../http.ts";
import {
  formatZodIssues,
  PlayerIdSchema,
  ScoreRunFilterSchema,
} from "../../../../shared/leaderboard/zodSchemas.ts";
import type { LeaderboardEntry } from "../../../../shared/leaderboard/types.ts";

const LEADERBOARD_ENTRY_LIMIT = 100;

/** GET /leaderboard: returns one user's score runs for the UI to paginate locally. */
export function getUserLeaderboardEntries(
  db: LeaderboardDb,
  playerId: string | null,
  mode: string | null = null,
  challengeDate: string | null = null,
): JsonResponse<{ entries: LeaderboardEntry[] } | { error: string; details?: string[] }> {
  if (playerId === null) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      body: { error: "leaderboard_player_id_required" },
    };
  }

  const filterValidation = ScoreRunFilterSchema.safeParse({
    mode: mode ?? undefined,
    challengeDate: challengeDate ?? undefined,
  });

  if (!filterValidation.success) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      body: {
        error: "leaderboard_filter_validation_failed",
        details: formatZodIssues(filterValidation.error.issues),
      },
    };
  }

  if (!PlayerIdSchema.safeParse(playerId).success) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      body: {
        error: "leaderboard_player_id_validation_failed",
        details: ["playerId: expected UUID"],
      },
    };
  }

  return {
    status: HTTP_STATUS.OK,
    body: {
      entries: db.getTopScoreRunsForPlayer(
        playerId,
        LEADERBOARD_ENTRY_LIMIT,
        filterValidation.data,
      ),
    },
  };
}
