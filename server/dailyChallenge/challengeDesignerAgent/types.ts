import type {
  ChallengeModifiers,
  DailyChallenge,
} from "../../../shared/dailyChallenge/types.ts";

/**
 * Untrusted provider output before validation. Every field is optional and
 * unknown because an LLM may omit it or return a value of the wrong type.
 */
export type ChallengeDraft = {
  seed?: unknown;
  title?: unknown;
  blurb?: unknown;
  modifiers?: unknown;
  challenge?: unknown;
};

export type CritiqueCode =
  | "banned_term"
  | "missing_mechanic"
  | "empty_copy"
  | "unsupported_claim";

export type CritiqueFinding = {
  code: CritiqueCode;
  field: "title" | "blurb" | "both";
  detail: string;
};

/** Spawn behavior observed at one representative point in the score curve. */
export type BandSpawnRates = {
  score: number;
  movingShare: number;
  monsterRate: number;
  springRate: number;
  powerupRate: number;
  meanGapRatio: number;
};

/** Deterministic spawn samples used to check whether gameplay matches copy. */
export type SpawnPreview = {
  seed: number;
  bands: BandSpawnRates[];
  avg: Omit<BandSpawnRates, "score">;
};

export type ThemeAxis = "calm" | "movers" | "monsters" | "springs" | "scarcity";

/** Pass/fail result and actionable feedback for the next LLM revision. */
export type QualityReport = {
  ok: boolean;
  themeAxis: ThemeAxis | null;
  findings: CritiqueFinding[];
  preview: SpawnPreview;
  reasons: string[];
};

export type { ChallengeModifiers, DailyChallenge };
