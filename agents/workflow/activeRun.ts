import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { projectRoot } from "./promptRender.ts";
import type { RunState } from "./types.ts";

const runsRoot = resolve(projectRoot, "agents/runs");

/** Returns the active run ID, or null when the workflow is idle. */
export function readActiveRunId(): string | null {
  const path = resolve(runsRoot, "ACTIVE");
  if (!existsSync(path)) return null;
  const value = readFileSync(path, "utf8").trim();
  return value && value !== "none" ? value : null;
}

/** Updates the pointer used to resume the active run. */
export function writeActiveRunId(runId: string | null): void {
  mkdirSync(runsRoot, { recursive: true });
  writeFileSync(resolve(runsRoot, "ACTIVE"), runId ?? "none");
}

/** Loads a persisted workflow state file. */
export function readState(runId: string): RunState {
  return JSON.parse(readFileSync(resolve(runsRoot, runId, "state.json"), "utf8"));
}

/** Persists the current workflow state as readable JSON. */
export function writeState(state: RunState): void {
  const dir = resolve(runsRoot, state.runId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "state.json"), JSON.stringify(state, null, 2) + "\n");
}

/** Creates the artifact directory and returns a path within it. */
export function artifactPath(state: RunState, name: string): string {
  const dir = resolve(runsRoot, state.runId, "artifacts");
  mkdirSync(dir, { recursive: true });
  return resolve(dir, name);
}
