const MIN_MONSTER_SPEED = 0.07;
const MAX_MONSTER_SPEED = 0.11;
const MIN_HORIZONTAL_MONSTER_TRAVEL_DISTANCE = 24;
const MAX_HORIZONTAL_MONSTER_TRAVEL_DISTANCE = 48;
const MIN_CIRCULAR_MONSTER_ORBIT_RADIUS = 24;
const MAX_CIRCULAR_MONSTER_ORBIT_RADIUS = 48;
const MIN_TRIANGULAR_MONSTER_PATH_SIZE = 48;
const MAX_TRIANGULAR_MONSTER_PATH_SIZE = 72;

export function generateRandomMonsterSpeed(): number {
  return (
    MIN_MONSTER_SPEED +
    Math.random() * (MAX_MONSTER_SPEED - MIN_MONSTER_SPEED)
  );
}

export function generateRandomMonsterDirection(): number {
  return Math.random() < 0.5 ? -1 : 1;
}

export function generateRandomMonsterVelocity(): number {
  return generateRandomMonsterSpeed() * generateRandomMonsterDirection();
}

export function generateRandomHorizontalMonsterTravelDistance(): number {
  return (
    MIN_HORIZONTAL_MONSTER_TRAVEL_DISTANCE +
    Math.random() *
      (MAX_HORIZONTAL_MONSTER_TRAVEL_DISTANCE -
        MIN_HORIZONTAL_MONSTER_TRAVEL_DISTANCE)
  );
}

export function generateRandomCircularMonsterOrbitRadius(): number {
  return (
    MIN_CIRCULAR_MONSTER_ORBIT_RADIUS +
    Math.random() *
      (MAX_CIRCULAR_MONSTER_ORBIT_RADIUS -
        MIN_CIRCULAR_MONSTER_ORBIT_RADIUS)
  );
}

export function generateRandomCircularMonsterAngularVelocity(
  radius: number,
): number {
  return (
    (generateRandomMonsterSpeed() / radius) * generateRandomMonsterDirection()
  );
}

export function generateRandomTriangularMonsterPathSize(): number {
  return (
    MIN_TRIANGULAR_MONSTER_PATH_SIZE +
    Math.random() *
      (MAX_TRIANGULAR_MONSTER_PATH_SIZE - MIN_TRIANGULAR_MONSTER_PATH_SIZE)
  );
}
