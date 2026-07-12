import { describe, expect, it } from "vitest";
import {
  getLeaderboardPage,
  getLeaderboardPageCount,
  renderPersonalBestText,
} from "./leaderboardMenu.ts";
import type { LeaderboardEntry } from "../../../api/leaderboard";

describe("renderPersonalBestText", () => {
  it("formats each personal best state", () => {
    expect(renderPersonalBestText({ status: "idle", score: null })).toBe(
      "Your best: --",
    );
    expect(renderPersonalBestText({ status: "loading", score: null })).toBe(
      "Your best: Loading...",
    );
    expect(renderPersonalBestText({ status: "loaded", score: 20 })).toBe(
      "Your best: 20",
    );
    expect(renderPersonalBestText({ status: "error", score: null })).toBe(
      "Your best unavailable",
    );
  });
});

describe("leaderboard pagination", () => {
  it("shows ten entries per page", () => {
    const entries = Array.from({ length: 12 }, (_, index): LeaderboardEntry => {
      const rank = index + 1;

      return {
        rank,
        playerName: `Player ${rank}`,
        score: 100 - rank,
        createdAt: String(rank),
      };
    });

    expect(getLeaderboardPageCount(entries.length)).toBe(2);
    expect(getLeaderboardPage(entries, 0)).toHaveLength(10);
    expect(getLeaderboardPage(entries, 1)).toHaveLength(2);
  });
});
