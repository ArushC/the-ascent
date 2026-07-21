import type { DailyChallenge } from "../../../shared/dailyChallenge/types.ts";
import { createFallbackChallenge } from "../fallbackChallenge/FallbackChallenge.ts";
import {
  DRAFT_TEMPERATURE,
  MAX_DESIGN_ROUNDS,
  REVISION_TEMPERATURE,
} from "./constants.ts";
import { getLlmConfig, requestJsonCompletion } from "./llmClient.ts";
import { buildDraftPrompt, buildRevisePrompt } from "./prompts.ts";
import { critiqueCopy } from "./tools/critiqueCopy.ts";
import { previewSpawnStats } from "./tools/previewSpawnStats.ts";
import { scoreQuality } from "./tools/scoreQuality.ts";
import { validateDraft } from "./tools/validateDraft.ts";

export type DailyChallengeDesigner = (challengeDate: string) => Promise<DailyChallenge> | DailyChallenge;

/**
 * Drafts a challenge, inspects it with deterministic tools, and asks the LLM
 * to revise failed proposals before falling back to a known-good preset.
 */
export async function designChallenge(challengeDate: string): Promise<DailyChallenge> {
  const config = getLlmConfig();
  if (!config) return createFallbackChallenge(challengeDate);

  try {
    let raw = await requestJsonCompletion(config, [
      { role: "system", content: "You design one Doodle Jump-style daily challenge as compact JSON." },
      { role: "user", content: buildDraftPrompt(challengeDate) },
    ], { temperature: DRAFT_TEMPERATURE });

    for (let round = 0; round < MAX_DESIGN_ROUNDS; round += 1) {
      const challenge = validateDraft(challengeDate, raw);
      const findings = critiqueCopy(challenge);
      const preview = previewSpawnStats(challenge);
      const report = scoreQuality(challenge, findings, preview);
      if (report.ok) return challenge;
      if (round === MAX_DESIGN_ROUNDS - 1) break;
      raw = await requestJsonCompletion(config, [
        { role: "system", content: "You revise a Doodle Jump daily challenge JSON to fix quality issues." },
        { role: "user", content: buildRevisePrompt({ challengeDate, previous: challenge, report }) },
      ], { temperature: REVISION_TEMPERATURE });
    }
  } catch {
    // Any invalid provider response or tool failure uses the known-good fallback.
  }
  return createFallbackChallenge(challengeDate);
}
