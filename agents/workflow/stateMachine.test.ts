import { describe, expect, it } from "vitest";
import { afterApproved, afterMerged, afterRejected, afterStepSucceeded, NEXT_STEP } from "./stateMachine.ts";
import type { RunState } from "./types.ts";
const state = (overrides: Partial<RunState> = {}): RunState => ({ runId: "run", featureSlug: "feature", paramsPath: "params.json", branch: "workflow/run", prNumber: 1, prUrl: "url", step: "arch", status: "awaiting_approval", awaitingSince: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", size: "normal", cursorAgentId: null, lastCursorRunId: null, lastError: null, history: [], ...overrides });
describe("workflow state machine", () => {
  it("requires every step in the happy path", () => { expect(NEXT_STEP).toEqual({ propose: "spec", spec: "arch", arch: "impl", impl: "review", review: "test", test: "done", done: null }); });
  it("moves an approved architecture to implementation", () => { expect(afterApproved(state()).step).toBe("impl"); });
  it("does not permit advancing a non-awaiting run", () => { expect(() => afterApproved(state({ status: "running" }))).toThrow(); });
  it("blocks rejected runs", () => { expect(afterRejected(state()).status).toBe("blocked"); });
  it("treats merge as terminal", () => { expect(afterMerged(state())).toMatchObject({ step: "done", status: "done" }); });
  it("records a successful step as awaiting approval", () => { expect(afterStepSucceeded(state({ status: "running" }))).toMatchObject({ status: "awaiting_approval" }); });
});
