import { describe, expect, it, vi } from "vitest";
import {
  KeyboardInput,
  type KeyboardEventType,
  type KeyboardListener,
} from "./KeyboardInput";

class TestKeyboardTarget {
  private readonly listeners: Record<KeyboardEventType, Set<KeyboardListener>> = {
    keydown: new Set(),
    keyup: new Set(),
  };

  addEventListener(type: KeyboardEventType, listener: KeyboardListener): void {
    this.listeners[type].add(listener);
  }

  removeEventListener(type: KeyboardEventType, listener: KeyboardListener): void {
    this.listeners[type].delete(listener);
  }

  dispatch(type: KeyboardEventType, code: string): KeyboardEvent {
    const event = {
      code,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    for (const listener of this.listeners[type]) {
      listener(event);
    }

    return event;
  }
}

function createKeyboardInput(): {
  input: KeyboardInput;
  target: TestKeyboardTarget;
} {
  const target = new TestKeyboardTarget();
  const input = new KeyboardInput(target);

  return { input, target };
}

describe("KeyboardInput", () => {
  it("returns left intent while ArrowLeft is pressed", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "ArrowLeft");

    expect(input.getHorizontalIntent()).toBe(-1);
  });

  it("returns left intent while A is pressed", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyA");

    expect(input.getHorizontalIntent()).toBe(-1);
  });

  it("returns right intent while ArrowRight is pressed", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "ArrowRight");

    expect(input.getHorizontalIntent()).toBe(1);
  });

  it("returns right intent while D is pressed", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyD");

    expect(input.getHorizontalIntent()).toBe(1);
  });

  it("returns neutral intent while both arrow keys are pressed", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "ArrowLeft");
    target.dispatch("keydown", "ArrowRight");

    expect(input.getHorizontalIntent()).toBe(0);
  });

  it("consumes start as an edge-triggered Space action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "Space");

    expect(input.consumePhaseKeyPresses()).toEqual({
      start: true,
      shoot: true,
      pauseOrResume: false,
      restart: false,
      shrinkPowerupShortcut: false,
      slowMoPowerupShortcut: false,
    });
    expect(input.consumePhaseKeyPresses()).toEqual({
      start: false,
      shoot: false,
      pauseOrResume: false,
      restart: false,
      shrinkPowerupShortcut: false,
      slowMoPowerupShortcut: false,
    });
  });

  it("queues shoot from Space", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "Space");

    expect(input.consumePhaseKeyPresses().shoot).toBe(true);
  });

  it("does not repeat an action while the key stays pressed", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "Space");
    target.dispatch("keydown", "Space");

    expect(input.consumePhaseKeyPresses().shoot).toBe(true);
    expect(input.consumePhaseKeyPresses().shoot).toBe(false);
  });

  it("queues Space again after keyup", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "Space");
    input.consumePhaseKeyPresses();
    target.dispatch("keyup", "Space");
    target.dispatch("keydown", "Space");

    expect(input.consumePhaseKeyPresses().shoot).toBe(true);
  });

  it("consumes pause-or-resume from P or Escape", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyP");

    expect(input.consumePhaseKeyPresses().pauseOrResume).toBe(true);

    target.dispatch("keyup", "KeyP");
    target.dispatch("keydown", "Escape");

    expect(input.consumePhaseKeyPresses().pauseOrResume).toBe(true);
  });

  it("consumes the Shrink powerup shortcut as an edge-triggered F action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyF");

    expect(input.consumePhaseKeyPresses().shrinkPowerupShortcut).toBe(true);
    expect(input.consumePhaseKeyPresses().shrinkPowerupShortcut).toBe(false);
  });

  it("consumes the Slow-mo powerup shortcut as an edge-triggered T action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyT");

    expect(input.consumePhaseKeyPresses().slowMoPowerupShortcut).toBe(true);
    expect(input.consumePhaseKeyPresses().slowMoPowerupShortcut).toBe(false);
  });

  it("prevents default browser scrolling for Space", () => {
    const { target } = createKeyboardInput();

    const event = target.dispatch("keydown", "Space");

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("leaves letter shortcuts to the browser", () => {
    const { target } = createKeyboardInput();

    const event = target.dispatch("keydown", "KeyP");

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
