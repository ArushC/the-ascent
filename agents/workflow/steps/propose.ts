import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { artifactPath } from "../activeRun.ts";
import { requestJsonCompletion } from "../llmClient.ts";
import { projectRoot } from "../promptRender.ts";
import { buildRepositoryContext } from "../repositoryContext.ts";
import type { RunState } from "../types.ts";

type Proposal = { feature: string; requirements: string; size: "small" | "normal"; slug: string };
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "feature";

/** Validates the structured proposal returned by the planning model. */
export function parseProposal(value: unknown): Proposal {
  if (!value || typeof value !== "object") throw new Error("Proposal must be a JSON object.");
  const proposal = value as Record<string, unknown>;
  if (typeof proposal.feature !== "string" || !proposal.feature.trim()) {
    throw new Error("Proposal feature must be a non-empty string.");
  }
  if (typeof proposal.requirements !== "string" || !proposal.requirements.trim()) {
    throw new Error("Proposal requirements must be a non-empty string.");
  }
  if (proposal.size !== "small" && proposal.size !== "normal") {
    throw new Error('Proposal size must be "small" or "normal".');
  }
  if (typeof proposal.slug !== "string") throw new Error("Proposal slug must be a string.");
  return proposal as Proposal;
}

/** Builds the shared parameter object consumed by later prompt templates. */
export function featureParams(proposal: Proposal): Record<string, string> {
  return {
    PROJECT: "Vertical endless climber in React, TypeScript, and Canvas",
    FEATURE: proposal.feature,
    REQUIREMENTS: proposal.requirements,
    ARCHITECTURE: "Paste approved architecture here before running ai:impl.",
    EXPECTED: "",
    ACTUAL: "",
    REPRODUCTION: "",
    CODE: "",
    LOGS: "",
    SYSTEM: "",
    SOURCE_FILE: "",
    EDGE_CASES: ""
  };
}

/** Proposes one feature from the backlog and recent repository history. */
export async function proposeFeature(date = new Date()): Promise<{ state: RunState; proposal: Proposal } | null> {
  const backlogPath = resolve(projectRoot, "agents/backlog.md");
  const backlog = existsSync(backlogPath) ? readFileSync(backlogPath, "utf8") : "";
  const pkg = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf8")) as { name: string };
  const commits = execFileSync("git", ["log", "-5", "--oneline"], { cwd: projectRoot, encoding: "utf8" });
  const context = buildRepositoryContext(backlog);
  const response = await requestJsonCompletion<unknown>(
    `Propose one focused, incremental feature for the existing ${pkg.name} repository. Return exactly one JSON object with string fields feature, requirements, slug, and size equal to "small" or "normal". Do not propose systems already implemented. Prefer an uncompleted backlog idea.\n\nBacklog:\n${backlog}\n\nRecent commits:\n${commits}\n\n${context}`
  );
  if (response && typeof response === "object" && (response as Record<string, unknown>).feature === "") return null;
  const proposal = parseProposal(response);
  proposal.slug = slugify(proposal.slug || proposal.feature);
  proposal.size = proposal.size === "small" ? "small" : "normal";
  const day = date.toISOString().slice(0, 10);
  const runId = `${day}-${proposal.slug}`;
  const now = date.toISOString();
  const paramsPath = `agents/params/${proposal.slug}.json`;
  const state: RunState = {
    runId,
    featureSlug: proposal.slug,
    paramsPath,
    branch: `workflow/${runId}`,
    prNumber: null,
    prUrl: null,
    step: "propose",
    status: "running",
    awaitingSince: null,
    updatedAt: now,
    size: proposal.size,
    cursorAgentId: null,
    lastCursorRunId: null,
    lastError: null,
    history: []
  };
  writeFileSync(resolve(projectRoot, paramsPath), JSON.stringify(featureParams(proposal), null, 2) + "\n");
  writeFileSync(artifactPath(state, "propose.json"), JSON.stringify(proposal, null, 2) + "\n");
  return { state, proposal };
}
