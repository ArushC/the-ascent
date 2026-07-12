import { describe, expect, it } from "vitest";
import { getPlatformPowerup } from "../entities/Powerup";
import {
  POWERUP_GENERATION_DURATION_MS,
  beginPowerupGeneration,
  createPowerupInventory,
} from "../powerups/PowerupInventory";
import {
  createTestPlayer,
  createTestStaticPlatform,
} from "../testing/entityFactories";
import { updatePowerups } from "./PowerupSystem";

describe("updatePowerups", () => {
  it("starts generation when the player collects a star", () => {
    const platform = createTestStaticPlatform({ hasPowerup: true });
    const powerup = getPlatformPowerup(platform);
    if (powerup === null) {
      throw new Error("Expected a powerup entity");
    }
    const player = createTestPlayer({ x: powerup.x, y: powerup.y });

    const result = updatePowerups(
      player,
      [platform],
      createPowerupInventory(),
      16,
    );

    expect(platform.hasPowerup).toBe(false);
    expect(result.inventory.status).toBe("generating");
    expect(result.didPanelStateChange).toBe(true);
    expect(result.didLoseReadyShrinkPowerup).toBe(false);
  });

  it("collects only the first overlapping star in a frame", () => {
    const firstPlatform = createTestStaticPlatform({ hasPowerup: true });
    const secondPlatform = createTestStaticPlatform({ hasPowerup: true });
    const powerup = getPlatformPowerup(firstPlatform);
    if (powerup === null) {
      throw new Error("Expected a powerup entity");
    }
    const player = createTestPlayer({ x: powerup.x, y: powerup.y });

    updatePowerups(
      player,
      [firstPlatform, secondPlatform],
      createPowerupInventory(),
      16,
    );

    expect(firstPlatform.hasPowerup).toBe(false);
    expect(secondPlatform.hasPowerup).toBe(true);
  });

  it("tracks held Shrink as the previous powerup when collection restarts generation", () => {
    const platform = createTestStaticPlatform({ hasPowerup: true });
    const powerup = getPlatformPowerup(platform);
    if (powerup === null) {
      throw new Error("Expected a powerup entity");
    }
    const player = createTestPlayer({ x: powerup.x, y: powerup.y });

    const result = updatePowerups(
      player,
      [platform],
      {
        status: "ready",
        powerup: {
          id: "shrink",
          label: "F: toggle size",
        },
      },
      16,
    );

    expect(result.inventory).toEqual({
      status: "generating",
      remainingMs: POWERUP_GENERATION_DURATION_MS - 16,
      previousPowerup: {
        id: "shrink",
        label: "F: toggle size",
      },
    });
    expect(result.didLoseReadyShrinkPowerup).toBe(false);
  });

  it("reports a UI change when generation finishes", () => {
    const result = updatePowerups(
      createTestPlayer(),
      [],
      beginPowerupGeneration(),
      POWERUP_GENERATION_DURATION_MS,
    );

    expect(result.inventory).toEqual({
      status: "ready",
      powerup: {
        id: "shrink",
        label: "F: toggle size",
      },
    });
    expect(result.didPanelStateChange).toBe(true);
    expect(result.didLoseReadyShrinkPowerup).toBe(false);
  });

  it("does not report a UI change for an in-progress countdown tick", () => {
    const result = updatePowerups(
      createTestPlayer(),
      [],
      beginPowerupGeneration(),
      500,
    );

    expect(result.inventory).toEqual({
      status: "generating",
      remainingMs: POWERUP_GENERATION_DURATION_MS - 500,
      previousPowerup: null,
    });
    expect(result.didPanelStateChange).toBe(false);
    expect(result.didLoseReadyShrinkPowerup).toBe(false);
  });
});
