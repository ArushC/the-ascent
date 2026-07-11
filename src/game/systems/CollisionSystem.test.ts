import { describe, expect, it } from "vitest";
import {
  createTestMovingPlatform,
  createTestPlayer,
  createTestStaticPlatform,
  createTestVerticalMovingPlatform,
} from "../testing/entityFactories";
import { resolvePlatformLanding } from "./CollisionSystem";
import { INITIAL_JUMP_VELOCITY } from "./PhysicsSystem";

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
});
