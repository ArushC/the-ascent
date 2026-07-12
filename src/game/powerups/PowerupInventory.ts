import {
  pickRandomPowerup,
  SHRINK_POWERUP_ID,
  type PowerupDefinition,
} from "./PowerupCatalog";

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
    powerup: pickRandomPowerup(),
  };
}

export function isShrinkPowerupReady(inventory: PowerupInventory): boolean {
  return (
    inventory.status === "ready" &&
    inventory.powerup?.id === SHRINK_POWERUP_ID
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

function wasShrinkPowerupHeld(inventory: PowerupInventory): boolean {
  if (isShrinkPowerupReady(inventory)) return true;

  return (
    inventory.status === "generating" &&
    inventory.previousPowerup?.id === SHRINK_POWERUP_ID
  );
}
