import { describe, expect, it } from "vitest";
import {
  ALL_POWERUP_IDS,
  ROCKET_POWERUP_ID,
} from "../../../powerups/powerupCatalog/PowerupCatalog";
import type { PowerupInventory } from "../../../powerups/powerupInventory/PowerupInventory";
import {
  createPowerupUsageHistory,
  recordPowerupUse,
} from "../../../powerups/powerupUsageHistory/PowerupUsageHistory";
import { SCORE_RAMP_END } from "../../difficultySystem/DifficultySystem";
import { hasMetAscensionWinConditions } from "./AscensionWinConditions";

describe("hasMetAscensionWinConditions", () => {
  const readyRocketInventory: PowerupInventory = {
    status: "ready",
    powerup: {
      id: ROCKET_POWERUP_ID,
      label: "R: toggle rocket",
    },
  };

  function createCompleteHistory() {
    const history = createPowerupUsageHistory();
    for (const id of ALL_POWERUP_IDS) {
      recordPowerupUse(history, id);
    }
    return history;
  }

  it("passes when every Phase 2 gate is met", () => {
    expect(
      hasMetAscensionWinConditions({
        powerupUsageHistory: createCompleteHistory(),
        powerupInventory: readyRocketInventory,
        score: SCORE_RAMP_END,
        hasBouncedOnSpring: true,
      }),
    ).toBe(true);
  });

  it("fails below the score ramp end", () => {
    expect(
      hasMetAscensionWinConditions({
        powerupUsageHistory: createCompleteHistory(),
        powerupInventory: readyRocketInventory,
        score: SCORE_RAMP_END - 1,
        hasBouncedOnSpring: true,
      }),
    ).toBe(false);
  });

  it("fails without a spring bounce", () => {
    expect(
      hasMetAscensionWinConditions({
        powerupUsageHistory: createCompleteHistory(),
        powerupInventory: readyRocketInventory,
        score: SCORE_RAMP_END,
        hasBouncedOnSpring: false,
      }),
    ).toBe(false);
  });

  it("fails with incomplete powerup usage", () => {
    const history = createPowerupUsageHistory();
    recordPowerupUse(history, ROCKET_POWERUP_ID);

    expect(
      hasMetAscensionWinConditions({
        powerupUsageHistory: history,
        powerupInventory: readyRocketInventory,
        score: SCORE_RAMP_END,
        hasBouncedOnSpring: true,
      }),
    ).toBe(false);
  });

  it("fails when rocket is not held", () => {
    expect(
      hasMetAscensionWinConditions({
        powerupUsageHistory: createCompleteHistory(),
        powerupInventory: { status: "empty" },
        score: SCORE_RAMP_END,
        hasBouncedOnSpring: true,
      }),
    ).toBe(false);
  });
});
