export type AscensionState =
  | { status: "inactive" }
  | {
      status: "ascending";
      startPeakY: number;
      messageReady: boolean;
    };

export type AscensionUiState = {
  voidActive: boolean;
  messageReady: boolean;
};

export type AscensionUpdateResult = {
  state: AscensionState;
  didBegin: boolean;
};

export const ASCENSION_MESSAGE_CLIMB_SCREENS = 2;
export const ASCENDED_CLEAR_COLOR = "#9fd7ff";

export function createAscensionState(): AscensionState {
  return { status: "inactive" };
}

export function beginAscension(peakY: number): AscensionState {
  return {
    status: "ascending",
    startPeakY: peakY,
    messageReady: false,
  };
}

export function updateAscensionClimb(
  state: AscensionState,
  peakY: number,
  screenHeight: number,
): AscensionState {
  if (state.status !== "ascending" || state.messageReady) return state;

  return {
    ...state,
    messageReady:
      state.startPeakY - peakY >=
      ASCENSION_MESSAGE_CLIMB_SCREENS * screenHeight,
  };
}

export function updateAscensionForFrame(
  state: AscensionState,
  canBegin: boolean,
  peakY: number,
  screenHeight: number,
): AscensionUpdateResult {
  if (state.status === "inactive" && canBegin) {
    return {
      state: updateAscensionClimb(beginAscension(peakY), peakY, screenHeight),
      didBegin: true,
    };
  }

  return {
    state: updateAscensionClimb(state, peakY, screenHeight),
    didBegin: false,
  };
}

export function isBlankSpawnActive(state: AscensionState): boolean {
  return state.status === "ascending";
}

export function isAscensionMessageReady(state: AscensionState): boolean {
  return state.status === "ascending" && state.messageReady;
}

export function createAscensionUiState(
  state: AscensionState,
): AscensionUiState {
  return {
    voidActive: isBlankSpawnActive(state),
    messageReady: isAscensionMessageReady(state),
  };
}

export function hasAscensionUiChanged(
  before: AscensionUiState,
  after: AscensionUiState,
): boolean {
  return (
    before.voidActive !== after.voidActive ||
    before.messageReady !== after.messageReady
  );
}

export function removeEntitiesAboveCamera<T extends { y: number }>(
  entities: readonly T[],
  screenTopY: number,
): T[] {
  return entities.filter((entity) => entity.y >= screenTopY);
}
