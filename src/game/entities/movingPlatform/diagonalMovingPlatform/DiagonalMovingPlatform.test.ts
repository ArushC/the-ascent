import { describe, expect, it, vi } from "vitest";
import { createTestDiagonalMovingPlatform } from "../../../testing/entityFactories";

describe("DiagonalMovingPlatform", () => {
  it("draws diagonal moving platforms in orange", () => {
    const platform = createTestDiagonalMovingPlatform();

    expect(getDrawColor(platform)).toBe("orange");
  });

  it("tracks previous y before moving", () => {
    const platform = createTestDiagonalMovingPlatform({
      x: 100,
      y: 100,
      velocityX: 0.1,
      velocityY: 0.1,
      minX: 50,
      maxX: 150,
      minY: 50,
      maxY: 150,
    });

    platform.update(100, 400);

    expect(platform.previousY).toBe(100);
    expect(platform.y).toBe(110);
  });
});

function getDrawColor(
  platform: ReturnType<typeof createTestDiagonalMovingPlatform>,
) {
  const ctx = {
    fillStyle: "",
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  platform.draw(ctx);

  return ctx.fillStyle;
}
