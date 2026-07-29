import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getStoredThemeId,
  storeThemeId,
  THEME_PREFERENCE_KEY,
} from "./themePreference";
import {
  DEFAULT_THEME_ID,
  THEME_OPTIONS,
  type GameThemeId,
} from "../themeCatalog/themeCatalog";

beforeEach(() => {
  const storage = new Map<string, string>();

  vi.stubGlobal("localStorage", {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("themePreference", () => {
  it("returns the default theme when nothing is stored", () => {
    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
  });

  it("returns a stored valid theme id", () => {
    localStorage.setItem(THEME_PREFERENCE_KEY, "neon");

    expect(getStoredThemeId()).toBe("neon");
  });

  it.each(THEME_OPTIONS.map((option) => option.id))(
    "round-trips the %s theme id through storage",
    (themeId) => {
      storeThemeId(themeId);

      expect(localStorage.getItem(THEME_PREFERENCE_KEY)).toBe(themeId);
      expect(getStoredThemeId()).toBe(themeId);
    },
  );

  it("falls back to the default theme for unknown stored ids", () => {
    localStorage.setItem(THEME_PREFERENCE_KEY, "unknown-theme");

    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
  });

  it("falls back to the default theme for empty stored values", () => {
    localStorage.setItem(THEME_PREFERENCE_KEY, "");

    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
  });

  it("rejects case-mismatched stored ids", () => {
    localStorage.setItem(THEME_PREFERENCE_KEY, "Classic");

    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
  });

  it("rejects stored ids with surrounding whitespace", () => {
    localStorage.setItem(THEME_PREFERENCE_KEY, " neon ");

    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
  });

  it("persists a selected theme id", () => {
    storeThemeId("ocean");

    expect(localStorage.getItem(THEME_PREFERENCE_KEY)).toBe("ocean");
  });

  it("returns the default theme when localStorage throws on read", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("storage unavailable");
      },
      setItem: vi.fn(),
    });

    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
  });

  it("does not throw when localStorage throws on write", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        throw new Error("storage unavailable");
      },
    });

    expect(() => storeThemeId("neon" satisfies GameThemeId)).not.toThrow();
    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
  });
});
