import { describe, expect, it } from "vitest";
import {
  createProjectile,
  PROJECTILE_WIDTH,
} from "./Projectile";
import { createTestPlayer } from "../testing/entityFactories";

describe("createProjectile", () => {
  it("spawns at the player's horizontal center", () => {
    const player = createTestPlayer({ x: 100, width: 40 });

    const projectile = createProjectile(player);

    expect(projectile.x).toBe(player.x + player.width / 2 - PROJECTILE_WIDTH / 2);
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
