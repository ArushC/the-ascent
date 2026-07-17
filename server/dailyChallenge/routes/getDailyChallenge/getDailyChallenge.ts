import { DAILY_CHALLENGE_DATE_PATTERN } from "../../../../shared/dailyChallenge/validation.ts";
import { HTTP_STATUS, type JsonResponse } from "../../../http.ts";
import type { LeaderboardDb } from "../../../leaderboard/db.ts";

export async function getDailyChallenge(
  db: Pick<LeaderboardDb, "getOrCreateDailyChallenge">,
  dateParam: string | null,
  environment = process.env.NODE_ENV,
): Promise<JsonResponse> {
  const challengeDate = getRequestedChallengeDate(dateParam, environment);

  if (!challengeDate) {
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      body: { error: "daily_challenge_date_validation_failed" },
    };
  }

  return {
    status: HTTP_STATUS.OK,
    body: await db.getOrCreateDailyChallenge(challengeDate),
  };
}

// Let tests and local runs ask for a specific date, but keep production on today.
function getRequestedChallengeDate(
  dateParam: string | null,
  environment: string | undefined,
): string | null {
  if (dateParam && environment !== "production") {
    return DAILY_CHALLENGE_DATE_PATTERN.test(dateParam) ? dateParam : null;
  }

  return getUtcChallengeDate();
}

function getUtcChallengeDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}
