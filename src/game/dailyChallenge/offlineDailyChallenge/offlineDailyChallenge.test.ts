import { describe, expect, it } from "vitest";
import { parseDailyChallenge } from "../../../../shared/dailyChallenge/validation.ts";
import { OFFLINE_DAILY_CHALLENGES } from "./offlineDailyChallenge";

describe("OFFLINE_DAILY_CHALLENGES", () => {
  it("contains valid daily challenge definitions", () => {
    expect(OFFLINE_DAILY_CHALLENGES.map(parseDailyChallenge)).toEqual(
      OFFLINE_DAILY_CHALLENGES,
    );
  });
});
