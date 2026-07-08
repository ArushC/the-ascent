import { describe, expect, it } from "vitest";
import {
  createTestPlayer,
  TEST_PLAYER_DEFAULTS,
} from "../testing/entityFactories";
import {
  GRAVITY,
  HORIZONTAL_SPEED,
  updatePlayerPhysics,
} from "./PhysicsSystem";

describe("updatePlayerPhysics", () => {
  it("applies gravity to vertical velocity", () => {
    const player = createTestPlayer({ velocityY: 1 });
    const deltaTime = 16;

    updatePlayerPhysics(player, deltaTime, 0);

    expect(player.velocityY).toBeCloseTo(1 + GRAVITY * deltaTime);
  });

  it("updates vertical position using the current vertical velocity", () => {
    const player = createTestPlayer({ y: 50, velocityY: 1 });
    const deltaTime = 16;
    const expectedVelocityY = 1 + GRAVITY * deltaTime;

    updatePlayerPhysics(player, deltaTime, 0);

    expect(player.y).toBeCloseTo(50 + expectedVelocityY * deltaTime);
  });

  it("moves right when horizontal intent is positive", () => {
    const startingX = TEST_PLAYER_DEFAULTS.x;
    const player = createTestPlayer({ x: startingX });
    const deltaTime = 16;

    updatePlayerPhysics(player, deltaTime, 1);

    expect(player.velocityX).toBe(HORIZONTAL_SPEED);
    expect(player.x).toBeCloseTo(startingX + HORIZONTAL_SPEED * deltaTime);
  });

  it("moves left when horizontal intent is negative", () => {
    const startingX = TEST_PLAYER_DEFAULTS.x;
    const player = createTestPlayer({ x: startingX });
    const deltaTime = 16;

    updatePlayerPhysics(player, deltaTime, -1);

    expect(player.velocityX).toBe(-HORIZONTAL_SPEED);
    expect(player.x).toBeCloseTo(startingX - HORIZONTAL_SPEED * deltaTime);
  });

  it("stops horizontal movement when there is no horizontal input", () => {
    const player = createTestPlayer({ velocityX: HORIZONTAL_SPEED });

    updatePlayerPhysics(player, 16, 0);

    expect(player.velocityX).toBe(0);
  });

  it("scales movement by delta time", () => {
    const singleFramePlayer = createTestPlayer();
    const doubleFramePlayer = createTestPlayer();

    updatePlayerPhysics(singleFramePlayer, 16, 1);
    updatePlayerPhysics(doubleFramePlayer, 32, 1);

    const singleFrameX = singleFramePlayer.x - TEST_PLAYER_DEFAULTS.x;
    const doubleFrameX = doubleFramePlayer.x - TEST_PLAYER_DEFAULTS.x;
    const singleFrameY = singleFramePlayer.y - TEST_PLAYER_DEFAULTS.y;
    const doubleFrameY = doubleFramePlayer.y - TEST_PLAYER_DEFAULTS.y;

    expect(doubleFrameX).toBeCloseTo(singleFrameX * 2);
    expect(doubleFrameY).toBeCloseTo(singleFrameY * 4);
  });
});
