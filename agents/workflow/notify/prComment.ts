import { createPullRequestComment } from "../github.ts";
import type { RunState } from "../types.ts";

/** Mirrors a notification to the active workflow PR when one exists. */
export function mirrorToPullRequest(state: RunState, text: string): void {
  if (state.prNumber) createPullRequestComment(state.prNumber, text);
}
