import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { artifactPath } from "../activeRun.ts";
import { requestTextCompletion } from "../llmClient.ts";
import { projectRoot, readParams, renderPrompt } from "../promptRender.ts";
import { buildRepositoryContext } from "../repositoryContext.ts";
import type { RunState } from "../types.ts";

/** Generates architecture and copies it into the implementation parameters. */
export async function runArch(state: RunState): Promise<string> {
  const params = readParams(state.paramsPath);
  const specification = readFileSync(artifactPath(state, "spec.md"), "utf8");
  const context = buildRepositoryContext(`${params.FEATURE}\n${params.REQUIREMENTS}\n${specification}`);
  const prompt = `${renderPrompt("arch", params)}\n\nApproved specification:\n${specification}\n\n${context}\n\nDesign only the requested change against the existing files and conventions above.`;
  const output = await requestTextCompletion(prompt);
  writeFileSync(artifactPath(state, "architecture.md"), output + "\n");
  params.ARCHITECTURE = output;
  writeFileSync(resolve(projectRoot, state.paramsPath), JSON.stringify(params, null, 2) + "\n");
  return output;
}
