import type { LeaderboardDb } from "../db.ts";
import { HTTP_STATUS, type JsonResponse } from "../../http.ts";
import type { LeaderboardEntry } from "../../../shared/leaderboard/types.ts";

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
