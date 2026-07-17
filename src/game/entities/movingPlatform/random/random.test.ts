import { describe, expect, it } from "vitest";
import {
  generateRandomMovingPlatformTravelDistance,
  generateRandomMovingPlatformVelocity,
} from "./random";

describe("moving platform random helpers", () => {
  it("generates signed velocity in the configured speed range", () => {
    expect(generateRandomMovingPlatformVelocity(rngFromSequence([0, 0]))).toBe(
      -0.07,
    );
    expect(generateRandomMovingPlatformVelocity(rngFromSequence([1, 0.5]))).toBe(
      0.11,
    );
  });

  it("generates travel distance in the configured range", () => {
    expect(generateRandomMovingPlatformTravelDistance(() => 0)).toBe(24);
    expect(generateRandomMovingPlatformTravelDistance(() => 1)).toBe(48);
  });
});

function rngFromSequence(values: readonly number[]) {
  let index = 0;

  // Test RNG: returns each scripted roll in order, then repeats the last one.
  return () => values[index++] ?? values[values.length - 1] ?? 0;
}
