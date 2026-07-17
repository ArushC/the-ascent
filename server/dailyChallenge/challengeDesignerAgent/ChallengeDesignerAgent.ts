import type { DailyChallenge } from "../../../shared/dailyChallenge/types.ts";
import {
  MAX_DAILY_CHALLENGE_SEED,
  parseDailyChallenge,
} from "../../../shared/dailyChallenge/validation.ts";
import { hashDateToSeed } from "../../../src/game/rng/seededRng/SeededRng.ts";
import { createFallbackChallenge } from "../fallbackChallenge/FallbackChallenge.ts";

export type DailyChallengeDesigner = (
  challengeDate: string,
) => Promise<DailyChallenge> | DailyChallenge;

type LlmConfig = {
  /** Bearer token for the OpenAI-compatible provider, never sent to clients. */
  apiKey: string;
  /** Provider base URL without a trailing slash, e.g. https://api.groq.com/openai/v1. */
  baseUrl: string;
  /** Chat-completions model id configured for challenge design. */
  model: string;
};

type ChatCompletionResponse = {
  /** Minimal OpenAI-compatible response shape; content should be a JSON string. */
  choices?: Array<{ message?: { content?: unknown } }>;
};

type ChallengeDraft = {
  /** Candidate seed from the LLM; invalid values are replaced with the date hash. */
  seed?: unknown;
  /** Candidate short display name, later trimmed and length-checked by Zod. */
  title?: unknown;
  /** Candidate menu summary, later trimmed and length-checked by Zod. */
  blurb?: unknown;
  /** Candidate gameplay modifiers, later defaulted and clamped by Zod. */
  modifiers?: unknown;
};

type NestedChallengeDraft = {
  challenge?: unknown;
};

const DEFAULT_LLM_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_LLM_MODEL = "gpt-4o-mini";

export async function designChallenge(
  challengeDate: string,
): Promise<DailyChallenge> {
  const config = getLlmConfig();

  if (!config) {
    return createFallbackChallenge(challengeDate);
  }

  try {
    const completion = await requestChallengeCompletion(config, challengeDate);
    return parseAgentChallenge(challengeDate, completion);
  } catch {
    return createFallbackChallenge(challengeDate);
  }
}

/** Reads optional LLM env config; null means deterministic fallback-only mode. */
function getLlmConfig(): LlmConfig | null {
  const apiKey = process.env.LLM_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    baseUrl: normalizeLlmBaseUrl(process.env.LLM_BASE_URL),
    model: process.env.LLM_MODEL?.trim() || DEFAULT_LLM_MODEL,
  };
}

/** Normalizes provider roots before appending the chat-completions path. */
export function normalizeLlmBaseUrl(baseUrl: string | undefined): string {
  return (baseUrl?.trim() || DEFAULT_LLM_BASE_URL).replace(/\/+$/, "");
}

/** Calls the configured OpenAI-compatible chat endpoint for one challenge draft. */
async function requestChallengeCompletion(
  config: LlmConfig,
  challengeDate: string,
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: "json_object" },
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You design one Doodle Jump-style daily challenge as compact JSON.",
        },
        {
          role: "user",
          content: buildChallengePrompt(challengeDate),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM request failed with status ${response.status}.`);
  }

  return (await response.json()) as ChatCompletionResponse;
}

/** Builds the structured-output prompt for a specific UTC challenge date. */
export function buildChallengePrompt(challengeDate: string): string {
  return [
    `Design the UTC daily challenge for ${challengeDate}.`,
    "Use the date only as a private variety cue; the public title and blurb must be gameplay-first, not setting-first.",
    "Game context: the player jumps upward between platforms in a Doodle Jump-style vertical climber.",
    "Available mechanics are platforms, moving platforms, monsters, springs, powerups, gaps, jump timing, route choice, recovery jumps, and climb speed.",
    "Do not invent unsupported characters, settings, goals, lore, or hazards.",
    "Do not mention seasons, months, weekdays, news, living real people, relative dates like today/tomorrow, space, stars, cosmos, planets, portals, cities, relics, clouds, storms, skies, night, fireworks, terrain, weather, water, or dashes.",
    "Create a compact challenge whose title and blurb could be understood from the game mechanics alone.",
    "Good title style: Spring Chain, Monster Lane, Moving Gap Drill, Powerup Drought, Recovery Route.",
    "Bad title style: Celestial Ascent, Galactic Ascent, Summer Skybound, Midnight Skybound, Skybound Oasis.",
    "The blurb must describe an actual player action using available mechanics only.",
    "Return only one flat JSON object with exactly these top-level keys: title, blurb, seed, modifiers.",
    "Do not include challengeDate, date, challenge, metadata, or any nested wrapper object.",
    "title: 1-40 chars. blurb: 1-120 chars.",
    `seed: integer 0..${MAX_DAILY_CHALLENGE_SEED}.`,
    "modifiers: difficultyRampScale 0.75..1.35, movingShareBias -0.10..0.20, monsterRateBias -0.08..0.15, springSpawnProbability 0.05..0.25, powerupSpawnProbability 0.01..0.08, gapBias -0.05..0.08.",
  ].join(" ");
}

/** Converts raw chat-completion JSON into the persisted DailyChallenge shape. */
export function parseAgentChallenge(
  challengeDate: string,
  completion: ChatCompletionResponse,
): DailyChallenge {
  const draft = parseChallengeDraft(completion);

  return parseDailyChallenge({
    challengeDate,
    seed: getValidSeedOrDateHash(draft.seed, challengeDate),
    title: draft.title,
    blurb: draft.blurb,
    modifiers: draft.modifiers,
    source: "agent",
  });
}

/** Extracts and parses the assistant's JSON object from the chat response. */
function parseChallengeDraft(completion: ChatCompletionResponse): ChallengeDraft {
  const content = completion.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error("LLM response did not include JSON content.");
  }

  const draft = JSON.parse(content) as ChallengeDraft & NestedChallengeDraft;

  return isObject(draft.challenge)
    ? (draft.challenge as ChallengeDraft)
    : draft;
}

/** Keeps valid LLM seeds and repairs invalid ones with the deterministic date hash. */
export function getValidSeedOrDateHash(
  seed: unknown,
  challengeDate: string,
): number {
  return isValidSeed(seed) ? seed : hashDateToSeed(challengeDate);
}

/** Checks the shared unsigned 32-bit seed bounds. */
function isValidSeed(seed: unknown): seed is number {
  return (
    typeof seed === "number" &&
    Number.isInteger(seed) &&
    seed >= 0 &&
    seed <= MAX_DAILY_CHALLENGE_SEED
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
