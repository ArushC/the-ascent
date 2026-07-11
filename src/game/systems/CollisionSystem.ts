import type { Platform } from "../entities/Platform";
import type { Player } from "../entities/Player";
import { INITIAL_JUMP_VELOCITY } from "./PhysicsSystem";

export function resolvePlatformLanding(
  player: Player,
  platforms: readonly Platform[],
  previousY: number,
): void {
  if (player.velocityY <= 0) return;

  const previousBottom = previousY + player.height;
  const currentBottom = player.y + player.height;
  const playerLeft = player.x;
  const playerRight = player.x + player.width;
  let landingPlatform: Platform | null = null;

  for (const platform of platforms) {
    const platformLeft = platform.x;
    const platformRight = platform.x + platform.width;
    const hasHorizontalOverlap =
      playerRight > platformLeft && playerLeft < platformRight;
    const crossedPlatformTop =
      previousBottom <= platform.y && currentBottom >= platform.y;

    if (!hasHorizontalOverlap || !crossedPlatformTop) continue;

    if (landingPlatform === null || platform.y < landingPlatform.y) {
      landingPlatform = platform;
    }
  }

  if (landingPlatform === null) return;

  player.y = landingPlatform.y - player.height;
  player.velocityY = -INITIAL_JUMP_VELOCITY;
}
