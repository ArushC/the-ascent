import { describe, expect, it } from "vitest";
import {
  createProjectile,
  DEFAULT_PROJECTILE_HEIGHT,
  DEFAULT_PROJECTILE_WIDTH,
  LARGE_PROJECTILE_HEIGHT,
  LARGE_PROJECTILE_WIDTH,
} from "./Projectile";
import { createTestPlayer } from "../../testing/entityFactories";

describe("createProjectile", () => {
  it("spawns at the player's horizontal center", () => {
    const player = createTestPlayer({ x: 100, width: 40 });

    const projectile = createProjectile(player);

    expect(projectile.x).toBe(
      player.x + player.width / 2 - DEFAULT_PROJECTILE_WIDTH / 2,
    );
  });

  it("uses the default projectile size by default", () => {
    const projectile = createProjectile(createTestPlayer());

    expect(projectile.width).toBe(DEFAULT_PROJECTILE_WIDTH);
    expect(projectile.height).toBe(DEFAULT_PROJECTILE_HEIGHT);
  });

  it("uses large size and keeps centering when big shot is active", () => {
    const player = createTestPlayer({ x: 100, width: 40 });
    player.toggleProjectileSize();

    const projectile = createProjectile(player);

    expect(projectile.width).toBe(LARGE_PROJECTILE_WIDTH);
    expect(projectile.height).toBe(LARGE_PROJECTILE_HEIGHT);
    expect(projectile.x).toBe(
      player.x + player.width / 2 - LARGE_PROJECTILE_WIDTH / 2,
    );
  });

  it("spawns at the player's top edge", () => {
    const player = createTestPlayer({ y: 200 });

    const projectile = createProjectile(player);

    expect(projectile.y).toBe(player.y);
  });

  it("sets upward velocity", () => {
    const projectile = createProjectile(createTestPlayer());

    expect(projectile.velocityY).toBeLessThan(0);
  });
});
