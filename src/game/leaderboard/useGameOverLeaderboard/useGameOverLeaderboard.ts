import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { fetchLeaderboard, submitScore } from "../../../api/leaderboard";
import type { ScoreBoard, ScoreSubmission } from "../../../../shared/leaderboard/types.ts";
import type { GamePhase, RunMode } from "../../Game";
import type { LeaderboardState, PersonalBestState } from "../state/leaderboardState";

type UseGameOverLeaderboardArgs = {
  phase: GamePhase;
  playerId: string;
  score: number;
  mode: RunMode;
  challengeDate: string | null;
};

export function useGameOverLeaderboard({
  phase,
  playerId,
  score,
  mode,
  challengeDate,
}: UseGameOverLeaderboardArgs) {
  const [personalBest, setPersonalBest] = useState<PersonalBestState>({
    status: "idle",
    score: null,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardState>({
    status: "idle",
    entries: [],
  });

  useEffect(() => {
    if (phase !== "over") return;

    setPersonalBest({ status: "loading", score: null });
    setLeaderboard({ status: "loading", entries: [] });

    const board = getScoreBoard(mode, challengeDate);

    if (!board) {
      setPersonalBest({ status: "error", score: null });
      setLeaderboard({ status: "error", entries: [] });
      return;
    }

    void loadGameOverScores(
      playerId,
      score,
      board,
      setPersonalBest,
      setLeaderboard,
    );
  }, [phase, playerId, score, mode, challengeDate]);

  return { personalBest, leaderboard };
}

/** Daily boards are always tied to the challenge that started the run. */
function getScoreBoard(
  mode: RunMode,
  challengeDate: string | null,
): ScoreBoard | null {
  if (mode === "classic") {
    return { mode: "classic" };
  }

  return challengeDate ? { mode: "daily", challengeDate } : null;
}

async function loadGameOverScores(
  playerId: string,
  score: number,
  board: ScoreBoard,
  setPersonalBest: Dispatch<SetStateAction<PersonalBestState>>,
  setLeaderboard: Dispatch<SetStateAction<LeaderboardState>>,
): Promise<void> {
  const submission: ScoreSubmission = { playerId, score, ...board };

  try {
    const result = await submitScore(submission);
    const entries = await fetchLeaderboard(playerId, board);

    setPersonalBest({ status: "loaded", score: result.personalBest });
    setLeaderboard({ status: "loaded", entries });
  } catch (error: unknown) {
    console.warn(error);
    setPersonalBest({ status: "error", score: null });
    setLeaderboard({ status: "error", entries: [] });
  }
}
