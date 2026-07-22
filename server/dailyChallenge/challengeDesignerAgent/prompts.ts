import { CHALLENGE_MODIFIER_LIMITS, MAX_DAILY_CHALLENGE_SEED } from "../../../shared/dailyChallenge/zodSchemas.ts";
import type { DailyChallenge, QualityReport } from "./types.ts";

const shapeRules = [
  "Return only one flat JSON object with exactly these top-level keys: title, blurb, seed, modifiers.",
  "Do not include challengeDate, date, challenge, metadata, or a nested wrapper.",
  "title: 1-40 chars. blurb: 1-120 chars.",
  "Keep the blurb to a short action line; the UI adds a separate normal-mode comparison.",
  `seed: integer 0..${MAX_DAILY_CHALLENGE_SEED}.`,
  `modifiers: ${Object.entries(CHALLENGE_MODIFIER_LIMITS).map(([key, limits]) => `${key} ${limits.min}..${limits.max}`).join(", ")}.`,
];

/** Gives the model the gameplay boundaries for its first challenge proposal. */
export function buildDraftPrompt(challengeDate: string): string {
  return [
    `Design the UTC daily challenge for ${challengeDate}.`,
    "Use the date only as a private variety cue; never expose it in the copy.",
    "The player jumps upward between platforms in a Doodle Jump-style vertical climber.",
    "Use mechanics-only language: platforms, moving platforms, monsters, springs, powerups, gaps, jump timing, routes, recovery, and climbing.",
    "Pick exactly one theme axis: calm, movers, monsters, springs, or scarcity. Keep other modifiers near defaults; do not max every knob.",
    "Do not invent settings, lore, characters, goals, or hazards. Avoid seasons, news, living people, today/tomorrow, sky, space, stars, cosmos, planets, portals, cities, relics, clouds, storms, night, fireworks, terrain, weather, water, and decorative dashes.",
    "Good titles: Spring Chain, Monster Lane, Moving Gap Drill, Powerup Drought, Recovery Route.",
    "Bad titles: Celestial Ascent, Galactic Ascent, Summer Skybound, Midnight Skybound, Skybound Oasis.",
    "The blurb must describe an actual player action using supported mechanics.",
    ...shapeRules,
  ].join(" ");
}

/** Feeds tool observations back to the model so it can repair its proposal. */
export function buildRevisePrompt(args: { challengeDate: string; previous: DailyChallenge; report: QualityReport }): string {
  return [
    `Revise the UTC daily challenge for ${args.challengeDate}. The date remains a private variety cue.`,
    `Post-clamp previous challenge: ${JSON.stringify(args.previous)}.`,
    `Fix every listed reason:\n${args.report.reasons.map((reason) => `- ${reason}`).join("\n")}`,
    `Spawn preview averages: ${JSON.stringify(args.report.preview.avg)}.`,
    "Keep the same theme axis unless a reason says the theme is wrong. Return the same flat JSON shape.",
    ...shapeRules,
  ].join(" ");
}
