import { DiagonalMovingPlatform } from "../entities/movingPlatform/DiagonalMovingPlatform";
import { HorizontalMovingPlatform } from "../entities/movingPlatform/HorizontalMovingPlatform";
import { VerticalMovingPlatform } from "../entities/movingPlatform/VerticalMovingPlatform";
import { Player } from "../entities/Player";
import { StaticPlatform } from "../entities/StaticPlatform";

export const TEST_PLAYER_DEFAULTS = {
  x: 100,
  y: 200,
  width: 40,
  height: 40,
  velocityX: 0,
  velocityY: 0,
} as const;

export const TEST_STATIC_PLATFORM_DEFAULTS = {
  x: 90,
  y: 100,
  width: 90,
  height: 14,
} as const;

export const TEST_MOVING_PLATFORM_TRAVEL_DISTANCE = 100;

export const TEST_HORIZONTAL_MOVING_PLATFORM_DEFAULTS = {
  ...TEST_STATIC_PLATFORM_DEFAULTS,
  velocityX: 0.1,
  minX:
    TEST_STATIC_PLATFORM_DEFAULTS.x - TEST_MOVING_PLATFORM_TRAVEL_DISTANCE / 2,
  maxX:
    TEST_STATIC_PLATFORM_DEFAULTS.x + TEST_MOVING_PLATFORM_TRAVEL_DISTANCE / 2,
} as const;

export const TEST_VERTICAL_MOVING_PLATFORM_DEFAULTS = {
  ...TEST_STATIC_PLATFORM_DEFAULTS,
  velocityY: 0.1,
  minY:
    TEST_STATIC_PLATFORM_DEFAULTS.y - TEST_MOVING_PLATFORM_TRAVEL_DISTANCE / 2,
  maxY:
    TEST_STATIC_PLATFORM_DEFAULTS.y + TEST_MOVING_PLATFORM_TRAVEL_DISTANCE / 2,
} as const;

export const TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS = {
  ...TEST_STATIC_PLATFORM_DEFAULTS,
  velocityX: 0.1,
  velocityY: 0.1,
  minX:
    TEST_STATIC_PLATFORM_DEFAULTS.x - TEST_MOVING_PLATFORM_TRAVEL_DISTANCE / 2,
  maxX:
    TEST_STATIC_PLATFORM_DEFAULTS.x + TEST_MOVING_PLATFORM_TRAVEL_DISTANCE / 2,
  minY:
    TEST_STATIC_PLATFORM_DEFAULTS.y - TEST_MOVING_PLATFORM_TRAVEL_DISTANCE / 2,
  maxY:
    TEST_STATIC_PLATFORM_DEFAULTS.y + TEST_MOVING_PLATFORM_TRAVEL_DISTANCE / 2,
} as const;

export const TEST_MOVING_PLATFORM_DEFAULTS = {
  ...TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS,
  velocityY: 0,
} as const;

type NumericOverrides<T> = Partial<{ [Key in keyof T]: number }>;
type PlatformOverrides<T> = NumericOverrides<T> & { hasSpring?: boolean };

export type TestPlayerOverrides = NumericOverrides<typeof TEST_PLAYER_DEFAULTS>;
export type TestStaticPlatformOverrides = PlatformOverrides<
  typeof TEST_STATIC_PLATFORM_DEFAULTS
>;
export type TestMovingPlatformOverrides = PlatformOverrides<
  typeof TEST_MOVING_PLATFORM_DEFAULTS
>;
export type TestHorizontalMovingPlatformOverrides = PlatformOverrides<
  typeof TEST_HORIZONTAL_MOVING_PLATFORM_DEFAULTS
>;
export type TestVerticalMovingPlatformOverrides = PlatformOverrides<
  typeof TEST_VERTICAL_MOVING_PLATFORM_DEFAULTS
>;
export type TestDiagonalMovingPlatformOverrides = PlatformOverrides<
  typeof TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS
>;

export function createTestPlayer(
  overrides: TestPlayerOverrides = {},
): Player {
  return new Player(
    overrides.x ?? TEST_PLAYER_DEFAULTS.x,
    overrides.y ?? TEST_PLAYER_DEFAULTS.y,
    overrides.width ?? TEST_PLAYER_DEFAULTS.width,
    overrides.height ?? TEST_PLAYER_DEFAULTS.height,
    overrides.velocityX ?? TEST_PLAYER_DEFAULTS.velocityX,
    overrides.velocityY ?? TEST_PLAYER_DEFAULTS.velocityY,
  );
}

export function createTestStaticPlatform(
  overrides: TestStaticPlatformOverrides = {},
): StaticPlatform {
  return new StaticPlatform(
    overrides.x ?? TEST_STATIC_PLATFORM_DEFAULTS.x,
    overrides.y ?? TEST_STATIC_PLATFORM_DEFAULTS.y,
    overrides.width ?? TEST_STATIC_PLATFORM_DEFAULTS.width,
    overrides.height ?? TEST_STATIC_PLATFORM_DEFAULTS.height,
    overrides.hasSpring ?? false,
  );
}

export function createTestMovingPlatform(
  overrides: TestMovingPlatformOverrides = {},
): HorizontalMovingPlatform {
  return createTestHorizontalMovingPlatform(overrides);
}

export function createTestHorizontalMovingPlatform(
  overrides: TestHorizontalMovingPlatformOverrides = {},
): HorizontalMovingPlatform {
  return new HorizontalMovingPlatform(
    overrides.x ?? TEST_HORIZONTAL_MOVING_PLATFORM_DEFAULTS.x,
    overrides.y ?? TEST_HORIZONTAL_MOVING_PLATFORM_DEFAULTS.y,
    overrides.width ?? TEST_HORIZONTAL_MOVING_PLATFORM_DEFAULTS.width,
    overrides.height ?? TEST_HORIZONTAL_MOVING_PLATFORM_DEFAULTS.height,
    overrides.velocityX ??
      TEST_HORIZONTAL_MOVING_PLATFORM_DEFAULTS.velocityX,
    overrides.minX ?? TEST_HORIZONTAL_MOVING_PLATFORM_DEFAULTS.minX,
    overrides.maxX ?? TEST_HORIZONTAL_MOVING_PLATFORM_DEFAULTS.maxX,
    overrides.hasSpring ?? false,
  );
}

export function createTestVerticalMovingPlatform(
  overrides: TestVerticalMovingPlatformOverrides = {},
): VerticalMovingPlatform {
  return new VerticalMovingPlatform(
    overrides.x ?? TEST_VERTICAL_MOVING_PLATFORM_DEFAULTS.x,
    overrides.y ?? TEST_VERTICAL_MOVING_PLATFORM_DEFAULTS.y,
    overrides.width ?? TEST_VERTICAL_MOVING_PLATFORM_DEFAULTS.width,
    overrides.height ?? TEST_VERTICAL_MOVING_PLATFORM_DEFAULTS.height,
    overrides.velocityY ?? TEST_VERTICAL_MOVING_PLATFORM_DEFAULTS.velocityY,
    overrides.minY ?? TEST_VERTICAL_MOVING_PLATFORM_DEFAULTS.minY,
    overrides.maxY ?? TEST_VERTICAL_MOVING_PLATFORM_DEFAULTS.maxY,
    overrides.hasSpring ?? false,
  );
}

export function createTestDiagonalMovingPlatform(
  overrides: TestDiagonalMovingPlatformOverrides = {},
): DiagonalMovingPlatform {
  return new DiagonalMovingPlatform(
    overrides.x ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.x,
    overrides.y ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.y,
    overrides.width ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.width,
    overrides.height ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.height,
    overrides.velocityX ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.velocityX,
    overrides.velocityY ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.velocityY,
    overrides.minX ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.minX,
    overrides.maxX ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.maxX,
    overrides.minY ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.minY,
    overrides.maxY ?? TEST_DIAGONAL_MOVING_PLATFORM_DEFAULTS.maxY,
    overrides.hasSpring ?? false,
  );
}
