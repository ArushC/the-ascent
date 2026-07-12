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
): number {
  return min + Math.random() * (max - min);
}

export function generateRandomMonsterDirection(): number {
  return Math.random() < 0.5 ? -1 : 1;
}

export function generateRandomMonsterVelocity(
  minSpeed = MIN_MONSTER_SPEED,
  maxSpeed = MAX_MONSTER_SPEED,
): number {
  return (
    generateRandomMonsterSpeed(minSpeed, maxSpeed) *
    generateRandomMonsterDirection()
  );
}

export function generateRandomHorizontalMonsterTravelDistance(
  min = MIN_HORIZONTAL_MONSTER_TRAVEL_DISTANCE,
  max = MAX_HORIZONTAL_MONSTER_TRAVEL_DISTANCE,
): number {
  return min + Math.random() * (max - min);
}

export function generateRandomCircularMonsterOrbitRadius(
  min = MIN_CIRCULAR_MONSTER_ORBIT_RADIUS,
  max = MAX_CIRCULAR_MONSTER_ORBIT_RADIUS,
): number {
  return min + Math.random() * (max - min);
}

export function generateRandomCircularMonsterAngularVelocity(
  radius: number,
  minSpeed = MIN_MONSTER_SPEED,
  maxSpeed = MAX_MONSTER_SPEED,
): number {
  return (
    (generateRandomMonsterSpeed(minSpeed, maxSpeed) / radius) *
    generateRandomMonsterDirection()
  );
}

export function generateRandomTriangularMonsterPathSize(
  min = MIN_TRIANGULAR_MONSTER_PATH_SIZE,
  max = MAX_TRIANGULAR_MONSTER_PATH_SIZE,
): number {
  return min + Math.random() * (max - min);
}
