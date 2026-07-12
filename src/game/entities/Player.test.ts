import { describe, expect, it } from "vitest";
import { Player } from "./Player";

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
});
