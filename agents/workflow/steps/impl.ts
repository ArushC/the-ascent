import { readParams, renderPrompt } from "../promptRender.ts";
import { runCursorAgent } from "../cursorAgent.ts";
import type { RunState } from "../types.ts";

/** Starts Cursor implementation only when approved architecture is available. */
export async function runImpl(state: RunState): Promise<void> {
  const params = readParams(state.paramsPath);
  if (!params.ARCHITECTURE?.trim() || params.ARCHITECTURE.startsWith("Paste approved")) {
    throw new Error("Implementation requires approved architecture in params.ARCHITECTURE.");
  }
  const ids = await runCursorAgent(renderPrompt("impl", params), state);
  state.cursorAgentId = ids.agentId;
  state.lastCursorRunId = ids.runId;
}
