export const DEFAULT_DATABASE_FILE = "data/leaderboard.sqlite";

const CREATE_PLAYERS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS players (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    best_score INTEGER NOT NULL DEFAULT 0,
    best_score_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

const CREATE_SCORE_RUNS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS score_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
  );
`;

const CREATE_LEADERBOARD_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_score_runs_leaderboard
    ON score_runs(score DESC, created_at ASC);
`;

export function initializeSchema(db: { exec(sql: string): void }): void {
  db.exec(CREATE_PLAYERS_TABLE_SQL);
  db.exec(CREATE_SCORE_RUNS_TABLE_SQL);
  db.exec(CREATE_LEADERBOARD_INDEX_SQL);
}
