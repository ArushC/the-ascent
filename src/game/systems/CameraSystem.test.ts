import { describe, expect, it } from "vitest";
import {
  CAMERA_FOLLOW_THRESHOLD_RATIO,
  updateCamera,
  worldToScreenY,
} from "./CameraSystem";

const CANVAS_HEIGHT = 600;
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
