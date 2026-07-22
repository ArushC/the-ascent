import { runCursorTextAgent } from "../cursorAgent.ts";
import { createPullRequestComment } from "../github.ts";
import { renderPrompt } from "../promptRender.ts";
import type { RunState } from "../types.ts";

/** Generates an advisory code review and posts it to the workflow PR. */
export async function runReview(state: RunState): Promise<string> {
  const prompt = renderPrompt("review", {
    DIFF: "Inspect the workflow branch diff against origin/main directly."
  });
  const result = await runCursorTextAgent(prompt, state.branch);
  const output = result.text;
  state.cursorAgentId = result.agentId;
  state.lastCursorRunId = result.runId;
  if (state.prNumber) createPullRequestComment(state.prNumber, output);
  return output;
}
