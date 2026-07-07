import type { Player } from "../entities/Player";
import type { HorizontalIntent } from "../input/KeyboardInput";

export const GRAVITY = 0.0004;
export const HORIZONTAL_SPEED = 0.35;
export const INITIAL_JUMP_VELOCITY = 0.45;

export function updatePlayerPhysics(
  player: Player,
  deltaTime: number,
  horizontalIntent: HorizontalIntent,
): void {
  player.velocityX = horizontalIntent * HORIZONTAL_SPEED;
  player.velocityY += GRAVITY * deltaTime;
  player.x += player.velocityX * deltaTime;
  player.y += player.velocityY * deltaTime;
}
