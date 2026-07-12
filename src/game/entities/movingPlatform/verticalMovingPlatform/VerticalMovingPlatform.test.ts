import { describe, expect, it, vi } from "vitest";
import { createTestVerticalMovingPlatform } from "../../../testing/entityFactories";

describe("VerticalMovingPlatform", () => {
  it("draws vertical moving platforms in purple", () => {
    const platform = createTestVerticalMovingPlatform();

    expect(getDrawColor(platform)).toBe("purple");
  });

  it("tracks previous y before moving", () => {
    const platform = createTestVerticalMovingPlatform({
      y: 100,
      velocityY: 0.1,
      minY: 50,
      maxY: 150,
    });

    platform.update(100, 400);

    expect(platform.previousY).toBe(100);
    expect(platform.y).toBe(110);
  });
});

function getDrawColor(
  platform: ReturnType<typeof createTestVerticalMovingPlatform>,
) {
  const ctx = {
    fillStyle: "",
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  platform.draw(ctx);

  return ctx.fillStyle;
}
