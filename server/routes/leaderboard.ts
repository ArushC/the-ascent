import type { LeaderboardDb } from "../db.ts";
import { HTTP_STATUS, type JsonResponse } from "../http.ts";
import { isValidPlayerId } from "../policy.ts";
import type {
  LeaderboardEntry,
  PlayerBest,
} from "../../shared/leaderboardTypes.ts";

const LEADERBOARD_ENTRY_LIMIT = 100;

/** GET /leaderboard: returns enough score runs for the UI to paginate locally. */
export function getLeaderboardEntries(
  db: LeaderboardDb,
): JsonResponse<{ entries: LeaderboardEntry[] }> {
  return {
    status: HTTP_STATUS.OK,
    body: { entries: db.getTopScoreRuns(LEADERBOARD_ENTRY_LIMIT) },
  };
}

/** GET /players/:playerId/best: returns one player's stored personal best. */
export function getTopPlayerScore(
  db: LeaderboardDb,
  playerId: string,
): JsonResponse<PlayerBest | { error: string; details?: string[] }> {
  if (!isValidPlayerId(playerId)) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      body: {
        error: "player_score_validation_failed",
        details: ["playerId: expected UUID"],
      },
    };
  }

  const best = db.getTopPlayerScore(playerId);

  if (!best) {
    return { status: HTTP_STATUS.NOT_FOUND, body: { error: "player_not_found" } };
  }

  return { status: HTTP_STATUS.OK, body: best };
}
