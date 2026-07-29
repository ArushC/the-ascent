import type { RunState } from "./types.ts";

/** Appends human review feedback when the current step is being revised. */
export function appendRevisionFeedback(prompt: string, state: RunState): string {
  if (!state.revisionFeedback?.trim()) return prompt;
  return `${prompt}

## Human revision feedback
The previous output for this workflow step was not approved. Revise in place to address every point below. Prefer minimal changes that satisfy the feedback.

${state.revisionFeedback.trim()}
`;
}
