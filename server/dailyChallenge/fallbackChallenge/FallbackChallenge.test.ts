import { describe, expect, it } from "vitest";
import { parseDailyChallenge } from "../../../shared/dailyChallenge/validation.ts";
import {
  createFallbackChallenge,
  FALLBACK_CHALLENGE_PRESETS,
} from "./FallbackChallenge.ts";

describe("createFallbackChallenge", () => {
  it("defines the planned fallback preset rotation", () => {
    expect(Object.keys(FALLBACK_CHALLENGE_PRESETS)).toEqual([
      "calm",
      "movers",
      "monster_alley",
      "spring_fest",
      "starved",
    ]);
  });

  it("is deterministic for a challenge date", () => {
    expect(createFallbackChallenge("2026-07-17")).toEqual(
      createFallbackChallenge("2026-07-17"),
    );
  });

  it("returns a Zod-valid fallback challenge", () => {
    const challenge = createFallbackChallenge("2026-07-17");

    expect(parseDailyChallenge(challenge)).toEqual(challenge);
    expect(challenge.source).toBe("fallback");
  });
});
