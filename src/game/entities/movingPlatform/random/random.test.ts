import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateRandomMovingPlatformTravelDistance,
  generateRandomMovingPlatformVelocity,
} from "./random";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("moving platform random helpers", () => {
  it("generates signed velocity in the configured speed range", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValueOnce(0);

    expect(generateRandomMovingPlatformVelocity()).toBe(-0.07);

    vi.spyOn(Math, "random").mockReturnValueOnce(1).mockReturnValueOnce(0.5);

    expect(generateRandomMovingPlatformVelocity()).toBe(0.11);
  });

  it("generates travel distance in the configured range", () => {
    const randomSpy = vi.spyOn(Math, "random");

    randomSpy.mockReturnValue(0);
    expect(generateRandomMovingPlatformTravelDistance()).toBe(24);

    randomSpy.mockReturnValue(1);
    expect(generateRandomMovingPlatformTravelDistance()).toBe(48);
  });
});
