import { ALL_POWERUP_IDS } from "../../../powerups/powerupCatalog/PowerupCatalog";
import {
  isRocketPowerupReady,
  type PowerupInventory,
} from "../../../powerups/powerupInventory/PowerupInventory";
import {
  hasUsedAllPowerups,
  type PowerupUsageHistory,
} from "../../../powerups/powerupUsageHistory/PowerupUsageHistory";
import { SCORE_RAMP_END } from "../../difficultySystem/DifficultySystem";

export type AscensionWinConditionState = {
  powerupUsageHistory: PowerupUsageHistory;
  powerupInventory: PowerupInventory;
  score: number;
  hasBouncedOnSpring: boolean;
};

export function hasMetAscensionWinConditions({
  powerupUsageHistory,
  powerupInventory,
  score,
  hasBouncedOnSpring,
}: AscensionWinConditionState): boolean {
  return (
    hasUsedAllPowerups(powerupUsageHistory, ALL_POWERUP_IDS) &&
    isRocketPowerupReady(powerupInventory) &&
    score >= SCORE_RAMP_END &&
    hasBouncedOnSpring
  );
}
