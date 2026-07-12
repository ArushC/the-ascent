import { describe, expect, it } from "vitest";
import {
  createTestDiagonalMovingPlatform,
  createTestHorizontalMovingPlatform,
  createTestVerticalMovingPlatform,
} from "../../testing/entityFactories";
import { updateMovingPlatforms } from "./PlatformMovementSystem";

describe("updateMovingPlatforms", () => {
  it("moves horizontal platforms by velocity and delta time", () => {
    const platform = createTestHorizontalMovingPlatform({
      x: 50,
      velocityX: 0.1,
      minX: 50,
      maxX: 150,
    });

    updateMovingPlatforms([platform], 200, 400);

    expect(platform.x).toBe(70);
  });

  it("bounces horizontal platforms off the left edge", () => {
    const platform = createTestHorizontalMovingPlatform({
      x: 5,
      velocityX: -0.1,
      minX: 0,
      maxX: 100,
    });

    updateMovingPlatforms([platform], 100, 400);

    expect(platform.x).toBe(0);
    expect(platform.velocityX).toBe(0.1);
  });

  it("bounces horizontal platforms off the right edge", () => {
    const platform = createTestHorizontalMovingPlatform({
      x: 305,
      width: 90,
      velocityX: 0.1,
      minX: 210,
      maxX: 310,
    });

    updateMovingPlatforms([platform], 100, 400);

    expect(platform.x).toBe(310);
    expect(platform.velocityX).toBe(-0.1);
  });

  it("bounces vertical platforms between local vertical bounds", () => {
    const platform = createTestVerticalMovingPlatform({
      y: 95,
      velocityY: -0.1,
      minY: 90,
      maxY: 130,
    });

    updateMovingPlatforms([platform], 100, 400);

    expect(platform.y).toBe(90);
    expect(platform.velocityY).toBe(0.1);
  });

  it("moves and bounces diagonal platforms on both axes", () => {
    const platform = createTestDiagonalMovingPlatform({
      x: 145,
      y: 125,
      velocityX: 0.1,
      velocityY: 0.1,
      minX: 50,
      maxX: 150,
      minY: 90,
      maxY: 130,
    });

    updateMovingPlatforms([platform], 100, 400);

    expect(platform.x).toBe(150);
    expect(platform.y).toBe(130);
    expect(platform.velocityX).toBe(-0.1);
    expect(platform.velocityY).toBe(-0.1);
  });
});
