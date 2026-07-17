export type ChallengeModifiers = {
  /** Scales how quickly the normal difficulty curve reaches late-game values. */
  difficultyRampScale: number;
  /** Adds or removes moving-platform share before gameplay clamps are applied. */
  movingShareBias: number;
  /** Adds or removes monster spawn chance before gameplay clamps are applied. */
  monsterRateBias: number;
  /** Chance for a spawned platform to carry a spring. */
  springSpawnProbability: number;
  /** Chance for a spawned platform to carry a powerup. */
  powerupSpawnProbability: number;
  /** Adjusts spawn gap ratios while preserving playable bounds. */
  gapBias: number;
};

export type DailyChallenge = {
  /** UTC challenge day in YYYY-MM-DD form. */
  challengeDate: string;
  /** Unsigned 32-bit seed used by the local deterministic RNG. */
  seed: number;
  title: string;
  blurb: string;
  modifiers: ChallengeModifiers;
  source: "agent" | "fallback";
};
