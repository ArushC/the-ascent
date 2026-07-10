import type { LeaderboardEntry } from "../api/leaderboard";

export type PersonalBestState = {
  status: "idle" | "loading" | "loaded" | "error";
  score: number | null;
};

export type LeaderboardState = {
  status: "idle" | "loading" | "loaded" | "error";
  entries: LeaderboardEntry[];
};
