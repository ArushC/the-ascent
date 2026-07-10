import { describe, expect, it } from "vitest";
import { createLeaderboardDb } from "./db.ts";

const ADA_PLAYER_ID = "11111111-1111-4111-8111-111111111111";
const BOB_PLAYER_ID = "22222222-2222-4222-8222-222222222222";

describe("leaderboard database", () => {
  it("keeps personal best from decreasing", () => {
    const db = createLeaderboardDb(":memory:");

    try {
      expect(
        db.recordScoreRun({
          playerId: ADA_PLAYER_ID,
          playerName: "Ada",
          score: 100,
        }).personalBest,
      ).toBe(100);
      expect(
        db.recordScoreRun({
          playerId: ADA_PLAYER_ID,
          playerName: "Ada",
          score: 200,
        }).personalBest,
      ).toBe(200);
      expect(
        db.recordScoreRun({
          playerId: ADA_PLAYER_ID,
          playerName: "Ada",
          score: 50,
        }).personalBest,
      ).toBe(200);
      expect(db.getTopPlayerScore(ADA_PLAYER_ID)?.bestScore).toBe(200);
    } finally {
      db.close();
    }
  });

  it("ranks individual runs by score", () => {
    const db = createLeaderboardDb(":memory:");

    try {
      db.recordScoreRun({
        playerId: ADA_PLAYER_ID,
        playerName: "Ada",
        score: 100,
      });
      db.recordScoreRun({
        playerId: ADA_PLAYER_ID,
        playerName: "Ada",
        score: 300,
      });
      db.recordScoreRun({
        playerId: BOB_PLAYER_ID,
        playerName: "Bob",
        score: 200,
      });

      expect(db.getTopScoreRuns(2)).toEqual([
        expect.objectContaining({ rank: 1, playerName: "Ada", score: 300 }),
        expect.objectContaining({ rank: 2, playerName: "Bob", score: 200 }),
      ]);
    } finally {
      db.close();
    }
  });
});
