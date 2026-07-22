import { describe, expect, it } from "vitest";
import { getPalettePreviewSwatches } from "./palettePreview";
import { THEME_OPTIONS } from "../themeCatalog/themeCatalog";

describe("getPalettePreviewSwatches", () => {
  it("returns five colors in a stable order", () => {
    const classic = THEME_OPTIONS[0].palette;

    expect(getPalettePreviewSwatches(classic)).toEqual([
      "black",
      "green",
      "red",
      "cyan",
      "yellow",
    ]);
  });

  it("preserves duplicate colors when present in the palette", () => {
    const palette = {
      background: "black",
      player: "black",
      platform: "green",
      hazard: "green",
      accent: "yellow",
    };

    expect(getPalettePreviewSwatches(palette)).toEqual([
      "black",
      "green",
      "black",
      "green",
      "yellow",
    ]);
  });

  it("returns the same swatches on repeated calls", () => {
    const palette = THEME_OPTIONS[1].palette;
    const first = getPalettePreviewSwatches(palette);
    const second = getPalettePreviewSwatches(palette);

    expect(first).toEqual(second);
    expect(first).toHaveLength(5);
  });
});
