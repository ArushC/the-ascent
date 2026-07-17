import { describe, expect, it, vi } from "vitest";
import { HTTP_STATUS } from "../../../http.ts";
import { createLeaderboardDb } from "../../../leaderboard/db.ts";
import { initializeSchema } from "../../../leaderboard/databaseSchema.ts";
import { openSqliteDatabase } from "../../../leaderboard/sqlite.ts";
import { getOrCreateDailyChallenge } from "../../db.ts";
import { createFallbackChallenge } from "../../fallbackChallenge/FallbackChallenge.ts";
import { getDailyChallenge } from "./getDailyChallenge.ts";

describe("getDailyChallenge", () => {
  it("returns a fallback challenge and reuses the stored row", async () => {
    const sqliteDb = openSqliteDatabase(":memory:");
    initializeSchema(sqliteDb);
    const designer = vi.fn((date: string) => createFallbackChallenge(date));
    const routeDb = {
      getOrCreateDailyChallenge: (date: string) =>
        getOrCreateDailyChallenge(sqliteDb, date, designer),
    };

    try {
      const first = await getDailyChallenge(routeDb, "2026-07-17", "test");
      const second = await getDailyChallenge(routeDb, "2026-07-17", "test");

      expect(first.status).toBe(HTTP_STATUS.OK);
      expect(second).toEqual(first);
      expect(first.body).toMatchObject({
        challengeDate: "2026-07-17",
        source: "fallback",
      });
      expect(designer).toHaveBeenCalledOnce();
    } finally {
      sqliteDb.close();
    }
  });

  it("rejects invalid dev-only date params", async () => {
    const db = createLeaderboardDb(":memory:");

    try {
      await expect(getDailyChallenge(db, "07-17-2026", "test")).resolves.toEqual({
        status: HTTP_STATUS.BAD_REQUEST,
        body: { error: "daily_challenge_date_validation_failed" },
      });
    } finally {
      db.close();
    }
  });

  it("ignores date params in production", async () => {
    const db = createLeaderboardDb(":memory:");

    try {
      const response = await getDailyChallenge(db, "2099-12-31", "production");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toMatchObject({ source: "fallback" });
      expect(response.body).not.toMatchObject({ challengeDate: "2099-12-31" });
    } finally {
      db.close();
    }
  });
});
