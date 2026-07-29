import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { artifactPath } from "../activeRun.ts";
import { runCursorTextAgent } from "../cursorAgent.ts";
import { projectRoot } from "../promptRender.ts";
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

/** Extracts the single JSON object requested from a Cursor text response. */
export function parseProposalResponse(text: string): Proposal {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) throw new Error("Cursor proposal did not contain a JSON object.");
  return parseProposal(JSON.parse(text.slice(firstBrace, lastBrace + 1)));
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
  const cursorResult = await runCursorTextAgent(
    "Read agents/backlog.md, package.json, recent Git history, and relevant source/tests. Propose one focused, incremental feature that is not already implemented. Prefer an uncompleted backlog idea. Return exactly one JSON object with string fields feature, requirements, slug, and size equal to \"small\" or \"normal\". Return no prose or Markdown fences.",
    process.env.WORKFLOW_DEFAULT_BRANCH?.trim() || "main"
  );
  const proposal = parseProposalResponse(cursorResult.text);
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
    cursorAgentId: cursorResult.agentId,
    lastCursorRunId: cursorResult.runId,
    lastError: null,
    revisionFeedback: null,
    history: []
  };
  writeFileSync(resolve(projectRoot, paramsPath), JSON.stringify(featureParams(proposal), null, 2) + "\n");
  writeFileSync(artifactPath(state, "propose.json"), JSON.stringify(proposal, null, 2) + "\n");
  return { state, proposal };
}

/** Revises the existing proposal without changing the run identity or branch. */
export async function reviseProposal(state: RunState): Promise<string> {
  if (!state.revisionFeedback?.trim()) throw new Error("Proposal revision requires human feedback.");
  const proposalPath = artifactPath(state, "propose.json");
  const current = readFileSync(proposalPath, "utf8");
  const cursorResult = await runCursorTextAgent(
    `Revise the existing feature proposal using the human feedback. Return exactly one JSON object with string fields feature, requirements, slug, and size equal to "small" or "normal". Keep the work focused and return no prose or Markdown fences.\n\nExisting proposal:\n${current}\n\nHuman revision feedback:\n${state.revisionFeedback}`,
    state.branch
  );
  const proposal = parseProposalResponse(cursorResult.text);
  proposal.slug = state.featureSlug;
  const paramsPath = resolve(projectRoot, state.paramsPath);
  const params = JSON.parse(readFileSync(paramsPath, "utf8")) as Record<string, string>;
  const revisedParams = featureParams(proposal);
  params.FEATURE = revisedParams.FEATURE;
  params.REQUIREMENTS = revisedParams.REQUIREMENTS;
  state.size = proposal.size;
  state.cursorAgentId = cursorResult.agentId;
  state.lastCursorRunId = cursorResult.runId;
  writeFileSync(paramsPath, JSON.stringify(params, null, 2) + "\n");
  writeFileSync(proposalPath, JSON.stringify(proposal, null, 2) + "\n");
  return `Feature proposal revised: ${proposal.feature}`;
}
