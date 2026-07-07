import { createPlayer, type Player } from "./entities/Player";
import { updatePlayerPhysics } from "./systems/PhysicsSystem";

const MAX_DELTA_MS = 50;

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private player: Player;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.player = createPlayer(canvas);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
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
    updatePlayerPhysics(this.player, deltaTime);
  }

  private render(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText("Doodle Jump AI", 100, 60);

    this.player.draw(ctx);
  }
}
