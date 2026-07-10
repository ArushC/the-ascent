/** Score run submitted by the browser after a game-over event. */
export type ScoreSubmission = {
  playerId: string;
  playerName: string;
  score: number;
};

/** API response returned after a score run is saved. */
export type ScoreSubmissionResult = {
  runId: number;
  score: number;
  personalBest: number;
  isNewPersonalBest: boolean;
  createdAt: string;
};

/** One score run shown in the global leaderboard. */
export type LeaderboardEntry = {
  rank: number;
  playerName: string;
  score: number;
  createdAt: string;
};

/** Stored personal best for one anonymous player id. */
export type PlayerBest = {
  playerId: string;
  playerName: string;
  bestScore: number;
  achievedAt: string | null;
};
