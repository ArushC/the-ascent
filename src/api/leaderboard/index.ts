import type {
  LeaderboardEntry,
  PlayerBest,
  ScoreSubmission,
  ScoreSubmissionResult,
} from "../../../shared/leaderboard/types.ts";

export type {
  LeaderboardEntry,
  PlayerBest,
  ScoreSubmission,
  ScoreSubmissionResult,
} from "../../../shared/leaderboard/types.ts";

export async function submitScore(
  submission: ScoreSubmission,
): Promise<ScoreSubmissionResult> {
  const response = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(submission),
  });

  if (!response.ok) {
    throw new Error("Score submission failed.");
  }

  return (await response.json()) as ScoreSubmissionResult;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const response = await fetch("/api/leaderboard");

  if (!response.ok) {
    throw new Error("Leaderboard fetch failed.");
  }

  const result = (await response.json()) as { entries: LeaderboardEntry[] };
  return result.entries;
}

export async function fetchPersonalBest(playerId: string): Promise<PlayerBest> {
  const response = await fetch(`/api/players/${encodeURIComponent(playerId)}/best`);

  if (!response.ok) {
    throw new Error("Personal best fetch failed.");
  }

  return (await response.json()) as PlayerBest;
}
