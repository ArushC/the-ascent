import { describe, expect, it } from "vitest";
import { getPalettePreviewSwatches } from "./palettePreview";
import {
  THEME_OPTIONS,
  type GamePalette,
} from "../themeCatalog/themeCatalog";

const SWATCH_ORDER: readonly (keyof GamePalette)[] = [
  "background",
  "platform",
  "player",
  "hazard",
  "accent",
];

function createTestPalette(overrides: Partial<GamePalette> = {}): GamePalette {
  return {
    background: "bg-token",
    platform: "platform-token",
    player: "player-token",
    hazard: "hazard-token",
    accent: "accent-token",
    ...overrides,
  };
}

describe("getPalettePreviewSwatches", () => {
  it("returns five colors in background-platform-player-hazard-accent order", () => {
    const palette = createTestPalette();

    expect(getPalettePreviewSwatches(palette)).toEqual([
      "bg-token",
      "platform-token",
      "player-token",
      "hazard-token",
      "accent-token",
    ]);
  });

  it("maps the classic catalog palette to legacy hardcoded colors", () => {
    const classic = THEME_OPTIONS.find((option) => option.id === "classic")!;

    expect(getPalettePreviewSwatches(classic.palette)).toEqual([
      "black",
      "green",
      "red",
      "cyan",
      "yellow",
    ]);
  });

  it.each(THEME_OPTIONS.map((option) => [option.id, option.palette] as const))(
    "returns five swatches for the %s theme",
    (_id, palette) => {
      expect(getPalettePreviewSwatches(palette)).toHaveLength(5);
    },
  );

  it("preserves duplicate colors when present in the palette", () => {
    const palette = createTestPalette({
      background: "black",
      player: "black",
      platform: "green",
      hazard: "green",
      accent: "yellow",
    });

    expect(getPalettePreviewSwatches(palette)).toEqual([
      "black",
      "green",
      "black",
      "green",
      "yellow",
    ]);
  });

  it("derives swatches from token keys, not object insertion order", () => {
    const palette = {
      accent: "accent-token",
      hazard: "hazard-token",
      player: "player-token",
      platform: "platform-token",
      background: "bg-token",
    } satisfies GamePalette;

    expect(getPalettePreviewSwatches(palette)).toEqual(
      SWATCH_ORDER.map((token) => palette[token]),
    );
  });

  it("returns the same swatch values on repeated calls", () => {
    const palette = THEME_OPTIONS[1].palette;
    const first = getPalettePreviewSwatches(palette);
    const second = getPalettePreviewSwatches(palette);

    expect(first).toEqual(second);
    expect(first).toHaveLength(5);
  });

  it("returns a new array on each call", () => {
    const palette = THEME_OPTIONS[0].palette;
    const first = getPalettePreviewSwatches(palette);
    const second = getPalettePreviewSwatches(palette);

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});
