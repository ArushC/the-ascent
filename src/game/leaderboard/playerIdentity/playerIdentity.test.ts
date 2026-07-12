import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getOrCreatePlayerId,
  getPlayerName,
  setPlayerName,
} from "./playerIdentity";

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

describe("player identity", () => {
  it("creates and persists a UUID when no player id is stored", () => {
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => "00000000-0000-4000-8000-000000000001"),
    });

    expect(getOrCreatePlayerId()).toBe(
      "00000000-0000-4000-8000-000000000001",
    );
    expect(localStorage.getItem("the-ascent:player-id")).toBe(
      "00000000-0000-4000-8000-000000000001",
    );
  });

  it("returns an existing player id without creating another one", () => {
    const randomUUIDSpy = vi.fn();
    vi.stubGlobal("crypto", { randomUUID: randomUUIDSpy });
    localStorage.setItem("the-ascent:player-id", "existing-player-id");

    expect(getOrCreatePlayerId()).toBe("existing-player-id");
    expect(randomUUIDSpy).not.toHaveBeenCalled();
  });

  it("returns null when the player name is missing or invalid", () => {
    expect(getPlayerName()).toBeNull();

    localStorage.setItem("the-ascent:player-name", " ");

    expect(getPlayerName()).toBeNull();
  });

  it("returns a normalized player name when stored name is valid", () => {
    localStorage.setItem("the-ascent:player-name", "  Ada Lovelace  ");

    expect(getPlayerName()).toBe("Ada Lovelace");
  });

  it("writes a normalized player name", () => {
    setPlayerName("  Grace Hopper  ");

    expect(localStorage.getItem("the-ascent:player-name")).toBe(
      "Grace Hopper",
    );
  });
});
