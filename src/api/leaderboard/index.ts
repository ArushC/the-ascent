import type {
  LeaderboardEntry,
  PlayerBest,
  ScoreSubmission,
  ScoreSubmissionResult,
  ScoreBoard,
} from "../../../shared/leaderboard/types.ts";

export type {
  LeaderboardEntry,
  PlayerBest,
  ScoreSubmission,
  ScoreSubmissionResult,
  ScoreBoard,
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

export async function fetchLeaderboard(
  playerId: string,
  board: ScoreBoard = { mode: "classic" },
): Promise<LeaderboardEntry[]> {
  const response = await fetch(createLeaderboardUrl(playerId, board));

  if (!response.ok) {
    throw new Error("Leaderboard fetch failed.");
  }

  const result = (await response.json()) as { entries: LeaderboardEntry[] };
  return result.entries;
}

/** Encodes the selected score board as GET collection filters. */
function createLeaderboardUrl(playerId: string, board: ScoreBoard): string {
  const search = new URLSearchParams({ playerId });

  if (board.mode === "daily") {
    search.set("mode", "daily");
    search.set("challengeDate", board.challengeDate);
  }

  return `/api/leaderboard?${search.toString()}`;
}

export async function fetchPersonalBest(playerId: string): Promise<PlayerBest> {
  const response = await fetch(`/api/players/${encodeURIComponent(playerId)}/best`);

  if (!response.ok) {
    throw new Error("Personal best fetch failed.");
  }

  return (await response.json()) as PlayerBest;
}
