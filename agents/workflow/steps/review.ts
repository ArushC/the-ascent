import { requestTextCompletion } from "../llmClient.ts";
import { createPullRequestComment } from "../github.ts";
import { gatherGitDiff, readParams, renderPrompt } from "../promptRender.ts";
import { buildRepositoryContext } from "../repositoryContext.ts";
import type { RunState } from "../types.ts";

/** Generates an advisory code review and posts it to the workflow PR. */
export async function runReview(state: RunState): Promise<string> {
  const params = readParams(state.paramsPath);
  const prompt = renderPrompt("review", {
    DIFF: gatherGitDiff(state.prNumber)
  });
  const context = buildRepositoryContext(`${params.FEATURE}\n${params.REQUIREMENTS}`);
  const output = await requestTextCompletion(`${prompt}\n\n${context}`);
  if (state.prNumber) createPullRequestComment(state.prNumber, output);
  return output;
}
