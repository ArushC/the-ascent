import type { LeaderboardEntry } from "../api/leaderboard";
import type { PersonalBestState } from "./leaderboardState";

export const LEADERBOARD_PAGE_SIZE = 10;

export function renderPersonalBestText(personalBest: PersonalBestState): string {
  switch (personalBest.status) {
    case "loading":
      return "Your best: Loading...";
    case "loaded":
      return `Your best: ${personalBest.score ?? 0}`;
    case "error":
      return "Your best unavailable";
    case "idle":
      return "Your best: --";
  }
}

export function getLeaderboardPageCount(totalEntries: number): number {
  return Math.max(1, Math.ceil(totalEntries / LEADERBOARD_PAGE_SIZE));
}

export function getLeaderboardPage(
  entries: LeaderboardEntry[],
  page: number,
): LeaderboardEntry[] {
  const start = page * LEADERBOARD_PAGE_SIZE;
  return entries.slice(start, start + LEADERBOARD_PAGE_SIZE);
}
