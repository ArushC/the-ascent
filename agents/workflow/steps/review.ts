import { requestTextCompletion } from "../llmClient.ts";
import { createPullRequestComment } from "../github.ts";
import { gatherGitDiff, renderPrompt } from "../promptRender.ts";
import type { RunState } from "../types.ts";

/** Generates an advisory code review and posts it to the workflow PR. */
export async function runReview(state: RunState): Promise<string> {
  const output = await requestTextCompletion(renderPrompt("review", {
    DIFF: gatherGitDiff(state.prNumber)
  }));
  if (state.prNumber) createPullRequestComment(state.prNumber, output);
  return output;
}
