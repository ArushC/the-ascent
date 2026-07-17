import { describe, expect, it } from "vitest";
import { toDailyChallengeErrorState } from "./useDailyChallenge";

describe("toDailyChallengeErrorState", () => {
  it("keeps Error objects intact", () => {
    const error = new Error("network down");

    expect(toDailyChallengeErrorState(error)).toEqual({
      status: "error",
      challenge: null,
      error,
    });
  });

  it("normalizes thrown non-Error values", () => {
    expect(toDailyChallengeErrorState("nope").error).toEqual(new Error("nope"));
  });
});
