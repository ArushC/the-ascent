import type { ChallengeModifiers } from "../../../../shared/dailyChallenge/types.ts";
import { createMathRng, type Rng } from "../../rng/seededRng/SeededRng.ts";

export const POWERUP_SPAWN_PROBABILITY = 0.03;
export const SPRING_SPAWN_PROBABILITY = 0.1;

export type PlatformExtras = { hasSpring: boolean; hasPowerup: boolean };

/**
 * Rolls mutually exclusive powerup and spring extras. This small shared module
 * lets gameplay and server-side previews use identical probability rules
 * without making the server load platform entities or rendering dependencies.
 */
export function rollPlatformExtras(
  rng: Rng = createMathRng(),
  modifiers?: ChallengeModifiers,
): PlatformExtras {
  const powerupProbability = modifiers?.powerupSpawnProbability ?? POWERUP_SPAWN_PROBABILITY;
  const springProbability = modifiers?.springSpawnProbability ?? SPRING_SPAWN_PROBABILITY;
  if (rng() < powerupProbability) return { hasSpring: false, hasPowerup: true };
  return { hasSpring: rng() < springProbability, hasPowerup: false };
}
