import type { Platform } from "../platform/Platform";
import type { Player } from "../player/Player";

export const POWERUP_STAR_SIZE = 18;
export const POWERUP_STAR_GAP_ABOVE_PLATFORM = 44;
const POWERUP_STAR_POINTS = 5;
const POWERUP_STAR_INNER_RADIUS_RATIO = 0.45;
const POWERUP_STAR_FILL = "#ffeb3b";
const POWERUP_STAR_STROKE = "white";

export type PlatformPowerupState = {
  hasPowerup: boolean;
};

export type Powerup = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getPlatformPowerup(platform: Platform): Powerup | null {
  if (!platform.hasPowerup) return null;

  return {
    x: platform.x + (platform.width - POWERUP_STAR_SIZE) / 2,
    y:
      platform.y -
      POWERUP_STAR_GAP_ABOVE_PLATFORM -
      POWERUP_STAR_SIZE,
    width: POWERUP_STAR_SIZE,
    height: POWERUP_STAR_SIZE,
  };
}

export function playerCollidesWithPowerup(
  player: Player,
  powerup: Powerup,
): boolean {
  return (
    player.x < powerup.x + powerup.width &&
    player.x + player.width > powerup.x &&
    player.y < powerup.y + powerup.height &&
    player.y + player.height > powerup.y
  );
}

export function playerCollidesWithPlatformPowerup(
  player: Player,
  platform: Platform,
): boolean {
  const powerup = getPlatformPowerup(platform);
  return powerup !== null && playerCollidesWithPowerup(player, powerup);
}

export function drawPlatformPowerup(
  ctx: CanvasRenderingContext2D,
  platform: Platform,
): void {
  const powerup = getPlatformPowerup(platform);
  if (powerup === null) return;

  drawPowerup(ctx, powerup);
}

export function drawPowerup(
  ctx: CanvasRenderingContext2D,
  powerup: Powerup,
): void {
  const centerX = powerup.x + powerup.width / 2;
  const centerY = powerup.y + powerup.height / 2;
  const outerRadius = powerup.width / 2;
  const innerRadius = outerRadius * POWERUP_STAR_INNER_RADIUS_RATIO;

  ctx.save();
  ctx.fillStyle = POWERUP_STAR_FILL;
  ctx.strokeStyle = POWERUP_STAR_STROKE;
  ctx.lineWidth = 2;
  ctx.beginPath();

  // Alternate outer and inner vertices around a circle to draw a 5-point star.
  for (let point = 0; point < POWERUP_STAR_POINTS * 2; point += 1) {
    const radius = point % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + (point * Math.PI) / POWERUP_STAR_POINTS;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    if (point === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
