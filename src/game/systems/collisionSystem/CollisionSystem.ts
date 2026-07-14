import {
  getPlatformPreviousY,
  type Platform,
} from "../../entities/platform/Platform";
import type { Monster } from "../../entities/monster/Monster";
import type { Player } from "../../entities/player/Player";
import { playerCollidesWithPlatformPowerup } from "../../entities/powerup/Powerup";
import type { Projectile } from "../../entities/projectile/Projectile";
import {
  playerOverlapsSpringHitZone,
  triggerPlatformSpring,
} from "../../entities/spring/Spring";
import { INITIAL_JUMP_VELOCITY, SPRING_JUMP_VELOCITY } from "../physicsSystem/PhysicsSystem";

export function resolvePlatformLanding(
  player: Player,
  platforms: readonly Platform[],
  previousY: number,
): boolean {
  if (player.velocityY <= 0) return false;

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

  if (landingPlatform === null) return false;

  player.y = landingPlatform.y - player.height;
  player.refreshAirJump();
  if (playerOverlapsSpringHitZone(player, landingPlatform)) {
    triggerPlatformSpring(landingPlatform);
    player.velocityY = -SPRING_JUMP_VELOCITY;
    return true;
  }

  player.velocityY = -INITIAL_JUMP_VELOCITY;
  return false;
}

export function resolvePowerupCollision(
  player: Player,
  platform: Platform,
): boolean {
  if (!playerCollidesWithPlatformPowerup(player, platform)) return false;

  platform.hasPowerup = false;
  return true;
}

export function playerCollidesWithMonster(
  player: Player,
  monster: Monster,
): boolean {
  return rectanglesOverlap(player, monster);
}

/**
 * Bounces an armored player off the first overlapping monster.
 * Mutates only the player and leaves death handling to the caller.
 * Returns true when a bounce was applied, or false when no monster overlaps.
 */
export function resolveArmoredMonsterCollision(
  player: Player,
  monsters: readonly Monster[],
): boolean {
  for (const monster of monsters) {
    if (!playerCollidesWithMonster(player, monster)) continue;

    const playerRight = player.x + player.width;
    const playerBottom = player.y + player.height;
    const monsterRight = monster.x + monster.width;
    const monsterBottom = monster.y + monster.height;
    const overlapX =
      Math.min(playerRight, monsterRight) - Math.max(player.x, monster.x);
    const overlapY =
      Math.min(playerBottom, monsterBottom) - Math.max(player.y, monster.y);
    const playerCenterX = player.x + player.width / 2;
    const monsterCenterX = monster.x + monster.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const monsterCenterY = monster.y + monster.height / 2;

    // Pick the bounce axis by whichever overlap is smaller.
    if (overlapX < overlapY) {
      if (playerCenterX <= monsterCenterX) {
        player.armor.pendingKnockbackVx = -INITIAL_JUMP_VELOCITY;
        player.x = monster.x - player.width;
      } else {
        player.armor.pendingKnockbackVx = INITIAL_JUMP_VELOCITY;
        player.x = monster.x + monster.width;
      }
      return true;
    }

    if (playerCenterY <= monsterCenterY) {
      player.velocityY = -INITIAL_JUMP_VELOCITY;
      player.y = monster.y - player.height;
    } else {
      player.velocityY = INITIAL_JUMP_VELOCITY;
      player.y = monster.y + monster.height;
    }
    return true;
  }

  return false;
}

export function projectileHitsMonster(
  projectile: Projectile,
  monster: Monster,
): boolean {
  return rectanglesOverlap(projectile, monster);
}

export function resolveProjectileMonsterCollisions(
  projectiles: readonly Projectile[],
  monsters: readonly Monster[],
): { projectiles: Projectile[]; monsters: Monster[]; killCount: number } {
  const hitProjectiles = new Set<Projectile>();
  const hitMonsters = new Set<Monster>();

  for (const projectile of projectiles) {
    for (const monster of monsters) {
      if (hitMonsters.has(monster)) continue;

      if (projectileHitsMonster(projectile, monster)) {
        hitProjectiles.add(projectile);
        hitMonsters.add(monster);
        break;
      }
    }
  }

  return {
    projectiles: projectiles.filter(
      (projectile) => !hitProjectiles.has(projectile),
    ),
    monsters: monsters.filter((monster) => !hitMonsters.has(monster)),
    killCount: hitMonsters.size,
  };
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
