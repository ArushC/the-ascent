import { describe, expect, it, vi } from "vitest";
import { createFallbackChallenge } from "./fallbackChallenge/FallbackChallenge.ts";
import {
  getOrCreateDailyChallenge,
  insertDailyChallenge,
  selectDailyChallenge,
} from "./db.ts";
import { initializeSchema } from "../leaderboard/databaseSchema.ts";
import { openSqliteDatabase } from "../leaderboard/sqlite.ts";

describe("getOrCreateDailyChallenge", () => {
  it("migrates legacy blurb rows without losing challenge data", () => {
    const db = openSqliteDatabase(":memory:");
    const challenge = createFallbackChallenge("2026-07-16");
    seedLegacyDailyChallenge(db, challenge);

    try {
      initializeSchema(db);
      initializeSchema(db);

      expect(selectDailyChallenge(db, challenge.challengeDate)).toEqual(challenge);
      expect(
        db.prepare("PRAGMA table_info(daily_challenges)").all(),
      ).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ name: "blurb" })]),
      );
    } finally {
      db.close();
    }
  });

  it("returns the stored row after the first insert", async () => {
    const db = openSqliteDatabase(":memory:");
    initializeSchema(db);
    const designer = vi.fn((date: string) => createFallbackChallenge(date));

    try {
      const first = await getOrCreateDailyChallenge(db, "2026-07-17", designer);
      const second = await getOrCreateDailyChallenge(db, "2026-07-17", designer);

      expect(first).toEqual(second);
      expect(designer).toHaveBeenCalledOnce();
    } finally {
      db.close();
    }
  });

  it("re-selects the row inserted by another request", async () => {
    const db = openSqliteDatabase(":memory:");
    initializeSchema(db);
    const challengeInsertedFirst = createFallbackChallenge("2026-07-18");
    const designer = vi.fn((date: string) => {
      insertDailyChallenge(db, challengeInsertedFirst);

      return {
        ...createFallbackChallenge(date),
        title: "Race Loser",
      };
    });

    try {
      await expect(
        getOrCreateDailyChallenge(db, "2026-07-18", designer),
      ).resolves.toEqual(challengeInsertedFirst);
      expect(designer).toHaveBeenCalledOnce();
    } finally {
      db.close();
    }
  });
});

function seedLegacyDailyChallenge(
  db: ReturnType<typeof openSqliteDatabase>,
  challenge: ReturnType<typeof createFallbackChallenge>,
): void {
  db.exec(`
    CREATE TABLE daily_challenges (
      challenge_date TEXT PRIMARY KEY,
      seed INTEGER NOT NULL,
      title TEXT NOT NULL,
      blurb TEXT NOT NULL,
      modifiers_json TEXT NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('agent', 'fallback')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  db.prepare(`
    INSERT INTO daily_challenges (
      challenge_date, seed, title, blurb, modifiers_json, source
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    challenge.challengeDate,
    challenge.seed,
    challenge.title,
    "Legacy copy",
    JSON.stringify(challenge.modifiers),
    challenge.source,
  );
}
