import type { GamePalette } from "../themeCatalog/themeCatalog";

const SWATCH_ORDER: readonly (keyof GamePalette)[] = [
  "background",
  "platform",
  "player",
  "hazard",
  "accent",
];

export function getPalettePreviewSwatches(
  palette: GamePalette,
): readonly string[] {
  return SWATCH_ORDER.map((token) => palette[token]);
}
