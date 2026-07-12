import type { Platform } from "../entities/Platform";
import type { Player } from "../entities/Player";
import {
  beginPowerupGeneration,
  didLoseReadyShrinkPowerup,
  updatePowerupInventory,
  type PowerupInventory,
} from "../powerups/PowerupInventory";
import { resolvePowerupCollision } from "./CollisionSystem";

export type PowerupUpdateResult = {
  inventory: PowerupInventory;
  didPanelStateChange: boolean;
  didLoseReadyShrinkPowerup: boolean;
};

/**
 * Updates platform-attached powerups and the one-slot inventory for one frame.
 * Only the first overlapping star is collected; collection restarts generation.
 */
export function updatePowerups(
  player: Player,
  platforms: readonly Platform[],
  inventory: PowerupInventory,
  deltaTime: number,
): PowerupUpdateResult {
  const collectedPlatform = resolveFirstPowerupCollision(player, platforms);
  const didCollectPowerup = collectedPlatform !== null;
  const previouslyHeldPowerup =
    inventory.status === "ready" ? inventory.powerup : null;
  const inventoryAfterCollection = didCollectPowerup
    ? beginPowerupGeneration(previouslyHeldPowerup)
    : inventory;

  const updatedInventory =
    inventoryAfterCollection.status === "generating"
      ? updatePowerupInventory(inventoryAfterCollection, deltaTime)
      : inventoryAfterCollection;
  const didGenerationFinish =
    inventoryAfterCollection.status === "generating" &&
    updatedInventory.status === "ready";
  const lostReadyShrinkPowerup = didLoseReadyShrinkPowerup(
    inventory,
    updatedInventory,
  );

  return {
    inventory: updatedInventory,
    didPanelStateChange: didCollectPowerup || didGenerationFinish,
    didLoseReadyShrinkPowerup: lostReadyShrinkPowerup,
  };
}

/**
 * Returns the platform whose powerup was collected, or null when none overlap.
 */
function resolveFirstPowerupCollision(
  player: Player,
  platforms: readonly Platform[],
): Platform | null {
  for (const platform of platforms) {
    if (resolvePowerupCollision(player, platform)) return platform;
  }

  return null;
}
