import { describe, expect, it, vi } from "vitest";
import { BIG_SHOT_COOLDOWN_MS, Player } from "./Player";
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

  it("toggles and resets projectile size mode", () => {
    const player = new Player(100, 200, 40, 40, 0, 0);

    player.toggleProjectileSize();

    expect(player.projectile.sizeMode).toBe("large");

    player.toggleProjectileSize();

    expect(player.projectile.sizeMode).toBe("default");

    player.toggleProjectileSize();
    player.resetProjectileSize();

    expect(player.projectile.sizeMode).toBe("default");
  });

  it("rate-limits only large projectiles", () => {
    const player = new Player(100, 200, 40, 40, 0, 0);

    expect(player.canShoot()).toBe(true);

    player.recordShot();

    expect(player.projectile.shootCooldownRemainingMs).toBe(0);
    expect(player.canShoot()).toBe(true);

    player.toggleProjectileSize();
    player.recordShot();

    expect(player.projectile.shootCooldownRemainingMs).toBe(
      BIG_SHOT_COOLDOWN_MS,
    );
    expect(player.canShoot()).toBe(false);

    player.updateShootCooldown(200);

    expect(player.projectile.shootCooldownRemainingMs).toBe(
      BIG_SHOT_COOLDOWN_MS - 200,
    );
    expect(player.canShoot()).toBe(false);

    player.updateShootCooldown(BIG_SHOT_COOLDOWN_MS);

    expect(player.projectile.shootCooldownRemainingMs).toBe(0);
    expect(player.canShoot()).toBe(true);
  });

  it("allows default shots while a previous big-shot cooldown is draining", () => {
    const player = new Player(100, 200, 40, 40, 0, 0);

    player.toggleProjectileSize();
    player.recordShot();
    player.toggleProjectileSize();

    expect(player.projectile.sizeMode).toBe("default");
    expect(player.projectile.shootCooldownRemainingMs).toBe(
      BIG_SHOT_COOLDOWN_MS,
    );
    expect(player.canShoot()).toBe(true);

    player.recordShot();

    expect(player.projectile.shootCooldownRemainingMs).toBe(0);
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
