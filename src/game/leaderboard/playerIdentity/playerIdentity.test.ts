import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getOrCreatePlayerId, PLAYER_ID_KEY } from "./playerIdentity";

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
    expect(localStorage.getItem(PLAYER_ID_KEY)).toBe(
      "00000000-0000-4000-8000-000000000001",
    );
  });

  it("returns an existing player id without creating another one", () => {
    const randomUUIDSpy = vi.fn();
    vi.stubGlobal("crypto", { randomUUID: randomUUIDSpy });
    localStorage.setItem(PLAYER_ID_KEY, "existing-player-id");

    expect(getOrCreatePlayerId()).toBe("existing-player-id");
    expect(randomUUIDSpy).not.toHaveBeenCalled();
  });
});
