import { describe, expect, it } from "vitest";
import { POWERUP_GENERATION_DURATION_MS } from "../powerupInventory/PowerupInventory";
import { getPowerupPanelState } from "./powerupPanelState";

describe("getPowerupPanelState", () => {
  it("maps empty inventory to an empty panel", () => {
    expect(getPowerupPanelState({ status: "empty" })).toEqual({
      mode: "empty",
    });
  });

  it("maps generating inventory to progress", () => {
    expect(
      getPowerupPanelState({
        status: "generating",
        remainingMs: POWERUP_GENERATION_DURATION_MS,
        previousPowerup: null,
      }),
    ).toEqual({ mode: "generating", progress: 0 });

    expect(
      getPowerupPanelState({
        status: "generating",
        remainingMs: POWERUP_GENERATION_DURATION_MS / 2,
        previousPowerup: null,
      }),
    ).toEqual({ mode: "generating", progress: 0.5 });

    expect(
      getPowerupPanelState({
        status: "generating",
        remainingMs: 0,
        previousPowerup: null,
      }),
    ).toEqual({ mode: "generating", progress: 1 });
  });

  it("maps a ready powerup to its label", () => {
    expect(
      getPowerupPanelState({
        status: "ready",
        powerup: {
          id: "shrink",
          label: "F: toggle size",
        },
      }),
    ).toEqual({ mode: "ready", label: "F: toggle size" });
  });

  it("maps a ready missing powerup to the fallback label", () => {
    expect(
      getPowerupPanelState({
        status: "ready",
        powerup: null,
      }),
    ).toEqual({ mode: "ready", label: "No powerups found" });
  });
});
