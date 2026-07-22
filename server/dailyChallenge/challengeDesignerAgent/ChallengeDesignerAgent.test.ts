import { afterEach, describe, expect, it, vi } from "vitest";
import { createFallbackChallenge } from "../fallbackChallenge/FallbackChallenge.ts";
import { designChallenge } from "./ChallengeDesignerAgent.ts";
import { REVISION_TEMPERATURE } from "./constants.ts";

/** A fixed date makes repaired seeds and fallback selection deterministic. */
const TEST_CHALLENGE_DATE = "2026-07-17";
const COPY_REJECTED_MOVERS_DRAFT = {
  seed: 12345,
  title: "Celestial Ascent",
  modifiers: {
    difficultyRampScale: 1.08, movingShareBias: 0.16, monsterRateBias: -0.01,
    springSpawnProbability: 0.1, powerupSpawnProbability: 0.03, gapBias: 0.02,
  },
};
const VALID_MOVERS_DRAFT = {
  ...COPY_REJECTED_MOVERS_DRAFT,
  title: "Moving Gap Drill",
};

function completion(draft: unknown): Response {
  return Response.json({ choices: [{ message: { content: JSON.stringify(draft) } }] });
}

describe("designChallenge", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns a candidate that passes on the first round", async () => {
    vi.stubEnv("LLM_API_KEY", "test-key");
    const fetchMock = vi.fn(async () => completion(VALID_MOVERS_DRAFT));
    vi.stubGlobal("fetch", fetchMock);

    await expect(designChallenge(TEST_CHALLENGE_DATE)).resolves.toMatchObject({ title: VALID_MOVERS_DRAFT.title, source: "agent" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("revises a failed candidate and uses the lower revision temperature", async () => {
    vi.stubEnv("LLM_API_KEY", "test-key");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(completion(COPY_REJECTED_MOVERS_DRAFT))
      .mockResolvedValueOnce(completion(VALID_MOVERS_DRAFT));
    vi.stubGlobal("fetch", fetchMock);

    await expect(designChallenge(TEST_CHALLENGE_DATE)).resolves.toMatchObject({ title: VALID_MOVERS_DRAFT.title, source: "agent" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const request = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      temperature: REVISION_TEMPERATURE,
    });
    expect(String(request.body)).toContain("Remove banned setting term");
  });

  it("falls back after three failed rounds", async () => {
    vi.stubEnv("LLM_API_KEY", "test-key");
    const fetchMock = vi.fn(async () => completion(COPY_REJECTED_MOVERS_DRAFT));
    vi.stubGlobal("fetch", fetchMock);
    await expect(designChallenge(TEST_CHALLENGE_DATE)).resolves.toEqual(createFallbackChallenge(TEST_CHALLENGE_DATE));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("falls back on provider errors and when no key is configured", async () => {
    vi.stubEnv("LLM_API_KEY", "test-key");
    const fetchMock = vi.fn(async () => new Response(null, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(designChallenge(TEST_CHALLENGE_DATE)).resolves.toEqual(createFallbackChallenge(TEST_CHALLENGE_DATE));

    vi.stubEnv("LLM_API_KEY", "");
    fetchMock.mockClear();
    await designChallenge(TEST_CHALLENGE_DATE);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
