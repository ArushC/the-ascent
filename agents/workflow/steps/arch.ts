import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { artifactPath } from "../activeRun.ts";
import { requestTextCompletion } from "../llmClient.ts";
import { projectRoot, readParams, renderPrompt } from "../promptRender.ts";
import type { RunState } from "../types.ts";

/** Generates architecture and copies it into the implementation parameters. */
export async function runArch(state: RunState): Promise<string> {
  const params = readParams(state.paramsPath);
  const output = await requestTextCompletion(renderPrompt("arch", params));
  writeFileSync(artifactPath(state, "architecture.md"), output + "\n");
  params.ARCHITECTURE = output;
  writeFileSync(resolve(projectRoot, state.paramsPath), JSON.stringify(params, null, 2) + "\n");
  return output;
}
