import type { ChallengeModifiers } from "./types.ts";
import { CHALLENGE_MODIFIER_LIMITS } from "./zodSchemas.ts";

type ThemeAxis = "movers" | "monsters" | "springs" | "scarcity" | "calm";

/** Scores within this distance are too close to call a dominant theme. */
const THEME_MARGIN = 0.02;

const HINTS: Record<ThemeAxis, string> = {
  movers: "More moving platforms than normal.",
  monsters: "More monsters than normal.",
  springs: "More springs than normal.",
  scarcity: "Sparser help than normal.",
  calm: "Gentler than normal.",
};

/** Returns one deterministic, player-facing contrast with normal mode. */
export function getChallengeDifferenceHint(
  modifiers: ChallengeModifiers,
): string {
  const defaults = Object.fromEntries(
    Object.entries(CHALLENGE_MODIFIER_LIMITS).map(([key, limits]) => [
      key,
      limits.defaultValue,
    ]),
  ) as unknown as ChallengeModifiers;
  const scores: Record<ThemeAxis, number> = {
    movers: modifiers.movingShareBias,
    monsters: modifiers.monsterRateBias,
    springs:
      modifiers.springSpawnProbability - defaults.springSpawnProbability,
    scarcity:
      defaults.springSpawnProbability - modifiers.springSpawnProbability +
      defaults.powerupSpawnProbability - modifiers.powerupSpawnProbability +
      Math.max(0, modifiers.gapBias),
    calm:
      defaults.difficultyRampScale - modifiers.difficultyRampScale +
      defaults.movingShareBias - modifiers.movingShareBias +
      defaults.monsterRateBias - modifiers.monsterRateBias +
      Math.max(0, -modifiers.gapBias),
  };
  const ranked = (Object.entries(scores) as Array<[ThemeAxis, number]>).sort(
    (a, b) => b[1] - a[1],
  );

  if (ranked[0][1] - ranked[1][1] > THEME_MARGIN) {
    return HINTS[ranked[0][0]];
  }

  return getLargestDeltaHint(modifiers, defaults);
}

function getLargestDeltaHint(
  modifiers: ChallengeModifiers,
  defaults: ChallengeModifiers,
): string {
  const deltas: Array<[number, string]> = [
    [
      modifiers.difficultyRampScale - defaults.difficultyRampScale,
      modifiers.difficultyRampScale < defaults.difficultyRampScale
        ? HINTS.calm
        : "Tougher than normal.",
    ],
    [
      modifiers.movingShareBias - defaults.movingShareBias,
      modifiers.movingShareBias > defaults.movingShareBias
        ? HINTS.movers
        : HINTS.calm,
    ],
    [
      modifiers.monsterRateBias - defaults.monsterRateBias,
      modifiers.monsterRateBias > defaults.monsterRateBias
        ? HINTS.monsters
        : HINTS.calm,
    ],
    [
      modifiers.springSpawnProbability - defaults.springSpawnProbability,
      modifiers.springSpawnProbability > defaults.springSpawnProbability
        ? HINTS.springs
        : HINTS.scarcity,
    ],
    [
      modifiers.powerupSpawnProbability - defaults.powerupSpawnProbability,
      modifiers.powerupSpawnProbability < defaults.powerupSpawnProbability
        ? HINTS.scarcity
        : "More help than normal.",
    ],
    [
      modifiers.gapBias - defaults.gapBias,
      modifiers.gapBias > defaults.gapBias ? HINTS.scarcity : HINTS.calm,
    ],
  ];
  const [delta, axis] = deltas.sort(
    ([a], [b]) => Math.abs(b) - Math.abs(a),
  )[0];

  return delta === 0 ? "Different mix than normal." : axis;
}
