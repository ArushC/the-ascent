import { describe, expect, it } from "vitest";
import {
  isCircularMonster,
  isHorizontalMonster,
  isTriangularPathMonster,
} from "./Monster";
import {
  createTestCircularMonster,
  createTestHorizontalMonster,
  createTestTriangularMonster,
} from "../testing/entityFactories";

describe("monster type guards", () => {
  it("identifies horizontal monsters", () => {
    expect(isHorizontalMonster(createTestHorizontalMonster())).toBe(true);
    expect(isHorizontalMonster(createTestCircularMonster())).toBe(false);
  });

  it("identifies circular monsters", () => {
    expect(isCircularMonster(createTestCircularMonster())).toBe(true);
    expect(isCircularMonster(createTestTriangularMonster())).toBe(false);
  });

  it("identifies triangular path monsters", () => {
    expect(isTriangularPathMonster(createTestTriangularMonster())).toBe(true);
    expect(isTriangularPathMonster(createTestHorizontalMonster())).toBe(false);
  });
});
