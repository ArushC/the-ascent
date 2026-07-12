import { describe, expect, it, vi } from "vitest";
import { Player } from "./Player";
import { INITIAL_JUMP_VELOCITY } from "../systems/PhysicsSystem";

describe("Player", () => {
  it("toggles between default and small size with a bottom-center anchor", () => {
    const player = new Player(100, 200, 40, 40, 0, 0);

    player.toggleSize();

    expect(player.sizeMode).toBe("small");
    expect(player.width).toBe(20);
    expect(player.height).toBe(20);
    expect(player.x).toBe(110);
    expect(player.y).toBe(220);

    player.toggleSize();

    expect(player.sizeMode).toBe("default");
    expect(player.width).toBe(40);
    expect(player.height).toBe(40);
    expect(player.x).toBe(100);
    expect(player.y).toBe(200);
  });

  it("resets to default size with a bottom-center anchor", () => {
    const player = new Player(100, 200, 40, 40, 0, 0);

    player.toggleSize();
    player.resetSize();

    expect(player.sizeMode).toBe("default");
    expect(player.width).toBe(40);
    expect(player.height).toBe(40);
    expect(player.x).toBe(100);
    expect(player.y).toBe(200);
  });

  it("toggles and resets armor state", () => {
    const player = new Player(100, 200, 40, 40, 0, 0);

    player.toggleArmor();
    player.armor.pendingKnockbackVx = 0.45;

    expect(player.armor.equipped).toBe(true);

    player.resetArmor();

    expect(player.armor.equipped).toBe(false);
    expect(player.armor.pendingKnockbackVx).toBeNull();
  });

  it("uses and refreshes one air jump charge", () => {
    const player = new Player(100, 200, 40, 40, 0, 0.8);

    expect(player.airJumpAvailable).toBe(true);
    expect(player.tryAirJump()).toBe(true);
    expect(player.velocityY).toBe(-INITIAL_JUMP_VELOCITY);
    expect(player.airJumpAvailable).toBe(false);

    player.velocityY = 0.4;

    expect(player.tryAirJump()).toBe(false);
    expect(player.velocityY).toBe(0.4);

    player.refreshAirJump();

    expect(player.airJumpAvailable).toBe(true);
    expect(player.tryAirJump()).toBe(true);
    expect(player.velocityY).toBe(-INITIAL_JUMP_VELOCITY);
  });

  it("draws an armor stroke when armor is equipped", () => {
    const player = new Player(100, 200, 40, 40, 0, 0);
    const ctx = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    player.toggleArmor();
    player.draw(ctx);

    expect(ctx.fillRect).toHaveBeenCalledWith(100, 200, 40, 40);
    expect(ctx.strokeStyle).toBe("white");
    expect(ctx.lineWidth).toBe(3);
    expect(ctx.strokeRect).toHaveBeenCalledWith(100, 200, 40, 40);
  });
});
