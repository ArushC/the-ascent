import { describe, expect, it, vi } from "vitest";
import { createFallbackChallenge } from "./fallbackChallenge/FallbackChallenge.ts";
import {
  getOrCreateDailyChallenge,
  insertDailyChallenge,
} from "./db.ts";
import { initializeSchema } from "../leaderboard/databaseSchema.ts";
import { openSqliteDatabase } from "../leaderboard/sqlite.ts";

describe("getOrCreateDailyChallenge", () => {
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
