import type { DailyChallenge } from "../../shared/dailyChallenge/types.ts";
import { parseDailyChallenge } from "../../shared/dailyChallenge/validation.ts";
import type { SqliteDatabase } from "../leaderboard/sqlite.ts";
import {
  designChallenge,
  type DailyChallengeDesigner,
} from "./challengeDesignerAgent/ChallengeDesignerAgent.ts";

type DailyChallengeRow = {
  challenge_date: string;
  seed: number;
  title: string;
  blurb: string;
  modifiers_json: string;
  source: "agent" | "fallback";
};

const SELECT_DAILY_CHALLENGE_SQL = `
  SELECT challenge_date, seed, title, blurb, modifiers_json, source
  FROM daily_challenges
  WHERE challenge_date = ?
`;

const INSERT_DAILY_CHALLENGE_SQL = `
  INSERT INTO daily_challenges (
    challenge_date,
    seed,
    title,
    blurb,
    modifiers_json,
    source
  )
  VALUES (?, ?, ?, ?, ?, ?)
`;

/** Select-or-insert one persisted challenge per UTC date. */
export async function getOrCreateDailyChallenge(
  db: SqliteDatabase,
  challengeDate: string,
  designer: DailyChallengeDesigner = designChallenge,
): Promise<DailyChallenge> {
  const storedChallenge = selectDailyChallenge(db, challengeDate);

  if (storedChallenge) {
    if (process.env.NODE_ENV !== "test") {
      console.info(
        `[daily-challenge:${challengeDate}] Returning cached ${storedChallenge.source} challenge "${storedChallenge.title}"; the designer was not called.`,
      );
    }
    return storedChallenge;
  }

  const challenge = parseDailyChallenge(await designer(challengeDate));

  try {
    insertDailyChallenge(db, challenge);
    return challenge;
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const challengeInsertedByOtherRequest = selectDailyChallenge(
      db,
      challengeDate,
    );

    if (!challengeInsertedByOtherRequest) {
      throw error;
    }

    return challengeInsertedByOtherRequest;
  }
}

export function selectDailyChallenge(
  db: SqliteDatabase,
  challengeDate: string,
): DailyChallenge | null {
  const row = db
    .prepare(SELECT_DAILY_CHALLENGE_SQL)
    .get(challengeDate) as DailyChallengeRow | undefined;

  return row ? mapDailyChallengeRow(row) : null;
}

export function insertDailyChallenge(
  db: SqliteDatabase,
  challenge: DailyChallenge,
): void {
  db.prepare(INSERT_DAILY_CHALLENGE_SQL).run(
    challenge.challengeDate,
    challenge.seed,
    challenge.title,
    challenge.blurb,
    JSON.stringify(challenge.modifiers),
    challenge.source,
  );
}

function mapDailyChallengeRow(row: DailyChallengeRow): DailyChallenge {
  return parseDailyChallenge({
    challengeDate: row.challenge_date,
    seed: Number(row.seed),
    title: String(row.title),
    blurb: String(row.blurb),
    modifiers: JSON.parse(row.modifiers_json) as unknown,
    source: row.source,
  });
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("UNIQUE constraint failed") ||
      error.message.includes("SQLITE_CONSTRAINT_PRIMARYKEY"))
  );
}
