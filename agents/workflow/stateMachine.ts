import type { GateResult, RunState, Step } from "./types.ts";

export const NEXT_STEP: Record<Step, Step | null> = {
  propose: "spec",
  spec: "arch",
  arch: "impl",
  impl: "review",
  review: "test",
  test: "done",
  done: null
};

/** Throws unless the state is waiting for the supplied gate event. */
export function assertCanAdvance(state: RunState, event: GateResult): void {
  if (state.status !== "awaiting_approval") throw new Error(`Cannot ${event} a ${state.status} run.`);
  if (event === "approved" && state.step === "done") throw new Error("Completed runs cannot advance.");
}

/** Records that a step completed and now requires human approval. */
export function afterStepSucceeded(state: RunState, now = new Date().toISOString()): RunState {
  return {
    ...state,
    status: "awaiting_approval",
    awaitingSince: now,
    updatedAt: now,
    lastError: null,
    history: [...state.history, { step: state.step, status: "awaiting_approval", at: now }]
  };
}

/** Consumes approval and starts the next step, or completes the run. */
export function afterApproved(state: RunState, now = new Date().toISOString()): RunState {
  assertCanAdvance(state, "approved");
  const next = NEXT_STEP[state.step];
  if (!next || next === "done") {
    return {
      ...state,
      step: "done",
      status: "done",
      awaitingSince: null,
      updatedAt: now,
      history: [...state.history, { step: state.step, status: "approved", at: now }]
    };
  }
  return {
    ...state,
    step: next,
    status: "running",
    awaitingSince: null,
    updatedAt: now,
    history: [...state.history, { step: state.step, status: "approved", at: now }]
  };
}

/** Blocks a run after a fresh rejection signal. */
export function afterRejected(state: RunState, now = new Date().toISOString()): RunState {
  assertCanAdvance(state, "rejected");
  return {
    ...state,
    status: "blocked",
    awaitingSince: null,
    updatedAt: now,
    history: [...state.history, { step: state.step, status: "blocked", at: now }]
  };
}

/** Marks a merged pull request as terminal regardless of its current step. */
export function afterMerged(state: RunState, now = new Date().toISOString()): RunState {
  return {
    ...state,
    step: "done",
    status: "done",
    awaitingSince: null,
    updatedAt: now,
    history: [...state.history, { step: state.step, status: "done", at: now }]
  };
}
