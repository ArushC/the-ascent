import type { RunState } from "../types.ts";

/** Builds the plain-text notification shared by email and the workflow PR. */
export function notificationText(state: RunState, detail: string): string {
  const heading = `${state.step} is ${state.status} for ${state.featureSlug}`;
  const reviewInstructions = state.status === "awaiting_approval"
    ? "\nApprove with the workflow:approve label or a /approve collaborator comment. Reject with workflow:reject."
    : "";
  return `${heading}\n\n${detail}\n\nPR: ${state.prUrl ?? "not created"}${reviewInstructions}`;
}

/** Sends a best-effort Resend notification without failing a completed step. */
export async function sendEmail(state: RunState, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return console.warn("RESEND_API_KEY is missing; skipping workflow email.");
  const to = process.env.WORKFLOW_EMAIL_TO?.trim();
  const from = process.env.WORKFLOW_EMAIL_FROM?.trim();
  if (!to || !from) return console.warn("Workflow email sender or recipient is missing; skipping workflow email.");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `workflow-${state.runId}-${state.step}-${state.awaitingSince}`
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[Ascent workflow] ${state.step} ${state.status}: ${state.featureSlug}`,
        text
      })
    });
    if (!response.ok) console.warn(`Workflow email failed (${response.status}): ${await response.text()}`);
  } catch (error) {
    console.warn("Workflow email failed:", error instanceof Error ? error.message : error);
  }
}
