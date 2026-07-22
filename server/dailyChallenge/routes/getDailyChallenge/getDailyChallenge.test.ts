import { afterEach, describe, expect, it, vi } from "vitest";
import { HTTP_STATUS } from "../../../http.ts";
import { createLeaderboardDb } from "../../../leaderboard/db.ts";
import { initializeSchema } from "../../../leaderboard/databaseSchema.ts";
import { openSqliteDatabase } from "../../../leaderboard/sqlite.ts";
import { getOrCreateDailyChallenge } from "../../db.ts";
import { createFallbackChallenge } from "../../fallbackChallenge/FallbackChallenge.ts";
import { getDailyChallenge } from "./getDailyChallenge.ts";

describe("getDailyChallenge", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

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

  it("uses the agent on the first miss and reuses the stored daily challenge", async () => {
    vi.stubEnv("LLM_API_KEY", "test-key");
    const fetchMock = vi.fn(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                seed: 99,
                title: "Moving Gap Drill",
                modifiers: {
                  difficultyRampScale: 1.08,
                  movingShareBias: 0.16,
                  monsterRateBias: -0.01,
                  springSpawnProbability: 0.1,
                  powerupSpawnProbability: 0.03,
                  gapBias: 0.02,
                },
              }),
            },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const db = createLeaderboardDb(":memory:");

    try {
      const first = await getDailyChallenge(db, "2026-07-17", "test");
      const second = await getDailyChallenge(db, "2026-07-17", "test");

      expect(first.status).toBe(HTTP_STATUS.OK);
      expect(first.body).toMatchObject({
        challengeDate: "2026-07-17",
        source: "agent",
      });
      expect(second).toEqual(first);
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      db.close();
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
