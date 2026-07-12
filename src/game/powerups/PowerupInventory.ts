import {
  pickRandomPowerup,
  type PowerupDefinition,
} from "./PowerupCatalog";

export const POWERUP_GENERATION_DURATION_MS = 2000;

export type PowerupInventory =
  | { status: "empty" }
  | { status: "generating"; remainingMs: number }
  | { status: "ready"; powerup: PowerupDefinition | null };

export function createPowerupInventory(): PowerupInventory {
  return { status: "empty" };
}

export function beginPowerupGeneration(): PowerupInventory {
  return {
    status: "generating",
    remainingMs: POWERUP_GENERATION_DURATION_MS,
  };
}

export function updatePowerupInventory(
  inventory: PowerupInventory,
  deltaTime: number,
): PowerupInventory {
  if (inventory.status !== "generating") return inventory;

  const remainingMs = Math.max(0, inventory.remainingMs - deltaTime);

  if (remainingMs > 0) {
    return { status: "generating", remainingMs };
  }

  return {
    status: "ready",
    powerup: pickRandomPowerup(),
  };
}
