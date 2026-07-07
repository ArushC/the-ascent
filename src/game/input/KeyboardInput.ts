/** Horizontal arrow-key intent: -1 left, 0 neutral, 1 right. */
export type HorizontalIntent = -1 | 0 | 1;

export class KeyboardInput {
  private leftPressed = false;
  private rightPressed = false;

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  getHorizontalIntent(): HorizontalIntent {
    if (this.leftPressed === this.rightPressed) {
      return 0;
    }

    return this.leftPressed ? -1 : 1;
  }

  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    this.leftPressed = false;
    this.rightPressed = false;
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.updateKeyState(event, true);
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.updateKeyState(event, false);
  };

  private updateKeyState(event: KeyboardEvent, pressed: boolean): void {
    switch (event.code) {
      case "ArrowLeft":
        event.preventDefault();
        this.leftPressed = pressed;
        break;
      case "KeyA":
        this.leftPressed = pressed;
        break;
      case "ArrowRight":
        event.preventDefault();
        this.rightPressed = pressed;
        break;
      case "KeyD":
        this.rightPressed = pressed;
        break;
    }
  }
}
