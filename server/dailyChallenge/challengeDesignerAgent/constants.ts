/** Maximum number of LLM proposals, including the initial draft. */
export const MAX_DESIGN_ROUNDS = 3;

/** A creative first pass followed by more focused, feedback-driven revisions. */
export const DRAFT_TEMPERATURE = 0.7;
export const REVISION_TEMPERATURE = 0.4;

/** Early, middle, and late scores used for the lightweight gameplay preview. */
export const PREVIEW_SCORE_BANDS = [0, 2500, 5000] as const;

/** Seeded rolls per score band; enough to expose broad probability differences. */
export const PREVIEW_EXTRA_SAMPLES_PER_BAND = 200;

/** Two leading theme scores this close together are treated as ambiguous. */
export const THEME_MARGIN = 0.02;

/** Setting-oriented words that make challenge copy unrelated to game mechanics. */
export const BANNED_COPY_TERMS = [
  "summer", "winter", "autumn", "season", "sky", "skies", "cosmos",
  "cosmic", "celestial", "galactic", "space", "star", "stars", "planet",
  "portal", "cloud", "storm", "weather", "night", "midnight", "firework",
  "terrain", "water", "ocean", "city", "relic", "oasis", "today",
  "tomorrow", "news",
] as const;

/** Words that show the title or blurb refers to something the player can do. */
export const MECHANIC_TERMS = [
  "platform", "platforms", "moving", "mover", "monster", "monsters", "spring",
  "springs", "powerup", "powerups", "gap", "gaps", "jump", "jumps", "timing",
  "recover", "recovery", "climb", "route", "bounce", "bouncy", "landing",
] as const;

/** Minimum observable mid-game share for a moving-platform challenge. */
export const MID_MOVING_MIN = 0.28;

/** Minimum observable mid-game spawn rate for a monster challenge. */
export const MID_MONSTER_MIN = 0.12;

/** Minimum average sampled spring rate for a spring challenge. */
export const SPRING_RATE_MIN = 0.12;

/** Scarcity fails only when both sampled forms of assistance remain generous. */
export const SCARCITY_SPRING_MAX = 0.12;
export const SCARCITY_POWERUP_MAX = 0.035;

/** Maximum mid-game hazards allowed for a challenge described as calm. */
export const CALM_MOVING_MAX = 0.45;
export const CALM_MONSTER_MAX = 0.22;
