import { createRequire } from "node:module";
import type { Database } from "better-sqlite3";

// Opens SQLite databases for the leaderboard and hides the package setup from the rest of the app.
const require = createRequire(import.meta.url);
const DatabaseCtor = require("better-sqlite3") as new (
  filename?: string,
) => Database;

export type SqliteDatabase = Database;

export function openSqliteDatabase(filename: string): SqliteDatabase {
  return new DatabaseCtor(filename);
}
