import { describe, expect, it } from "vitest";
import { createLeaderboardDb, type LeaderboardDb } from "../../db.ts";
import { HTTP_STATUS } from "../../../http.ts";
import { MAX_SCORE } from "../../../../shared/leaderboard/zodSchemas.ts";
import type { ScoreSubmission } from "../../../../shared/leaderboard/types.ts";
import { recordScore } from "./postScoreSubmission.ts";

const PLAYER_ID = "11111111-1111-4111-8111-111111111111";

describe("recordScore", () => {
  it("rejects non-object request bodies", () => {
    withLeaderboardDb((db) => {
      const response = recordScore(db, null);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body).toEqual({
        error: "score_submission_validation_failed",
        details: expect.arrayContaining([expect.any(String)]),
      });
    });
  });

  it("rejects invalid player ids", () => {
    withLeaderboardDb((db) => {
      expect(recordScore(db, scoreSubmission({ playerId: "not-a-uuid" }))).toEqual({
        status: HTTP_STATUS.BAD_REQUEST,
        body: {
          error: "score_submission_validation_failed",
          details: ["playerId: expected UUID"],
        },
      });
    });
  });

  it("rejects negative scores", () => {
    withLeaderboardDb((db) => {
      expect(recordScore(db, scoreSubmission({ score: -1 }))).toEqual({
        status: HTTP_STATUS.BAD_REQUEST,
        body: {
          error: "score_submission_validation_failed",
          details: ["score: Score must be non-negative."],
        },
      });
    });
  });

  it("rejects fractional scores", () => {
    withLeaderboardDb((db) => {
      expect(recordScore(db, scoreSubmission({ score: 1.5 }))).toEqual({
        status: HTTP_STATUS.BAD_REQUEST,
        body: {
          error: "score_submission_validation_failed",
          details: ["score: Score must be an integer."],
        },
      });
    });
  });

  it("rejects scores above the maximum", () => {
    withLeaderboardDb((db) => {
      expect(recordScore(db, scoreSubmission({ score: MAX_SCORE + 1 }))).toEqual({
        status: HTTP_STATUS.BAD_REQUEST,
        body: {
          error: "score_submission_validation_failed",
          details: [`score: Score must be ${MAX_SCORE} or lower.`],
        },
      });
    });
  });

  it("records zero as a valid score", () => {
    withLeaderboardDb((db) => {
      const response = recordScore(db, scoreSubmission({ score: 0 }));

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body).toEqual({
        runId: expect.any(Number),
        score: 0,
        personalBest: 0,
        isNewPersonalBest: true,
        createdAt: expect.any(String),
      });
      expect(db.getTopPlayerScore(PLAYER_ID)?.bestScore).toBe(0);
    });
  });

  it("records the maximum allowed score", () => {
    withLeaderboardDb((db) => {
      const response = recordScore(db, scoreSubmission({ score: MAX_SCORE }));

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body).toEqual({
        runId: expect.any(Number),
        score: MAX_SCORE,
        personalBest: MAX_SCORE,
        isNewPersonalBest: true,
        createdAt: expect.any(String),
      });
      expect(db.getTopPlayerScore(PLAYER_ID)?.bestScore).toBe(MAX_SCORE);
    });
  });

  it("requires a challenge date for daily scores", () => {
    withLeaderboardDb((db) => {
      expect(recordScore(db, scoreSubmission({ mode: "daily" }))).toEqual({
        status: HTTP_STATUS.BAD_REQUEST,
        body: {
          error: "score_submission_validation_failed",
          details: [
            "challengeDate: Challenge date is required for daily scores.",
          ],
        },
      });
    });
  });

  it("accepts daily scores with a UTC challenge date", () => {
    withLeaderboardDb((db) => {
      const response = recordScore(
        db,
        scoreSubmission({ mode: "daily", challengeDate: "2026-07-20" }),
      );

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(db.getTopScoreRunsForPlayer(PLAYER_ID, 100)).toEqual([]);
      expect(
        db.getTopScoreRunsForPlayer(PLAYER_ID, 100, {
          mode: "daily",
          challengeDate: "2026-07-20",
        }),
      ).toEqual([expect.objectContaining({ score: 100 })]);
    });
  });

  it("keeps the existing personal best for lower later submissions", () => {
    withLeaderboardDb((db) => {
      recordScore(db, scoreSubmission({ score: 500 }));

      const response = recordScore(db, scoreSubmission({ score: 100 }));

      expect(response).toEqual({
        status: HTTP_STATUS.CREATED,
        body: {
          runId: expect.any(Number),
          score: 100,
          personalBest: 500,
          isNewPersonalBest: false,
          createdAt: expect.any(String),
        },
      });
      expect(db.getTopPlayerScore(PLAYER_ID)?.bestScore).toBe(500);
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
    score: 100,
    ...overrides,
  };
}
