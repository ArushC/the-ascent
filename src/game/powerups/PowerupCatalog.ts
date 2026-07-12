export type PowerupDefinition = {
  id: string;
  label: string;
};

export const SHRINK_POWERUP_ID = "shrink";
export const SLOW_MO_POWERUP_ID = "slowMo";
export const ARMOR_POWERUP_ID = "armor";
export const DOUBLE_JUMP_POWERUP_ID = "doubleJump";
export const BIG_SHOT_POWERUP_ID = "bigShot";

const POWERUP_CATALOG: readonly PowerupDefinition[] = [
  {
    id: SHRINK_POWERUP_ID,
    label: "F: toggle size",
  },
  {
    id: SLOW_MO_POWERUP_ID,
    label: "T: toggle slow-mo",
  },
  {
    id: ARMOR_POWERUP_ID,
    label: "G: toggle armor",
  },
  {
    id: DOUBLE_JUMP_POWERUP_ID,
    label: "W: double jump",
  },
  {
    id: BIG_SHOT_POWERUP_ID,
    label: "B: toggle big shot",
  },
];

export function pickRandomPowerup(
  excludedPowerupId: string | null = null,
): PowerupDefinition | null {
  const availablePowerups = POWERUP_CATALOG.filter(
    (powerup) => powerup.id !== excludedPowerupId,
  );
  if (availablePowerups.length === 0) return null;

  const index = Math.floor(Math.random() * availablePowerups.length);
  return availablePowerups[index];
}
