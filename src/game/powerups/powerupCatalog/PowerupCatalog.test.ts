import { describe, expect, it } from "vitest";
import {
  ARMOR_POWERUP_ID,
  BIG_SHOT_POWERUP_ID,
  pickRandomPowerup,
  SHRINK_POWERUP_ID,
} from "./PowerupCatalog";

describe("pickRandomPowerup", () => {
  it("returns the catalog entry selected by random index", () => {
    expect(pickRandomPowerup(null, () => 0)).toEqual({
      id: SHRINK_POWERUP_ID,
      label: "F: toggle size",
    });
  });

  it("can select a later catalog entry", () => {
    expect(pickRandomPowerup(null, () => 0.8)).toEqual({
      id: BIG_SHOT_POWERUP_ID,
      label: "B: toggle big shot",
    });
  });

  it("omits the excluded powerup from the random selection pool", () => {
    const powerup = pickRandomPowerup(ARMOR_POWERUP_ID, () => 0.4);

    expect(powerup?.id).not.toBe(ARMOR_POWERUP_ID);
    expect(powerup).toEqual({
      id: "doubleJump",
      label: "W: double jump",
    });
  });
});
