import { describe, expect, it } from "vitest";
import { CANVAS_WIDTH } from "../../ui/gameCanvas/GameCanvas";
import {
  createTestPlayer,
  TEST_PLAYER_DEFAULTS,
} from "../../testing/entityFactories";
import {
  applyHorizontalWrap,
  GRAVITY,
  HORIZONTAL_SPEED,
  INITIAL_JUMP_VELOCITY,
  ROCKET_VELOCITY_MULTIPLIER,
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

  it("uses pending armor knockback for one frame before returning to input", () => {
    const player = createTestPlayer({ x: 100 });
    player.armor.pendingKnockbackVx = -INITIAL_JUMP_VELOCITY;

    updatePlayerPhysics(player, 16, 1);

    expect(player.velocityX).toBe(-INITIAL_JUMP_VELOCITY);
    expect(player.armor.pendingKnockbackVx).toBeNull();

    updatePlayerPhysics(player, 16, 1);

    expect(player.velocityX).toBe(HORIZONTAL_SPEED);
  });

  it("uses fixed upward velocity without gravity while rocket is active", () => {
    const player = createTestPlayer({ y: 200, velocityY: 1 });
    const deltaTime = 16;
    player.toggleRocket();

    updatePlayerPhysics(player, deltaTime, 0);

    const rocketVelocityY = -(
      ROCKET_VELOCITY_MULTIPLIER * INITIAL_JUMP_VELOCITY
    );
    expect(player.velocityY).toBe(rocketVelocityY);
    expect(player.y).toBeCloseTo(200 + rocketVelocityY * deltaTime);
  });

  it("keeps horizontal intent while rocket is active", () => {
    const startingX = TEST_PLAYER_DEFAULTS.x;
    const player = createTestPlayer({ x: startingX });
    player.toggleRocket();

    updatePlayerPhysics(player, 16, 1);

    expect(player.velocityX).toBe(HORIZONTAL_SPEED);
    expect(player.x).toBeCloseTo(startingX + HORIZONTAL_SPEED * 16);
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

describe("applyHorizontalWrap", () => {
  it("wraps the player from the left edge to the right edge", () => {
    const player = createTestPlayer({ x: -TEST_PLAYER_DEFAULTS.width });

    applyHorizontalWrap(player, CANVAS_WIDTH);

    expect(player.x).toBe(CANVAS_WIDTH - TEST_PLAYER_DEFAULTS.width);
  });

  it("wraps the player from the right edge to the left edge", () => {
    const player = createTestPlayer({ x: CANVAS_WIDTH });

    applyHorizontalWrap(player, CANVAS_WIDTH);

    expect(player.x).toBe(0);
  });

  it("leaves an in-bounds player unchanged", () => {
    const player = createTestPlayer({ x: TEST_PLAYER_DEFAULTS.x });

    applyHorizontalWrap(player, CANVAS_WIDTH);

    expect(player.x).toBe(TEST_PLAYER_DEFAULTS.x);
  });
});
