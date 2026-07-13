import type { LeaderboardDb } from "../../db.ts";
import { HTTP_STATUS, type JsonResponse } from "../../../http.ts";
import { PlayerIdSchema } from "../../../../shared/leaderboard/zodSchemas.ts";
import type { PlayerBest } from "../../../../shared/leaderboard/types.ts";

/** GET /players/:playerId/best: returns one player's stored personal best. */
export function getTopPlayerScore(
  db: LeaderboardDb,
  playerId: string,
): JsonResponse<PlayerBest | { error: string; details?: string[] }> {
  if (!PlayerIdSchema.safeParse(playerId).success) {
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
