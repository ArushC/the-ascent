import { BANNED_COPY_TERMS, MECHANIC_TERMS } from "../constants.ts";
import type { CritiqueFinding, DailyChallenge } from "../types.ts";

/** Checks that player-facing copy describes supported gameplay without setting fluff. */
export function critiqueCopy(challenge: DailyChallenge): CritiqueFinding[] {
  const findings: CritiqueFinding[] = [];
  const text = challenge.title;

  if (!text.trim()) findings.push({ code: "empty_copy", detail: "title must not be empty." });
  const tokens = tokenize(text);
  const banned = BANNED_COPY_TERMS.find((term) => tokens.includes(term));
  if (banned) findings.push({ code: "banned_term", detail: `Remove banned setting term "${banned}" from the title.` });
  if (/[—–]/.test(text)) findings.push({ code: "banned_term", detail: "Remove decorative dashes from the title." });

  if (!MECHANIC_TERMS.some((term) => tokens.includes(term))) {
    findings.push({ code: "missing_mechanic", detail: "Mention at least one supported game mechanic in the title." });
  }
  return findings;
}

/**
 * Converts copy into comparable words. Normalizing "power-up(s)" to "powerup"
 * preserves that mechanic before punctuation is split into separate tokens.
 */
function tokenize(value: string): string[] {
  return value.toLowerCase().replace(/power-ups?/g, "powerup").split(/[^a-z]+/).filter(Boolean);
}
