import { createPlayer, type Player } from "./entities/Player";
import {
  createStaticPlatform,
  type StaticPlatform,
} from "./entities/StaticPlatform";
import { KeyboardInput, type HorizontalIntent } from "./input/KeyboardInput";
import { resolvePlatformLanding } from "./systems/CollisionSystem";
import { updatePlayerPhysics } from "./systems/PhysicsSystem";

const MAX_DELTA_MS = 50;
const NO_HORIZONTAL_INPUT: HorizontalIntent = 0;
const STARTING_STATIC_PLATFORM_POSITIONS = [
  { x: 155, y: 500 },
  { x: 260, y: 410 },
  { x: 70, y: 320 },
  { x: 220, y: 230 },
  { x: 110, y: 140 },
] as const;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private player: Player;
  private staticPlatforms: StaticPlatform[];
  private keyboardInput: KeyboardInput | null = null;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.player = createPlayer(canvas);
    this.staticPlatforms = STARTING_STATIC_PLATFORM_POSITIONS.map(({ x, y }) =>
      createStaticPlatform(x, y),
    );
  }

  start(): void {
    if (this.running) return;
    this.keyboardInput = new KeyboardInput();
    this.running = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;

    if (this.keyboardInput !== null) {
      this.keyboardInput.destroy();
      this.keyboardInput = null;
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (timestamp: number): void => {
    const deltaTime = Math.min(timestamp - this.lastTimestamp, MAX_DELTA_MS);
    this.lastTimestamp = timestamp;

    this.update(deltaTime);
    this.render();

    if (this.running) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  private update(deltaTime: number): void {
    const horizontalIntent =
      this.keyboardInput?.getHorizontalIntent() ?? NO_HORIZONTAL_INPUT;
    const previousY = this.player.y;

    updatePlayerPhysics(this.player, deltaTime, horizontalIntent);
    resolvePlatformLanding(this.player, this.staticPlatforms, previousY);
  }

  private render(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText("Doodle Jump AI", 100, 60);

    for (const platform of this.staticPlatforms) {
      platform.draw(ctx);
    }

    this.player.draw(ctx);
  }
}
