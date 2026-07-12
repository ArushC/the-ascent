export type PowerupDefinition = {
  id: string;
  label: string;
};

const POWERUP_CATALOG: readonly PowerupDefinition[] = [];

export function pickRandomPowerup(): PowerupDefinition | null {
  if (POWERUP_CATALOG.length === 0) return null;

  const index = Math.floor(Math.random() * POWERUP_CATALOG.length);
  return POWERUP_CATALOG[index];
}
