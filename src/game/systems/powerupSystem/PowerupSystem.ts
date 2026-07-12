import type { Platform } from "../../entities/platform/Platform";
import type { Player } from "../../entities/player/Player";
import type { PowerupDefinition } from "../../powerups/powerupCatalog/PowerupCatalog";
import {
  beginPowerupGeneration,
  didLoseReadyArmorPowerup,
  didLoseReadyBigShotPowerup,
  didLoseReadyRocketPowerup,
  didLoseReadyShrinkPowerup,
  didLoseReadySlowMoPowerup,
  updatePowerupInventory,
  type PowerupInventory,
} from "../../powerups/powerupInventory/PowerupInventory";
import { resolvePowerupCollision } from "../collisionSystem/CollisionSystem";

export type PowerupUpdateResult = {
  inventory: PowerupInventory;
  didPanelStateChange: boolean;
  didLoseReadyShrinkPowerup: boolean;
  didLoseReadySlowMoPowerup: boolean;
  didLoseReadyArmorPowerup: boolean;
  didLoseReadyBigShotPowerup: boolean;
  didLoseReadyRocketPowerup: boolean;
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
  const previouslyHeldPowerup = getHeldPowerup(inventory);
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
  const didGeneratingProgress =
    updatedInventory.status === "generating" &&
    (didCollectPowerup || inventory.status === "generating");
  const lostReadyShrinkPowerup = didLoseReadyShrinkPowerup(
    inventory,
    updatedInventory,
  );
  const lostReadySlowMoPowerup = didLoseReadySlowMoPowerup(
    inventory,
    updatedInventory,
  );
  const lostReadyArmorPowerup = didLoseReadyArmorPowerup(
    inventory,
    updatedInventory,
  );
  const lostReadyBigShotPowerup = didLoseReadyBigShotPowerup(
    inventory,
    updatedInventory,
  );
  const lostReadyRocketPowerup = didLoseReadyRocketPowerup(
    inventory,
    updatedInventory,
  );

  return {
    inventory: updatedInventory,
    didPanelStateChange:
      didCollectPowerup || didGenerationFinish || didGeneratingProgress,
    didLoseReadyShrinkPowerup: lostReadyShrinkPowerup,
    didLoseReadySlowMoPowerup: lostReadySlowMoPowerup,
    didLoseReadyArmorPowerup: lostReadyArmorPowerup,
    didLoseReadyBigShotPowerup: lostReadyBigShotPowerup,
    didLoseReadyRocketPowerup: lostReadyRocketPowerup,
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

function getHeldPowerup(
  inventory: PowerupInventory,
): PowerupDefinition | null {
  switch (inventory.status) {
    case "ready":
      return inventory.powerup;
    case "generating":
      return inventory.previousPowerup;
    case "empty":
      return null;
  }
}
