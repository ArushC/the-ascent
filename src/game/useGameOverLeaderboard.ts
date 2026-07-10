import { useEffect, useState } from "react";
import {
  fetchLeaderboard,
  fetchPersonalBest,
  submitScore,
} from "../api/leaderboard";
import type { GamePhase } from "./Game";
import type { LeaderboardState, PersonalBestState } from "./leaderboardState";

type UseGameOverLeaderboardArgs = {
  phase: GamePhase;
  playerId: string;
  playerName: string | null;
  score: number;
};

export function useGameOverLeaderboard({
  phase,
  playerId,
  playerName,
  score,
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
    if (phase !== "over" || !playerName) return;

    setPersonalBest({ status: "loading", score: null });
    setLeaderboard({ status: "loading", entries: [] });

    submitScore({ playerId, playerName, score })
      .then((result) => {
        setPersonalBest({ status: "loaded", score: result.personalBest });
        refreshLeaderboard(setLeaderboard);
      })
      .catch((error: unknown) => {
        console.warn(error);
        setPersonalBest((current) =>
          current.status === "loaded"
            ? current
            : { status: "error", score: null },
        );
      });

    fetchPersonalBest(playerId)
      .then((best) => {
        setPersonalBest({ status: "loaded", score: best.bestScore });
      })
      .catch(() => {
        setPersonalBest((current) =>
          current.status === "loaded" ? current : { status: "error", score: null },
        );
      });

    refreshLeaderboard(setLeaderboard);
  }, [phase, playerId, playerName, score]);

  return { personalBest, leaderboard };
}

function refreshLeaderboard(
  setLeaderboard: (leaderboard: LeaderboardState) => void,
): void {
  fetchLeaderboard()
    .then((entries) => {
      setLeaderboard({ status: "loaded", entries });
    })
    .catch(() => {
      setLeaderboard({ status: "error", entries: [] });
    });
}
