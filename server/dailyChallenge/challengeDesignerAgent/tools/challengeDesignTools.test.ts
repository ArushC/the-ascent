import { describe, expect, it } from "vitest";
import {
  createFallbackChallenge,
  FALLBACK_CHALLENGE_PRESETS,
} from "../../fallbackChallenge/FallbackChallenge.ts";
import { critiqueCopy } from "./critiqueCopy.ts";
import { previewSpawnStats } from "./previewSpawnStats.ts";
import { inferThemeAxis, scoreQuality } from "./scoreQuality.ts";
import { validateDraft } from "./validateDraft.ts";

/** A fixed date makes seed repair deterministic; its calendar value is irrelevant. */
const TEST_CHALLENGE_DATE = "2026-07-17";

describe("challenge design validation and quality tools", () => {
  it("repairs seeds, unwraps drafts, and stamps the requested date", () => {
    const result = validateDraft(TEST_CHALLENGE_DATE, {
      challenge: { ...FALLBACK_CHALLENGE_PRESETS.movers, seed: "bad" },
    });

    expect(result).toMatchObject({
      challengeDate: TEST_CHALLENGE_DATE,
      source: "agent",
    });
    expect(result.seed).toBe(
      createFallbackChallenge(TEST_CHALLENGE_DATE).seed,
    );
  });

  it("allows spring mechanics but rejects setting copy", () => {
    const challenge = {
      ...createFallbackChallenge(TEST_CHALLENGE_DATE),
      title: "Spring Chain",
      blurb: "Bounce between springs and platforms.",
    };

    expect(critiqueCopy(challenge)).toEqual([]);
    expect(
      critiqueCopy({ ...challenge, title: "Celestial Ascent" }).some(
        (item) => item.code === "banned_term",
      ),
    ).toBe(true);
  });

  it("produces deterministic previews and infers a clear theme", () => {
    const challenge = validateDraft(TEST_CHALLENGE_DATE, {
      ...FALLBACK_CHALLENGE_PRESETS.movers,
      seed: 12345,
    });
    const preview = previewSpawnStats(challenge);

    expect(previewSpawnStats(challenge)).toEqual(preview);
    expect(inferThemeAxis(challenge.modifiers)).toBe("movers");
    expect(scoreQuality(challenge, critiqueCopy(challenge), preview).ok).toBe(
      true,
    );
  });
});
