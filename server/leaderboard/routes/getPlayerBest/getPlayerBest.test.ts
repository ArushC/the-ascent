import { describe, expect, it } from "vitest";
import { createLeaderboardDb, type LeaderboardDb } from "../../db.ts";
import { HTTP_STATUS } from "../../../http.ts";
import type { ScoreSubmission } from "../../../../shared/leaderboard/types.ts";
import { getTopPlayerScore } from "./getPlayerBest.ts";

const PLAYER_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_PLAYER_ID = "22222222-2222-4222-8222-222222222222";

describe("getTopPlayerScore", () => {
  it("rejects invalid player ids", () => {
    withLeaderboardDb((db) => {
      expect(getTopPlayerScore(db, "not-a-uuid")).toEqual({
        status: HTTP_STATUS.BAD_REQUEST,
        body: {
          error: "player_score_validation_failed",
          details: ["playerId: expected UUID"],
        },
      });
    });
  });

  it("returns not found when the player has no stored best", () => {
    withLeaderboardDb((db) => {
      expect(getTopPlayerScore(db, PLAYER_ID)).toEqual({
        status: HTTP_STATUS.NOT_FOUND,
        body: { error: "player_not_found" },
      });
    });
  });

  it("returns the requested player's stored personal best", () => {
    withLeaderboardDb((db) => {
      db.recordScoreRun(scoreSubmission({ score: 100 }));
      db.recordScoreRun(scoreSubmission({ score: 300 }));
      db.recordScoreRun(scoreSubmission({ playerId: OTHER_PLAYER_ID, score: 500 }));

      expect(getTopPlayerScore(db, PLAYER_ID)).toEqual({
        status: HTTP_STATUS.OK,
        body: {
          playerId: PLAYER_ID,
          bestScore: 300,
          achievedAt: expect.any(String),
        },
      });
    });
  });
});

function withLeaderboardDb(test: (db: LeaderboardDb) => void): void {
  const db = createLeaderboardDb(":memory:");

  try {
    test(db);
  } finally {
    db.close();
  }
}

function scoreSubmission(
  overrides: Partial<ScoreSubmission> = {},
): ScoreSubmission {
  return {
    playerId: PLAYER_ID,
    score: 0,
    ...overrides,
  };
}
