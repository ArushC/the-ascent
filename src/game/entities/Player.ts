import { INITIAL_JUMP_VELOCITY } from "../systems/PhysicsSystem";

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const PLAYER_COLOR = "red";

export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    velocityX: number,
    velocityY: number,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

export function createPlayer(canvas: HTMLCanvasElement): Player {
  return new Player(
    (canvas.width - PLAYER_WIDTH) / 2,
    canvas.height - PLAYER_HEIGHT,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    0,
    -INITIAL_JUMP_VELOCITY,
  );
}
