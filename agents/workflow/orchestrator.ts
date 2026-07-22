import { readActiveRunId, readState, writeActiveRunId, writeState } from "./activeRun.ts";
import { checkApproval } from "./gates/githubGate.ts";
import { commitAndPush, createPullRequestComment, createWorkflowBranch, ensureWorkflowLabels, removeApprovalLabel, resumeOpenWorkflowBranch, upsertPullRequest } from "./github.ts";
import { notificationText, sendEmail } from "./notify/email.ts";
import { mirrorToPullRequest } from "./notify/prComment.ts";
import { afterApproved, afterMerged, afterRejected, afterStepSucceeded } from "./stateMachine.ts";
import { proposeFeature } from "./steps/propose.ts";
import { runSpec } from "./steps/spec.ts";
import { runArch } from "./steps/arch.ts";
import { runImpl } from "./steps/impl.ts";
import { runReview } from "./steps/review.ts";
import { runTest } from "./steps/test.ts";
import type { RunState } from "./types.ts";

export type DailyOptions = { allowCombine?: boolean; dryRun?: boolean; idleOk?: boolean };

const stale = (state: RunState) => Date.now() - Date.parse(state.updatedAt) >= 2 * 60 * 60 * 1000;

/** Notifies the human reviewer through the workflow PR and configured email recipient. */
async function notify(state: RunState, detail: string): Promise<void> {
  const text = notificationText(state, detail);
  try {
    mirrorToPullRequest(state, text);
  } catch (error) {
    console.warn("Workflow PR notification failed:", error instanceof Error ? error.message : error);
  }
  await sendEmail(state, text);
}

async function executeStep(state: RunState): Promise<string> {
  if (state.step === "spec") return await runSpec(state);
  if (state.step === "arch") return await runArch(state);
  if (state.step === "impl") { await runImpl(state); return "Cursor implementation run completed."; }
  if (state.step === "review") return await runReview(state);
  if (state.step === "test") { await runTest(state); return "Cursor testing run completed."; }
  throw new Error(`No executor for ${state.step}.`);
}

/** Advances at most one human-gated workflow step for the active feature run. */
export async function runDaily(options: DailyOptions = {}): Promise<void> {
  let activeId = readActiveRunId();
  if (!activeId && !options.dryRun && resumeOpenWorkflowBranch()) activeId = readActiveRunId();
  if (!activeId) {
    if (options.dryRun) return console.log("Dry run: no active run; next action is propose via Cursor, then create a workflow branch and PR.");
    const created = await proposeFeature();
    if (!created) { if (!options.idleOk) console.log("No feature proposed; workflow remains idle."); return; }
    let { state } = created;
    createWorkflowBranch(state.branch);
    writeActiveRunId(state.runId);
    ensureWorkflowLabels();
    state = afterStepSucceeded(state);
    writeState(state);
    commitAndPush(state.branch, `chore(workflow): propose for ${state.featureSlug}`);
    const pr = upsertPullRequest(state.branch, `workflow: ${created.proposal.feature}`, "Daily agent workflow artifacts and implementation.");
    state.prNumber = pr.number; state.prUrl = pr.url; state.updatedAt = new Date().toISOString(); writeState(state);
    commitAndPush(state.branch, `chore(workflow): record PR for ${state.featureSlug}`);
    await notify(state, "Feature proposal is ready for review.");
    return;
  }

  let state = readState(activeId);
  if (options.dryRun) return console.log(`Dry run: ${state.status === "awaiting_approval" ? `check approval for ${state.step}` : `run ${state.step}`} on ${state.runId}.`);
  if (state.status === "running") {
    if (!stale(state)) return console.log("Workflow step is already running.");
    state.status = "failed";
    state.lastError = "Running state was stale for more than two hours.";
    state.updatedAt = new Date().toISOString();
    writeState(state);
    commitAndPush(state.branch, `chore(workflow): record stale ${state.step} failure`);
    await notify(state, state.lastError);
    return;
  }
  if (state.status === "blocked" || state.status === "failed") { await notify(state, state.lastError || `Run is ${state.status}.`); return; }
  if (state.status === "done") { writeActiveRunId(null); return; }
  if (state.status === "awaiting_approval") {
    if (!state.prNumber || !state.awaitingSince) throw new Error("Awaiting run lacks PR gate data.");
    const gate = checkApproval(state.prNumber, state.awaitingSince);
    if (gate === "waiting") { await notify(state, "Still waiting for human approval."); return; }
    if (gate === "rejected") { state = afterRejected(state); writeState(state); commitAndPush(state.branch, `chore(workflow): block ${state.featureSlug}`); await notify(state, "Run was rejected and is blocked."); return; }
    if (gate === "merged") { state = afterMerged(state); writeState(state); writeActiveRunId(null); await notify(state, "PR merged; workflow is complete."); return; }
    removeApprovalLabel(state.prNumber);
    state = afterApproved(state);
    if (state.status === "done") { writeState(state); writeActiveRunId(null); commitAndPush(state.branch, `chore(workflow): complete ${state.featureSlug}`); await notify(state, "Workflow is complete."); return; }
  }

  writeState(state);
  try {
    const detail = await executeStep(state);
    state = afterStepSucceeded(state);
    writeState(state);
    commitAndPush(state.branch, `chore(workflow): ${state.step} for ${state.featureSlug}`);
    await notify(state, detail.slice(0, 4000));
  } catch (error) {
    state.status = "failed"; state.lastError = error instanceof Error ? error.message : String(error); state.updatedAt = new Date().toISOString(); writeState(state);
    try { commitAndPush(state.branch, `chore(workflow): record ${state.step} failure`); } catch { /* preserve original failure */ }
    if (state.prNumber) createPullRequestComment(state.prNumber, `Workflow failed at ${state.step}: ${state.lastError}`);
    await sendEmail(state, notificationText(state, state.lastError));
    const failure = new Error(state.lastError); Object.assign(failure, { exitCode: 2 }); throw failure;
  }
}
