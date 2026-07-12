import { describe, expect, it, vi } from "vitest";
import {
  POWERUP_GENERATION_DURATION_MS,
  beginPowerupGeneration,
  createPowerupInventory,
  didLoseReadyArmorPowerup,
  didLoseReadyShrinkPowerup,
  didLoseReadySlowMoPowerup,
  isArmorPowerupReady,
  isShrinkPowerupReady,
  isSlowMoPowerupReady,
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
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    const inventory = updatePowerupInventory(
      beginPowerupGeneration(),
      POWERUP_GENERATION_DURATION_MS,
    );
    randomSpy.mockRestore();

    expect(inventory).toEqual({
      status: "ready",
      powerup: {
        id: "shrink",
        label: "F: toggle size",
      },
    });
  });

  it("becomes ready with Slow-mo when the catalog pick lands on it", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const inventory = updatePowerupInventory(
      beginPowerupGeneration(),
      POWERUP_GENERATION_DURATION_MS,
    );
    randomSpy.mockRestore();

    expect(inventory).toEqual({
      status: "ready",
      powerup: {
        id: "slowMo",
        label: "T: toggle slow-mo",
      },
    });
  });

  it("becomes ready with Armor when the catalog pick lands on it", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99);
    const inventory = updatePowerupInventory(
      beginPowerupGeneration(),
      POWERUP_GENERATION_DURATION_MS,
    );
    randomSpy.mockRestore();

    expect(inventory).toEqual({
      status: "ready",
      powerup: {
        id: "armor",
        label: "G: toggle armor",
      },
    });
  });

  it("does not generate the same powerup twice in a row", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.99);
    const inventory = updatePowerupInventory(
      beginPowerupGeneration({
        id: "armor",
        label: "G: toggle armor",
      }),
      POWERUP_GENERATION_DURATION_MS,
    );
    randomSpy.mockRestore();

    expect(inventory).toEqual({
      status: "ready",
      powerup: {
        id: "slowMo",
        label: "T: toggle slow-mo",
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

  it("reports Slow-mo as ready only when the ready slot holds Slow-mo", () => {
    expect(
      isSlowMoPowerupReady({
        status: "ready",
        powerup: {
          id: "slowMo",
          label: "T: toggle slow-mo",
        },
      }),
    ).toBe(true);
    expect(isSlowMoPowerupReady({ status: "empty" })).toBe(false);
    expect(
      isSlowMoPowerupReady({
        status: "ready",
        powerup: {
          id: "shrink",
          label: "F: toggle size",
        },
      }),
    ).toBe(false);
  });

  it("reports Armor as ready only when the ready slot holds Armor", () => {
    expect(
      isArmorPowerupReady({
        status: "ready",
        powerup: {
          id: "armor",
          label: "G: toggle armor",
        },
      }),
    ).toBe(true);
    expect(isArmorPowerupReady({ status: "empty" })).toBe(false);
    expect(
      isArmorPowerupReady({
        status: "ready",
        powerup: {
          id: "shrink",
          label: "F: toggle size",
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

  it("reports when generation from held Slow-mo finishes without Slow-mo", () => {
    expect(
      didLoseReadySlowMoPowerup(
        {
          status: "generating",
          remainingMs: 0,
          previousPowerup: {
            id: "slowMo",
            label: "T: toggle slow-mo",
          },
        },
        {
          status: "ready",
          powerup: {
            id: "shrink",
            label: "F: toggle size",
          },
        },
      ),
    ).toBe(true);
  });

  it("reports when generation from held Armor finishes without Armor", () => {
    expect(
      didLoseReadyArmorPowerup(
        {
          status: "generating",
          remainingMs: 0,
          previousPowerup: {
            id: "armor",
            label: "G: toggle armor",
          },
        },
        {
          status: "ready",
          powerup: {
            id: "shrink",
            label: "F: toggle size",
          },
        },
      ),
    ).toBe(true);
  });
});
