import { describe, expect, it } from "vitest";
import { parseProposal, parseProposalResponse } from "./steps/propose.ts";

describe("proposal validation", () => {
  it("accepts the expected structured proposal", () => {
    expect(parseProposal({
      feature: "Palette preview",
      requirements: "Preview each existing theme palette.",
      size: "small",
      slug: "palette-preview"
    })).toMatchObject({ feature: "Palette preview", size: "small" });
  });

  it("rejects malformed feature values with a clear error", () => {
    expect(() => parseProposal({
      feature: { title: "Palette preview" },
      requirements: "Preview palettes.",
      size: "small",
      slug: "palette-preview"
    })).toThrow("Proposal feature must be a non-empty string.");
  });

  it("extracts JSON from a Cursor response", () => {
    expect(parseProposalResponse('```json\n{"feature":"Palette preview","requirements":"Preview themes","size":"small","slug":"palette-preview"}\n```'))
      .toMatchObject({ feature: "Palette preview", slug: "palette-preview" });
  });

  it("rejects Cursor responses without JSON", () => {
    expect(() => parseProposalResponse("I could not choose a feature.")).toThrow(
      "Cursor proposal did not contain a JSON object."
    );
  });
});
