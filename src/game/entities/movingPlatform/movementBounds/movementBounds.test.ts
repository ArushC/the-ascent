import { describe, expect, it } from "vitest";
import {
  createTestHorizontalMovingPlatform,
  createTestVerticalMovingPlatform,
} from "../../../testing/entityFactories";
import {
  constrainHorizontalMovementToBounds,
  constrainVerticalMovementToBounds,
} from "./movementBounds";

describe("moving platform movement bounds", () => {
  it("clamps and reverses horizontal movement at canvas-aware x bounds", () => {
    const platform = createTestHorizontalMovingPlatform({
      x: 315,
      width: 90,
      velocityX: 0.1,
      minX: 100,
      maxX: 350,
    });

    constrainHorizontalMovementToBounds(platform, 400);

    expect(platform.x).toBe(310);
    expect(platform.velocityX).toBe(-0.1);
  });

  it("clamps and reverses vertical movement at local y bounds", () => {
    const platform = createTestVerticalMovingPlatform({
      y: 85,
      velocityY: -0.1,
      minY: 90,
      maxY: 130,
    });

    constrainVerticalMovementToBounds(platform);

    expect(platform.y).toBe(90);
    expect(platform.velocityY).toBe(0.1);
  });
});
