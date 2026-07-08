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

type NumericOverrides<T> = Partial<{ [Key in keyof T]: number }>;

export type TestPlayerOverrides = NumericOverrides<typeof TEST_PLAYER_DEFAULTS>;
export type TestStaticPlatformOverrides = NumericOverrides<
  typeof TEST_STATIC_PLATFORM_DEFAULTS
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
  );
}
