import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateRandomCircularMonsterAngularVelocity,
  generateRandomCircularMonsterOrbitRadius,
  generateRandomHorizontalMonsterTravelDistance,
  generateRandomMonsterDirection,
  generateRandomMonsterSpeed,
  generateRandomMonsterVelocity,
  generateRandomTriangularMonsterPathSize,
} from "./random";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("monster random helpers", () => {
  it("generates monster speeds in the moving platform speed range", () => {
    const randomSpy = vi.spyOn(Math, "random");

    randomSpy.mockReturnValue(0);
    expect(generateRandomMonsterSpeed()).toBe(0.07);

    randomSpy.mockReturnValue(1);
    expect(generateRandomMonsterSpeed()).toBe(0.11);
  });

  it("generates signed monster velocity", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(0);

    expect(generateRandomMonsterVelocity()).toBe(-0.09);
  });

  it("generates direction from an even split", () => {
    const randomSpy = vi.spyOn(Math, "random");

    randomSpy.mockReturnValue(0.49);
    expect(generateRandomMonsterDirection()).toBe(-1);

    randomSpy.mockReturnValue(0.5);
    expect(generateRandomMonsterDirection()).toBe(1);
  });

  it("generates path dimensions in the configured ranges", () => {
    const randomSpy = vi.spyOn(Math, "random");

    randomSpy.mockReturnValue(0);
    expect(generateRandomHorizontalMonsterTravelDistance()).toBe(24);
    expect(generateRandomCircularMonsterOrbitRadius()).toBe(24);
    expect(generateRandomTriangularMonsterPathSize()).toBe(48);

    randomSpy.mockReturnValue(1);
    expect(generateRandomHorizontalMonsterTravelDistance()).toBe(48);
    expect(generateRandomCircularMonsterOrbitRadius()).toBe(48);
    expect(generateRandomTriangularMonsterPathSize()).toBe(72);
  });

  it("derives angular velocity from linear speed and radius", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(1);

    expect(generateRandomCircularMonsterAngularVelocity(30)).toBeCloseTo(
      0.09 / 30,
    );
  });
});
