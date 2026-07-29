import { describe, expect, it } from "vitest";
import { evaluateApproval } from "./gates/githubGate.ts";
const since = "2026-07-21T15:00:00.000Z";
describe("GitHub approval gate", () => {
  it("ignores stale labels", () => { expect(evaluateApproval({ events: [{ event: "labeled", created_at: "2026-07-20T15:00:00.000Z", label: { name: "workflow:approve" } }] }, since)).toBe("waiting"); });
  it("accepts fresh approval labels", () => { expect(evaluateApproval({ events: [{ event: "labeled", created_at: since, label: { name: "workflow:approve" } }] }, since)).toBe("approved"); });
  it("accepts fresh revision labels", () => { expect(evaluateApproval({ events: [{ event: "labeled", created_at: since, label: { name: "workflow:revise" } }] }, since)).toBe("revised"); });
  it("ignores stale revision labels", () => { expect(evaluateApproval({ events: [{ event: "labeled", created_at: "2026-07-20T15:00:00.000Z", label: { name: "workflow:revise" } }] }, since)).toBe("waiting"); });
  it("accepts collaborator approve comments", () => { expect(evaluateApproval({ comments: [{ body: " /approve ", createdAt: since, authorAssociation: "COLLABORATOR" }] }, since)).toBe("approved"); });
  it("rejects before approving", () => { expect(evaluateApproval({ events: [{ event: "labeled", created_at: since, label: { name: "workflow:reject" } }, { event: "labeled", created_at: since, label: { name: "workflow:approve" } }] }, since)).toBe("rejected"); });
  it("rejects before revising", () => { expect(evaluateApproval({ events: [{ event: "labeled", created_at: since, label: { name: "workflow:reject" } }, { event: "labeled", created_at: since, label: { name: "workflow:revise" } }] }, since)).toBe("rejected"); });
  it("revises before approving", () => { expect(evaluateApproval({ events: [{ event: "labeled", created_at: since, label: { name: "workflow:revise" } }, { event: "labeled", created_at: since, label: { name: "workflow:approve" } }] }, since)).toBe("revised"); });
  it("treats merge as terminal", () => { expect(evaluateApproval({ mergedAt: since }, since)).toBe("merged"); });
  it("treats merge as terminal over revision", () => { expect(evaluateApproval({ mergedAt: since, events: [{ event: "labeled", created_at: since, label: { name: "workflow:revise" } }] }, since)).toBe("merged"); });
});
