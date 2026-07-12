import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CIRCULAR_MONSTER_SPAWN_WEIGHT,
  createInitialMonsters,
  HORIZONTAL_MONSTER_SPAWN_WEIGHT,
  MONSTER_SPAWN_PROBABILITY,
  pickMonsterKind,
  removeMonstersBelowCamera,
  rollMonsterSpawn,
  spawnMonstersAboveCamera,
  spawnNextMonster,
  TRIANGULAR_MONSTER_SPAWN_WEIGHT,
  updateMonstersForCamera,
} from "./MonsterSpawner";
import { SPAWN_LOOKAHEAD_SCREENS } from "../platformSpawner/PlatformSpawner";
import { createTestHorizontalMonster } from "../../testing/entityFactories";

const TEST_CANVAS_WIDTH = 400;
const TEST_CANVAS_HEIGHT = 600;
const MONSTER_KIND_ROLL_OFFSET = 0.01;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createInitialMonsters", () => {
  it("does not create monsters near the player spawn", () => {
    expect(createInitialMonsters()).toEqual([]);
  });
});

describe("monster spawn weights", () => {
  it("keeps monster kind weights normalized", () => {
    expect(
      HORIZONTAL_MONSTER_SPAWN_WEIGHT +
        CIRCULAR_MONSTER_SPAWN_WEIGHT +
        TRIANGULAR_MONSTER_SPAWN_WEIGHT,
    ).toBeCloseTo(1);
  });

  it("picks monster kinds from equal weighted ranges", () => {
    expect(pickMonsterKind(0)).toBe("horizontal");
    expect(
      pickMonsterKind(HORIZONTAL_MONSTER_SPAWN_WEIGHT + MONSTER_KIND_ROLL_OFFSET),
    ).toBe("circular");
    expect(
      pickMonsterKind(
        HORIZONTAL_MONSTER_SPAWN_WEIGHT +
          CIRCULAR_MONSTER_SPAWN_WEIGHT +
          MONSTER_KIND_ROLL_OFFSET,
      ),
    ).toBe("triangular");
  });
});

describe("spawnNextMonster", () => {
  it("spawns above the current topmost monster", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const monster = spawnNextMonster(100, TEST_CANVAS_WIDTH);

    expect(monster.y).toBeLessThan(100);
  });

  it("can spawn each monster kind", () => {
    const randomSpy = vi.spyOn(Math, "random");

    randomSpy.mockReturnValue(0);
    expect(spawnNextMonster(100, TEST_CANVAS_WIDTH).kind).toBe("horizontal");

    randomSpy.mockReturnValue(HORIZONTAL_MONSTER_SPAWN_WEIGHT + 0.01);
    expect(spawnNextMonster(100, TEST_CANVAS_WIDTH).kind).toBe("circular");

    randomSpy.mockReturnValue(
      HORIZONTAL_MONSTER_SPAWN_WEIGHT + CIRCULAR_MONSTER_SPAWN_WEIGHT + 0.01,
    );
    expect(spawnNextMonster(100, TEST_CANVAS_WIDTH).kind).toBe("triangular");
  });
});

describe("rollMonsterSpawn", () => {
  it("uses the configured monster spawn probability", () => {
    const randomSpy = vi.spyOn(Math, "random");

    randomSpy.mockReturnValue(MONSTER_SPAWN_PROBABILITY - 0.01);
    expect(rollMonsterSpawn()).toBe(true);

    randomSpy.mockReturnValue(MONSTER_SPAWN_PROBABILITY);
    expect(rollMonsterSpawn()).toBe(false);
  });
});

describe("spawnMonstersAboveCamera", () => {
  it("spawns monsters in the camera lookahead band when rolls hit", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const monsters = spawnMonstersAboveCamera(
      [],
      0,
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
    );

    expect(monsters.length).toBeGreaterThan(0);
    expect(Math.min(...monsters.map((monster) => monster.y))).toBeLessThanOrEqual(
      -TEST_CANVAS_HEIGHT * SPAWN_LOOKAHEAD_SCREENS,
    );
  });

  it("does not spawn monsters when rolls miss", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);

    expect(
      spawnMonstersAboveCamera([], 0, TEST_CANVAS_WIDTH, TEST_CANVAS_HEIGHT),
    ).toEqual([]);
  });
});

describe("removeMonstersBelowCamera", () => {
  it("removes monsters below the camera bottom and keeps visible monsters", () => {
    const visibleTop = createTestHorizontalMonster({ y: -50 });
    const visibleBottom = createTestHorizontalMonster({ y: TEST_CANVAS_HEIGHT });
    const belowScreen = createTestHorizontalMonster({
      y: TEST_CANVAS_HEIGHT + 1,
    });

    expect(
      removeMonstersBelowCamera(
        [visibleTop, visibleBottom, belowScreen],
        0,
        TEST_CANVAS_HEIGHT,
      ),
    ).toEqual([visibleTop, visibleBottom]);
  });
});

describe("updateMonstersForCamera", () => {
  it("cleans up old monsters while climbing", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);
    const belowScreen = createTestHorizontalMonster({
      y: TEST_CANVAS_HEIGHT + 1,
    });

    expect(
      updateMonstersForCamera(
        [belowScreen],
        0,
        TEST_CANVAS_WIDTH,
        TEST_CANVAS_HEIGHT,
      ),
    ).toEqual([]);
  });
});
