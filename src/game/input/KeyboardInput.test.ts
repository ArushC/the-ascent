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

  dispatch(type: KeyboardEventType, code: string): void {
    const event = {
      code,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent;

    for (const listener of this.listeners[type]) {
      listener(event);
    }
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
});
