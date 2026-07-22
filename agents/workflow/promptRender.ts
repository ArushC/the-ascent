import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Configuration for one prompt command in agents/manifest.json. */
export type AgentManifestEntry = {
  /** Repository-relative Markdown template rendered for this command. */
  template: string;
  /** Short command description shown by the interactive CLI. */
  description: string;
  /** Parameter keys that the manual CLI must collect before rendering. */
  params: string[];
  /** Recommended Cursor UI mode for the manual prompt workflow. */
  cursorMode: string;
  /** Context collectors, such as git-diff, run before manual rendering. */
  gather: string[];
  /** Optional default output path; null prints the prompt to stdout. */
  defaultOut: string | null;
  /** Service responsible for this command in the automated workflow. */
  executor: string;
  /** Whether automation must wait for human approval after this command. */
  needsApproval: boolean;
};
export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/** Loads command metadata shared by the manual CLI and daily workflow. */
export function loadManifest(): Record<string, AgentManifestEntry> {
  return JSON.parse(readFileSync(resolve(projectRoot, "agents/manifest.json"), "utf8"));
}

/** Substitutes uppercase prompt placeholders, leaving missing values empty. */
export function renderTemplate(template: string, params: Record<string, string>): string {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key: string) => params[key] ?? "");
}

/** Loads and renders a manifest command's prompt template. */
export function renderPrompt(command: string, params: Record<string, string>): string {
  const agent = loadManifest()[command];
  if (!agent) throw new Error(`Unknown command: ${command}`);
  return renderTemplate(readFileSync(resolve(projectRoot, agent.template), "utf8"), params);
}

/** Loads a feature parameter file relative to the repository root. */
export function readParams(path: string): Record<string, string> {
  return JSON.parse(readFileSync(resolve(projectRoot, path), "utf8"));
}

/** Reads either the selected PR diff or the current local Git diff. */
export function gatherGitDiff(prNumber?: number | null): string {
  if (prNumber) return execFileSync("gh", ["pr", "diff", String(prNumber)], { cwd: projectRoot, encoding: "utf8" });
  const staged = execFileSync("git", ["diff", "--staged", "--", "."], { cwd: projectRoot, encoding: "utf8" });
  const unstaged = execFileSync("git", ["diff", "--", "."], { cwd: projectRoot, encoding: "utf8" });
  return [staged, unstaged].filter(Boolean).join("\n") || "(No git diff found.)";
}

/** Runs the project's tests and returns combined output for prompt context. */
export function gatherTestOutput(): string {
  const result = spawnSync("npm", ["run", "test:run"], { cwd: projectRoot, encoding: "utf8" });
  return [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
}
