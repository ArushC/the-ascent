import { describe, expect, it } from "vitest";
import { appendRevisionFeedback } from "./revisionPrompt.ts";
import type { RunState } from "./types.ts";

const state = { revisionFeedback: null } as RunState;

describe("appendRevisionFeedback", () => {
  it("leaves prompts unchanged without feedback", () => {
    expect(appendRevisionFeedback("Base prompt", state)).toBe("Base prompt");
  });

  it("appends trimmed human feedback", () => {
    expect(appendRevisionFeedback("Base prompt", { ...state, revisionFeedback: "  Fix the title.  " }))
      .toContain("## Human revision feedback\n");
    expect(appendRevisionFeedback("Base prompt", { ...state, revisionFeedback: "  Fix the title.  " }))
      .toContain("Fix the title.");
  });
});
