import { Agent, CursorAgentError } from "@cursor/sdk";
import type { RunState } from "./types.ts";

/** Runs a prompt against the workflow branch using a Cursor cloud agent. */
export async function runCursorAgent(prompt: string, state: RunState): Promise<{ agentId: string | null; runId: string | null }> {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  const repo = process.env.WORKFLOW_REPO?.trim();
  if (!apiKey) throw new Error("CURSOR_API_KEY is required for this workflow step.");
  if (!repo) throw new Error("WORKFLOW_REPO is required for this workflow step.");
  try {
    const agent = await Agent.create({
      apiKey,
      model: { id: process.env.CURSOR_WORKFLOW_MODEL?.trim() || "composer-2.5" },
      cloud: {
        repos: [{ url: `https://github.com/${repo}.git`, startingRef: state.branch }],
        workOnCurrentBranch: true,
        autoCreatePR: false,
        skipReviewerRequest: true
      }
    });
    const run = await agent.send(prompt);
    const result = await run.wait();
    if (result.status === "error") throw new Error(result.error?.message || "Cursor agent run failed.");
    if (result.status === "cancelled") throw new Error("Cursor agent run was cancelled.");
    return { agentId: agent.agentId, runId: run.id };
  } catch (error) {
    if (error instanceof CursorAgentError) throw new Error(`Cursor agent failed: ${error.message}`);
    throw error;
  }
}
