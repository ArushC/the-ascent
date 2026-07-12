import { describe, expect, it } from "vitest";
import {
  POWERUP_GENERATION_DURATION_MS,
  beginPowerupGeneration,
  createPowerupInventory,
  didLoseReadyShrinkPowerup,
  isShrinkPowerupReady,
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
      previousPowerup: null,
    });
  });

  it("counts down while generating", () => {
    const inventory = updatePowerupInventory(beginPowerupGeneration(), 500);

    expect(inventory).toEqual({
      status: "generating",
      remainingMs: POWERUP_GENERATION_DURATION_MS - 500,
      previousPowerup: null,
    });
  });

  it("becomes ready with Shrink when the timer elapses", () => {
    const inventory = updatePowerupInventory(
      beginPowerupGeneration(),
      POWERUP_GENERATION_DURATION_MS,
    );

    expect(inventory).toEqual({
      status: "ready",
      powerup: {
        id: "shrink",
        label: "F: toggle size",
      },
    });
  });

  it("leaves non-generating inventory unchanged", () => {
    const inventory = { status: "ready" as const, powerup: null };

    expect(updatePowerupInventory(inventory, 500)).toBe(inventory);
  });

  it("reports Shrink as ready only when the ready slot holds Shrink", () => {
    expect(
      isShrinkPowerupReady({
        status: "ready",
        powerup: {
          id: "shrink",
          label: "F: toggle size",
        },
      }),
    ).toBe(true);
    expect(isShrinkPowerupReady({ status: "empty" })).toBe(false);
    expect(
      isShrinkPowerupReady({
        status: "generating",
        remainingMs: 1000,
        previousPowerup: null,
      }),
    ).toBe(false);
    expect(
      isShrinkPowerupReady({
        status: "ready",
        powerup: {
          id: "jetpack",
          label: "Jetpack",
        },
      }),
    ).toBe(false);
  });

  it("reports when a ready Shrink powerup is lost", () => {
    const readyShrink = {
      status: "ready" as const,
      powerup: {
        id: "shrink",
        label: "F: toggle size",
      },
    };

    expect(
      didLoseReadyShrinkPowerup(readyShrink, {
        status: "generating",
        remainingMs: 1000,
        previousPowerup: readyShrink.powerup,
      }),
    ).toBe(false);
    expect(
      didLoseReadyShrinkPowerup(readyShrink, {
        status: "ready",
        powerup: {
          id: "shrink",
          label: "F: toggle size",
        },
      }),
    ).toBe(false);
    expect(didLoseReadyShrinkPowerup(readyShrink, { status: "empty" })).toBe(
      true,
    );
    expect(
      didLoseReadyShrinkPowerup(readyShrink, {
        status: "ready",
        powerup: null,
      }),
    ).toBe(true);
    expect(
      didLoseReadyShrinkPowerup(readyShrink, {
        status: "ready",
        powerup: {
          id: "jetpack",
          label: "Jetpack",
        },
      }),
    ).toBe(true);
  });

  it("does not report losing Shrink when Shrink was not held", () => {
    expect(
      didLoseReadyShrinkPowerup(
        { status: "empty" },
        { status: "ready", powerup: null },
      ),
    ).toBe(false);
  });

  it("reports when generation from held Shrink finishes without Shrink", () => {
    expect(
      didLoseReadyShrinkPowerup(
        {
          status: "generating",
          remainingMs: 0,
          previousPowerup: {
            id: "shrink",
            label: "F: toggle size",
          },
        },
        {
          status: "ready",
          powerup: {
            id: "jetpack",
            label: "Jetpack",
          },
        },
      ),
    ).toBe(true);
  });
});
