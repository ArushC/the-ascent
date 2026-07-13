import { describe, expect, it } from "vitest";
import {
  ASCENSION_MESSAGE_CLIMB_SCREENS,
  beginAscension,
  createAscensionUiState,
  createAscensionState,
  hasAscensionUiChanged,
  isAscensionMessageReady,
  isBlankSpawnActive,
  removeEntitiesAboveCamera,
  updateAscensionForFrame,
  updateAscensionClimb,
} from "./AscensionSystem";
import { CANVAS_HEIGHT } from "../../ui/gameCanvas/GameCanvas";

describe("AscensionSystem", () => {
  it("starts inactive", () => {
    const state = createAscensionState();

    expect(state).toEqual({ status: "inactive" });
    expect(isBlankSpawnActive(state)).toBe(false);
    expect(isAscensionMessageReady(state)).toBe(false);
  });

  it("begins ascent from the current peak", () => {
    const state = beginAscension(-120);

    expect(state).toEqual({
      status: "ascending",
      startPeakY: -120,
      messageReady: false,
    });
    expect(isBlankSpawnActive(state)).toBe(true);
  });

  it("keeps the message hidden before a two-screen climb", () => {
    const state = updateAscensionClimb(
      beginAscension(0),
      -(ASCENSION_MESSAGE_CLIMB_SCREENS * CANVAS_HEIGHT - 1),
      CANVAS_HEIGHT,
    );

    expect(isAscensionMessageReady(state)).toBe(false);
  });

  it("readies the message after a two-screen climb", () => {
    const state = updateAscensionClimb(
      beginAscension(0),
      -(ASCENSION_MESSAGE_CLIMB_SCREENS * CANVAS_HEIGHT),
      CANVAS_HEIGHT,
    );

    expect(isAscensionMessageReady(state)).toBe(true);
  });

  it("leaves a ready ascent latched", () => {
    const readyState = updateAscensionClimb(
      beginAscension(0),
      -(ASCENSION_MESSAGE_CLIMB_SCREENS * CANVAS_HEIGHT),
      CANVAS_HEIGHT,
    );

    expect(updateAscensionClimb(readyState, 100, CANVAS_HEIGHT)).toBe(
      readyState,
    );
  });

  it("begins from a frame predicate", () => {
    const result = updateAscensionForFrame(
      createAscensionState(),
      true,
      -40,
      CANVAS_HEIGHT,
    );

    expect(result.didBegin).toBe(true);
    expect(result.state).toEqual({
      status: "ascending",
      startPeakY: -40,
      messageReady: false,
    });
  });

  it("does not begin when the frame predicate is false", () => {
    const result = updateAscensionForFrame(
      createAscensionState(),
      false,
      -40,
      CANVAS_HEIGHT,
    );

    expect(result.didBegin).toBe(false);
    expect(result.state).toEqual({ status: "inactive" });
  });

  it("derives and compares UI state", () => {
    const inactiveUi = createAscensionUiState(createAscensionState());
    const activeUi = createAscensionUiState(beginAscension(0));

    expect(inactiveUi).toEqual({
      voidActive: false,
      messageReady: false,
    });
    expect(activeUi).toEqual({
      voidActive: true,
      messageReady: false,
    });
    expect(hasAscensionUiChanged(inactiveUi, activeUi)).toBe(true);
    expect(hasAscensionUiChanged(activeUi, activeUi)).toBe(false);
  });

  it("removes entities above the camera for the immediate blank void", () => {
    const visibleEntity = { y: 100 };
    const aboveCamera = { y: -1 };

    expect(removeEntitiesAboveCamera([aboveCamera, visibleEntity], 0)).toEqual([
      visibleEntity,
    ]);
  });
});
