import {
  getPlatformPreviousY,
  type Platform,
} from "../entities/Platform";
import type { Monster } from "../entities/Monster";
import type { Player } from "../entities/Player";
import {
  playerOverlapsSpringHitZone,
  triggerPlatformSpring,
} from "../entities/Spring";
import { INITIAL_JUMP_VELOCITY, SPRING_JUMP_VELOCITY } from "./PhysicsSystem";

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
    const previousPlatformY = getPlatformPreviousY(platform);
    const platformLeft = platform.x;
    const platformRight = platform.x + platform.width;
    const hasHorizontalOverlap =
      playerRight > platformLeft && playerLeft < platformRight;
    const crossedPlatformTop =
      previousBottom <= previousPlatformY && currentBottom >= platform.y;

    if (!hasHorizontalOverlap || !crossedPlatformTop) continue;

    if (landingPlatform === null || platform.y < landingPlatform.y) {
      landingPlatform = platform;
    }
  }

  if (landingPlatform === null) return;

  player.y = landingPlatform.y - player.height;
  if (playerOverlapsSpringHitZone(player, landingPlatform)) {
    triggerPlatformSpring(landingPlatform);
    player.velocityY = -SPRING_JUMP_VELOCITY;
    return;
  }

  player.velocityY = -INITIAL_JUMP_VELOCITY;
}

export function playerCollidesWithMonster(
  player: Player,
  monster: Monster,
): boolean {
  return rectanglesOverlap(player, monster);
}

function rectanglesOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}
