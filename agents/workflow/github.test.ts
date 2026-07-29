import { describe, expect, it } from "vitest";
import { formatRevisionComments, needsLocalBranch } from "./github.ts";

describe("needsLocalBranch", () => {
  it("requires a local branch when HEAD is detached", () => {
    expect(needsLocalBranch("workflow/feature", "HEAD")).toBe(true);
  });

  it("requires a local branch when on a different branch", () => {
    expect(needsLocalBranch("workflow/feature", "main")).toBe(true);
  });

  it("skips checkout when already on the workflow branch", () => {
    expect(needsLocalBranch("workflow/feature", "workflow/feature")).toBe(false);
  });
});

describe("formatRevisionComments", () => {
  const since = "2026-07-29T10:00:00.000Z";

  it("formats collaborator issue and inline comments from the gate boundary", () => {
    const output = formatRevisionComments([
      { body: "Clarify the rules.", createdAt: since, authorAssociation: "MEMBER", author: "alice" },
      { body: "Handle null here.", createdAt: "2026-07-29T10:01:00.000Z", authorAssociation: "COLLABORATOR", author: "bob", path: "src/game.ts", line: 12 }
    ], since);
    expect(output).toContain("## Revision feedback from PR review");
    expect(output).toContain("Comment by alice");
    expect(output).toContain("src/game.ts:12");
    expect(output).toContain("Clarify the rules.");
    expect(output).toContain("Handle null here.");
  });

  it("excludes stale, bot, workflow notification, approve, and outsider comments", () => {
    const output = formatRevisionComments([
      { body: "Old", createdAt: "2026-07-29T09:59:59.999Z", authorAssociation: "MEMBER", author: "alice" },
      { body: "Bot-authored", createdAt: since, authorAssociation: "MEMBER", author: "github-actions[bot]" },
      { body: "spec is awaiting_approval for feature", createdAt: since, authorAssociation: "OWNER", author: "alice" },
      { body: "Workflow failed at spec: timeout", createdAt: since, authorAssociation: "OWNER", author: "alice" },
      { body: " /approve ", createdAt: since, authorAssociation: "OWNER", author: "alice" },
      { body: "Untrusted", createdAt: since, authorAssociation: "NONE", author: "eve" }
    ], since);
    expect(output).toBe("");
  });

  it("formats inline comments without a current line number", () => {
    const output = formatRevisionComments([
      { body: "This deleted line needs another approach.", createdAt: since, authorAssociation: "OWNER", author: "alice", path: "src/old.ts", line: null }
    ], since);
    expect(output).toContain("inline on src/old.ts");
    expect(output).not.toContain("src/old.ts:null");
  });
});
