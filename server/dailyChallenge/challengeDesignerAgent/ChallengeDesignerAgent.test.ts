import { afterEach, describe, expect, it, vi } from "vitest";
import { hashDateToSeed } from "../../../src/game/rng/seededRng/SeededRng.ts";
import { createFallbackChallenge } from "../fallbackChallenge/FallbackChallenge.ts";
import {
  buildChallengePrompt,
  designChallenge,
  getValidSeedOrDateHash,
  normalizeLlmBaseUrl,
  parseAgentChallenge,
} from "./ChallengeDesignerAgent.ts";

describe("designChallenge", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns a validated agent challenge from good JSON", async () => {
    vi.stubEnv("LLM_API_KEY", "test-key");
    vi.stubEnv("LLM_BASE_URL", "https://llm.example/v1");
    vi.stubEnv("LLM_MODEL", "test-model");
    const fetchMock = vi.fn(async () =>
      Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                challengeDate: "1999-01-01",
                seed: 12345,
                title: "  Sky Forge  ",
                blurb: "Thread moving platforms through a bright monster lane.",
                modifiers: {
                  difficultyRampScale: 2,
                  movingShareBias: 0.5,
                  monsterRateBias: 0.09,
                  springSpawnProbability: 0.01,
                  powerupSpawnProbability: 0.1,
                  gapBias: -0.2,
                },
              }),
            },
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const challenge = await designChallenge("2026-07-17");
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;

    expect(challenge).toEqual({
      challengeDate: "2026-07-17",
      seed: 12345,
      title: "Sky Forge",
      blurb: "Thread moving platforms through a bright monster lane.",
      modifiers: {
        difficultyRampScale: 1.35,
        movingShareBias: 0.2,
        monsterRateBias: 0.09,
        springSpawnProbability: 0.05,
        powerupSpawnProbability: 0.08,
        gapBias: -0.05,
      },
      source: "agent",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://llm.example/v1/chat/completions",
      expect.objectContaining({ method: "POST" }),
    );
    expect(JSON.parse(String(request.body))).toMatchObject({
      model: "test-model",
      response_format: { type: "json_object" },
    });
  });

  it("normalizes LLM base URLs", () => {
    expect(normalizeLlmBaseUrl(" https://llm.example/v1/// ")).toBe(
      "https://llm.example/v1",
    );
    expect(normalizeLlmBaseUrl(undefined)).toBe("https://api.openai.com/v1");
  });

  it("builds a simple date-inspired JSON prompt", () => {
    const prompt = buildChallengePrompt("2026-07-17");

    expect(prompt).toContain("2026-07-17");
    expect(prompt).toContain("private variety cue");
    expect(prompt).toContain("gameplay-first");
    expect(prompt).toContain("jumps upward between platforms");
    expect(prompt).toContain("Available mechanics");
    expect(prompt).toContain("Do not invent unsupported characters");
    expect(prompt).toContain("space, stars, cosmos");
    expect(prompt).toContain("Good title style");
    expect(prompt).toContain("Bad title style");
    expect(prompt).toContain("actual player action");
    expect(prompt).toContain("game mechanics alone");
    expect(prompt).toContain("one flat JSON object");
    expect(prompt).toContain("Do not include challengeDate, date, challenge");
  });

  it("repairs invalid agent seeds with the date hash", () => {
    expect(getValidSeedOrDateHash("not-a-seed", "2026-07-17")).toBe(
      hashDateToSeed("2026-07-17"),
    );
    expect(getValidSeedOrDateHash(12345, "2026-07-17")).toBe(12345);
  });

  it("forces the requested date while parsing agent JSON", () => {
    expect(
      parseAgentChallenge("2026-07-17", {
        choices: [
          {
            message: {
              content: JSON.stringify({
                challengeDate: "1999-01-01",
                seed: "not-a-seed",
                title: "Hash Day",
                blurb: "A valid profile with a bad seed gets repaired.",
                modifiers: {
                  difficultyRampScale: 1,
                  movingShareBias: 0,
                  monsterRateBias: 0,
                  springSpawnProbability: 0.1,
                  powerupSpawnProbability: 0.03,
                  gapBias: 0,
                },
              }),
            },
          },
        ],
      }),
    ).toMatchObject({
      challengeDate: "2026-07-17",
      seed: hashDateToSeed("2026-07-17"),
      source: "agent",
    });
  });

  it("unwraps nested challenge JSON from chatty providers", () => {
    expect(
      parseAgentChallenge("2026-07-17", {
        choices: [
          {
            message: {
              content: JSON.stringify({
                date: "2026-07-17",
                challenge: {
                  seed: 12345,
                  title: "Spring Chain",
                  blurb:
                    "Chain springs through wider gaps while keeping recovery jumps ready.",
                  modifiers: {
                    difficultyRampScale: 0.96,
                    movingShareBias: 0.09,
                    monsterRateBias: 0.01,
                    springSpawnProbability: 0.22,
                    powerupSpawnProbability: 0.04,
                    gapBias: -0.01,
                  },
                },
              }),
            },
          },
        ],
      }),
    ).toMatchObject({
      challengeDate: "2026-07-17",
      seed: 12345,
      title: "Spring Chain",
      source: "agent",
    });
  });

  it("falls back when the agent returns bad JSON", async () => {
    vi.stubEnv("LLM_API_KEY", "test-key");
    const fetchMock = vi.fn(async () =>
      Response.json({
        choices: [{ message: { content: "{" } }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(designChallenge("2026-07-17")).resolves.toEqual(
      createFallbackChallenge("2026-07-17"),
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("falls back without calling fetch when no API key is configured", async () => {
    vi.stubEnv("LLM_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(designChallenge("2026-07-17")).resolves.toEqual(
      createFallbackChallenge("2026-07-17"),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
