import { describe, expect, it } from "vitest";
import {
  createScoreState,
  getScore,
  updateScore,
  type ScoreState,
} from "./ScoreSystem";

describe("createScoreState", () => {
  it("captures the player's starting y as the start and peak", () => {
    expect(createScoreState(560)).toEqual({ startY: 560, peakY: 560 });
  });
});

describe("updateScore", () => {
  it("tracks the smallest y reached by the player", () => {
    const state = createScoreState(560);

    expect(updateScore(state, 320)).toEqual({ startY: 560, peakY: 320 });
  });

  it("does not lower the score when the player falls", () => {
    const state: ScoreState = { startY: 560, peakY: 320 };

    expect(updateScore(state, 400)).toEqual({ startY: 560, peakY: 320 });
  });

  it("allows peak y values above the initial world origin", () => {
    const state: ScoreState = { startY: 560, peakY: 100 };

    expect(updateScore(state, -50)).toEqual({ startY: 560, peakY: -50 });
  });
});

describe("getScore", () => {
  it("returns the height climbed in whole pixels", () => {
    expect(getScore({ startY: 560, peakY: 100.5 })).toBe(459);
  });

  it("is zero at the starting height", () => {
    expect(getScore(createScoreState(560))).toBe(0);
  });
});
