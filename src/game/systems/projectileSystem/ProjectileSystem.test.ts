import { describe, expect, it } from "vitest";
import { createTestProjectile } from "../../testing/entityFactories";
import {
  removeOffScreenProjectiles,
  updateProjectiles,
} from "./ProjectileSystem";

describe("updateProjectiles", () => {
  it("moves projectiles by vertical velocity and delta time", () => {
    const projectile = createTestProjectile({ y: 100, velocityY: -0.7 });

    updateProjectiles([projectile], 100);

    expect(projectile.y).toBe(30);
  });
});

describe("removeOffScreenProjectiles", () => {
  const viewport = {
    screenTopY: 100,
    canvasWidth: 300,
    canvasHeight: 400,
  };

  it("retains projectiles inside the visible viewport", () => {
    const projectile = createTestProjectile({ x: 100, y: 120 });

    expect(removeOffScreenProjectiles([projectile], viewport)).toEqual([
      projectile,
    ]);
  });

  it("culls projectiles above the viewport", () => {
    const projectile = createTestProjectile({ y: 83, height: 16 });

    expect(removeOffScreenProjectiles([projectile], viewport)).toEqual([]);
  });

  it("culls projectiles below the viewport", () => {
    const projectile = createTestProjectile({ y: 501 });

    expect(removeOffScreenProjectiles([projectile], viewport)).toEqual([]);
  });

  it("culls projectiles left of the viewport", () => {
    const projectile = createTestProjectile({ x: -9, width: 8 });

    expect(removeOffScreenProjectiles([projectile], viewport)).toEqual([]);
  });

  it("culls projectiles right of the viewport", () => {
    const projectile = createTestProjectile({ x: 301 });

    expect(removeOffScreenProjectiles([projectile], viewport)).toEqual([]);
  });
});
