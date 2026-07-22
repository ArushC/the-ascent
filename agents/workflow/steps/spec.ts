import { writeFileSync } from "node:fs";
import { artifactPath } from "../activeRun.ts";
import { runCursorTextAgent } from "../cursorAgent.ts";
import { readParams, renderPrompt } from "../promptRender.ts";
import type { RunState } from "../types.ts";

/** Generates and stores the product specification artifact. */
export async function runSpec(state: RunState): Promise<string> {
  const params = readParams(state.paramsPath);
  const prompt = `${renderPrompt("spec", params)}\n\nInspect the repository before answering. Scope milestones only to this requested change. Do not rebuild, redeploy, or reimplement existing systems. Return Markdown only.`;
  const result = await runCursorTextAgent(prompt, state.branch);
  const output = result.text;
  state.cursorAgentId = result.agentId;
  state.lastCursorRunId = result.runId;
  writeFileSync(artifactPath(state, "spec.md"), output + "\n");
  return output;
}
