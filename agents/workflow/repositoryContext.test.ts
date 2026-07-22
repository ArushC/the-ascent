import { describe, expect, it } from "vitest";
import { buildRepositoryContext, rankRelevantFiles } from "./repositoryContext.ts";

describe("repository context", () => {
  it("prioritizes feature terms in file paths and contents", () => {
    const ranked = rankRelevantFiles("palette preview", [
      { path: "src/game.ts", content: "movement and collision" },
      { path: "src/themeMenu.tsx", content: "render a palette preview" },
      { path: "src/colors.css", content: "palette variables" }
    ]);
    expect(ranked.map((file) => file.path)).toEqual(["src/themeMenu.tsx", "src/colors.css"]);
  });

  it("includes real repository metadata within the prompt budget", () => {
    const context = buildRepositoryContext("palette preview color scheme");
    expect(context).toContain("Existing repository — do not recreate implemented systems");
    expect(context).toContain("package.json");
    expect(context).toContain("Tracked files");
    expect(context.length).toBeLessThanOrEqual(24_000);
  });
});
