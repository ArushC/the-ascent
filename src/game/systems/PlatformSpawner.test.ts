import { afterEach, describe, expect, it, vi } from "vitest";
import { PLAYER_WIDTH } from "../entities/Player";
import { STATIC_PLATFORM_WIDTH } from "../entities/StaticPlatform";
import { createTestStaticPlatform } from "../testing/entityFactories";
import {
  BOTTOM_PLATFORM_OFFSET,
  computeMaxJumpHeight,
  createInitialPlatforms,
  getGapBounds,
  removePlatformsBelowCamera,
  spawnNextPlatform,
  spawnPlatformsAboveCamera,
  updatePlatformsForCamera,
} from "./PlatformSpawner";

const TEST_CANVAS_WIDTH = 400;
const TEST_CANVAS_HEIGHT = 600;
const EXPECTED_BOTTOM_PLATFORM_X =
  (TEST_CANVAS_WIDTH - PLAYER_WIDTH) / 2 +
  (PLAYER_WIDTH - STATIC_PLATFORM_WIDTH) / 2;
const EXPECTED_BOTTOM_PLATFORM_Y =
  TEST_CANVAS_HEIGHT - BOTTOM_PLATFORM_OFFSET;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createInitialPlatforms", () => {
  it("creates an aligned bottom platform and fills ahead of the first screen", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const platforms = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
    );

    expect(platforms[0]).toMatchObject({
      x: EXPECTED_BOTTOM_PLATFORM_X,
      y: EXPECTED_BOTTOM_PLATFORM_Y,
    });
    expect(Math.min(...platforms.map((platform) => platform.y))).toBeLessThanOrEqual(
      -TEST_CANVAS_HEIGHT,
    );
    expect(platforms.length).toBeGreaterThan(5);
  });

  it("uses random platform placement for different new game layouts", () => {
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy.mockReturnValue(0);
    const firstLayout = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
    );

    randomSpy.mockReturnValue(1);
    const secondLayout = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
    );

    expect(snapshotLayout(secondLayout)).not.toEqual(snapshotLayout(firstLayout));
  });

  it("keeps generated vertical gaps within the physics-derived bounds", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.25);
    const { minGap, maxGap } = getGapBounds();

    const platforms = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
    );

    for (let index = 1; index < platforms.length; index += 1) {
      const gap = platforms[index - 1].y - platforms[index].y;

      expect(gap).toBeGreaterThanOrEqual(minGap);
      expect(gap).toBeLessThanOrEqual(maxGap);
    }
  });
});

describe("platform gap bounds", () => {
  it("keeps max gap below the maximum jump height", () => {
    const { maxGap } = getGapBounds();

    expect(maxGap).toBeLessThan(computeMaxJumpHeight());
  });
});

describe("spawnNextPlatform", () => {
  it("spawns above the current topmost platform", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const platform = spawnNextPlatform(100, TEST_CANVAS_WIDTH);

    expect(platform.y).toBeLessThan(100);
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
    );

    expect(Math.min(...platforms.map((platform) => platform.y))).toBeLessThanOrEqual(
      -TEST_CANVAS_HEIGHT,
    );
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
    let platforms = createInitialPlatforms(
      TEST_CANVAS_WIDTH,
      TEST_CANVAS_HEIGHT,
    );
    let maxPlatformCount = platforms.length;

    for (let screenTopY = 0; screenTopY >= -5_000; screenTopY -= 100) {
      platforms = updatePlatformsForCamera(
        platforms,
        screenTopY,
        TEST_CANVAS_WIDTH,
        TEST_CANVAS_HEIGHT,
      );
      maxPlatformCount = Math.max(maxPlatformCount, platforms.length);
    }

    expect(maxPlatformCount).toBeLessThanOrEqual(25);
  });
});

function snapshotLayout(platforms: ReturnType<typeof createInitialPlatforms>) {
  return platforms.map((platform) => ({
    x: platform.x,
    y: platform.y,
  }));
}
