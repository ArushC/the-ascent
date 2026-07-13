import {
  ARMOR_POWERUP_ID,
  BIG_SHOT_POWERUP_ID,
  DOUBLE_JUMP_POWERUP_ID,
  pickRandomPowerup,
  ROCKET_POWERUP_ID,
  SHRINK_POWERUP_ID,
  SLOW_MO_POWERUP_ID,
  type PowerupDefinition,
} from "../powerupCatalog/PowerupCatalog";
import type { ProjectileSizeMode } from "../../entities/player/Player";

export const POWERUP_GENERATION_DURATION_MS = 2000;

export type PowerupInventory =
  | { status: "empty" }
  | {
      status: "generating";
      remainingMs: number;
      previousPowerup: PowerupDefinition | null;
    }
  | { status: "ready"; powerup: PowerupDefinition | null };

export function createPowerupInventory(): PowerupInventory {
  return { status: "empty" };
}

export function beginPowerupGeneration(
  previousPowerup: PowerupDefinition | null = null,
): PowerupInventory {
  return {
    status: "generating",
    remainingMs: POWERUP_GENERATION_DURATION_MS,
    previousPowerup,
  };
}

export function updatePowerupInventory(
  inventory: PowerupInventory,
  deltaTime: number,
): PowerupInventory {
  if (inventory.status !== "generating") return inventory;

  const remainingMs = Math.max(0, inventory.remainingMs - deltaTime);

  if (remainingMs > 0) {
    return {
      status: "generating",
      remainingMs,
      previousPowerup: inventory.previousPowerup,
    };
  }

  return {
    status: "ready",
    powerup: pickRandomPowerup(inventory.previousPowerup?.id ?? null),
  };
}

export function getPowerupGenerationProgress(remainingMs: number): number {
  return Math.min(
    1,
    Math.max(0, 1 - remainingMs / POWERUP_GENERATION_DURATION_MS),
  );
}

export function isShrinkPowerupReady(inventory: PowerupInventory): boolean {
  return (
    inventory.status === "ready" &&
    inventory.powerup?.id === SHRINK_POWERUP_ID
  );
}

export function isSlowMoPowerupReady(inventory: PowerupInventory): boolean {
  return (
    inventory.status === "ready" &&
    inventory.powerup?.id === SLOW_MO_POWERUP_ID
  );
}

export function isArmorPowerupReady(inventory: PowerupInventory): boolean {
  return (
    inventory.status === "ready" && inventory.powerup?.id === ARMOR_POWERUP_ID
  );
}

export function isDoubleJumpPowerupReady(
  inventory: PowerupInventory,
): boolean {
  return (
    inventory.status === "ready" &&
    inventory.powerup?.id === DOUBLE_JUMP_POWERUP_ID
  );
}

export function isBigShotPowerupReady(inventory: PowerupInventory): boolean {
  return (
    inventory.status === "ready" &&
    inventory.powerup?.id === BIG_SHOT_POWERUP_ID
  );
}

export function isBigShotArmed(
  inventory: PowerupInventory,
  projectileSizeMode: ProjectileSizeMode,
): boolean {
  return isBigShotPowerupReady(inventory) && projectileSizeMode === "large";
}

export function isRocketPowerupReady(inventory: PowerupInventory): boolean {
  return (
    inventory.status === "ready" &&
    inventory.powerup?.id === ROCKET_POWERUP_ID
  );
}

export function didLoseReadyShrinkPowerup(
  previousInventory: PowerupInventory,
  nextInventory: PowerupInventory,
): boolean {
  if (nextInventory.status === "generating") return false;
  if (!wasShrinkPowerupHeld(previousInventory)) return false;

  return !isShrinkPowerupReady(nextInventory);
}

export function didLoseReadySlowMoPowerup(
  previousInventory: PowerupInventory,
  nextInventory: PowerupInventory,
): boolean {
  if (nextInventory.status === "generating") return false;
  if (!wasSlowMoPowerupHeld(previousInventory)) return false;

  return !isSlowMoPowerupReady(nextInventory);
}

export function didLoseReadyArmorPowerup(
  previousInventory: PowerupInventory,
  nextInventory: PowerupInventory,
): boolean {
  if (nextInventory.status === "generating") return false;
  if (!wasArmorPowerupHeld(previousInventory)) return false;

  return !isArmorPowerupReady(nextInventory);
}

export function didLoseReadyBigShotPowerup(
  previousInventory: PowerupInventory,
  nextInventory: PowerupInventory,
): boolean {
  if (nextInventory.status === "generating") return false;
  if (!wasBigShotPowerupHeld(previousInventory)) return false;

  return !isBigShotPowerupReady(nextInventory);
}

export function didLoseReadyRocketPowerup(
  previousInventory: PowerupInventory,
  nextInventory: PowerupInventory,
): boolean {
  if (nextInventory.status === "generating") return false;
  if (!wasRocketPowerupHeld(previousInventory)) return false;

  return !isRocketPowerupReady(nextInventory);
}

function wasShrinkPowerupHeld(inventory: PowerupInventory): boolean {
  if (isShrinkPowerupReady(inventory)) return true;

  return (
    inventory.status === "generating" &&
    inventory.previousPowerup?.id === SHRINK_POWERUP_ID
  );
}

function wasSlowMoPowerupHeld(inventory: PowerupInventory): boolean {
  if (isSlowMoPowerupReady(inventory)) return true;

  return (
    inventory.status === "generating" &&
    inventory.previousPowerup?.id === SLOW_MO_POWERUP_ID
  );
}

function wasArmorPowerupHeld(inventory: PowerupInventory): boolean {
  if (isArmorPowerupReady(inventory)) return true;

  return (
    inventory.status === "generating" &&
    inventory.previousPowerup?.id === ARMOR_POWERUP_ID
  );
}

function wasBigShotPowerupHeld(inventory: PowerupInventory): boolean {
  if (isBigShotPowerupReady(inventory)) return true;

  return (
    inventory.status === "generating" &&
    inventory.previousPowerup?.id === BIG_SHOT_POWERUP_ID
  );
}

function wasRocketPowerupHeld(inventory: PowerupInventory): boolean {
  if (isRocketPowerupReady(inventory)) return true;

  return (
    inventory.status === "generating" &&
    inventory.previousPowerup?.id === ROCKET_POWERUP_ID
  );
}
