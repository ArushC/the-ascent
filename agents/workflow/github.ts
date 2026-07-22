import { execFileSync, spawnSync } from "node:child_process";
import { projectRoot } from "./promptRender.ts";

export type PullRequestGateData = {
  mergedAt: string | null;
  updatedAt: string;
  labels: { name: string }[];
  comments: { body: string; createdAt: string; authorAssociation: string }[];
  events: { event: string; created_at: string; label?: { name: string } }[];
};

function gh(args: string[]): string {
  return execFileSync("gh", args, { cwd: projectRoot, encoding: "utf8", env: process.env }).trim();
}

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: projectRoot, encoding: "utf8", env: process.env }).trim();
}

/** Creates the workflow gate labels when they do not already exist. */
export function ensureWorkflowLabels(): void {
  for (const [name, color] of [["workflow:approve", "0e8a16"], ["workflow:reject", "b60205"]]) {
    gh(["label", "create", name, "--color", color, "--force"]);
  }
}

/** Creates and checks out the branch that owns one workflow run. */
export function createWorkflowBranch(branch: string): void {
  git(["checkout", "-b", branch]);
}

/** Commits workflow artifacts and pushes them after rebasing remote agent work. */
export function commitAndPush(branch: string, message: string): void {
  git(["add", "agents"]);
  const diff = spawnSync("git", ["diff", "--cached", "--quiet"], { cwd: projectRoot });
  if (diff.status === 1) git(["commit", "-m", message]);
  else if (diff.status !== 0) throw new Error("Could not inspect staged workflow changes.");

  const remote = spawnSync("git", ["ls-remote", "--exit-code", "--heads", "origin", branch], {
    cwd: projectRoot,
    encoding: "utf8"
  });
  if (remote.status === 0) git(["pull", "--rebase", "origin", branch]);
  else if (remote.status !== 2) throw new Error(`Could not inspect remote workflow branch: ${remote.stderr.trim()}`);
  git(["push", "-u", "origin", branch]);
}

/** Returns the branch's open PR or creates it when necessary. */
export function upsertPullRequest(branch: string, title: string, body: string): { number: number; url: string } {
  const existing = gh(["pr", "list", "--head", branch, "--state", "open", "--json", "number,url"]);
  const prs = JSON.parse(existing || "[]") as { number: number; url: string }[];
  if (prs[0]) return prs[0];
  gh(["pr", "create", "--head", branch, "--base", process.env.WORKFLOW_DEFAULT_BRANCH || "main", "--title", title, "--body", body]);
  return JSON.parse(gh(["pr", "view", branch, "--json", "number,url"])) as { number: number; url: string };
}

/** Posts workflow status or review output to the run's PR. */
export function createPullRequestComment(prNumber: number, body: string): void {
  gh(["pr", "comment", String(prNumber), "--body", body]);
}

/** Removes a consumed approval label so each workflow step needs a fresh approval. */
export function removeApprovalLabel(prNumber: number): void {
  const data = JSON.parse(gh([
    "pr", "view", String(prNumber), "--json", "labels"
  ])) as { labels: { name: string }[] };
  const hasApprovalLabel = data.labels.some((label) => label.name === "workflow:approve");
  if (hasApprovalLabel) gh(["pr", "edit", String(prNumber), "--remove-label", "workflow:approve"]);
}

/** Loads merge state and timestamped approval signals for the current PR gate. */
export function getPullRequestGateData(prNumber: number): PullRequestGateData {
  const repo = process.env.WORKFLOW_REPO;
  if (!repo) throw new Error("WORKFLOW_REPO is required.");
  const pr = JSON.parse(gh([
    "pr", "view", String(prNumber), "--json", "mergedAt,updatedAt,labels,comments"
  ])) as Omit<PullRequestGateData, "events">;
  const events = JSON.parse(gh([
    "api", `repos/${repo}/issues/${prNumber}/events`, "--paginate"
  ])) as PullRequestGateData["events"];
  return { ...pr, events };
}

/** Checks out the first open workflow PR branch so Actions can resume state. */
export function resumeOpenWorkflowBranch(): boolean {
  const prs = JSON.parse(gh(["pr", "list", "--state", "open", "--json", "number,headRefName"])) as { number: number; headRefName: string }[];
  const match = prs.find((pr) => pr.headRefName.startsWith("workflow/"));
  if (!match) return false;
  gh(["pr", "checkout", String(match.number)]);
  return true;
}
