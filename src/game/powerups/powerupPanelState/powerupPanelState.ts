import {
  getPowerupGenerationProgress,
  type PowerupInventory,
} from "../powerupInventory/PowerupInventory";

export type PowerupPanelState =
  | { mode: "empty" }
  | { mode: "generating"; progress: number }
  | { mode: "ready"; label: string; armed: boolean };

export function getPowerupPanelState(
  inventory: PowerupInventory,
  armed = false,
): PowerupPanelState {
  switch (inventory.status) {
    case "empty":
      return { mode: "empty" };
    case "generating":
      return {
        mode: "generating",
        progress: getPowerupGenerationProgress(inventory.remainingMs),
      };
    case "ready":
      return {
        mode: "ready",
        label: inventory.powerup?.label ?? "No powerups found",
        armed,
      };
  }
}
