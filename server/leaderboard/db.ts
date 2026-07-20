import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type {
  LeaderboardEntry,
  PlayerBest,
  ScoreBoard,
  ScoreSubmission,
  ScoreSubmissionResult,
} from "../../shared/leaderboard/types.ts";
import type { DailyChallenge } from "../../shared/dailyChallenge/types.ts";
import {
  getOrCreateDailyChallenge as getOrCreateStoredDailyChallenge,
} from "../dailyChallenge/db.ts";
import {
  DELETE_EXCESS_PLAYER_SCORE_RUNS_SQL,
  INSERT_PLAYER_IF_MISSING_SQL,
  INSERT_SCORE_RUN_SQL,
  SELECT_BEST_DAILY_SCORE_SQL,
  SELECT_BEST_SCORE_SQL,
  SELECT_PLAYER_BEST_SQL,
  SELECT_TOP_SCORE_RUNS_FOR_PLAYER_SQL,
  SELECT_TOP_DAILY_SCORE_RUNS_FOR_PLAYER_SQL,
  UPSERT_PLAYER_BEST_SQL,
} from "./queries.ts";
import { DEFAULT_DATABASE_FILE, initializeSchema } from "./databaseSchema.ts";
import { openSqliteDatabase, type SqliteDatabase } from "./sqlite.ts";

type BestScoreRow = {
  best_score: number | null;
};

type TopScoreRunRow = {
  score: number;
  created_at: string;
};

type PlayerBestRow = {
  player_id: string;
  best_score: number;
  best_score_at: string | null;
};

export type LeaderboardDb = {
  /** Releases the SQLite connection, mainly used by tests. */
  close(): void;
  recordScoreRun(submission: ScoreSubmission): ScoreSubmissionResult;
  /** Returns one player's ranked runs from either the classic board or one dated daily board. */
  getTopScoreRunsForPlayer(
    playerId: string,
    limit: number,
    board?: ScoreBoard,
  ): LeaderboardEntry[];
  getTopPlayerScore(playerId: string): PlayerBest | null;
  /** Historical name aside, this wrapper owns the shared app SQLite file. */
  getOrCreateDailyChallenge(challengeDate: string): Promise<DailyChallenge>;
};

export function createLeaderboardDb(filename = DEFAULT_DATABASE_FILE) {
  if (filename !== ":memory:") {
    mkdirSync(dirname(filename), { recursive: true });
  }

  const db = openSqliteDatabase(filename);
  db.exec("PRAGMA foreign_keys = ON");
  initializeSchema(db);

  return {
    close() {
      db.close();
    },

    recordScoreRun(submission: ScoreSubmission): ScoreSubmissionResult {
      const now = new Date().toISOString();

      db.exec("BEGIN");

      try {
        const board = getScoreBoard(submission);
        const previousBest = getBestScoreForBoard(db, submission.playerId, board);
        const isNewPersonalBest =
          previousBest === null || submission.score > previousBest;
        const bestScore = isNewPersonalBest ? submission.score : previousBest;

        storePlayerForScore(db, submission, board, now);

        const runResult = db
          .prepare(INSERT_SCORE_RUN_SQL)
          .run(
            submission.playerId,
            submission.score,
            board.mode,
            getChallengeDate(board),
            now,
          );

        trimScoreRuns(db, submission.playerId, board);

        db.exec("COMMIT");

        return {
          runId: Number(runResult.lastInsertRowid),
          score: submission.score,
          personalBest: bestScore,
          isNewPersonalBest,
          createdAt: now,
        };
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },

    getTopScoreRunsForPlayer(
      playerId: string,
      limit: number,
      board: ScoreBoard = { mode: "classic" },
    ): LeaderboardEntry[] {
      const rows = selectTopScoreRuns(db, playerId, limit, board);

      return rows.map((row, index) => ({
        rank: index + 1,
        score: Number(row.score),
        createdAt: String(row.created_at),
      }));
    },

    getTopPlayerScore(playerId: string): PlayerBest | null {
      const row = db
        .prepare(SELECT_PLAYER_BEST_SQL)
        .get(playerId) as PlayerBestRow | undefined;

      if (!row) {
        return null;
      }

      return {
        playerId: String(row.player_id),
        bestScore: Number(row.best_score),
        achievedAt: row.best_score_at,
      };
    },

    getOrCreateDailyChallenge(challengeDate: string): Promise<DailyChallenge> {
      return getOrCreateStoredDailyChallenge(db, challengeDate);
    },
  } satisfies LeaderboardDb;
}

/** Normalizes the backward-compatible omitted mode to the classic board. */
function getScoreBoard(submission: ScoreSubmission): ScoreBoard {
  return submission.mode === "daily"
    ? { mode: "daily", challengeDate: submission.challengeDate }
    : { mode: "classic" };
}

/** Finds the prior best within the board receiving the new run. */
function getBestScoreForBoard(
  db: SqliteDatabase,
  playerId: string,
  board: ScoreBoard,
): number | null {
  if (board.mode !== "daily") {
    return getClassicBestScore(db, playerId);
  }

  const row = db
    .prepare(SELECT_BEST_DAILY_SCORE_SQL)
    .get(playerId, board.challengeDate) as BestScoreRow | undefined;

  return row?.best_score == null ? null : Number(row.best_score);
}

/** Updates classic personal bests; daily runs only ensure the foreign-key player exists. */
function storePlayerForScore(
  db: SqliteDatabase,
  submission: ScoreSubmission,
  board: ScoreBoard,
  now: string,
): void {
  if (board.mode === "daily") {
    db.prepare(INSERT_PLAYER_IF_MISSING_SQL).run(submission.playerId, now);
    return;
  }

  db.prepare(UPSERT_PLAYER_BEST_SQL).run(
    submission.playerId,
    submission.score,
    now,
    now,
  );
}

/** Reads the persisted all-time classic personal best. */
function getClassicBestScore(db: SqliteDatabase, playerId: string): number | null {
  const row = db
    .prepare(SELECT_BEST_SCORE_SQL)
    .get(playerId) as BestScoreRow | undefined;

  return row ? Number(row.best_score) : null;
}

/** Selects ranked rows using the query shape for the requested board. */
function selectTopScoreRuns(
  db: SqliteDatabase,
  playerId: string,
  limit: number,
  board: ScoreBoard,
): TopScoreRunRow[] {
  if (board.mode === "daily") {
    return db
      .prepare(SELECT_TOP_DAILY_SCORE_RUNS_FOR_PLAYER_SQL)
      .all(playerId, board.challengeDate, limit) as TopScoreRunRow[];
  }

  return db
    .prepare(SELECT_TOP_SCORE_RUNS_FOR_PLAYER_SQL)
    .all(playerId, limit) as TopScoreRunRow[];
}

/** Keeps at most 100 runs in the selected classic or dated daily board. */
function trimScoreRuns(
  db: SqliteDatabase,
  playerId: string,
  board: ScoreBoard,
): void {
  const challengeDate = getChallengeDate(board);

  db.prepare(DELETE_EXCESS_PLAYER_SCORE_RUNS_SQL).run(
    playerId,
    board.mode ?? "classic",
    challengeDate,
    playerId,
    board.mode ?? "classic",
    challengeDate,
  );
}

function getChallengeDate(board: ScoreBoard): string | null {
  return board.mode === "daily" ? board.challengeDate : null;
}
