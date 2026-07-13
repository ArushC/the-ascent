import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Leaderboard } from "./Leaderboard";
import { formatScoreTimestamp } from "../../leaderboard/formatScoreTimestamp/formatScoreTimestamp";
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
        score: 100 - rank,
        createdAt: `2026-07-${String(rank).padStart(2, "0")}T12:00:00.000Z`,
      };
    });
    const markup = renderToStaticMarkup(
      <Leaderboard leaderboard={{ status: "loaded", entries }} />,
    );

    expect(markup).toContain("Your Top Scores:");
    expect(markup).toContain("Rank");
    expect(markup).toContain("Timestamp");
    expect(markup).toContain("Score");
    expect(markup).toContain("<td>1</td>");
    expect(markup).toContain(formatScoreTimestamp(entries[0].createdAt));
    expect(markup.indexOf("99")).toBeLessThan(
      markup.indexOf(formatScoreTimestamp(entries[0].createdAt)),
    );
    expect(markup).not.toContain(formatScoreTimestamp(entries[10].createdAt));
    expect(markup).toContain("1 / 2");
  });
});
