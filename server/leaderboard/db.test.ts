import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createLeaderboardDb } from "./db.ts";
import { openSqliteDatabase, type SqliteDatabase } from "./sqlite.ts";

const ADA_PLAYER_ID = "11111111-1111-4111-8111-111111111111";
const BOB_PLAYER_ID = "22222222-2222-4222-8222-222222222222";
const LEGACY_DISPLAY_COLUMN = ["player", "name"].join("_");

describe("leaderboard database", () => {
  it("keeps personal best from decreasing", () => {
    const db = createLeaderboardDb(":memory:");

    try {
      expect(
        db.recordScoreRun({
          playerId: ADA_PLAYER_ID,
          score: 100,
        }).personalBest,
      ).toBe(100);
      expect(
        db.recordScoreRun({
          playerId: ADA_PLAYER_ID,
          score: 200,
        }).personalBest,
      ).toBe(200);
      expect(
        db.recordScoreRun({
          playerId: ADA_PLAYER_ID,
          score: 50,
        }).personalBest,
      ).toBe(200);
      expect(db.getTopPlayerScore(ADA_PLAYER_ID)?.bestScore).toBe(200);
    } finally {
      db.close();
    }
  });

  it("returns only the requested player's top score runs", () => {
    const db = createLeaderboardDb(":memory:");

    try {
      db.recordScoreRun({
        playerId: ADA_PLAYER_ID,
        score: 100,
      });
      db.recordScoreRun({
        playerId: ADA_PLAYER_ID,
        score: 300,
      });
      db.recordScoreRun({
        playerId: BOB_PLAYER_ID,
        score: 200,
      });

      expect(db.getTopScoreRunsForPlayer(ADA_PLAYER_ID, 2)).toEqual([
        expect.objectContaining({ rank: 1, score: 300 }),
        expect.objectContaining({ rank: 2, score: 100 }),
      ]);
    } finally {
      db.close();
    }
  });

  it("trims stored runs to the top 100 for each player", () => {
    const db = createLeaderboardDb(":memory:");

    try {
      for (let score = 0; score < 105; score += 1) {
        db.recordScoreRun({ playerId: ADA_PLAYER_ID, score });
      }

      const entries = db.getTopScoreRunsForPlayer(ADA_PLAYER_ID, 150);

      expect(entries).toHaveLength(100);
      expect(entries[0]).toEqual(expect.objectContaining({ rank: 1, score: 104 }));
      expect(entries.at(-1)).toEqual(
        expect.objectContaining({ rank: 100, score: 5 }),
      );
      expect(db.getTopPlayerScore(ADA_PLAYER_ID)?.bestScore).toBe(104);
    } finally {
      db.close();
    }
  });

  it("migrates legacy name columns away on init", () => {
    const dir = mkdtempSync(join(tmpdir(), "leaderboard-"));
    const filename = join(dir, "legacy.sqlite");

    try {
      const legacyDb = openSqliteDatabase(filename);
      legacyDb.exec(`
        CREATE TABLE players (
          player_id TEXT PRIMARY KEY,
          ${LEGACY_DISPLAY_COLUMN} TEXT NOT NULL,
          best_score INTEGER NOT NULL DEFAULT 0,
          best_score_at TEXT,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE score_runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          player_id TEXT NOT NULL,
          ${LEGACY_DISPLAY_COLUMN} TEXT NOT NULL,
          score INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (player_id) REFERENCES players(player_id)
        );

        INSERT INTO players (
          player_id,
          ${LEGACY_DISPLAY_COLUMN},
          best_score,
          best_score_at,
          updated_at
        )
        VALUES (
          '${ADA_PLAYER_ID}',
          'Ada',
          120,
          '2026-07-12T12:00:00.000Z',
          '2026-07-12T12:00:00.000Z'
        );

        INSERT INTO score_runs (
          player_id,
          ${LEGACY_DISPLAY_COLUMN},
          score,
          created_at
        )
        VALUES (
          '${ADA_PLAYER_ID}',
          'Ada',
          120,
          '2026-07-12T12:00:00.000Z'
        );
      `);
      legacyDb.close();

      const db = createLeaderboardDb(filename);
      const rawDb = openSqliteDatabase(filename);

      try {
        expect(db.getTopPlayerScore(ADA_PLAYER_ID)).toEqual({
          playerId: ADA_PLAYER_ID,
          bestScore: 120,
          achievedAt: "2026-07-12T12:00:00.000Z",
        });
        expect(db.getTopScoreRunsForPlayer(ADA_PLAYER_ID, 10)).toEqual([
          expect.objectContaining({ rank: 1, score: 120 }),
        ]);
        expect(tableColumnNames(rawDb, "players")).not.toContain(
          LEGACY_DISPLAY_COLUMN,
        );
        expect(tableColumnNames(rawDb, "score_runs")).not.toContain(
          LEGACY_DISPLAY_COLUMN,
        );
      } finally {
        rawDb.close();
        db.close();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

function tableColumnNames(db: SqliteDatabase, tableName: string): string[] {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string;
  }>;

  return rows.map((row) => row.name);
}
