import { describe, expect, it, vi } from "vitest";
import { createTestHorizontalMovingPlatform } from "../../../testing/entityFactories";

describe("HorizontalMovingPlatform", () => {
  it("draws horizontal moving platforms in blue", () => {
    const platform = createTestHorizontalMovingPlatform();

    expect(getDrawColor(platform)).toBe("blue");
  });
});

function getDrawColor(
  platform: ReturnType<typeof createTestHorizontalMovingPlatform>,
) {
  const ctx = {
    fillStyle: "",
    fillRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  platform.draw(ctx);

  return ctx.fillStyle;
}
