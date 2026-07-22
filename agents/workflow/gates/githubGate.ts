import { getPullRequestGateData, type PullRequestGateData } from "../github.ts";
import type { GateResult } from "../types.ts";

type GateData = Partial<PullRequestGateData>;
const COLLABORATORS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

/** Evaluates only approval signals created after the current gate opened. */
export function evaluateApproval(data: GateData, awaitingSince: string): GateResult {
  if (data.mergedAt) return "merged";
  const since = Date.parse(awaitingSince);
  const freshLabel = (name: string) => data.events?.some((event) => (
    event.event === "labeled"
    && event.label?.name === name
    && Date.parse(event.created_at) >= since
  )) ?? false;
  if (freshLabel("workflow:reject")) return "rejected";
  if (freshLabel("workflow:approve")) return "approved";
  const approvedByComment = data.comments?.some((comment) => (
    comment.body.trim() === "/approve"
    && Date.parse(comment.createdAt) >= since
    && COLLABORATORS.has(comment.authorAssociation ?? "")
  ));
  return approvedByComment ? "approved" : "waiting";
}

/** Fetches a PR's gate data and evaluates its current approval state. */
export function checkApproval(prNumber: number, awaitingSince: string): GateResult {
  return evaluateApproval(getPullRequestGateData(prNumber), awaitingSince);
}
