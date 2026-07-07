import { describe, expect, it } from "vitest";
import { Player } from "../entities/Player";
import {
  GRAVITY,
  HORIZONTAL_SPEED,
  updatePlayerPhysics,
} from "./PhysicsSystem";

type TestPlayerOverrides = Partial<{
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}>;

function createTestPlayer(overrides: TestPlayerOverrides = {}): Player {
  return new Player(
    overrides.x ?? 100,
    overrides.y ?? 200,
    40,
    40,
    overrides.velocityX ?? 0,
    overrides.velocityY ?? 0,
  );
}

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
    const player = createTestPlayer({ x: 100 });
    const deltaTime = 16;

    updatePlayerPhysics(player, deltaTime, 1);

    expect(player.velocityX).toBe(HORIZONTAL_SPEED);
    expect(player.x).toBeCloseTo(100 + HORIZONTAL_SPEED * deltaTime);
  });

  it("moves left when horizontal intent is negative", () => {
    const player = createTestPlayer({ x: 100 });
    const deltaTime = 16;

    updatePlayerPhysics(player, deltaTime, -1);

    expect(player.velocityX).toBe(-HORIZONTAL_SPEED);
    expect(player.x).toBeCloseTo(100 - HORIZONTAL_SPEED * deltaTime);
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

    const singleFrameX = singleFramePlayer.x - 100;
    const doubleFrameX = doubleFramePlayer.x - 100;
    const singleFrameY = singleFramePlayer.y - 200;
    const doubleFrameY = doubleFramePlayer.y - 200;

    expect(doubleFrameX).toBeCloseTo(singleFrameX * 2);
    expect(doubleFrameY).toBeCloseTo(singleFrameY * 4);
  });
});
