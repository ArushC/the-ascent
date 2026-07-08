export const CAMERA_FOLLOW_THRESHOLD_RATIO = 1 / 3;

export function updateCamera(
  screenTopY: number, // World-space y-coordinate currently shown at screen y = 0.
  playerY: number,
  canvasHeight: number,
): number {
  const thresholdY = canvasHeight * CAMERA_FOLLOW_THRESHOLD_RATIO;
  const playerScreenY = worldToScreenY(playerY, screenTopY);

  if (playerScreenY >= thresholdY) {
    return screenTopY;
  }

  return playerY - thresholdY;
}

export function worldToScreenY(worldY: number, screenTopY: number): number {
  return worldY - screenTopY;
}
