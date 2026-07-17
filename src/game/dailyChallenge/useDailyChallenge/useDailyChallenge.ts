import { useEffect, useState } from "react";
import {
  fetchDailyChallenge,
  type DailyChallenge,
} from "../../../api/dailyChallenge";

export type DailyChallengeLoadState =
  | { status: "idle"; challenge: null; error: null }
  | { status: "loading"; challenge: null; error: null }
  | { status: "loaded"; challenge: DailyChallenge; error: null }
  | { status: "error"; challenge: null; error: Error };

/** Fetches the menu's daily challenge. */
export function useDailyChallenge(
  fetchChallenge = fetchDailyChallenge,
): DailyChallengeLoadState {
  const [state, setState] = useState<DailyChallengeLoadState>({
    status: "idle",
    challenge: null,
    error: null,
  });

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadChallenge(): Promise<void> {
      setState({ status: "loading", challenge: null, error: null });

      try {
        const challenge = await fetchChallenge();

        if (isCurrentRequest) {
          setState({ status: "loaded", challenge, error: null });
        }
      } catch (error) {
        if (isCurrentRequest) {
          setState(toDailyChallengeErrorState(error));
        }
      }
    }

    void loadChallenge();

    return () => {
      isCurrentRequest = false;
    };
  }, [fetchChallenge]);

  return state;
}

export function toDailyChallengeErrorState(
  error: unknown,
): Extract<DailyChallengeLoadState, { status: "error" }> {
  return {
    status: "error",
    challenge: null,
    error: error instanceof Error ? error : new Error(String(error)),
  };
}
