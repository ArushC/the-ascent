import { createMathRng, type Rng } from "../../../rng/seededRng/SeededRng";

export const MIN_MONSTER_SPEED = 0.07;
export const MAX_MONSTER_SPEED = 0.11;
export const MIN_HORIZONTAL_MONSTER_TRAVEL_DISTANCE = 24;
export const MAX_HORIZONTAL_MONSTER_TRAVEL_DISTANCE = 48;
export const MIN_CIRCULAR_MONSTER_ORBIT_RADIUS = 24;
export const MAX_CIRCULAR_MONSTER_ORBIT_RADIUS = 48;
export const MIN_TRIANGULAR_MONSTER_PATH_SIZE = 48;
export const MAX_TRIANGULAR_MONSTER_PATH_SIZE = 72;

export function generateRandomMonsterSpeed(
  min = MIN_MONSTER_SPEED,
  max = MAX_MONSTER_SPEED,
  rng: Rng = createMathRng(),
): number {
  return min + rng() * (max - min);
}

/** Returns -1 or 1 using the provided random-like source. */
export function generateRandomMonsterDirection(
  rng: Rng = createMathRng(),
): number {
  return rng() < 0.5 ? -1 : 1;
}

export function generateRandomMonsterVelocity(
  minSpeed = MIN_MONSTER_SPEED,
  maxSpeed = MAX_MONSTER_SPEED,
  rng: Rng = createMathRng(),
): number {
  return (
    generateRandomMonsterSpeed(minSpeed, maxSpeed, rng) *
    generateRandomMonsterDirection(rng)
  );
}

export function generateRandomHorizontalMonsterTravelDistance(
  min = MIN_HORIZONTAL_MONSTER_TRAVEL_DISTANCE,
  max = MAX_HORIZONTAL_MONSTER_TRAVEL_DISTANCE,
  rng: Rng = createMathRng(),
): number {
  return min + rng() * (max - min);
}

export function generateRandomCircularMonsterOrbitRadius(
  min = MIN_CIRCULAR_MONSTER_ORBIT_RADIUS,
  max = MAX_CIRCULAR_MONSTER_ORBIT_RADIUS,
  rng: Rng = createMathRng(),
): number {
  return min + rng() * (max - min);
}

export function generateRandomCircularMonsterAngularVelocity(
  radius: number,
  minSpeed = MIN_MONSTER_SPEED,
  maxSpeed = MAX_MONSTER_SPEED,
  rng: Rng = createMathRng(),
): number {
  return (
    (generateRandomMonsterSpeed(minSpeed, maxSpeed, rng) / radius) *
    generateRandomMonsterDirection(rng)
  );
}

export function generateRandomTriangularMonsterPathSize(
  min = MIN_TRIANGULAR_MONSTER_PATH_SIZE,
  max = MAX_TRIANGULAR_MONSTER_PATH_SIZE,
  rng: Rng = createMathRng(),
): number {
  return min + rng() * (max - min);
}
