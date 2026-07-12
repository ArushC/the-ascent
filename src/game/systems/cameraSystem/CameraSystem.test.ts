import { describe, expect, it } from "vitest";
import { CANVAS_HEIGHT } from "../../ui/gameCanvas/GameCanvas";
import {
  CAMERA_FOLLOW_THRESHOLD_RATIO,
  isPlayerBelowScreen,
  updateCamera,
  worldToScreenY,
} from "./CameraSystem";

const FOLLOW_THRESHOLD_Y = CANVAS_HEIGHT * CAMERA_FOLLOW_THRESHOLD_RATIO;

describe("updateCamera", () => {
  it("does not move before the player crosses the follow threshold", () => {
    expect(updateCamera(0, FOLLOW_THRESHOLD_Y + 100, CANVAS_HEIGHT)).toBe(0);
  });

  it("moves the screen top up when the player crosses the upper third", () => {
    const playerY = FOLLOW_THRESHOLD_Y - 50;

    expect(updateCamera(0, playerY, CANVAS_HEIGHT)).toBe(-50);
  });

  it("keeps the player pinned to the follow threshold after scrolling", () => {
    const playerY = FOLLOW_THRESHOLD_Y - 50;
    const screenTopY = updateCamera(0, playerY, CANVAS_HEIGHT);

    expect(worldToScreenY(playerY, screenTopY)).toBe(FOLLOW_THRESHOLD_Y);
  });

  it("does not scroll back down when the player falls", () => {
    expect(updateCamera(-50, FOLLOW_THRESHOLD_Y + 100, CANVAS_HEIGHT)).toBe(
      -50,
    );
  });
});

describe("worldToScreenY", () => {
  it("converts world y to screen y using the current screen top", () => {
    expect(worldToScreenY(500, -50)).toBe(550);
  });
});

describe("isPlayerBelowScreen", () => {
  it("returns false while the player is still inside the screen", () => {
    expect(isPlayerBelowScreen(599, 0, CANVAS_HEIGHT)).toBe(false);
  });

  it("returns true after the player falls below the bottom edge", () => {
    expect(isPlayerBelowScreen(601, 0, CANVAS_HEIGHT)).toBe(true);
  });

  it("accounts for the current camera offset", () => {
    expect(isPlayerBelowScreen(551, -50, CANVAS_HEIGHT)).toBe(true);
  });
});
