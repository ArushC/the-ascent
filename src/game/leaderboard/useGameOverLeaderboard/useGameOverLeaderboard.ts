import { useEffect, useState } from "react";
import {
  fetchLeaderboard,
  fetchPersonalBest,
  submitScore,
} from "../../../api/leaderboard";
import type { GamePhase } from "../../Game";
import type { LeaderboardState, PersonalBestState } from "../state/leaderboardState";

type UseGameOverLeaderboardArgs = {
  phase: GamePhase;
  playerId: string;
  score: number;
};

export function useGameOverLeaderboard({
  phase,
  playerId,
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
    if (phase !== "over") return;

    setPersonalBest({ status: "loading", score: null });
    setLeaderboard({ status: "loading", entries: [] });

    submitScore({ playerId, score })
      .then((result) => {
        setPersonalBest({ status: "loaded", score: result.personalBest });
        refreshLeaderboard(playerId, setLeaderboard);
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

    refreshLeaderboard(playerId, setLeaderboard);
  }, [phase, playerId, score]);

  return { personalBest, leaderboard };
}

function refreshLeaderboard(
  playerId: string,
  setLeaderboard: (leaderboard: LeaderboardState) => void,
): void {
  fetchLeaderboard(playerId)
    .then((entries) => {
      setLeaderboard({ status: "loaded", entries });
    })
    .catch(() => {
      setLeaderboard({ status: "error", entries: [] });
    });
}
