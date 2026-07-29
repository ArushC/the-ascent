import {
  DEFAULT_THEME_ID,
  THEME_OPTIONS,
  type GameThemeId,
} from "../themeCatalog/themeCatalog";

export const THEME_PREFERENCE_KEY = "the-ascent:theme-id";

const VALID_THEME_IDS = new Set<GameThemeId>(
  THEME_OPTIONS.map((option) => option.id),
);

export function getStoredThemeId(): GameThemeId {
  try {
    const stored = localStorage.getItem(THEME_PREFERENCE_KEY);

    if (stored && VALID_THEME_IDS.has(stored as GameThemeId)) {
      return stored as GameThemeId;
    }
  } catch {
    // localStorage may be unavailable in tests or private browsing.
  }

  return DEFAULT_THEME_ID;
}

export function storeThemeId(id: GameThemeId): void {
  try {
    localStorage.setItem(THEME_PREFERENCE_KEY, id);
  } catch {
    // localStorage may be unavailable in tests or private browsing.
  }
}
