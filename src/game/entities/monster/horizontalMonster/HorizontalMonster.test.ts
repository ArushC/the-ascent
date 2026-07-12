import { describe, expect, it, vi } from "vitest";
import { MONSTER_SPIKE_SIZE } from "../Monster";
import { createTestHorizontalMonster } from "../../../testing/entityFactories";

describe("HorizontalMonster", () => {
  it("moves by velocity and delta time", () => {
    const monster = createTestHorizontalMonster({
      x: 120,
      velocityX: 0.1,
    });

    monster.update(200, 400);

    expect(monster.x).toBe(140);
  });

  it("bounces off horizontal bounds", () => {
    const monster = createTestHorizontalMonster({
      x: 95,
      velocityX: -0.1,
      minX: 100,
      maxX: 180,
    });

    monster.update(100, 400);

    expect(monster.x).toBe(100);
    expect(monster.velocityX).toBe(0.1);
  });

  it("draws horizontal monsters in cyan", () => {
    const monster = createTestHorizontalMonster();
    const ctx = {
      fillStyle: "",
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    monster.draw(ctx);

    expect(ctx.fillStyle).toBe("cyan");
    expect(ctx.fillRect).toHaveBeenCalledWith(
      monster.x + MONSTER_SPIKE_SIZE,
      monster.y + MONSTER_SPIKE_SIZE,
      monster.width - MONSTER_SPIKE_SIZE * 2,
      monster.height - MONSTER_SPIKE_SIZE * 2,
    );
    expect(ctx.beginPath).toHaveBeenCalledTimes(4);
    expect(ctx.fill).toHaveBeenCalledTimes(4);
  });
});
