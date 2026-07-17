import { createMathRng, type Rng } from "../../../rng/seededRng/SeededRng";

const MIN_MOVING_PLATFORM_SPEED = 0.07;
const MAX_MOVING_PLATFORM_SPEED = 0.11;
const MIN_MOVING_PLATFORM_TRAVEL_DISTANCE = 24;
const MAX_MOVING_PLATFORM_TRAVEL_DISTANCE = 48;

export function generateRandomMovingPlatformVelocity(
  rng: Rng = createMathRng(),
): number {
  const speed =
    MIN_MOVING_PLATFORM_SPEED +
    rng() * (MAX_MOVING_PLATFORM_SPEED - MIN_MOVING_PLATFORM_SPEED);
  const direction = rng() < 0.5 ? -1 : 1;

  return speed * direction;
}

export function generateRandomMovingPlatformTravelDistance(
  rng: Rng = createMathRng(),
): number {
  return (
    MIN_MOVING_PLATFORM_TRAVEL_DISTANCE +
    rng() *
      (MAX_MOVING_PLATFORM_TRAVEL_DISTANCE -
        MIN_MOVING_PLATFORM_TRAVEL_DISTANCE)
  );
}
