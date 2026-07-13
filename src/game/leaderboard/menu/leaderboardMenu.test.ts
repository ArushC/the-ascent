import { describe, expect, it } from "vitest";
import {
  getLeaderboardPage,
  getLeaderboardPageCount,
} from "./leaderboardMenu.ts";
import type { LeaderboardEntry } from "../../../api/leaderboard";

describe("leaderboard pagination", () => {
  it("shows ten entries per page", () => {
    const entries = Array.from({ length: 12 }, (_, index): LeaderboardEntry => {
      const rank = index + 1;

      return {
        rank,
        score: 100 - rank,
        createdAt: String(rank),
      };
    });

    expect(getLeaderboardPageCount(entries.length)).toBe(2);
    expect(getLeaderboardPage(entries, 0)).toHaveLength(10);
    expect(getLeaderboardPage(entries, 1)).toHaveLength(2);
  });
});
