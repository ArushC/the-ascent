import { describe, expect, it } from "vitest";
import {
  getPlatformPreviousY,
  getPlatformTopY,
  isDiagonalMovingPlatform,
  isHorizontalMovingPlatform,
  isMovingPlatform,
  isVerticalMovingPlatform,
  type Platform,
} from "./Platform";

type PlatformOverrides = Partial<Platform> & Record<string, unknown>;

function createPlatform(
  kind: Platform["kind"],
  extra: PlatformOverrides = {},
): Platform {
  return {
    kind,
    x: 10,
    y: 20,
    width: 90,
    height: 14,
    hasSpring: false,
    springActivationMs: 0,
    hasPowerup: false,
    draw: () => undefined,
    ...extra,
  };
}

describe("platform type guards", () => {
  it("identifies horizontal moving platforms", () => {
    expect(isHorizontalMovingPlatform(createPlatform("horizontalMoving"))).toBe(
      true,
    );
    expect(isHorizontalMovingPlatform(createPlatform("static"))).toBe(false);
  });

  it("identifies vertical moving platforms", () => {
    expect(isVerticalMovingPlatform(createPlatform("verticalMoving"))).toBe(
      true,
    );
    expect(isVerticalMovingPlatform(createPlatform("horizontalMoving"))).toBe(
      false,
    );
  });

  it("identifies diagonal moving platforms", () => {
    expect(isDiagonalMovingPlatform(createPlatform("diagonalMoving"))).toBe(
      true,
    );
    expect(isDiagonalMovingPlatform(createPlatform("verticalMoving"))).toBe(
      false,
    );
  });

  it("identifies any moving platform", () => {
    expect(isMovingPlatform(createPlatform("horizontalMoving"))).toBe(true);
    expect(isMovingPlatform(createPlatform("verticalMoving"))).toBe(true);
    expect(isMovingPlatform(createPlatform("diagonalMoving"))).toBe(true);
    expect(isMovingPlatform(createPlatform("static"))).toBe(false);
  });
});

describe("platform Y helpers", () => {
  it("uses y as previous Y for static and horizontal platforms", () => {
    expect(getPlatformPreviousY(createPlatform("static", { y: 40 }))).toBe(40);
    expect(
      getPlatformPreviousY(createPlatform("horizontalMoving", { y: 50 })),
    ).toBe(50);
  });

  it("uses previousY for vertical and diagonal platforms", () => {
    expect(
      getPlatformPreviousY(
        createPlatform("verticalMoving", { previousY: 60 }),
      ),
    ).toBe(60);
    expect(
      getPlatformPreviousY(
        createPlatform("diagonalMoving", { previousY: 70 }),
      ),
    ).toBe(70);
  });

  it("uses y as top Y for static and horizontal platforms", () => {
    expect(getPlatformTopY(createPlatform("static", { y: 80 }))).toBe(80);
    expect(getPlatformTopY(createPlatform("horizontalMoving", { y: 90 }))).toBe(
      90,
    );
  });

  it("uses minY as top Y for vertical and diagonal platforms", () => {
    expect(
      getPlatformTopY(
        createPlatform("verticalMoving", { minY: 100 }),
      ),
    ).toBe(100);
    expect(
      getPlatformTopY(
        createPlatform("diagonalMoving", { minY: 110 }),
      ),
    ).toBe(110);
  });
});
