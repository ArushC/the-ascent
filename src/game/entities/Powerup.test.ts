import { describe, expect, it } from "vitest";
import {
  getPlatformPowerup,
  playerCollidesWithPlatformPowerup,
} from "./Powerup";
import {
  createTestPlayer,
  createTestStaticPlatform,
} from "../testing/entityFactories";

describe("playerCollidesWithPlatformPowerup", () => {
  it("does not collide when the player is resting on the platform top", () => {
    const platform = createTestStaticPlatform({
      x: 100,
      y: 100,
      hasPowerup: true,
    });
    const player = createTestPlayer({
      x: platform.x + (platform.width - 40) / 2,
      y: platform.y - 40,
      width: 40,
      height: 40,
    });

    expect(playerCollidesWithPlatformPowerup(player, platform)).toBe(false);
  });

  it("collides when the player touches the floating star", () => {
    const platform = createTestStaticPlatform({
      x: 100,
      y: 100,
      hasPowerup: true,
    });
    const powerup = getPlatformPowerup(platform);
    if (powerup === null) {
      throw new Error("Expected a powerup entity");
    }
    const player = createTestPlayer({
      x: powerup.x,
      y: powerup.y,
      width: 40,
      height: 40,
    });

    expect(playerCollidesWithPlatformPowerup(player, platform)).toBe(true);
  });

  it("does not collide when the platform has no powerup", () => {
    const platform = createTestStaticPlatform({ hasPowerup: false });
    const player = createTestPlayer({
      x: platform.x,
      y: platform.y - 40,
    });

    expect(playerCollidesWithPlatformPowerup(player, platform)).toBe(false);
  });
});
