import { describe, expect, it, vi } from "vitest";
import { MONSTER_SPIKE_SIZE } from "../Monster";
import { createTestTriangularMonster } from "../../../testing/entityFactories";

describe("TriangularPathMonster", () => {
  it("advances around the triangle perimeter", () => {
    const monster = createTestTriangularMonster({
      x: 100,
      y: 100,
      pathSize: 60,
      pathT: 0,
      speed: 0.1,
    });
    const initialX = monster.x;
    const initialY = monster.y;

    monster.update(300, 400);

    expect(monster.x).not.toBe(initialX);
    expect(monster.y).not.toBe(initialY);
    expect(monster.pathT).toBeGreaterThan(0);
  });

  it("wraps path progress", () => {
    const monster = createTestTriangularMonster({
      pathT: 0.99,
      speed: 1,
    });

    monster.update(monster.perimeterLength, 400);

    expect(monster.pathT).toBeCloseTo(0.99);
  });

  it("draws triangular path monsters in white", () => {
    const monster = createTestTriangularMonster();
    const ctx = {
      fillStyle: "",
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    monster.draw(ctx);

    expect(ctx.fillStyle).toBe("white");
    expect(ctx.moveTo).toHaveBeenLastCalledWith(
      monster.x + monster.width / 2,
      monster.y + MONSTER_SPIKE_SIZE,
    );
    expect(ctx.lineTo).toHaveBeenCalledTimes(8);
    expect(ctx.fill).toHaveBeenCalledTimes(4);
  });
});
