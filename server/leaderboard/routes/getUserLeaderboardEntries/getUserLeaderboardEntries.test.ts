import { describe, expect, it } from "vitest";
import { createLeaderboardDb } from "../../db.ts";
import { HTTP_STATUS } from "../../../http.ts";
import { getUserLeaderboardEntries } from "./getUserLeaderboardEntries.ts";

const PLAYER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_PLAYER_ID = "22222222-2222-4222-8222-222222222222";

describe("getUserLeaderboardEntries", () => {
  it("requires a player id", () => {
    const db = createLeaderboardDb(":memory:");

    try {
      expect(getUserLeaderboardEntries(db, null)).toEqual({
        status: HTTP_STATUS.BAD_REQUEST,
        body: { error: "leaderboard_player_id_required" },
      });
      expect(db.getTopScoreRunsForPlayer(PLAYER_ID, 100)).toEqual([]);
    } finally {
      db.close();
    }
  });

  it("rejects invalid player ids", () => {
    const db = createLeaderboardDb(":memory:");

    try {
      expect(getUserLeaderboardEntries(db, "not-a-uuid")).toEqual({
        status: HTTP_STATUS.BAD_REQUEST,
        body: {
          error: "leaderboard_player_id_validation_failed",
          details: ["playerId: expected UUID"],
        },
      });
      expect(db.getTopScoreRunsForPlayer(PLAYER_ID, 100)).toEqual([]);
    } finally {
      db.close();
    }
  });

  it("returns only the requested player's top 100 score runs", () => {
    const db = createLeaderboardDb(":memory:");

    try {
      for (let score = 0; score < 105; score += 1) {
        db.recordScoreRun({ playerId: PLAYER_ID, score });
      }

      db.recordScoreRun({ playerId: OTHER_PLAYER_ID, score: 1_000 });

      const response = getUserLeaderboardEntries(db, PLAYER_ID);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual({
        entries: expect.arrayContaining([
          expect.objectContaining({ rank: 1, score: 104 }),
          expect.objectContaining({ rank: 100, score: 5 }),
        ]),
      });

      if ("entries" in response.body) {
        expect(response.body.entries).toHaveLength(100);
        expect(response.body.entries).not.toEqual(
          expect.arrayContaining([expect.objectContaining({ score: 1_000 })]),
        );
      }
    } finally {
      db.close();
    }
  });
});
