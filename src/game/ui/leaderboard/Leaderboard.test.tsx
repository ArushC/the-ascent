import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Leaderboard } from "./Leaderboard";
import type { LeaderboardEntry } from "../../../api/leaderboard";

describe("Leaderboard", () => {
  it("renders fallback states", () => {
    expect(
      renderToStaticMarkup(
        <Leaderboard leaderboard={{ status: "loading", entries: [] }} />,
      ),
    ).toContain("Loading leaderboard...");
    expect(
      renderToStaticMarkup(
        <Leaderboard leaderboard={{ status: "error", entries: [] }} />,
      ),
    ).toContain("Leaderboard unavailable");
  });

  it("renders a paginated first page", () => {
    const entries = Array.from({ length: 12 }, (_, index): LeaderboardEntry => {
      const rank = index + 1;

      return {
        rank,
        playerName: `Player ${rank}`,
        score: 100 - rank,
        createdAt: String(rank),
      };
    });
    const markup = renderToStaticMarkup(
      <Leaderboard leaderboard={{ status: "loaded", entries }} />,
    );

    expect(markup).toContain("Top Scores");
    expect(markup).toContain("Player 1");
    expect(markup).not.toContain("Player 11");
    expect(markup).toContain("1 / 2");
  });
});
