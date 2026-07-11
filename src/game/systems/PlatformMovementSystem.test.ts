import { describe, expect, it } from "vitest";
import { createTestMovingPlatform } from "../testing/entityFactories";
import { updateMovingPlatforms } from "./PlatformMovementSystem";

describe("updateMovingPlatforms", () => {
  it("moves horizontal platforms by velocity and delta time", () => {
    const platform = createTestMovingPlatform({ x: 50, velocityX: 0.1 });

    updateMovingPlatforms([platform], 200, 400);

    expect(platform.x).toBe(70);
  });

  it("bounces horizontal platforms off the left edge", () => {
    const platform = createTestMovingPlatform({ x: 5, velocityX: -0.1 });

    updateMovingPlatforms([platform], 100, 400);

    expect(platform.x).toBe(0);
    expect(platform.velocityX).toBe(0.1);
  });

  it("bounces horizontal platforms off the right edge", () => {
    const platform = createTestMovingPlatform({
      x: 305,
      width: 90,
      velocityX: 0.1,
    });

    updateMovingPlatforms([platform], 100, 400);

    expect(platform.x).toBe(310);
    expect(platform.velocityX).toBe(-0.1);
  });
});
