const MAX_DELTA_MS = 50;

interface DemoRect {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;
  private rafId: number | null = null;
  private lastTimestamp = 0;

  private rect: DemoRect = {
    x: 50,
    y: 280,
    width: 40,
    height: 40,
    vx: 0.15,
  };

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
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
    this.rect.x += this.rect.vx * deltaTime;

    const maxX = this.canvas.width - this.rect.width;
    if (this.rect.x <= 0 || this.rect.x >= maxX) {
      this.rect.vx *= -1;
      this.rect.x = Math.min(Math.max(this.rect.x, 0), maxX);
    }
  }

  private render(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText("Doodle Jump AI", 100, 60);

    ctx.fillStyle = "red";
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
  }
}
