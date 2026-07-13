import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  LeaderboardEntry,
  PlayerBest,
  ScoreSubmission,
  ScoreSubmissionResult,
} from "../../shared/leaderboard/types.ts";
import {
  DELETE_EXCESS_PLAYER_SCORE_RUNS_SQL,
  INSERT_SCORE_RUN_SQL,
  SELECT_BEST_SCORE_SQL,
  SELECT_PLAYER_BEST_SQL,
  SELECT_TOP_SCORE_RUNS_FOR_PLAYER_SQL,
  UPSERT_PLAYER_BEST_SQL,
} from "./queries.ts";
import { DEFAULT_DATABASE_FILE, initializeSchema } from "./schema.ts";

type BestScoreRow = {
  best_score: number;
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
  getTopScoreRunsForPlayer(playerId: string, limit: number): LeaderboardEntry[];
  getTopPlayerScore(playerId: string): PlayerBest | null;
};

export function createLeaderboardDb(filename = DEFAULT_DATABASE_FILE) {
  if (filename !== ":memory:") {
    mkdirSync(dirname(filename), { recursive: true });
  }

  const db = new DatabaseSync(filename);
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
        const previousBest = getBestScore(db, submission.playerId);
        const isNewPersonalBest =
          previousBest === null || submission.score > previousBest;
        const bestScore = isNewPersonalBest ? submission.score : previousBest;

        db.prepare(UPSERT_PLAYER_BEST_SQL).run(
          submission.playerId,
          submission.score,
          now,
          now,
        );

        const runResult = db
          .prepare(INSERT_SCORE_RUN_SQL)
          .run(submission.playerId, submission.score, now);

        db.prepare(DELETE_EXCESS_PLAYER_SCORE_RUNS_SQL).run(
          submission.playerId,
          submission.playerId,
        );

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

    getTopScoreRunsForPlayer(playerId: string, limit: number): LeaderboardEntry[] {
      const rows = db
        .prepare(SELECT_TOP_SCORE_RUNS_FOR_PLAYER_SQL)
        .all(playerId, limit) as TopScoreRunRow[];

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
  } satisfies LeaderboardDb;
}

function getBestScore(db: DatabaseSync, playerId: string): number | null {
  const row = db
    .prepare(SELECT_BEST_SCORE_SQL)
    .get(playerId) as BestScoreRow | undefined;

  return row ? Number(row.best_score) : null;
}
