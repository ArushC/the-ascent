import { describe, expect, it } from "vitest";
import { needsLocalBranch } from "./github.ts";

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
