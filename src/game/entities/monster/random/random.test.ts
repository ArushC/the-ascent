import { describe, expect, it } from "vitest";
import {
  generateRandomCircularMonsterAngularVelocity,
  generateRandomCircularMonsterOrbitRadius,
  generateRandomHorizontalMonsterTravelDistance,
  generateRandomMonsterDirection,
  generateRandomMonsterSpeed,
  generateRandomMonsterVelocity,
  generateRandomTriangularMonsterPathSize,
} from "./random";

describe("monster random helpers", () => {
  it("generates monster speeds in the moving platform speed range", () => {
    expect(generateRandomMonsterSpeed(undefined, undefined, () => 0)).toBe(
      0.07,
    );
    expect(generateRandomMonsterSpeed(undefined, undefined, () => 1)).toBe(
      0.11,
    );
  });

  it("generates signed monster velocity", () => {
    expect(
      generateRandomMonsterVelocity(
        undefined,
        undefined,
        rngFromSequence([0.5, 0]),
      ),
    ).toBe(-0.09);
  });

  it("generates direction from an even split", () => {
    expect(generateRandomMonsterDirection(() => 0.49)).toBe(-1);
    expect(generateRandomMonsterDirection(() => 0.5)).toBe(1);
  });

  it("generates path dimensions in the configured ranges", () => {
    expect(
      generateRandomHorizontalMonsterTravelDistance(undefined, undefined, () => 0),
    ).toBe(24);
    expect(
      generateRandomCircularMonsterOrbitRadius(undefined, undefined, () => 0),
    ).toBe(24);
    expect(
      generateRandomTriangularMonsterPathSize(undefined, undefined, () => 0),
    ).toBe(48);

    expect(
      generateRandomHorizontalMonsterTravelDistance(undefined, undefined, () => 1),
    ).toBe(48);
    expect(
      generateRandomCircularMonsterOrbitRadius(undefined, undefined, () => 1),
    ).toBe(48);
    expect(
      generateRandomTriangularMonsterPathSize(undefined, undefined, () => 1),
    ).toBe(72);
  });

  it("uses optional override ranges", () => {
    expect(generateRandomMonsterSpeed(1, 2, () => 0)).toBe(1);
    expect(generateRandomHorizontalMonsterTravelDistance(10, 20, () => 0)).toBe(
      10,
    );
    expect(generateRandomCircularMonsterOrbitRadius(30, 40, () => 0)).toBe(30);
    expect(generateRandomTriangularMonsterPathSize(50, 60, () => 0)).toBe(50);

    expect(generateRandomMonsterSpeed(1, 2, () => 1)).toBe(2);
    expect(generateRandomHorizontalMonsterTravelDistance(10, 20, () => 1)).toBe(
      20,
    );
    expect(generateRandomCircularMonsterOrbitRadius(30, 40, () => 1)).toBe(40);
    expect(generateRandomTriangularMonsterPathSize(50, 60, () => 1)).toBe(60);
  });

  it("derives angular velocity from linear speed and radius", () => {
    expect(
      generateRandomCircularMonsterAngularVelocity(
        30,
        undefined,
        undefined,
        rngFromSequence([0.5, 1]),
      ),
    ).toBeCloseTo(0.09 / 30);
  });
});

function rngFromSequence(values: readonly number[]) {
  let index = 0;

  // Test RNG: returns each scripted roll in order, then repeats the last one.
  return () => values[index++] ?? values[values.length - 1] ?? 0;
}
