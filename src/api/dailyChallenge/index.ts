import type { DailyChallenge } from "../../../shared/dailyChallenge/types.ts";
import { parseDailyChallenge } from "../../../shared/dailyChallenge/validation.ts";

export type { DailyChallenge } from "../../../shared/dailyChallenge/types.ts";

export async function fetchDailyChallenge(): Promise<DailyChallenge> {
  const response = await fetch("/api/daily-challenge");

  if (!response.ok) {
    throw new Error("Daily challenge fetch failed.");
  }

  return parseDailyChallenge(await response.json());
}
