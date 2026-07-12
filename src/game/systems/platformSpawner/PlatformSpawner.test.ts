import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PLATFORM_WIDTH,
  getPlatformTopY,
  isDiagonalMovingPlatform,
  isHorizontalMovingPlatform,
  isVerticalMovingPlatform,
} from "../../entities/platform/Platform";
import { PLAYER_WIDTH } from "../../entities/player/Player";
import { SPRING_WIDTH } from "../../entities/spring/Spring";
import {
  getDifficultyParams,
  SCORE_RAMP_END,
} from "../difficultySystem/DifficultySystem";
import {
  createTestVerticalMovingPlatform,
  createTestStaticPlatform,
} from "../../testing/entityFactories";
import {
  BOTTOM_PLATFORM_OFFSET,
  computeMaxJumpHeight,
  createInitialPlatforms,
  DIAGONAL_MOVING_PLATFORM_SPAWN_WEIGHT,
  getGapBounds,
  getMovingPlatformTravelDistance,
  getRandomPlatformX,
  getTopmostPlatformY,
  HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT,
  pickPlatformKind,
  POWERUP_SPAWN_PROBABILITY,
  removePlatformsBelowCamera,
  rollPlatformExtras,
  spawnNextPlatform,
  spawnPlatformsAboveCamera,
  SPAWN_LOOKAHEAD_SCREENS,
  SPRING_SPAWN_PROBABILITY,
  STATIC_PLATFORM_SPAWN_WEIGHT,
  VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT,
  updatePlatformsForCamera,
} from "./PlatformSpawner";

const TEST_CANVAS_WIDTH = 400;
const TEST_CANVAS_HEIGHT = 600;
const EXPECTED_BOTTOM_PLATFORM_X =
  (TEST_CANVAS_WIDTH - PLAYER_WIDTH) / 2 +
  (PLAYER_WIDTH - DEFAULT_PLATFORM_WIDTH) / 2;
const EXPECTED_BOTTOM_PLATFORM_Y =
  TEST_CANVAS_HEIGHT - BOTTOM_PLATFORM_OFFSET;
const PLATFORM_KIND_ROLL_OFFSET = 0.01;
const BASE_DIFFICULTY = getDifficultyParams(0);
const HARD_DIFFICULTY = getDifficultyParams(SCORE_RAMP_END);
const BASE_GAP_BOUNDS = getGapBounds(BASE_DIFFICULTY);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createInitialPlatforms", () => {
  it("creates an aligned bottom platform and fills ahead of the first screen", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const platforms = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      BASE_DIFFICULTY,
    );

    expect(platforms[0]).toMatchObject({
      kind: "static",
      x: EXPECTED_BOTTOM_PLATFORM_X,
      y: EXPECTED_BOTTOM_PLATFORM_Y,
    });
    expect(platforms[0].hasSpring).toBe(false);
    expect(platforms[0].hasPowerup).toBe(false);
    expect(Math.min(...platforms.map(getPlatformTopY))).toBeLessThanOrEqual(
      -TEST_CANVAS_HEIGHT * SPAWN_LOOKAHEAD_SCREENS,
    );
    expect(platforms.length).toBeGreaterThan(5);
  });

  it("does not attach extras to the guaranteed bottom platform", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const platforms = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      BASE_DIFFICULTY,
    );

    expect(platforms[0].hasSpring).toBe(false);
    expect(platforms[0].hasPowerup).toBe(false);
    expect(platforms[1].hasSpring).toBe(false);
    expect(platforms[1].hasPowerup).toBe(true);
  });

  it("uses random platform placement for different new game layouts", () => {
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy.mockReturnValue(0);
    const firstLayout = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      BASE_DIFFICULTY,
    );

    randomSpy.mockReturnValue(1);
    const secondLayout = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      BASE_DIFFICULTY,
    );

    expect(snapshotLayout(secondLayout)).not.toEqual(snapshotLayout(firstLayout));
  });

  it("keeps generated vertical gaps within the physics-derived bounds", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.25);
    const { minGap, maxGap } = getGapBounds(BASE_DIFFICULTY);

    const platforms = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      BASE_DIFFICULTY,
    );

    for (let index = 1; index < platforms.length; index += 1) {
      const gap =
        getPlatformTopY(platforms[index - 1]) -
        getPlatformTopY(platforms[index]);

      expect(gap).toBeGreaterThanOrEqual(minGap);
      expect(gap).toBeLessThanOrEqual(maxGap);
    }
  });
});

describe("platform gap bounds", () => {
  it("keeps max gap below the maximum jump height", () => {
    const { maxGap } = getGapBounds(BASE_DIFFICULTY);

    expect(maxGap).toBeLessThan(computeMaxJumpHeight());
  });
});

describe("platform spawn weights", () => {
  it("keeps platform kind weights normalized", () => {
    expect(
      STATIC_PLATFORM_SPAWN_WEIGHT +
        HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT +
        VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT +
        DIAGONAL_MOVING_PLATFORM_SPAWN_WEIGHT,
    ).toBe(1);
  });

  it("picks platform kinds from the weighted ranges", () => {
    expect(pickPlatformKind(0, BASE_DIFFICULTY)).toBe("static");
    expect(
      pickPlatformKind(
        STATIC_PLATFORM_SPAWN_WEIGHT + PLATFORM_KIND_ROLL_OFFSET,
        BASE_DIFFICULTY,
      ),
    ).toBe("horizontalMoving");
    expect(
      pickPlatformKind(
        STATIC_PLATFORM_SPAWN_WEIGHT +
          HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT +
          PLATFORM_KIND_ROLL_OFFSET,
        BASE_DIFFICULTY,
      ),
    ).toBe("verticalMoving");
    expect(
      pickPlatformKind(
        STATIC_PLATFORM_SPAWN_WEIGHT +
          HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT +
          VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT +
          PLATFORM_KIND_ROLL_OFFSET,
        BASE_DIFFICULTY,
      ),
    ).toBe("diagonalMoving");
  });
});

describe("getRandomPlatformX", () => {
  it("keeps the platform inside the canvas when no horizontal travel is needed", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);

    expect(getRandomPlatformX(TEST_CANVAS_WIDTH)).toBe(
      TEST_CANVAS_WIDTH - DEFAULT_PLATFORM_WIDTH,
    );
  });

  it("leaves room for horizontal travel on both sides of the platform", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(getRandomPlatformX(TEST_CANVAS_WIDTH, 100)).toBe(50);
  });
});

describe("getTopmostPlatformY", () => {
  it("uses a moving platform's highest reachable vertical position", () => {
    const staticPlatform = createTestStaticPlatform({ y: 100 });
    const movingPlatform = createTestVerticalMovingPlatform({
      y: 50,
      velocityY: 0.1,
      minY: 25,
      maxY: 75,
    });

    expect(getTopmostPlatformY([staticPlatform, movingPlatform])).toBe(25);
  });
});

describe("spawnNextPlatform", () => {
  it("spawns above the current topmost platform", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH, BASE_DIFFICULTY);

    expect(platform.y).toBeLessThan(100);
  });

  it("can spawn horizontal moving platforms based on the spawn chance", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(
        STATIC_PLATFORM_SPAWN_WEIGHT + PLATFORM_KIND_ROLL_OFFSET,
      )
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(1);

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH, BASE_DIFFICULTY);

    expect(platform.kind).toBe("horizontalMoving");
    if (isHorizontalMovingPlatform(platform)) {
      expect(platform.velocityX).not.toBe(0);
      expect(platform.maxX - platform.minX).toBeCloseTo(
        getMovingPlatformTravelDistance(
          TEST_CANVAS_WIDTH,
          DEFAULT_PLATFORM_WIDTH,
          BASE_GAP_BOUNDS,
        ),
      );
    }
  });

  it("can spawn vertical moving platforms", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(
        STATIC_PLATFORM_SPAWN_WEIGHT +
          HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT +
          PLATFORM_KIND_ROLL_OFFSET,
      )
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1);

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH, BASE_DIFFICULTY);

    expect(platform.kind).toBe("verticalMoving");
    if (isVerticalMovingPlatform(platform)) {
      expect(platform.velocityY).not.toBe(0);
      expect(platform.maxY - platform.minY).toBeCloseTo(
        getMovingPlatformTravelDistance(
          TEST_CANVAS_WIDTH,
          DEFAULT_PLATFORM_WIDTH,
          BASE_GAP_BOUNDS,
        ),
      );
    }
  });

  it("can spawn diagonal moving platforms", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(
        STATIC_PLATFORM_SPAWN_WEIGHT +
          HORIZONTAL_MOVING_PLATFORM_SPAWN_WEIGHT +
          VERTICAL_MOVING_PLATFORM_SPAWN_WEIGHT +
          PLATFORM_KIND_ROLL_OFFSET,
      )
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1);

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH, BASE_DIFFICULTY);

    expect(platform.kind).toBe("diagonalMoving");
    if (isDiagonalMovingPlatform(platform)) {
      expect(platform.velocityX).not.toBe(0);
      expect(platform.velocityY).not.toBe(0);
      expect(platform.maxX - platform.minX).toBeCloseTo(
        getMovingPlatformTravelDistance(
          TEST_CANVAS_WIDTH,
          DEFAULT_PLATFORM_WIDTH,
          BASE_GAP_BOUNDS,
        ),
      );
      expect(platform.maxY - platform.minY).toBeCloseTo(
        getMovingPlatformTravelDistance(
          TEST_CANVAS_WIDTH,
          DEFAULT_PLATFORM_WIDTH,
          BASE_GAP_BOUNDS,
        ),
      );
    }
  });

  it("can spawn static platforms based on the spawn chance", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(1);

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH, BASE_DIFFICULTY);

    expect(platform.kind).toBe("static");
  });

  it("attaches springs based on the spring roll", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(POWERUP_SPAWN_PROBABILITY)
      .mockReturnValueOnce(0);

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH, BASE_DIFFICULTY);

    expect(platform.hasSpring).toBe(true);
    expect(platform.hasPowerup).toBe(false);
  });

  it("attaches powerups before rolling for springs", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(POWERUP_SPAWN_PROBABILITY - 0.01)
      .mockReturnValueOnce(0.5);

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH, BASE_DIFFICULTY);

    expect(platform.hasSpring).toBe(false);
    expect(platform.hasPowerup).toBe(true);
  });

  it("clamps spring platform width to the spring width", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(POWERUP_SPAWN_PROBABILITY)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5);
    const params = {
      ...getDifficultyParams(0),
      minPlatformWidth: 10,
      maxPlatformWidth: 10,
    };

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH, params);

    expect(platform.hasSpring).toBe(true);
    expect(platform.width).toBe(SPRING_WIDTH);
  });

  it("uses hard-score gap and width params at spawn", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5);

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH, HARD_DIFFICULTY);

    expect(platform.kind).toBe("static");
    expect(platform.width).toBe(70);
    expect(platform.y).toBeCloseTo(
      100 - getGapBounds(HARD_DIFFICULTY).minGap,
    );
  });
});

describe("rollPlatformExtras", () => {
  it("uses the configured powerup spawn probability first", () => {
    const randomSpy = vi.spyOn(Math, "random");

    randomSpy.mockReturnValue(POWERUP_SPAWN_PROBABILITY - 0.01);
    expect(rollPlatformExtras()).toEqual({
      hasSpring: false,
      hasPowerup: true,
    });

    randomSpy.mockReturnValue(POWERUP_SPAWN_PROBABILITY);
    expect(rollPlatformExtras().hasPowerup).toBe(false);
  });

  it("uses the configured spring spawn probability after powerup misses", () => {
    const randomSpy = vi.spyOn(Math, "random");

    randomSpy
      .mockReturnValueOnce(POWERUP_SPAWN_PROBABILITY)
      .mockReturnValueOnce(SPRING_SPAWN_PROBABILITY - 0.01);
    expect(rollPlatformExtras()).toEqual({
      hasSpring: true,
      hasPowerup: false,
    });

    randomSpy
      .mockReturnValueOnce(POWERUP_SPAWN_PROBABILITY)
      .mockReturnValueOnce(SPRING_SPAWN_PROBABILITY);
    expect(rollPlatformExtras()).toEqual({
      hasSpring: false,
      hasPowerup: false,
    });
  });
});

describe("spawnPlatformsAboveCamera", () => {
  it("spawns platforms up to the camera lookahead boundary", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const bottomPlatform = createTestStaticPlatform({
      y: EXPECTED_BOTTOM_PLATFORM_Y,
    });

    const platforms = spawnPlatformsAboveCamera(
      [bottomPlatform],
      0,
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      BASE_DIFFICULTY,
    );

    expect(Math.min(...platforms.map(getPlatformTopY))).toBeLessThanOrEqual(
      -TEST_CANVAS_HEIGHT * SPAWN_LOOKAHEAD_SCREENS,
    );
  });

  it("uses normal gaps above a sprung topmost platform", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const sprungPlatform = createTestStaticPlatform({
      y: 100,
      hasSpring: true,
    });
    const { minGap } = getGapBounds(BASE_DIFFICULTY);

    const platforms = spawnPlatformsAboveCamera(
      [sprungPlatform],
      0,
      TEST_CANVAS_WIDTH,
      10,
      BASE_DIFFICULTY,
    );

    expect(platforms[1].y).toBeCloseTo(sprungPlatform.y - minGap);
  });

  it("continues spawning from a moving platform's effective top", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const { minGap, maxGap } = getGapBounds(BASE_DIFFICULTY);
    const currentTop = 60;
    const movingPlatform = createTestVerticalMovingPlatform({
      y: 100,
      velocityY: 0.1,
      minY: currentTop,
      maxY: 140,
    });

    const platforms = spawnPlatformsAboveCamera(
      [movingPlatform],
      0,
      TEST_CANVAS_WIDTH,
      100,
      BASE_DIFFICULTY,
    );

    expect(platforms[1].y).toBeCloseTo(currentTop - (minGap + maxGap) / 2);
  });
});

describe("removePlatformsBelowCamera", () => {
  it("removes platforms below the camera bottom and keeps visible platforms", () => {
    const visibleTop = createTestStaticPlatform({ y: -50 });
    const visibleBottom = createTestStaticPlatform({ y: TEST_CANVAS_HEIGHT });
    const belowScreen = createTestStaticPlatform({
      y: TEST_CANVAS_HEIGHT + 1,
    });

    expect(
      removePlatformsBelowCamera(
        [visibleTop, visibleBottom, belowScreen],
        0,
        TEST_CANVAS_HEIGHT,
      ),
    ).toEqual([visibleTop, visibleBottom]);
  });
});

describe("updatePlatformsForCamera", () => {
  it("cleans up old platforms and keeps platform count bounded while climbing", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const expectedMaxPlatformCount =
      Math.ceil(
        (TEST_CANVAS_HEIGHT * (SPAWN_LOOKAHEAD_SCREENS + 1)) /
          getGapBounds(BASE_DIFFICULTY).minGap,
      ) + 1;
    let platforms = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
      BASE_DIFFICULTY,
    );
    let maxPlatformCount = platforms.length;

    for (let screenTopY = 0; screenTopY >= -5_000; screenTopY -= 100) {
      platforms = updatePlatformsForCamera(
        platforms,
        screenTopY,
        TEST_CANVAS_WIDTH,
        TEST_CANVAS_HEIGHT,
        BASE_DIFFICULTY,
      );
      maxPlatformCount = Math.max(maxPlatformCount, platforms.length);
    }

    expect(maxPlatformCount).toBeLessThanOrEqual(expectedMaxPlatformCount);
  });
});

function snapshotLayout(platforms: ReturnType<typeof createInitialPlatforms>) {
  return platforms.map((platform) => ({
    x: platform.x,
    y: platform.y,
  }));
}
