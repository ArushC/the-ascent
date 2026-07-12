/** Horizontal arrow-key intent: -1 left, 0 neutral, 1 right. */
export type HorizontalIntent = -1 | 0 | 1;

export type KeyboardEventType = "keydown" | "keyup";
export type KeyboardListener = (event: KeyboardEvent) => void;

/**
 * One-frame phase shortcuts consumed by Game.
 * true means the key was newly pressed since the previous consume call.
 */
export type PowerupShortcutKeyPresses = {
  shrink: boolean;
  slowMo: boolean;
  armor: boolean;
  doubleJump: boolean;
  bigShot: boolean;
  rocket: boolean;
};

export type PhaseKeyPresses = {
  start: boolean;
  shoot: boolean;
  pauseOrResume: boolean;
  help: boolean;
  powerupShortcuts: PowerupShortcutKeyPresses;
};

type PhaseActionKey =
  | keyof Omit<PhaseKeyPresses, "powerupShortcuts">
  | keyof PowerupShortcutKeyPresses;

const PHASE_ACTIONS_BY_CODE: Partial<Record<string, readonly PhaseActionKey[]>> =
  {
    Space: ["start", "shoot"],
    KeyF: ["shrink"],
    KeyT: ["slowMo"],
    KeyG: ["armor"],
    KeyW: ["doubleJump"],
    KeyB: ["bigShot"],
    KeyP: ["pauseOrResume"],
    Escape: ["pauseOrResume"],
    KeyH: ["help"],
    KeyR: ["rocket"],
};

export interface KeyboardEventTarget {
  addEventListener(type: KeyboardEventType, listener: KeyboardListener): void;
  removeEventListener(type: KeyboardEventType, listener: KeyboardListener): void;
}

export class KeyboardInput {
  private readonly eventTarget: KeyboardEventTarget;
  private leftPressed = false;
  private rightPressed = false;
  private readonly heldPhaseActionKeys = new Set<PhaseActionKey>();
  private readonly queuedPhaseActionKeys = new Set<PhaseActionKey>();

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

  consumePhaseKeyPresses(): PhaseKeyPresses {
    const actions = {
      start: this.queuedPhaseActionKeys.has("start"),
      shoot: this.queuedPhaseActionKeys.has("shoot"),
      pauseOrResume: this.queuedPhaseActionKeys.has("pauseOrResume"),
      help: this.queuedPhaseActionKeys.has("help"),
      powerupShortcuts: {
        shrink: this.queuedPhaseActionKeys.has("shrink"),
        slowMo: this.queuedPhaseActionKeys.has("slowMo"),
        armor: this.queuedPhaseActionKeys.has("armor"),
        doubleJump: this.queuedPhaseActionKeys.has("doubleJump"),
        bigShot: this.queuedPhaseActionKeys.has("bigShot"),
        rocket: this.queuedPhaseActionKeys.has("rocket"),
      },
    };

    this.queuedPhaseActionKeys.clear();

    return actions;
  }

  destroy(): void {
    this.eventTarget.removeEventListener("keydown", this.handleKeyDown);
    this.eventTarget.removeEventListener("keyup", this.handleKeyUp);
    this.leftPressed = false;
    this.rightPressed = false;
    this.heldPhaseActionKeys.clear();
    this.queuedPhaseActionKeys.clear();
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
      case "Space":
        event.preventDefault();
        this.recordPhaseActionKey(event.code, pressed);
        break;
      case "KeyP":
      case "Escape":
      case "KeyH":
      case "KeyF":
      case "KeyT":
      case "KeyG":
      case "KeyW":
      case "KeyB":
      case "KeyR":
        this.recordPhaseActionKey(event.code, pressed);
        break;
    }
  }

  /**
   * Queues a shortcut only on the first keydown, then waits for keyup
   * before the same shortcut can be queued again.
   */
  private recordPhaseActionKey(code: string, pressed: boolean): void {
    const actions = PHASE_ACTIONS_BY_CODE[code];
    if (!actions) return;

    if (!pressed) {
      for (const action of actions) {
        this.heldPhaseActionKeys.delete(action);
      }
      return;
    }

    for (const action of actions) {
      if (!this.heldPhaseActionKeys.has(action)) {
        this.queuedPhaseActionKeys.add(action);
      }

      this.heldPhaseActionKeys.add(action);
    }
  }
}
