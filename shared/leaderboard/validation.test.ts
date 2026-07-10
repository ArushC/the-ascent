import { describe, expect, it } from "vitest";
import { MAX_SCORE, validatePlayerName, validateScore } from "./validation.ts";

describe("validatePlayerName", () => {
  it("accepts trimmed letters, numbers, spaces, underscores, and hyphens", () => {
    expect(validatePlayerName(" Ada_99-1 ").ok).toBe(true);
    expect(validatePlayerName("hello world").ok).toBe(true);
  });

  it("rejects empty, long, and unsupported names", () => {
    expect(validatePlayerName("  ").ok).toBe(false);
    expect(validatePlayerName("a".repeat(25)).ok).toBe(false);
    expect(validatePlayerName("<script>").ok).toBe(false);
  });
});

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
