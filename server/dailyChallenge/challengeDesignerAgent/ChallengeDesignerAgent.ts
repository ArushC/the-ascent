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
  if (!config) {
    logDesignWarning(
      challengeDate,
      "LLM_API_KEY is missing; using a deterministic fallback.",
    );
    return createFallbackChallenge(challengeDate);
  }

  try {
    logDesignInfo(
      challengeDate,
      `Requesting a draft from model "${config.model}" at ${config.baseUrl}.`,
    );
    let raw = await requestJsonCompletion(config, [
      { role: "system", content: "You design one Doodle Jump-style daily challenge as compact JSON." },
      { role: "user", content: buildDraftPrompt(challengeDate) },
    ], { temperature: DRAFT_TEMPERATURE });

    for (let round = 0; round < MAX_DESIGN_ROUNDS; round += 1) {
      const challenge = validateDraft(challengeDate, raw);
      const findings = critiqueCopy(challenge);
      const preview = previewSpawnStats(challenge);
      const report = scoreQuality(challenge, findings, preview);
      if (report.ok) {
        logDesignInfo(
          challengeDate,
          `Accepted round ${round + 1}/${MAX_DESIGN_ROUNDS} with theme "${report.themeAxis}".`,
        );
        return challenge;
      }

      logDesignWarning(
        challengeDate,
        `Rejected round ${round + 1}/${MAX_DESIGN_ROUNDS}: ${report.reasons.join(" | ")}`,
      );
      if (round === MAX_DESIGN_ROUNDS - 1) break;
      raw = await requestJsonCompletion(config, [
        { role: "system", content: "You revise a Doodle Jump daily challenge JSON to fix quality issues." },
        { role: "user", content: buildRevisePrompt({ challengeDate, previous: challenge, report }) },
      ], { temperature: REVISION_TEMPERATURE });
    }
  } catch (error) {
    logDesignError(challengeDate, error);
    return createFallbackChallenge(challengeDate);
  }

  logDesignWarning(
    challengeDate,
    "No proposal passed the quality gate; using a deterministic fallback.",
  );
  return createFallbackChallenge(challengeDate);
}

function logDesignInfo(challengeDate: string, message: string): void {
  if (process.env.NODE_ENV !== "test") {
    console.info(`[daily-challenge:${challengeDate}] ${message}`);
  }
}

function logDesignWarning(challengeDate: string, message: string): void {
  if (process.env.NODE_ENV !== "test") {
    console.warn(`[daily-challenge:${challengeDate}] ${message}`);
  }
}

function logDesignError(challengeDate: string, error: unknown): void {
  if (process.env.NODE_ENV !== "test") {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[daily-challenge:${challengeDate}] Design failed; using a deterministic fallback. Cause: ${message}`,
    );
  }
}
