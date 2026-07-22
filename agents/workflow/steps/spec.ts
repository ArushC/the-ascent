import { writeFileSync } from "node:fs";
import { artifactPath } from "../activeRun.ts";
import { requestTextCompletion } from "../llmClient.ts";
import { readParams, renderPrompt } from "../promptRender.ts";
import { buildRepositoryContext } from "../repositoryContext.ts";
import type { RunState } from "../types.ts";

/** Generates and stores the product specification artifact. */
export async function runSpec(state: RunState): Promise<string> {
  const params = readParams(state.paramsPath);
  const context = buildRepositoryContext(`${params.FEATURE}\n${params.REQUIREMENTS}`);
  const prompt = `${renderPrompt("spec", params)}\n\n${context}\n\nScope the milestones to the requested change in this existing repository. Do not propose rebuilding, redeploying, or reimplementing systems already present.`;
  const output = await requestTextCompletion(prompt);
  writeFileSync(artifactPath(state, "spec.md"), output + "\n");
  return output;
}
