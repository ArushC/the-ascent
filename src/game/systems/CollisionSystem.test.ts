import { describe, expect, it } from "vitest";
import { SPRING_ACTIVATION_DURATION_MS } from "../entities/Spring";
import { getPlatformPowerup } from "../entities/Powerup";
import {
  createTestHorizontalMonster,
  createTestMovingPlatform,
  createTestPlayer,
  createTestProjectile,
  createTestStaticPlatform,
  createTestVerticalMovingPlatform,
} from "../testing/entityFactories";
import {
  playerCollidesWithMonster,
  projectileHitsMonster,
  resolveProjectileMonsterCollisions,
  resolvePlatformLanding,
  resolvePowerupCollision,
} from "./CollisionSystem";
import { INITIAL_JUMP_VELOCITY, SPRING_JUMP_VELOCITY } from "./PhysicsSystem";

describe("resolvePlatformLanding", () => {
  it("places a falling player on the crossed platform and bounces upward", () => {
    const player = createTestPlayer({ y: 80, velocityY: 0.5 });
    const platform = createTestStaticPlatform({ y: 100 });
    const previousY = 50;

    resolvePlatformLanding(player, [platform], previousY);

    expect(player.y).toBe(platform.y - player.height);
    expect(player.velocityY).toBe(-INITIAL_JUMP_VELOCITY);
  });

  it("does not land when the player is moving upward", () => {
    const player = createTestPlayer({ y: 80, velocityY: -0.5 });
    const originalY = player.y;
    const originalVelocityY = player.velocityY;

    resolvePlatformLanding(player, [createTestStaticPlatform()], 50);

    expect(player.y).toBe(originalY);
    expect(player.velocityY).toBe(originalVelocityY);
  });

  it("does not land when the player is not moving vertically", () => {
    const player = createTestPlayer({ y: 80, velocityY: 0 });
    const originalY = player.y;

    resolvePlatformLanding(player, [createTestStaticPlatform()], 50);

    expect(player.y).toBe(originalY);
    expect(player.velocityY).toBe(0);
  });

  it("does not land before the player's bottom reaches the platform top", () => {
    const player = createTestPlayer({ y: 55, velocityY: 0.5 });
    const originalY = player.y;
    const originalVelocityY = player.velocityY;

    resolvePlatformLanding(player, [createTestStaticPlatform({ y: 100 })], 40);

    expect(player.y).toBe(originalY);
    expect(player.velocityY).toBe(originalVelocityY);
  });

  it("does not land after the player was already below the platform top", () => {
    const player = createTestPlayer({ y: 90, velocityY: 0.5 });
    const originalY = player.y;
    const originalVelocityY = player.velocityY;

    resolvePlatformLanding(player, [createTestStaticPlatform({ y: 100 })], 70);

    expect(player.y).toBe(originalY);
    expect(player.velocityY).toBe(originalVelocityY);
  });

  it("does not land when the player only touches the platform left edge", () => {
    const platform = createTestStaticPlatform({ x: 100, y: 100 });
    const player = createTestPlayer({
      x: platform.x - 40,
      y: 80,
      width: 40,
      velocityY: 0.5,
    });
    const originalY = player.y;

    resolvePlatformLanding(player, [platform], 50);

    expect(player.y).toBe(originalY);
    expect(player.velocityY).toBe(0.5);
  });

  it("does not land when the player only touches the platform right edge", () => {
    const platform = createTestStaticPlatform({ x: 100, y: 100, width: 90 });
    const player = createTestPlayer({
      x: platform.x + platform.width,
      y: 80,
      velocityY: 0.5,
    });
    const originalY = player.y;

    resolvePlatformLanding(player, [platform], 50);

    expect(player.y).toBe(originalY);
    expect(player.velocityY).toBe(0.5);
  });

  it("lands when the player starts exactly on the platform top and continues falling", () => {
    const platform = createTestStaticPlatform({ y: 100 });
    const player = createTestPlayer({ y: 65, height: 40, velocityY: 0.5 });
    const previousY = platform.y - player.height;

    resolvePlatformLanding(player, [platform], previousY);

    expect(player.y).toBe(platform.y - player.height);
    expect(player.velocityY).toBe(-INITIAL_JUMP_VELOCITY);
  });

  it("lands when the player's current bottom exactly reaches the platform top", () => {
    const platform = createTestStaticPlatform({ y: 100 });
    const player = createTestPlayer({ y: platform.y - 40, velocityY: 0.5 });

    resolvePlatformLanding(player, [platform], 50);

    expect(player.y).toBe(platform.y - player.height);
    expect(player.velocityY).toBe(-INITIAL_JUMP_VELOCITY);
  });

  it("lands on the highest crossed platform when multiple platforms overlap", () => {
    const player = createTestPlayer({ y: 100, velocityY: 0.5 });
    const lowerPlatform = createTestStaticPlatform({ y: 120 });
    const higherPlatform = createTestStaticPlatform({ y: 100 });

    resolvePlatformLanding(player, [lowerPlatform, higherPlatform], 50);

    expect(player.y).toBe(higherPlatform.y - player.height);
    expect(player.velocityY).toBe(-INITIAL_JUMP_VELOCITY);
  });

  it("lands on a moving platform using its current position", () => {
    const player = createTestPlayer({ y: 80, velocityY: 0.5 });
    const platform = createTestMovingPlatform({ x: 90, y: 100 });

    resolvePlatformLanding(player, [platform], 50);

    expect(player.y).toBe(platform.y - player.height);
    expect(player.velocityY).toBe(-INITIAL_JUMP_VELOCITY);
  });

  it("uses spring bounce when the player lands over a spring hit zone", () => {
    const platform = createTestStaticPlatform({
      x: 100,
      y: 100,
      hasSpring: true,
    });
    const player = createTestPlayer({ x: 120, y: 80, velocityY: 0.5 });

    resolvePlatformLanding(player, [platform], 50);

    expect(player.y).toBe(platform.y - player.height);
    expect(player.velocityY).toBe(-SPRING_JUMP_VELOCITY);
    expect(platform.springActivationMs).toBe(SPRING_ACTIVATION_DURATION_MS);
  });

  it("uses normal bounce when the player lands on a spring platform but misses the spring", () => {
    const platform = createTestStaticPlatform({
      x: 100,
      y: 100,
      hasSpring: true,
    });
    const player = createTestPlayer({
      x: platform.x,
      y: 80,
      width: 20,
      velocityY: 0.5,
    });

    resolvePlatformLanding(player, [platform], 50);

    expect(player.y).toBe(platform.y - player.height);
    expect(player.velocityY).toBe(-INITIAL_JUMP_VELOCITY);
    expect(platform.springActivationMs).toBe(0);
  });

  it("lands when a vertical moving platform sweeps upward during the frame", () => {
    const player = createTestPlayer({ y: 65, velocityY: 0.5 });
    const platform = createTestVerticalMovingPlatform({
      x: 90,
      y: 100,
      minY: 80,
      maxY: 120,
    });
    platform.previousY = 110;

    resolvePlatformLanding(player, [platform], 65);

    expect(player.y).toBe(platform.y - player.height);
    expect(player.velocityY).toBe(-INITIAL_JUMP_VELOCITY);
  });

  it("does not collect a powerup when landing on the platform body", () => {
    const platform = createTestStaticPlatform({
      x: 100,
      y: 100,
      hasPowerup: true,
    });
    const player = createTestPlayer({
      x: platform.x + 20,
      y: 80,
      velocityY: 0.5,
    });

    resolvePlatformLanding(player, [platform], 50);

    expect(resolvePowerupCollision(player, platform)).toBe(false);
    expect(platform.hasPowerup).toBe(true);
  });
});

describe("resolvePowerupCollision", () => {
  it("clears a collected floating star", () => {
    const platform = createTestStaticPlatform({
      x: 100,
      y: 100,
      hasPowerup: true,
    });
    const powerup = getPlatformPowerup(platform);
    if (powerup === null) {
      throw new Error("Expected a powerup entity");
    }
    const player = createTestPlayer({
      x: powerup.x,
      y: powerup.y,
    });

    expect(resolvePowerupCollision(player, platform)).toBe(true);
    expect(platform.hasPowerup).toBe(false);
  });

  it("ignores platform bodies outside the star hitbox", () => {
    const platform = createTestStaticPlatform({
      x: 100,
      y: 100,
      hasPowerup: true,
    });
    const player = createTestPlayer({
      x: platform.x,
      y: platform.y - 40,
    });

    expect(resolvePowerupCollision(player, platform)).toBe(false);
    expect(platform.hasPowerup).toBe(true);
  });
});

describe("playerCollidesWithMonster", () => {
  it("returns true when the player overlaps a monster", () => {
    const player = createTestPlayer({ x: 100, y: 100, width: 40, height: 40 });
    const monster = createTestHorizontalMonster({
      x: 120,
      y: 120,
      width: 56,
      height: 14,
    });

    expect(playerCollidesWithMonster(player, monster)).toBe(true);
  });

  it("returns false when the player only touches a monster edge", () => {
    const monster = createTestHorizontalMonster({ x: 140, y: 100 });
    const player = createTestPlayer({
      x: monster.x - 40,
      y: monster.y,
      width: 40,
      height: 40,
    });

    expect(playerCollidesWithMonster(player, monster)).toBe(false);
  });

  it("returns false when there are no monster overlaps", () => {
    const player = createTestPlayer({ x: 0, y: 0 });
    const monster = createTestHorizontalMonster({ x: 100, y: 100 });

    expect(playerCollidesWithMonster(player, monster)).toBe(false);
  });
});

describe("projectileHitsMonster", () => {
  it("returns true when a projectile overlaps a monster", () => {
    const projectile = createTestProjectile({ x: 120, y: 120 });
    const monster = createTestHorizontalMonster({
      x: 116,
      y: 130,
      width: 56,
      height: 14,
    });

    expect(projectileHitsMonster(projectile, monster)).toBe(true);
  });

  it("returns false when a projectile misses a monster", () => {
    const projectile = createTestProjectile({ x: 0, y: 0 });
    const monster = createTestHorizontalMonster({ x: 100, y: 100 });

    expect(projectileHitsMonster(projectile, monster)).toBe(false);
  });
});

describe("resolveProjectileMonsterCollisions", () => {
  it("removes a projectile and monster when they collide", () => {
    const projectile = createTestProjectile({ x: 120, y: 120 });
    const monster = createTestHorizontalMonster({ x: 116, y: 130 });

    expect(resolveProjectileMonsterCollisions([projectile], [monster])).toEqual(
      {
        projectiles: [],
        monsters: [],
      },
    );
  });

  it("keeps projectiles and monsters when nothing collides", () => {
    const projectile = createTestProjectile({ x: 0, y: 0 });
    const monster = createTestHorizontalMonster({ x: 100, y: 100 });

    expect(resolveProjectileMonsterCollisions([projectile], [monster])).toEqual(
      {
        projectiles: [projectile],
        monsters: [monster],
      },
    );
  });

  it("does not remove unrelated projectiles or monsters", () => {
    const hitProjectile = createTestProjectile({ x: 120, y: 120 });
    const missedProjectile = createTestProjectile({ x: 0, y: 0 });
    const hitMonster = createTestHorizontalMonster({ x: 116, y: 130 });
    const missedMonster = createTestHorizontalMonster({ x: 200, y: 200 });

    expect(
      resolveProjectileMonsterCollisions(
        [hitProjectile, missedProjectile],
        [hitMonster, missedMonster],
      ),
    ).toEqual({
      projectiles: [missedProjectile],
      monsters: [missedMonster],
    });
  });

  it("lets a second projectile continue when the first projectile removes the monster", () => {
    const firstProjectile = createTestProjectile({ x: 120, y: 120 });
    const secondProjectile = createTestProjectile({ x: 122, y: 122 });
    const monster = createTestHorizontalMonster({ x: 116, y: 130 });

    expect(
      resolveProjectileMonsterCollisions(
        [firstProjectile, secondProjectile],
        [monster],
      ),
    ).toEqual({
      projectiles: [secondProjectile],
      monsters: [],
    });
  });
});
