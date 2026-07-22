import { afterEach, describe, expect, it, vi } from "vitest";
import { notificationText, sendEmail } from "./notify/email.ts";
import type { RunState } from "./types.ts";

const state = (status: RunState["status"], overrides: Partial<RunState> = {}): RunState => ({
  runId: "run",
  featureSlug: "feature",
  paramsPath: "params.json",
  branch: "workflow/run",
  prNumber: 1,
  prUrl: "https://example.com/pr/1",
  step: "spec",
  status,
  awaitingSince: "2026-07-21T15:00:00.000Z",
  updatedAt: "2026-07-21T15:00:00.000Z",
  size: "normal",
  cursorAgentId: null,
  lastCursorRunId: null,
  lastError: null,
  history: [],
  ...overrides
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("notificationText", () => {
  it("identifies the run, detail, and pull request", () => {
    const text = notificationText(state("awaiting_approval"), "Specification ready");
    expect(text).toContain("spec is awaiting_approval for feature");
    expect(text).toContain("Specification ready");
    expect(text).toContain("https://example.com/pr/1");
  });

  it("includes approval instructions only while awaiting approval", () => {
    expect(notificationText(state("awaiting_approval"), "Ready")).toContain("workflow:approve");
    for (const status of ["failed", "blocked", "done"] as const) {
      expect(notificationText(state(status), "Not reviewable")).not.toContain("workflow:approve");
    }
  });

  it("handles notifications created before a pull request exists", () => {
    expect(notificationText(state("running", { prUrl: null }), "Starting")).toContain("PR: not created");
  });
});

describe("sendEmail", () => {
  it("skips delivery when Resend is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const fetchMock = vi.fn();
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendEmail(state("awaiting_approval"), "Ready")).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith("RESEND_API_KEY is missing; skipping workflow email.");
  });

  it("sends the configured recipient, subject, and idempotency key", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("WORKFLOW_EMAIL_TO", "reviewer@example.com");
    vi.stubEnv("WORKFLOW_EMAIL_FROM", "Workflow <sender@example.com>");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendEmail(state("awaiting_approval"), "Ready");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(request.headers).toMatchObject({
      Authorization: "Bearer test-key",
      "Idempotency-Key": "workflow-run-spec-2026-07-21T15:00:00.000Z"
    });
    expect(JSON.parse(String(request.body))).toMatchObject({
      from: "Workflow <sender@example.com>",
      to: ["reviewer@example.com"],
      subject: "[Ascent workflow] spec awaiting_approval: feature",
      text: "Ready"
    });
  });

  it("soft-fails when Resend rejects or cannot be reached", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("WORKFLOW_EMAIL_TO", "reviewer@example.com");
    vi.stubEnv("WORKFLOW_EMAIL_FROM", "sender@example.com");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("invalid", { status: 400 }))
      .mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendEmail(state("failed"), "Failure")).resolves.toBeUndefined();
    await expect(sendEmail(state("failed"), "Failure")).resolves.toBeUndefined();
    expect(warning).toHaveBeenCalledTimes(2);
  });
});
