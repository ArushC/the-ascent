import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type Agent = {
  template: string;
  description: string;
  params: string[];
  cursorMode: string;
  gather: string[];
  defaultOut: string | null;
};

type CliOptions = {
  command?: string;
  paramsPath?: string;
  outPath?: string;
  copy: boolean;
  help: boolean;
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "agents/manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Record<string, Agent>;
let terminal: ReturnType<typeof readline.createInterface> | undefined;
const pipedAnswers = input.isTTY ? undefined : readFileSync(0, "utf8").split(/\r?\n/);
let pipedAnswerIndex = 0;

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { copy: false, help: false };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--help") options.help = true;
    else if (arg === "--copy") options.copy = true;
    else if (arg === "--params" && next) {
      options.paramsPath = next;
      index += 1;
    } else if (arg === "--out" && next) {
      options.outPath = next;
      index += 1;
    } else if (!arg.startsWith("--") && !options.command) {
      options.command = arg;
    }
  }

  return options;
}

function printHelp(): void {
  console.log("AI Workflow commands:\n");
  for (const [key, agent] of Object.entries(manifest)) {
    console.log(`  ${key.padEnd(8)} ${agent.description} (${agent.cursorMode})`);
  }
  console.log("  feature  Start a feature and create its params file (mixed)");
  console.log("\nFlags: --params path.json  --out path  --copy  --help");
}

async function ask(message: string): Promise<string> {
  if (pipedAnswers) {
    if (pipedAnswerIndex >= pipedAnswers.length) throw new Error(`Missing input for ${message}`);
    const answer = pipedAnswers[pipedAnswerIndex].trim();
    pipedAnswerIndex += 1;
    output.write(`${message}${answer}\n`);
    return answer;
  }

  terminal ??= readline.createInterface({ input, output });
  return (await terminal.question(message)).trim();
}

function closeTerminal(): void {
  terminal?.close();
}

async function chooseCommand(): Promise<string | undefined> {
  console.log("AI Workflow - pick a step:");
  Object.entries(manifest).forEach(([key, agent], index) => {
    console.log(`  ${index + 1}) ${key.padEnd(10)} ${agent.description}`);
  });
  console.log("  8) feature    Start a feature and create its params file");
  console.log("  q) quit");

  const choice = await ask("Choice: ");
  if (choice.toLowerCase() === "q") return undefined;
  if (choice === "8" || choice === "feature") return "feature";

  const keys = Object.keys(manifest);
  return keys[Number(choice) - 1] ?? (manifest[choice] ? choice : undefined);
}

function readParams(paramsPath?: string): Record<string, string> {
  if (!paramsPath) return {};
  return JSON.parse(readFileSync(resolve(root, paramsPath), "utf8")) as Record<string, string>;
}

async function addGatheredContext(agent: Agent, params: Record<string, string>): Promise<void> {
  for (const hook of agent.gather) {
    if (hook === "git-diff" && !params.DIFF) params.DIFF = readGitDiff();
    else if (hook === "test-output" && !params.LOGS) params.LOGS = readTestOutput();
    else if (hook.startsWith("read-file:")) await readFileParam(hook, params);
  }
}

function readGitDiff(): string {
  const staged = execFileSync("git", ["diff", "--staged", "--", "."], { cwd: root }).toString();
  const unstaged = execFileSync("git", ["diff", "--", "."], { cwd: root }).toString();
  return [staged, unstaged].filter(Boolean).join("\n") || "(No staged or unstaged git diff found.)";
}

function readTestOutput(): string {
  const result = spawnSync("npm", ["run", "test:run"], { cwd: root, encoding: "utf8" });
  return [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
}

async function readFileParam(hook: string, params: Record<string, string>): Promise<void> {
  const key = hook.slice("read-file:".length);
  if (params[key]) return;

  const path = await ask(`Path for ${key} (blank to paste manually): `);
  if (path) params[key] = readFileSync(resolve(root, path), "utf8");
}

async function askForMissingParams(keys: string[], params: Record<string, string>): Promise<void> {
  for (const key of keys) {
    if (!params[key]) params[key] = await ask(`${key}: `);
  }
}

function render(command: string, params: Record<string, string>): string {
  const agent = manifest[command];
  const template = readFileSync(resolve(root, agent.template), "utf8");
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key: string) => params[key] ?? "");
}

function writeOutput(text: string, options: CliOptions): void {
  if (options.outPath) {
    writeFileSync(resolve(root, options.outPath), text);
    console.log(`Wrote ${options.outPath}`);
  } else {
    console.log(text);
  }

  if (options.copy) copyToClipboard(text);
}

function copyToClipboard(text: string): void {
  try {
    execFileSync("pbcopy", { input: text });
    console.error("Copied prompt to clipboard.");
  } catch {
    console.error("Could not copy with pbcopy. Copy the prompt from the terminal instead.");
  }
}

async function renderCommand(command: string, options: CliOptions): Promise<void> {
  const agent = manifest[command];
  if (!agent) throw new Error(`Unknown command: ${command}`);

  const params = readParams(options.paramsPath);
  await addGatheredContext(agent, params);
  await askForMissingParams(agent.params, params);
  writeOutput(render(command, params), options);
}

async function startFeature(options: CliOptions): Promise<void> {
  const feature = await ask("Feature name: ");
  const requirements = await ask("Requirements: ");
  const slugInput = await ask("File slug (blank to generate): ");
  const slug = slugInput || slugify(feature);
  const paramsPath = `agents/params/${slug}.json`;
  const absoluteParamsPath = resolve(root, paramsPath);

  if (existsSync(absoluteParamsPath)) throw new Error(`${paramsPath} already exists.`);

  mkdirSync(dirname(absoluteParamsPath), { recursive: true });
  writeFileSync(absoluteParamsPath, JSON.stringify(createFeatureParams(feature, requirements), null, 2) + "\n");

  const archPrompt = render("arch", { FEATURE: feature, REQUIREMENTS: requirements });
  console.log(`Created ${paramsPath}\n`);
  console.log("Next: paste this prompt into Cursor Plan mode.\n");
  console.log(`To regenerate it later:\nnpm run ai:arch -- --params ${paramsPath} --copy\n`);
  writeOutput(archPrompt, { ...options, outPath: undefined });
}

function createFeatureParams(feature: string, requirements: string): Record<string, string> {
  return {
    PROJECT: "Doodle Jump clone in React, TypeScript, and Canvas",
    FEATURE: feature,
    REQUIREMENTS: requirements,
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "feature";
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return printHelp();

  const command = options.command ?? (await chooseCommand());
  if (!command) return;
  if (command === "feature") return startFeature(options);

  await renderCommand(command, options);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeTerminal);
