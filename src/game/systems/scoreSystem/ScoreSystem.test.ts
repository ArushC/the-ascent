import { describe, expect, it } from "vitest";
import {
  awardBonusPoints,
  createScoreState,
  getScore,
  updateScore,
  type ScoreState,
} from "./ScoreSystem";

describe("createScoreState", () => {
  it("captures the player's starting y as the start and peak", () => {
    expect(createScoreState(560)).toEqual({
      startY: 560,
      peakY: 560,
      bonusPoints: 0,
    });
  });
});

describe("updateScore", () => {
  it("tracks the smallest y reached by the player", () => {
    const state = createScoreState(560);

    expect(updateScore(state, 320)).toEqual({
      startY: 560,
      peakY: 320,
      bonusPoints: 0,
    });
  });

  it("does not lower the score when the player falls", () => {
    const state: ScoreState = { startY: 560, peakY: 320, bonusPoints: 0 };

    expect(updateScore(state, 400)).toEqual({
      startY: 560,
      peakY: 320,
      bonusPoints: 0,
    });
  });

  it("allows peak y values above the initial world origin", () => {
    const state: ScoreState = { startY: 560, peakY: 100, bonusPoints: 0 };

    expect(updateScore(state, -50)).toEqual({
      startY: 560,
      peakY: -50,
      bonusPoints: 0,
    });
  });
});

describe("getScore", () => {
  it("returns the height climbed in whole pixels", () => {
    expect(getScore({ startY: 560, peakY: 100.5, bonusPoints: 0 })).toBe(459);
  });

  it("includes bonus points", () => {
    expect(getScore({ startY: 560, peakY: 100.5, bonusPoints: 200 })).toBe(
      659,
    );
  });

  it("is zero at the starting height", () => {
    expect(getScore(createScoreState(560))).toBe(0);
  });
});

describe("awardBonusPoints", () => {
  it("adds bonus points to the score state", () => {
    const state = createScoreState(560);

    expect(awardBonusPoints(state, 20)).toEqual({
      startY: 560,
      peakY: 560,
      bonusPoints: 20,
    });
  });

  it("returns the same state for non-positive bonus points", () => {
    const state = createScoreState(560);

    expect(awardBonusPoints(state, 0)).toBe(state);
  });
});
