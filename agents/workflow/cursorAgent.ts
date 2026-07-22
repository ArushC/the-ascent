import { Agent, CursorAgentError } from "@cursor/sdk";
import type { RunState } from "./types.ts";

export type CursorRunResult = { agentId: string; runId: string; text: string };

async function executeCursorAgent(prompt: string, branch: string): Promise<CursorRunResult> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  const repo = process.env.WORKFLOW_REPO?.trim();
  if (!apiKey) throw new Error("CURSOR_API_KEY is required for this workflow step.");
  if (!repo) throw new Error("WORKFLOW_REPO is required for this workflow step.");
  try {
    const agent = await Agent.create({
      apiKey,
      model: { id: process.env.CURSOR_WORKFLOW_MODEL?.trim() || "composer-2.5" },
      cloud: {
        repos: [{ url: `https://github.com/${repo}.git`, startingRef: branch }],
        workOnCurrentBranch: true,
        autoCreatePR: false,
        skipReviewerRequest: true
      }
    });
    const run = await agent.send(prompt);
    const result = await run.wait();
    if (result.status === "error") throw new Error(result.error?.message || "Cursor agent run failed.");
    if (result.status === "cancelled") throw new Error("Cursor agent run was cancelled.");
    return { agentId: agent.agentId, runId: run.id, text: result.result?.trim() || "" };
  } catch (error) {
    if (error instanceof CursorAgentError) throw new Error(`Cursor agent failed: ${error.message}`);
    throw error;
  }
}

/** Runs a read-only planning/review prompt against a full cloud checkout. */
export async function runCursorTextAgent(prompt: string, branch: string): Promise<CursorRunResult> {
  const result = await executeCursorAgent(
    `Inspect the existing repository thoroughly. Do not edit files, commit, push, or open a PR. Return only the requested response.\n\n${prompt}`,
    branch
  );
  if (!result.text) throw new Error("Cursor returned an empty response.");
  return result;
}

/** Runs an implementation/testing prompt with write access to the workflow branch. */
export async function runCursorAgent(prompt: string, state: RunState): Promise<CursorRunResult> {
  return executeCursorAgent(prompt, state.branch);
}
