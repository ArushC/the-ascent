import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ARMOR_POWERUP_ID,
  BIG_SHOT_POWERUP_ID,
  pickRandomPowerup,
  SHRINK_POWERUP_ID,
} from "./PowerupCatalog";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("pickRandomPowerup", () => {
  it("returns the catalog entry selected by random index", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(pickRandomPowerup()).toEqual({
      id: SHRINK_POWERUP_ID,
      label: "F: toggle size",
    });
  });

  it("can select a later catalog entry", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.8);

    expect(pickRandomPowerup()).toEqual({
      id: BIG_SHOT_POWERUP_ID,
      label: "B: toggle big shot",
    });
  });

  it("omits the excluded powerup from the random selection pool", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.4);

    const powerup = pickRandomPowerup(ARMOR_POWERUP_ID);

    expect(powerup?.id).not.toBe(ARMOR_POWERUP_ID);
    expect(powerup).toEqual({
      id: "doubleJump",
      label: "W: double jump",
    });
  });
});
