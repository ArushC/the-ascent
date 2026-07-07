/** Horizontal arrow-key intent: -1 left, 0 neutral, 1 right. */
export type HorizontalIntent = -1 | 0 | 1;

export type KeyboardEventType = "keydown" | "keyup";
export type KeyboardListener = (event: KeyboardEvent) => void;

export interface KeyboardEventTarget {
  addEventListener(type: KeyboardEventType, listener: KeyboardListener): void;
  removeEventListener(type: KeyboardEventType, listener: KeyboardListener): void;
}

export class KeyboardInput {
  private readonly eventTarget: KeyboardEventTarget;
  private leftPressed = false;
  private rightPressed = false;

  constructor(eventTarget: KeyboardEventTarget = window) {
    this.eventTarget = eventTarget;
    this.eventTarget.addEventListener("keydown", this.handleKeyDown);
    this.eventTarget.addEventListener("keyup", this.handleKeyUp);
  }

  getHorizontalIntent(): HorizontalIntent {
    if (this.leftPressed === this.rightPressed) {
      return 0;
    }

    return this.leftPressed ? -1 : 1;
  }

  destroy(): void {
    this.eventTarget.removeEventListener("keydown", this.handleKeyDown);
    this.eventTarget.removeEventListener("keyup", this.handleKeyUp);
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
