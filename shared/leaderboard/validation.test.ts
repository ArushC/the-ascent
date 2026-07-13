import { describe, expect, it } from "vitest";
import { MAX_SCORE, validateScore } from "./validation.ts";

describe("validateScore", () => {
  it("accepts non-negative scores up to the gameplay cap", () => {
    expect(validateScore(0).ok).toBe(true);
    expect(validateScore(999999).ok).toBe(true);
    expect(validateScore(MAX_SCORE).ok).toBe(true);
  });

  it("rejects negative, fractional, and over-cap scores", () => {
    expect(validateScore(-1).ok).toBe(false);
    expect(validateScore(1.5).ok).toBe(false);
    expect(validateScore(MAX_SCORE + 1).ok).toBe(false);
  });
});
