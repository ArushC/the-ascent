export type GameThemeId = "classic" | "neon" | "ocean";

export type GamePalette = {
  background: string;
  player: string;
  platform: string;
  hazard: string;
  accent: string;
};

export type GameThemeOption = {
  id: GameThemeId;
  label: string;
  palette: GamePalette;
};

export const DEFAULT_THEME_ID: GameThemeId = "classic";

export const THEME_OPTIONS: readonly GameThemeOption[] = [
  {
    id: "classic",
    label: "Classic",
    palette: {
      background: "black",
      player: "red",
      platform: "green",
      hazard: "cyan",
      accent: "yellow",
    },
  },
  {
    id: "neon",
    label: "Neon",
    palette: {
      background: "#0d0221",
      player: "#ff006e",
      platform: "#00f5d4",
      hazard: "#8338ec",
      accent: "#ffbe0b",
    },
  },
  {
    id: "ocean",
    label: "Ocean",
    palette: {
      background: "#0a1628",
      player: "#ff6b6b",
      platform: "#4ecdc4",
      hazard: "#45b7d1",
      accent: "#ffd93d",
    },
  },
];
