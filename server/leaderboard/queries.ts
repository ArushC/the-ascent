export const UPSERT_PLAYER_BEST_SQL = `
  INSERT INTO players (
    player_id,
    best_score,
    best_score_at,
    updated_at
  )
  VALUES (?, ?, ?, ?)
  ON CONFLICT(player_id) DO UPDATE SET
    best_score = CASE
      WHEN excluded.best_score > players.best_score
      THEN excluded.best_score
      ELSE players.best_score
    END,
    best_score_at = CASE
      WHEN excluded.best_score > players.best_score
      THEN excluded.best_score_at
      ELSE players.best_score_at
    END,
    updated_at = excluded.updated_at
`;

export const INSERT_SCORE_RUN_SQL = `
  INSERT INTO score_runs (player_id, score, created_at)
  VALUES (?, ?, ?)
`;

export const SELECT_TOP_SCORE_RUNS_FOR_PLAYER_SQL = `
  SELECT score, created_at
  FROM score_runs
  WHERE player_id = ?
  ORDER BY score DESC, created_at ASC
  LIMIT ?
`;

export const DELETE_EXCESS_PLAYER_SCORE_RUNS_SQL = `
  DELETE FROM score_runs
  WHERE player_id = ?
    AND id NOT IN (
      SELECT id
      FROM score_runs
      WHERE player_id = ?
      ORDER BY score DESC, created_at ASC
      LIMIT 100
    )
`;

export const SELECT_PLAYER_BEST_SQL = `
  SELECT player_id, best_score, best_score_at
  FROM players
  WHERE player_id = ?
`;

export const SELECT_BEST_SCORE_SQL =
  "SELECT best_score FROM players WHERE player_id = ?";
