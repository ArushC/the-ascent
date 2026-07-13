import { describe, expect, it } from "vitest";
import {
  createPowerupUsageHistory,
  hasUsedAllPowerups,
  recordPowerupUse,
} from "./PowerupUsageHistory";

describe("PowerupUsageHistory", () => {
  it("starts empty", () => {
    const history = createPowerupUsageHistory();

    expect(history.size).toBe(0);
  });

  it("records powerup ids once", () => {
    const history = createPowerupUsageHistory();

    recordPowerupUse(history, "rocket");
    recordPowerupUse(history, "rocket");

    expect([...history]).toEqual(["rocket"]);
  });

  it("requires every catalog id", () => {
    const history = createPowerupUsageHistory();
    recordPowerupUse(history, "shrink");
    recordPowerupUse(history, "rocket");

    expect(hasUsedAllPowerups(history, ["shrink", "rocket"])).toBe(true);
    expect(hasUsedAllPowerups(history, ["shrink", "rocket", "armor"])).toBe(
      false,
    );
  });
});
