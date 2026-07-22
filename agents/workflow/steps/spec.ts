import { writeFileSync } from "node:fs";
import { artifactPath } from "../activeRun.ts";
import { requestTextCompletion } from "../llmClient.ts";
import { readParams, renderPrompt } from "../promptRender.ts";
import type { RunState } from "../types.ts";

/** Generates and stores the product specification artifact. */
export async function runSpec(state: RunState): Promise<string> {
  const output = await requestTextCompletion(renderPrompt("spec", readParams(state.paramsPath)));
  writeFileSync(artifactPath(state, "spec.md"), output + "\n");
  return output;
}
