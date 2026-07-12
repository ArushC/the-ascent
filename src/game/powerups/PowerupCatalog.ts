export type PowerupDefinition = {
  id: string;
  label: string;
};

export const SHRINK_POWERUP_ID = "shrink";
export const SLOW_MO_POWERUP_ID = "slowMo";

const POWERUP_CATALOG: readonly PowerupDefinition[] = [
  {
    id: SHRINK_POWERUP_ID,
    label: "F: toggle size",
  },
  {
    id: SLOW_MO_POWERUP_ID,
    label: "T: toggle slow-mo",
  },
];

export function pickRandomPowerup(): PowerupDefinition | null {
  if (POWERUP_CATALOG.length === 0) return null;

  const index = Math.floor(Math.random() * POWERUP_CATALOG.length);
  return POWERUP_CATALOG[index];
}
