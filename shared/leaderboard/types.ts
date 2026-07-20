export type ScoreBoard =
  | { mode?: "classic"; challengeDate?: never }
  | { mode: "daily"; challengeDate: string };

/** Score run submitted by the browser after a game-over event. */
export type ScoreSubmission = {
  playerId: string;
  score: number;
} & ScoreBoard;

/** API response returned after a score run is saved. */
export type ScoreSubmissionResult = {
  runId: number;
  score: number;
  personalBest: number;
  isNewPersonalBest: boolean;
  createdAt: string;
};

/** One score run shown in the private leaderboard. */
export type LeaderboardEntry = {
  rank: number;
  score: number;
  createdAt: string;
};

/** Stored personal best for one anonymous player id. */
export type PlayerBest = {
  playerId: string;
  bestScore: number;
  achievedAt: string | null;
};
