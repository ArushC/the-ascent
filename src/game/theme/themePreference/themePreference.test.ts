import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getStoredThemeId,
  storeThemeId,
  THEME_PREFERENCE_KEY,
} from "./themePreference";
import { DEFAULT_THEME_ID } from "../themeCatalog/themeCatalog";

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

  it("falls back to the default theme for unknown stored ids", () => {
    localStorage.setItem(THEME_PREFERENCE_KEY, "unknown-theme");

    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
  });

  it("persists a selected theme id", () => {
    storeThemeId("ocean");

    expect(localStorage.getItem(THEME_PREFERENCE_KEY)).toBe("ocean");
  });

  it("returns the default theme when localStorage throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("storage unavailable");
      },
      setItem: () => {
        throw new Error("storage unavailable");
      },
    });

    expect(getStoredThemeId()).toBe(DEFAULT_THEME_ID);
    expect(() => storeThemeId("neon")).not.toThrow();
  });
});
