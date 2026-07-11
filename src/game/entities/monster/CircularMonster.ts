import {
  CIRCULAR_MONSTER_SIZE,
  drawMonsterSpike,
  MONSTER_SPIKE_COLOR,
  MONSTER_SPIKE_SIZE,
  type CircularMonster as CircularMonsterEntity,
} from "../Monster";
import {
  generateRandomCircularMonsterAngularVelocity,
  generateRandomCircularMonsterOrbitRadius,
} from "./random";

const CIRCULAR_MONSTER_COLOR = "magenta";

export class CircularMonster implements CircularMonsterEntity {
  readonly kind = "circular";
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radius: number;
  angle: number;
  angularVelocity: number;

  constructor(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    radius: number,
    angle: number,
    angularVelocity: number,
  ) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.angle = angle;
    this.angularVelocity = angularVelocity;
    this.x = centerX + radius * Math.cos(angle) - width / 2;
    this.y = centerY + radius * Math.sin(angle) - height / 2;
  }

  update(deltaTime: number, _canvasWidth: number): void {
    this.angle += this.angularVelocity * deltaTime;
    this.x =
      this.centerX + this.radius * Math.cos(this.angle) - this.width / 2;
    this.y =
      this.centerY + this.radius * Math.sin(this.angle) - this.height / 2;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const outerRadius = Math.min(this.width, this.height) / 2;
    const spikeSize = Math.min(MONSTER_SPIKE_SIZE, outerRadius / 3);
    const radius = outerRadius - spikeSize;

    // Evenly spaced spikes make the orbiting circle read as a hazard.
    ctx.fillStyle = MONSTER_SPIKE_COLOR;
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * 2 * Math.PI;
      const baseLeftAngle = angle - 0.16;
      const baseRightAngle = angle + 0.16;

      drawMonsterSpike(
        ctx,
        centerX + Math.cos(angle) * outerRadius,
        centerY + Math.sin(angle) * outerRadius,
        centerX + Math.cos(baseLeftAngle) * radius,
        centerY + Math.sin(baseLeftAngle) * radius,
        centerX + Math.cos(baseRightAngle) * radius,
        centerY + Math.sin(baseRightAngle) * radius,
      );
    }

    ctx.fillStyle = CIRCULAR_MONSTER_COLOR;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

export function createCircularMonster(
  centerX: number,
  centerY: number,
  radius = generateRandomCircularMonsterOrbitRadius(),
  angle = Math.random() * 2 * Math.PI,
  angularVelocity = generateRandomCircularMonsterAngularVelocity(radius),
): CircularMonster {
  return new CircularMonster(
    centerX,
    centerY,
    CIRCULAR_MONSTER_SIZE,
    CIRCULAR_MONSTER_SIZE,
    radius,
    angle,
    angularVelocity,
  );
}
