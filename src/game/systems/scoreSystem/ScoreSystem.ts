export type ScoreState = {
  startY: number;
  peakY: number;
};

export function createScoreState(startPlayerY: number): ScoreState {
  return {
    startY: startPlayerY,
    peakY: startPlayerY,
  };
}

export function updateScore(
  state: ScoreState,
  playerY: number,
): ScoreState {
  return {
    startY: state.startY,
    peakY: Math.min(state.peakY, playerY),
  };
}

export function getScore(state: ScoreState): number {
  // Canvas y values get smaller as the player climbs, so this is height gained.
  return Math.floor(state.startY - state.peakY);
}
