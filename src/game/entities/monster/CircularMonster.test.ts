import { describe, expect, it, vi } from "vitest";
import { MONSTER_SPIKE_SIZE } from "../Monster";
import { createTestCircularMonster } from "../../testing/entityFactories";

describe("CircularMonster", () => {
  it("orbits around its anchor", () => {
    const monster = createTestCircularMonster({
      centerX: 100,
      centerY: 150,
      radius: 20,
      angle: 0,
      angularVelocity: Math.PI / 100,
    });

    monster.update(50, 400);

    expect(monster.x).toBeCloseTo(100 - monster.width / 2);
    expect(monster.y).toBeCloseTo(170 - monster.height / 2);
  });

  it("draws circular monsters in magenta", () => {
    const monster = createTestCircularMonster();
    const ctx = {
      fillStyle: "",
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    monster.draw(ctx);

    expect(ctx.fillStyle).toBe("magenta");
    expect(ctx.arc).toHaveBeenCalledWith(
      monster.x + monster.width / 2,
      monster.y + monster.height / 2,
      monster.width / 2 - MONSTER_SPIKE_SIZE,
      0,
      2 * Math.PI,
    );
    expect(ctx.beginPath).toHaveBeenCalledTimes(9);
    expect(ctx.fill).toHaveBeenCalledTimes(9);
  });
});
