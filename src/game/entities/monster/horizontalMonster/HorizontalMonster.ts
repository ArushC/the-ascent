import {
  drawMonsterSpike,
  HORIZONTAL_MONSTER_HEIGHT,
  HORIZONTAL_MONSTER_WIDTH,
  MONSTER_SPIKE_COLOR,
  MONSTER_SPIKE_SIZE,
  type HorizontalMonster as HorizontalMonsterEntity,
} from "../Monster";
import {
  generateRandomHorizontalMonsterTravelDistance,
  generateRandomMonsterVelocity,
} from "../random/random";

const HORIZONTAL_MONSTER_COLOR = "cyan";

export class HorizontalMonster implements HorizontalMonsterEntity {
  readonly kind = "horizontal";
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  minX: number;
  maxX: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityX: number,
    minX: number,
    maxX: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = velocityX;
    this.minX = minX;
    this.maxX = maxX;
  }

  update(deltaTime: number, canvasWidth: number): void {
    this.x += this.velocityX * deltaTime;

    const minX = Math.max(0, this.minX);
    const maxX = Math.min(this.maxX, Math.max(0, canvasWidth - this.width));

    if (this.x < minX) {
      this.x = minX;
      this.velocityX = Math.abs(this.velocityX);
    } else if (this.x > maxX) {
      this.x = maxX;
      this.velocityX = -Math.abs(this.velocityX);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const spikeSize = Math.min(MONSTER_SPIKE_SIZE, this.height / 3);
    const bodyX = this.x + spikeSize;
    const bodyY = this.y + spikeSize;
    const bodyWidth = this.width - spikeSize * 2;
    const bodyHeight = this.height - spikeSize * 2;

    // Two spikes on the top and bottom make the wide slider read as dangerous.
    ctx.fillStyle = MONSTER_SPIKE_COLOR;
    drawMonsterSpike(
      ctx,
      this.x + this.width * 0.25,
      this.y,
      this.x + this.width * 0.25 - spikeSize,
      bodyY,
      this.x + this.width * 0.25 + spikeSize,
      bodyY,
    );
    drawMonsterSpike(
      ctx,
      this.x + this.width * 0.75,
      this.y,
      this.x + this.width * 0.75 - spikeSize,
      bodyY,
      this.x + this.width * 0.75 + spikeSize,
      bodyY,
    );
    drawMonsterSpike(
      ctx,
      this.x + this.width * 0.25,
      this.y + this.height,
      this.x + this.width * 0.25 + spikeSize,
      bodyY + bodyHeight,
      this.x + this.width * 0.25 - spikeSize,
      bodyY + bodyHeight,
    );
    drawMonsterSpike(
      ctx,
      this.x + this.width * 0.75,
      this.y + this.height,
      this.x + this.width * 0.75 + spikeSize,
      bodyY + bodyHeight,
      this.x + this.width * 0.75 - spikeSize,
      bodyY + bodyHeight,
    );
    ctx.fillStyle = HORIZONTAL_MONSTER_COLOR;
    ctx.fillRect(bodyX, bodyY, bodyWidth, bodyHeight);
  }
}

export function createHorizontalMonster(
  x: number,
  y: number,
  velocityX = generateRandomMonsterVelocity(),
  travelDistance = generateRandomHorizontalMonsterTravelDistance(),
  width = HORIZONTAL_MONSTER_WIDTH,
  height = HORIZONTAL_MONSTER_HEIGHT,
): HorizontalMonster {
  const halfTravelDistance = travelDistance / 2;

  return new HorizontalMonster(
    x,
    y,
    width,
    height,
    velocityX,
    x - halfTravelDistance,
    x + halfTravelDistance,
  );
}
