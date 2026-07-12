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

  dispatch(
    type: KeyboardEventType,
    code: string,
    target?: EventTarget,
  ): KeyboardEvent {
    const event = {
      code,
      target,
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
      help: false,
      powerupShortcuts: {
        shrink: false,
        slowMo: false,
        armor: false,
        doubleJump: false,
        bigShot: false,
        rocket: false,
      },
    });
    expect(input.consumePhaseKeyPresses()).toEqual({
      start: false,
      shoot: false,
      pauseOrResume: false,
      help: false,
      powerupShortcuts: {
        shrink: false,
        slowMo: false,
        armor: false,
        doubleJump: false,
        bigShot: false,
        rocket: false,
      },
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

  it("consumes help as an edge-triggered H action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyH");

    expect(input.consumePhaseKeyPresses().help).toBe(true);
    expect(input.consumePhaseKeyPresses().help).toBe(false);

    target.dispatch("keydown", "KeyH");

    expect(input.consumePhaseKeyPresses().help).toBe(false);

    target.dispatch("keyup", "KeyH");
    target.dispatch("keydown", "KeyH");

    expect(input.consumePhaseKeyPresses().help).toBe(true);
  });

  it("ignores game shortcuts while an input is focused", () => {
    const { input, target } = createKeyboardInput();
    const textInput = { tagName: "INPUT" } as unknown as EventTarget;

    target.dispatch("keydown", "KeyH", textInput);
    const spaceEvent = target.dispatch("keydown", "Space", textInput);
    target.dispatch("keydown", "KeyP", textInput);

    expect(input.consumePhaseKeyPresses()).toEqual({
      start: false,
      shoot: false,
      pauseOrResume: false,
      help: false,
      powerupShortcuts: {
        shrink: false,
        slowMo: false,
        armor: false,
        doubleJump: false,
        bigShot: false,
        rocket: false,
      },
    });
    expect(spaceEvent.preventDefault).not.toHaveBeenCalled();
  });

  it("consumes the Shrink powerup shortcut as an edge-triggered F action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyF");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.shrink).toBe(true);
    expect(input.consumePhaseKeyPresses().powerupShortcuts.shrink).toBe(false);
  });

  it("consumes the Slow-mo powerup shortcut as an edge-triggered T action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyT");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.slowMo).toBe(true);
    expect(input.consumePhaseKeyPresses().powerupShortcuts.slowMo).toBe(false);
  });

  it("consumes the Armor powerup shortcut as an edge-triggered G action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyG");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.armor).toBe(true);
    expect(input.consumePhaseKeyPresses().powerupShortcuts.armor).toBe(false);
  });

  it("consumes the Double Jump powerup shortcut as an edge-triggered W action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyW");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.doubleJump).toBe(
      true,
    );
    expect(input.consumePhaseKeyPresses().powerupShortcuts.doubleJump).toBe(
      false,
    );

    target.dispatch("keydown", "KeyW");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.doubleJump).toBe(
      false,
    );

    target.dispatch("keyup", "KeyW");
    target.dispatch("keydown", "KeyW");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.doubleJump).toBe(
      true,
    );
  });

  it("consumes the Big Shot powerup shortcut as an edge-triggered B action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyB");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.bigShot).toBe(true);
    expect(input.consumePhaseKeyPresses().powerupShortcuts.bigShot).toBe(false);

    target.dispatch("keydown", "KeyB");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.bigShot).toBe(false);

    target.dispatch("keyup", "KeyB");
    target.dispatch("keydown", "KeyB");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.bigShot).toBe(true);
  });

  it("consumes the Rocket powerup shortcut as an edge-triggered R action", () => {
    const { input, target } = createKeyboardInput();

    target.dispatch("keydown", "KeyR");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.rocket).toBe(true);
    expect(input.consumePhaseKeyPresses().powerupShortcuts.rocket).toBe(false);

    target.dispatch("keydown", "KeyR");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.rocket).toBe(false);

    target.dispatch("keyup", "KeyR");
    target.dispatch("keydown", "KeyR");

    expect(input.consumePhaseKeyPresses().powerupShortcuts.rocket).toBe(true);
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
