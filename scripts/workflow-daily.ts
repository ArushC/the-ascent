import { runDaily } from "../agents/workflow/orchestrator.ts";

const args = new Set(process.argv.slice(2));
runDaily({
  allowCombine: args.has("--allow-combine") || process.env.ALLOW_COMBINE === "true",
  dryRun: args.has("--dry-run"),
  idleOk: args.has("--idle-ok")
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = typeof error === "object" && error && "exitCode" in error
    ? Number(error.exitCode)
    : 1;
});
