export const HORIZONTAL_MONSTER_WIDTH = 56;
export const HORIZONTAL_MONSTER_HEIGHT = 14;
export const CIRCULAR_MONSTER_SIZE = 32;
export const TRIANGULAR_MONSTER_SIZE = 32;

export const MONSTER_SPIKE_COLOR = "red";
export const MONSTER_SPIKE_SIZE = 3;

export type MonsterKind = "horizontal" | "circular" | "triangular";

export interface Monster {
  readonly kind: MonsterKind;
  x: number;
  y: number;
  width: number;
  height: number;
  draw(ctx: CanvasRenderingContext2D): void;
  update(deltaTime: number, canvasWidth: number): void;
}

export type HorizontalMonster = Monster & {
  readonly kind: "horizontal";
  velocityX: number;
  minX: number;
  maxX: number;
};

export type CircularMonster = Monster & {
  readonly kind: "circular";
  centerX: number;
  centerY: number;
  radius: number;
  angle: number;
  angularVelocity: number;
};

export type TriangularPathMonster = Monster & {
  readonly kind: "triangular";
  pathT: number;
  speed: number;
  perimeterLength: number;
};

export function isHorizontalMonster(
  monster: Monster,
): monster is HorizontalMonster {
  return monster.kind === "horizontal";
}

export function isCircularMonster(monster: Monster): monster is CircularMonster {
  return monster.kind === "circular";
}

export function isTriangularPathMonster(
  monster: Monster,
): monster is TriangularPathMonster {
  return monster.kind === "triangular";
}

export function drawMonsterSpike(
  ctx: CanvasRenderingContext2D,
  tipX: number,
  tipY: number,
  baseLeftX: number,
  baseLeftY: number,
  baseRightX: number,
  baseRightY: number,
): void {
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(baseLeftX, baseLeftY);
  ctx.lineTo(baseRightX, baseRightY);
  ctx.closePath();
  ctx.fill();
}
