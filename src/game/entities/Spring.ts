import type { Platform } from "./Platform";
import type { Player } from "./Player";
import { GRAVITY, SPRING_JUMP_VELOCITY } from "../systems/PhysicsSystem";

export const SPRING_WIDTH = 28;
export const SPRING_HEIGHT = 8;
export const SPRING_COMPRESSED_HEIGHT = 2;
export const SPRING_ACTIVATION_DURATION_MS = 220;
export const SPRING_REST_COLOR = "yellow";
export const SPRING_ACTIVE_COLOR = "#fffde7";
export const SPRING_PLATFORM_FLASH_COLOR = "#fff176";
export const SPRING_PLATFORM_FLASH_MAX_ALPHA = 0.35;
export const SPRING_BURST_LINE_WIDTH = 2;
export const SPRING_BURST_MAX_INSET = 10;
export const SPRING_BURST_OUTER_OFFSET_X = 12;
export const SPRING_BURST_INNER_OFFSET_X = 2;
export const SPRING_BURST_OUTER_OFFSET_Y = 12;
export const SPRING_BURST_INNER_OFFSET_Y = 4;

export type PlatformSpringState = {
  readonly hasSpring: boolean;
  springActivationMs: number;
};

export type SpringActivationVisuals = {
  readonly isActive: boolean;
  readonly activationRatio: number;
  readonly springColor: string;
  readonly springHeight: number;
  readonly platformFlashAlpha: number;
  readonly burstInset: number;
};

export function getSpringHitBounds(
  platform: Platform,
): { left: number; right: number } | null {
  if (!platform.hasSpring) return null;

  const springLeft = platform.x + (platform.width - SPRING_WIDTH) / 2;

  return {
    left: springLeft,
    right: springLeft + SPRING_WIDTH,
  };
}

export function playerOverlapsSpringHitZone(
  player: Player,
  platform: Platform,
): boolean {
  const springBounds = getSpringHitBounds(platform);
  if (springBounds === null) return false;

  const playerLeft = player.x;
  const playerRight = player.x + player.width;

  return playerRight > springBounds.left && playerLeft < springBounds.right;
}

export function triggerPlatformSpring(platform: Platform): void {
  if (!platform.hasSpring) return;

  platform.springActivationMs = SPRING_ACTIVATION_DURATION_MS;
}

export function updatePlatformSpringAnimations(
  platforms: readonly Platform[],
  deltaTime: number,
): void {
  for (const platform of platforms) {
    platform.springActivationMs = Math.max(
      0,
      platform.springActivationMs - deltaTime,
    );
  }
}

export function getSpringActivationVisuals(
  platform: Platform,
): SpringActivationVisuals {
  const activationRatio = clampRatio(
    platform.springActivationMs / SPRING_ACTIVATION_DURATION_MS,
  );

  return {
    isActive: activationRatio > 0,
    activationRatio,
    springColor: activationRatio > 0 ? SPRING_ACTIVE_COLOR : SPRING_REST_COLOR,
    springHeight:
      SPRING_HEIGHT -
      (SPRING_HEIGHT - SPRING_COMPRESSED_HEIGHT) * activationRatio,
    platformFlashAlpha: SPRING_PLATFORM_FLASH_MAX_ALPHA * activationRatio,
    burstInset: SPRING_BURST_MAX_INSET * (1 - activationRatio),
  };
}

export function drawPlatformSpring(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const springBounds = getSpringHitBounds(platform);
  if (springBounds === null) return;

  const visuals = getSpringActivationVisuals(platform);

  if (visuals.isActive) {
    ctx.save();
    ctx.globalAlpha = visuals.platformFlashAlpha;
    ctx.fillStyle = SPRING_PLATFORM_FLASH_COLOR;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.restore();
  }

  ctx.fillStyle = visuals.springColor;
  ctx.fillRect(
    springBounds.left,
    platform.y - visuals.springHeight,
    SPRING_WIDTH,
    visuals.springHeight,
  );

  if (visuals.isActive) {
    ctx.save();
    ctx.globalAlpha = visuals.activationRatio;
    ctx.strokeStyle = SPRING_ACTIVE_COLOR;
    ctx.lineWidth = SPRING_BURST_LINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(
      springBounds.left - SPRING_BURST_OUTER_OFFSET_X - visuals.burstInset,
      platform.y - SPRING_BURST_OUTER_OFFSET_Y,
    );
    ctx.lineTo(
      springBounds.left - SPRING_BURST_INNER_OFFSET_X,
      platform.y - SPRING_BURST_INNER_OFFSET_Y,
    );
    ctx.moveTo(
      springBounds.right + SPRING_BURST_OUTER_OFFSET_X + visuals.burstInset,
      platform.y - SPRING_BURST_OUTER_OFFSET_Y,
    );
    ctx.lineTo(
      springBounds.right + SPRING_BURST_INNER_OFFSET_X,
      platform.y - SPRING_BURST_INNER_OFFSET_Y,
    );
    ctx.stroke();
    ctx.restore();
  }
}

export function computeSpringJumpHeight(): number {
  return SPRING_JUMP_VELOCITY ** 2 / (2 * GRAVITY);
}

function clampRatio(value: number): number {
  return Math.max(0, Math.min(1, value));
}
