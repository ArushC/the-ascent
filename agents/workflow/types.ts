export const STEPS = ["propose", "spec", "arch", "impl", "review", "test", "done"] as const;
export type Step = (typeof STEPS)[number];
export type RunStatus = "running" | "awaiting_approval" | "approved" | "blocked" | "failed" | "done" | "idle";

export type HistoryEntry = { step: Step; status: RunStatus; at: string };

export type RunState = {
  runId: string;
  featureSlug: string;
  paramsPath: string;
  branch: string;
  prNumber: number | null;
  prUrl: string | null;
  step: Step;
  status: RunStatus;
  awaitingSince: string | null;
  updatedAt: string;
  size: "small" | "normal";
  cursorAgentId: string | null;
  lastCursorRunId: string | null;
  lastError: string | null;
  history: HistoryEntry[];
};

export type GateResult = "approved" | "rejected" | "merged" | "waiting";
