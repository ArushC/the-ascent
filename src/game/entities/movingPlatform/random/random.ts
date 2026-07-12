const MIN_MOVING_PLATFORM_SPEED = 0.07;
const MAX_MOVING_PLATFORM_SPEED = 0.11;
const MIN_MOVING_PLATFORM_TRAVEL_DISTANCE = 24;
const MAX_MOVING_PLATFORM_TRAVEL_DISTANCE = 48;

export function generateRandomMovingPlatformVelocity(): number {
  const speed =
    MIN_MOVING_PLATFORM_SPEED +
    Math.random() * (MAX_MOVING_PLATFORM_SPEED - MIN_MOVING_PLATFORM_SPEED);
  const direction = Math.random() < 0.5 ? -1 : 1;

  return speed * direction;
}

export function generateRandomMovingPlatformTravelDistance(): number {
  return (
    MIN_MOVING_PLATFORM_TRAVEL_DISTANCE +
    Math.random() *
      (MAX_MOVING_PLATFORM_TRAVEL_DISTANCE -
        MIN_MOVING_PLATFORM_TRAVEL_DISTANCE)
  );
}
