import { describe, expect, it } from "vitest";
import { formatScoreTimestamp } from "./formatScoreTimestamp";

describe("formatScoreTimestamp", () => {
  it("formats an ISO timestamp for display", () => {
    expect(formatScoreTimestamp("2026-07-12T15:30:00.000Z")).toBe(
      `${new Date("2026-07-12T15:30:00.000Z").toLocaleDateString(undefined, {
        dateStyle: "short",
      })} ${new Date("2026-07-12T15:30:00.000Z").toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`,
    );
  });

  it("returns a safe fallback for invalid timestamps", () => {
    expect(formatScoreTimestamp("not-a-date")).toBe("Unknown time");
  });
});
