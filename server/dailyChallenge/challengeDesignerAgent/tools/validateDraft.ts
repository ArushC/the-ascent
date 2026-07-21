import { MAX_DAILY_CHALLENGE_SEED, parseDailyChallenge } from "../../../../shared/dailyChallenge/validation.ts";
import { hashDateToSeed } from "../../../../src/game/rng/seededRng/SeededRng.ts";
import type { ChallengeDraft } from "../types.ts";

/** Keeps a usable provider seed or substitutes the deterministic date seed. */
export function getValidSeedOrDateHash(seed: unknown, challengeDate: string): number {
  return typeof seed === "number" && Number.isInteger(seed) && seed >= 0 && seed <= MAX_DAILY_CHALLENGE_SEED
    ? seed
    : hashDateToSeed(challengeDate);
}

/** Turns untrusted provider output into a clamped, server-owned challenge. */
export function validateDraft(challengeDate: string, raw: unknown) {
  if (!isObject(raw)) throw new Error("Challenge draft must be an object.");
  const draft = (isObject(raw.challenge) ? raw.challenge : raw) as ChallengeDraft;
  return parseDailyChallenge({
    challengeDate,
    seed: getValidSeedOrDateHash(draft.seed, challengeDate),
    title: draft.title,
    blurb: draft.blurb,
    modifiers: draft.modifiers,
    source: "agent",
  });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
