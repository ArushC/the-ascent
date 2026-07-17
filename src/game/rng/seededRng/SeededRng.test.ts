import { describe, expect, it } from "vitest";
import { createSeededRng, hashDateToSeed } from "./SeededRng";

describe("createSeededRng", () => {
  it("produces the same sequence for the same seed", () => {
    const first = createSeededRng(12345);
    const second = createSeededRng(12345);

    expect(Array.from({ length: 8 }, () => first())).toEqual(
      Array.from({ length: 8 }, () => second()),
    );
  });

  it("produces different sequences for different seeds", () => {
    const first = createSeededRng(12345);
    const second = createSeededRng(54321);

    expect(Array.from({ length: 8 }, () => first())).not.toEqual(
      Array.from({ length: 8 }, () => second()),
    );
  });
});

describe("hashDateToSeed", () => {
  it("is stable for a fixed date", () => {
    expect(hashDateToSeed("2026-07-17")).toBe(3567238314);
  });
});
