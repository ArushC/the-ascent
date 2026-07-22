import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { artifactPath } from "../activeRun.ts";
import { runCursorTextAgent } from "../cursorAgent.ts";
import { projectRoot, readParams, renderPrompt } from "../promptRender.ts";
import type { RunState } from "../types.ts";

/** Generates architecture and copies it into the implementation parameters. */
export async function runArch(state: RunState): Promise<string> {
  const params = readParams(state.paramsPath);
  const prompt = `${renderPrompt("arch", params)}\n\nRead the approved specification at agents/runs/${state.runId}/artifacts/spec.md and inspect the relevant source/tests. Design only the requested change against existing files and conventions. Return Markdown only.`;
  const result = await runCursorTextAgent(prompt, state.branch);
  const output = result.text;
  state.cursorAgentId = result.agentId;
  state.lastCursorRunId = result.runId;
  writeFileSync(artifactPath(state, "architecture.md"), output + "\n");
  params.ARCHITECTURE = output;
  writeFileSync(resolve(projectRoot, state.paramsPath), JSON.stringify(params, null, 2) + "\n");
  return output;
}
