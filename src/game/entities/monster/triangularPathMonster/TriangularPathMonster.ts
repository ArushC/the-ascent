import {
  drawMonsterSpike,
  MONSTER_SPIKE_COLOR,
  MONSTER_SPIKE_SIZE,
  TRIANGULAR_MONSTER_SIZE,
  type TriangularPathMonster as TriangularPathMonsterEntity,
} from "../Monster";
import {
  generateRandomMonsterDirection,
  generateRandomMonsterSpeed,
  generateRandomTriangularMonsterPathSize,
} from "../random/random";
import { createMathRng, type Rng } from "../../../rng/seededRng/SeededRng";

const TRIANGULAR_PATH_MONSTER_COLOR = "white";

type Point = {
  x: number;
  y: number;
};

export class TriangularPathMonster implements TriangularPathMonsterEntity {
  readonly kind = "triangular";
  x: number;
  y: number;
  width: number;
  height: number;
  pathT: number;
  speed: number;
  readonly vertices: readonly [Point, Point, Point];
  readonly perimeterLength: number;

  constructor(
    vertices: readonly [Point, Point, Point],
    width: number,
    height: number,
    pathT: number,
    speed: number,
  ) {
    this.vertices = vertices;
    this.width = width;
    this.height = height;
    this.pathT = wrapPathT(pathT);
    this.speed = speed;
    this.perimeterLength = getPerimeterLength(vertices);
    const position = getPathPosition(vertices, this.pathT);
    this.x = position.x - width / 2;
    this.y = position.y - height / 2;
  }

  update(deltaTime: number, _canvasWidth: number): void {
    this.pathT = wrapPathT(
      this.pathT + (this.speed * deltaTime) / this.perimeterLength,
    );
    const position = getPathPosition(this.vertices, this.pathT);

    this.x = position.x - this.width / 2;
    this.y = position.y - this.height / 2;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const spikeSize = Math.min(MONSTER_SPIKE_SIZE, this.width / 5);
    const topX = this.x + this.width / 2;
    const topY = this.y + spikeSize;
    const rightX = this.x + this.width - spikeSize;
    const bottomY = this.y + this.height - spikeSize;
    const leftX = this.x + spikeSize;

    // A spike on each corner reinforces the triangular monster silhouette.
    ctx.fillStyle = MONSTER_SPIKE_COLOR;
    drawMonsterSpike(
      ctx,
      this.x + this.width / 2,
      this.y,
      topX - spikeSize,
      topY + spikeSize,
      topX + spikeSize,
      topY + spikeSize,
    );
    drawMonsterSpike(
      ctx,
      this.x + this.width,
      this.y + this.height,
      rightX - spikeSize,
      bottomY,
      rightX,
      bottomY - spikeSize,
    );
    drawMonsterSpike(
      ctx,
      this.x,
      this.y + this.height,
      leftX,
      bottomY - spikeSize,
      leftX + spikeSize,
      bottomY,
    );

    ctx.fillStyle = TRIANGULAR_PATH_MONSTER_COLOR;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(rightX, bottomY);
    ctx.lineTo(leftX, bottomY);
    ctx.closePath();
    ctx.fill();
  }
}

export function createTriangularMonster(
  x: number,
  y: number,
  pathSize?: number,
  pathT?: number,
  speed?: number,
  size = TRIANGULAR_MONSTER_SIZE,
  rng: Rng = createMathRng(),
): TriangularPathMonster {
  // Provided values win, missing movement uses rng
  const resolvedPathSize =
    pathSize ?? generateRandomTriangularMonsterPathSize(
      undefined,
      undefined,
      rng,
    );
  const resolvedPathT = pathT ?? rng();
  const resolvedSpeed =
    speed ??
    generateRandomMonsterSpeed(undefined, undefined, rng) *
      generateRandomMonsterDirection(rng);
  const height = (Math.sqrt(3) / 2) * resolvedPathSize;
  const vertices: readonly [Point, Point, Point] = [
    { x, y: y - height / 2 },
    { x: x + resolvedPathSize / 2, y: y + height / 2 },
    { x: x - resolvedPathSize / 2, y: y + height / 2 },
  ];

  return new TriangularPathMonster(
    vertices,
    size,
    size,
    resolvedPathT,
    resolvedSpeed,
  );
}

function getPerimeterLength(vertices: readonly [Point, Point, Point]): number {
  return (
    getDistance(vertices[0], vertices[1]) +
    getDistance(vertices[1], vertices[2]) +
    getDistance(vertices[2], vertices[0])
  );
}

function getDistance(start: Point, end: Point): number {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function getPathPosition(
  vertices: readonly [Point, Point, Point],
  pathT: number,
): Point {
  const edgeProgress = wrapPathT(pathT) * 3;
  const edgeIndex = Math.min(2, Math.floor(edgeProgress));
  const localT = edgeProgress - edgeIndex;
  const start = vertices[edgeIndex];
  const end = vertices[(edgeIndex + 1) % vertices.length];

  return {
    x: start.x + (end.x - start.x) * localT,
    y: start.y + (end.y - start.y) * localT,
  };
}

function wrapPathT(pathT: number): number {
  return ((pathT % 1) + 1) % 1;
}
