import { describe, expect, it } from "vitest";
import {
  POWERUP_GENERATION_DURATION_MS,
  beginPowerupGeneration,
  createPowerupInventory,
  updatePowerupInventory,
} from "./PowerupInventory";

describe("PowerupInventory", () => {
  it("starts empty", () => {
    expect(createPowerupInventory()).toEqual({ status: "empty" });
  });

  it("generates for the configured delay", () => {
    const inventory = beginPowerupGeneration();

    expect(inventory).toEqual({
      status: "generating",
      remainingMs: POWERUP_GENERATION_DURATION_MS,
    });
  });

  it("counts down while generating", () => {
    const inventory = updatePowerupInventory(beginPowerupGeneration(), 500);

    expect(inventory).toEqual({
      status: "generating",
      remainingMs: POWERUP_GENERATION_DURATION_MS - 500,
    });
  });

  it("becomes ready with the empty catalog award when the timer elapses", () => {
    const inventory = updatePowerupInventory(
      beginPowerupGeneration(),
      POWERUP_GENERATION_DURATION_MS,
    );

    expect(inventory).toEqual({
      status: "ready",
      powerup: null,
    });
  });

  it("leaves non-generating inventory unchanged", () => {
    const inventory = { status: "ready" as const, powerup: null };

    expect(updatePowerupInventory(inventory, 500)).toBe(inventory);
  });
});
