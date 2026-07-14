export type ScoreState = {
  startY: number;
  peakY: number;
  bonusPoints: number;
};

export function createScoreState(startPlayerY: number): ScoreState {
  return {
    startY: startPlayerY,
    peakY: startPlayerY,
    bonusPoints: 0,
  };
}

export function updateScore(
  state: ScoreState,
  playerY: number,
): ScoreState {
  return {
    startY: state.startY,
    peakY: Math.min(state.peakY, playerY),
    bonusPoints: state.bonusPoints,
  };
}

export function awardBonusPoints(
  state: ScoreState,
  bonusPoints: number,
): ScoreState {
  if (bonusPoints <= 0) return state;

  return {
    ...state,
    bonusPoints: state.bonusPoints + bonusPoints,
  };
}

export function getScore(state: ScoreState): number {
  // Canvas y values get smaller as the player climbs, so this is height gained.
  return Math.floor(state.startY - state.peakY) + state.bonusPoints;
}
