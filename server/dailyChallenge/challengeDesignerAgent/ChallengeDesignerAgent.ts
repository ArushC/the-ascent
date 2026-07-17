import type { DailyChallenge } from "../../../shared/dailyChallenge/types.ts";
import { createFallbackChallenge } from "../fallbackChallenge/FallbackChallenge.ts";

export type DailyChallengeDesigner = (
  challengeDate: string,
) => Promise<DailyChallenge> | DailyChallenge;

export async function designChallenge(
  challengeDate: string,
): Promise<DailyChallenge> {
  // TODO: Replace this fallback-only stub with the LLM-backed designer in phase 6.
  return createFallbackChallenge(challengeDate);
}
