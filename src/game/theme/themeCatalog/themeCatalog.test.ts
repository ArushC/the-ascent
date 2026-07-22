import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_ID,
  THEME_OPTIONS,
  type GamePalette,
} from "./themeCatalog";

describe("themeCatalog", () => {
  it("defines three themes with unique ids", () => {
    expect(THEME_OPTIONS).toHaveLength(3);

    const ids = THEME_OPTIONS.map((option) => option.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("uses classic as the default theme id", () => {
    expect(DEFAULT_THEME_ID).toBe("classic");
    expect(THEME_OPTIONS.some((option) => option.id === DEFAULT_THEME_ID)).toBe(
      true,
    );
  });

  it("populates every palette token for each theme", () => {
    const tokens: (keyof GamePalette)[] = [
      "background",
      "player",
      "platform",
      "hazard",
      "accent",
    ];

    for (const option of THEME_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);

      for (const token of tokens) {
        expect(option.palette[token].length).toBeGreaterThan(0);
      }
    }
  });
});
