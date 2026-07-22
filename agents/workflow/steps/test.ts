import { gatherGitDiff, readParams, renderPrompt } from "../promptRender.ts";
import { runCursorAgent } from "../cursorAgent.ts";
import type { RunState } from "../types.ts";

/** Runs Cursor's focused testing prompt with PR-derived fallback context. */
export async function runTest(state: RunState): Promise<void> {
  const params = readParams(state.paramsPath);
  params.REQUIREMENTS ||= `Infer focused tests from this PR diff:\n${gatherGitDiff(state.prNumber)}`;
  params.SYSTEM ||= "Infer the affected system from the PR diff";
  params.SOURCE_FILE ||= "Infer the source files from the PR diff";
  params.EDGE_CASES ||= "Cover important boundary and regression cases";
  const ids = await runCursorAgent(renderPrompt("test", params), state);
  state.cursorAgentId = ids.agentId;
  state.lastCursorRunId = ids.runId;
}
