import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME_ID,
  THEME_OPTIONS,
  type GamePalette,
  type GameThemeId,
} from "./themeCatalog";

const PALETTE_TOKENS: (keyof GamePalette)[] = [
  "background",
  "player",
  "platform",
  "hazard",
  "accent",
];

describe("themeCatalog", () => {
  it("defines three themes with unique ids", () => {
    expect(THEME_OPTIONS).toHaveLength(3);

    const ids = THEME_OPTIONS.map((option) => option.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("lists classic, neon, and ocean in catalog order", () => {
    expect(THEME_OPTIONS.map((option) => option.id)).toEqual([
      "classic",
      "neon",
      "ocean",
    ]);
    expect(THEME_OPTIONS.map((option) => option.label)).toEqual([
      "Classic",
      "Neon",
      "Ocean",
    ]);
  });

  it("uses classic as the default theme id", () => {
    expect(DEFAULT_THEME_ID).toBe("classic");
    expect(THEME_OPTIONS.some((option) => option.id === DEFAULT_THEME_ID)).toBe(
      true,
    );
  });

  it("mirrors legacy hardcoded colors in the classic palette", () => {
    const classic = THEME_OPTIONS.find((option) => option.id === "classic")!;

    expect(classic.palette).toEqual({
      background: "black",
      player: "red",
      platform: "green",
      hazard: "cyan",
      accent: "yellow",
    });
  });

  it("populates every palette token for each theme", () => {
    for (const option of THEME_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);

      for (const token of PALETTE_TOKENS) {
        expect(option.palette[token].length).toBeGreaterThan(0);
      }
    }
  });

  it("uses distinct player and platform tokens so previews stay distinguishable", () => {
    for (const option of THEME_OPTIONS) {
      const { player, platform, hazard } = option.palette;

      expect(player).not.toBe(platform);
      expect(platform).not.toBe(hazard);
    }
  });

  it("restricts theme ids to the supported union", () => {
    const supportedIds: GameThemeId[] = ["classic", "neon", "ocean"];

    expect(THEME_OPTIONS.map((option) => option.id)).toEqual(supportedIds);
  });
});
