import type { Player } from "../../entities/player/Player";
import type { HorizontalIntent } from "../../input/keyboardInput/KeyboardInput";

export const GRAVITY = 0.0004;
export const HORIZONTAL_SPEED = 0.35;
export const INITIAL_JUMP_VELOCITY = 0.45;
export const ROCKET_VELOCITY_MULTIPLIER = 0.75;
export const SPRING_JUMP_VELOCITY_MULTIPLIER = 1.6;
export const SPRING_JUMP_VELOCITY =
  INITIAL_JUMP_VELOCITY * SPRING_JUMP_VELOCITY_MULTIPLIER;

export function updatePlayerPhysics(
  player: Player,
  deltaTime: number,
  horizontalIntent: HorizontalIntent,
): void {
  if (player.armor.pendingKnockbackVx !== null) {
    player.velocityX = player.armor.pendingKnockbackVx;
    player.armor.pendingKnockbackVx = null;
  } else {
    player.velocityX = horizontalIntent * HORIZONTAL_SPEED;
  }
  if (player.rocket.active) {
    player.velocityY = -(ROCKET_VELOCITY_MULTIPLIER * INITIAL_JUMP_VELOCITY);
  } else {
    player.velocityY += GRAVITY * deltaTime;
  }
  player.x += player.velocityX * deltaTime;
  player.y += player.velocityY * deltaTime;
}

export function applyHorizontalWrap(player: Player, canvasWidth: number): void {
  if (player.x + player.width <= 0) {
    player.x += canvasWidth;
  } else if (player.x >= canvasWidth) {
    player.x -= canvasWidth;
  }
}
