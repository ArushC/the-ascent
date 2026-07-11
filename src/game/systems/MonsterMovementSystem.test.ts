import { describe, expect, it } from "vitest";
import { createTestHorizontalMonster } from "../testing/entityFactories";
import { updateMonsters } from "./MonsterMovementSystem";

describe("updateMonsters", () => {
  it("updates each monster", () => {
    const first = createTestHorizontalMonster({ x: 100, velocityX: 0.1 });
    const second = createTestHorizontalMonster({ x: 150, velocityX: -0.1 });

    updateMonsters([first, second], 100, 400);

    expect(first.x).toBe(110);
    expect(second.x).toBe(140);
  });
});
