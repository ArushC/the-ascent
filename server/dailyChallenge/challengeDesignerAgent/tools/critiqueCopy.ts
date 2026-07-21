import { BANNED_COPY_TERMS, MECHANIC_TERMS } from "../constants.ts";
import type { CritiqueFinding, DailyChallenge } from "../types.ts";

/** Checks that player-facing copy describes supported gameplay without setting fluff. */
export function critiqueCopy(challenge: DailyChallenge): CritiqueFinding[] {
  const findings: CritiqueFinding[] = [];
  const fields = [{ field: "title" as const, text: challenge.title }, { field: "blurb" as const, text: challenge.blurb }];

  for (const { field, text } of fields) {
    if (!text.trim()) findings.push({ code: "empty_copy", field, detail: `${field} must not be empty.` });
    const tokens = tokenize(text);
    const banned = BANNED_COPY_TERMS.find((term) => tokens.includes(term));
    if (banned) findings.push({ code: "banned_term", field, detail: `Remove banned setting term "${banned}" from the ${field}.` });
    if (/[—–]/.test(text)) findings.push({ code: "banned_term", field, detail: `Remove decorative dashes from the ${field}.` });
  }

  const combined = tokenize(`${challenge.title} ${challenge.blurb}`);
  if (!MECHANIC_TERMS.some((term) => combined.includes(term))) {
    findings.push({ code: "missing_mechanic", field: "both", detail: "Mention at least one supported game mechanic in the title or blurb." });
  }
  if (/\b(?:swim|fly)\s+(?:to|through)\b/i.test(challenge.blurb)) {
    findings.push({ code: "unsupported_claim", field: "blurb", detail: "Describe jumping and climbing only; remove unsupported movement claims." });
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
