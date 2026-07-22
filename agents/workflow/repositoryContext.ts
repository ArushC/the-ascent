import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { projectRoot } from "./promptRender.ts";

const MAX_CONTEXT_CHARS = 24_000;
const MAX_EXCERPT_CHARS = 2_500;
const MAX_RELEVANT_FILES = 5;
const TEXT_EXTENSIONS = new Set([".css", ".json", ".md", ".ts", ".tsx"]);
const IGNORED_WORDS = new Set(["about", "add", "after", "before", "feature", "from", "into", "small", "that", "the", "this", "with"]);

type RepositoryFile = { path: string; content: string };

function truncate(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit)}\n…[truncated]`;
}

function queryTerms(query: string): string[] {
  return [...new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? [])]
    .filter((word) => word.length >= 4 && !IGNORED_WORDS.has(word));
}

/** Ranks repository files by occurrences of feature terms in their paths and contents. */
export function rankRelevantFiles(query: string, files: RepositoryFile[]): RepositoryFile[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  return files
    .map((file) => {
      const path = file.path.toLowerCase();
      const content = file.content.toLowerCase();
      const score = terms.reduce((total, term) => {
        const pathMatches = path.split(term).length - 1;
        const contentMatches = content.split(term).length - 1;
        return total + pathMatches * 10 + Math.min(contentMatches, 10);
      }, 0);
      return { ...file, score };
    })
    .filter((file) => file.score > 0)
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
    .slice(0, MAX_RELEVANT_FILES)
    .map(({ path, content }) => ({ path, content }));
}

/** Builds bounded repository context for Groq planning and review prompts. */
export function buildRepositoryContext(query: string): string {
  const trackedFiles = execFileSync("git", ["ls-files"], { cwd: projectRoot, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
  const readableFiles = trackedFiles
    .filter((path) => TEXT_EXTENSIONS.has(extname(path)) && path !== "package-lock.json" && !path.startsWith("agents/runs/"))
    .map((path) => ({ path, content: readFileSync(resolve(projectRoot, path), "utf8") }));
  const relevantFiles = rankRelevantFiles(query, readableFiles);
  const readOptional = (path: string, limit: number) => {
    const absolutePath = resolve(projectRoot, path);
    return existsSync(absolutePath) ? truncate(readFileSync(absolutePath, "utf8"), limit) : "(not present)";
  };
  const recentCommits = execFileSync("git", ["log", "-5", "--oneline"], {
    cwd: projectRoot,
    encoding: "utf8"
  });
  const excerpts = relevantFiles.length > 0
    ? relevantFiles.map((file) => `### ${file.path}\n${truncate(file.content, MAX_EXCERPT_CHARS)}`).join("\n\n")
    : "(No files matched the feature terms; use the tracked-file inventory.)";
  const context = [
    "## Existing repository — do not recreate implemented systems",
    `### package.json\n${readOptional("package.json", 2_500)}`,
    `### README.md\n${readOptional("README.md", 3_000)}`,
    `### Recent commits\n${truncate(recentCommits, 1_500)}`,
    `### Tracked files\n${truncate(trackedFiles.join("\n"), 6_000)}`,
    `### Feature-relevant excerpts\n${excerpts}`
  ].join("\n\n");
  return truncate(context, MAX_CONTEXT_CHARS);
}
