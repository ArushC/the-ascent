import { afterEach, describe, expect, it, vi } from "vitest";
import { createFallbackChallenge } from "../../../server/dailyChallenge/fallbackChallenge/FallbackChallenge.ts";
import { fetchDailyChallenge } from "./index";

describe("fetchDailyChallenge", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and validates the daily challenge response", async () => {
    const challenge = createFallbackChallenge("2026-07-17");
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify(challenge), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchDailyChallenge()).resolves.toEqual(challenge);
    expect(fetchMock).toHaveBeenCalledWith("/api/daily-challenge");
  });

  it("throws on non-OK responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 })),
    );

    await expect(fetchDailyChallenge()).rejects.toThrow(
      "Daily challenge fetch failed.",
    );
  });
});
