import { CHALLENGE_MODIFIER_LIMITS } from "../../../../shared/dailyChallenge/zodSchemas.ts";
import {
  CALM_MONSTER_MAX, CALM_MOVING_MAX, MID_MONSTER_MIN, MID_MOVING_MIN,
  SCARCITY_POWERUP_MAX, SCARCITY_SPRING_MAX, SPRING_RATE_MIN, THEME_MARGIN,
} from "../constants.ts";
import type { ChallengeModifiers, CritiqueFinding, DailyChallenge, QualityReport, SpawnPreview, ThemeAxis } from "../types.ts";

/**
 * Infers the single gameplay idea emphasized by the modifiers. A close tie
 * returns null so mixed or unclear designs are sent back for revision.
 */
export function inferThemeAxis(modifiers: ChallengeModifiers): ThemeAxis | null {
  const defaults = Object.fromEntries(Object.entries(CHALLENGE_MODIFIER_LIMITS).map(([key, value]) => [key, value.defaultValue])) as unknown as ChallengeModifiers;
  const scores: Record<ThemeAxis, number> = {
    movers: modifiers.movingShareBias,
    monsters: modifiers.monsterRateBias,
    springs: modifiers.springSpawnProbability - defaults.springSpawnProbability,
    scarcity: (defaults.springSpawnProbability - modifiers.springSpawnProbability)
      + (defaults.powerupSpawnProbability - modifiers.powerupSpawnProbability)
      + Math.max(0, modifiers.gapBias),
    calm: (defaults.difficultyRampScale - modifiers.difficultyRampScale)
      + (defaults.movingShareBias - modifiers.movingShareBias)
      + (defaults.monsterRateBias - modifiers.monsterRateBias)
      + Math.max(0, -modifiers.gapBias),
  };
  const ranked = (Object.entries(scores) as Array<[ThemeAxis, number]>).sort((a, b) => b[1] - a[1]);
  return ranked[0][1] - ranked[1][1] <= THEME_MARGIN ? null : ranked[0][0];
}

/**
 * Combines copy checks, theme clarity, modifier restraint, and sampled gameplay
 * into a quality report whose reasons can be given directly to the LLM.
 */
export function scoreQuality(challenge: DailyChallenge, findings: CritiqueFinding[], preview: SpawnPreview): QualityReport {
  const themeAxis = inferThemeAxis(challenge.modifiers);
  const reasons = findings.map((finding) => finding.detail);
  if (!themeAxis) reasons.push("Pick one clear theme axis (calm, movers, monsters, springs, or scarcity); keep other modifiers near defaults.");

  const extremeCount = countExtremeModifiers(challenge.modifiers);
  if (extremeCount >= 4) reasons.push("Too many modifiers are near their limits; emphasize one theme and keep the other settings near defaults.");

  const mid = preview.bands[1];
  if (themeAxis === "movers" && mid.movingShare < MID_MOVING_MIN) reasons.push("Increase the mid-game moving-platform share to match the movers theme.");
  if (themeAxis === "monsters" && mid.monsterRate < MID_MONSTER_MIN) reasons.push("Increase the mid-game monster rate to match the monsters theme.");
  if (themeAxis === "springs" && preview.avg.springRate < SPRING_RATE_MIN) reasons.push("Increase spring spawns to match the springs theme.");
  if (themeAxis === "scarcity" && preview.avg.springRate > SCARCITY_SPRING_MAX && preview.avg.powerupRate > SCARCITY_POWERUP_MAX) reasons.push("Reduce spring or powerup availability to make scarcity visible.");
  if (themeAxis === "calm" && (mid.movingShare > CALM_MOVING_MAX || mid.monsterRate > CALM_MONSTER_MAX)) reasons.push("Reduce moving platforms or monsters to match the calm theme.");

  if (themeAxis && !mentionsTheme(challenge, themeAxis)) reasons.push(`Make the copy clearly describe the ${themeAxis} theme.`);
  return { ok: reasons.length === 0, themeAxis, findings, preview, reasons };
}

/** Counts knobs placed near either limit, which signals an unfocused design. */
function countExtremeModifiers(modifiers: ChallengeModifiers): number {
  return Object.entries(CHALLENGE_MODIFIER_LIMITS).filter(([key, limits]) => {
    const value = modifiers[key as keyof ChallengeModifiers];
    const edge = (limits.max - limits.min) * 0.1;
    return value <= limits.min + edge || value >= limits.max - edge;
  }).length;
}

/** Checks whether the player-facing copy names the inferred gameplay idea. */
function mentionsTheme(challenge: DailyChallenge, axis: ThemeAxis): boolean {
  const text = `${challenge.title} ${challenge.blurb}`.toLowerCase();
  const terms: Record<ThemeAxis, string[]> = {
    movers: ["moving", "mover", "platform"], monsters: ["monster"],
    springs: ["spring", "bounce", "bouncy"], scarcity: ["sparse", "scarce", "gap", "drought", "recover", "starved"],
    calm: ["calm", "steady", "steadier", "gentle"],
  };
  return terms[axis].some((term) => text.includes(term));
}
