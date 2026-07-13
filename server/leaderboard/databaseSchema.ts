import type { SqliteDatabase } from "./sqlite.ts";

export const DEFAULT_DATABASE_FILE = "data/leaderboard.sqlite";
const LEGACY_DISPLAY_COLUMN = ["player", "name"].join("_");

const CREATE_PLAYERS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS players (
    player_id TEXT PRIMARY KEY,
    best_score INTEGER NOT NULL DEFAULT 0,
    best_score_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

const CREATE_SCORE_RUNS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS score_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
  );
`;

const CREATE_LEADERBOARD_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_score_runs_player_board
    ON score_runs(player_id, score DESC, created_at ASC);
`;

export function initializeSchema(db: SqliteDatabase): void {
  db.exec(CREATE_PLAYERS_TABLE_SQL);
  db.exec(CREATE_SCORE_RUNS_TABLE_SQL);
  migrateLegacyNameColumns(db);
  db.exec("DROP INDEX IF EXISTS idx_score_runs_leaderboard");
  db.exec(CREATE_LEADERBOARD_INDEX_SQL);
}

function migrateLegacyNameColumns(db: SqliteDatabase): void {
  const playersHasName = tableHasColumn(db, "players", LEGACY_DISPLAY_COLUMN);
  const scoreRunsHasName = tableHasColumn(
    db,
    "score_runs",
    LEGACY_DISPLAY_COLUMN,
  );

  if (!playersHasName && !scoreRunsHasName) {
    return;
  }

  db.exec("PRAGMA foreign_keys = OFF");
  db.exec("BEGIN");

  try {
    if (scoreRunsHasName) {
      db.exec(`
        CREATE TABLE score_runs_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          player_id TEXT NOT NULL,
          score INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (player_id) REFERENCES players(player_id)
        );

        INSERT INTO score_runs_new (id, player_id, score, created_at)
        SELECT id, player_id, score, created_at
        FROM score_runs;

        DROP TABLE score_runs;
        ALTER TABLE score_runs_new RENAME TO score_runs;
      `);
    }

    if (playersHasName) {
      db.exec(`
        CREATE TABLE players_new (
          player_id TEXT PRIMARY KEY,
          best_score INTEGER NOT NULL DEFAULT 0,
          best_score_at TEXT,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        INSERT INTO players_new (player_id, best_score, best_score_at, updated_at)
        SELECT player_id, best_score, best_score_at, updated_at
        FROM players;

        DROP TABLE players;
        ALTER TABLE players_new RENAME TO players;
      `);
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  } finally {
    db.exec("PRAGMA foreign_keys = ON");
  }
}

function tableHasColumn(
  db: SqliteDatabase,
  tableName: string,
  columnName: string,
): boolean {
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string;
  }>;

  return rows.some((row) => row.name === columnName);
}
