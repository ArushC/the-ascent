import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PowerupPanel } from "./PowerupPanel";

describe("PowerupPanel", () => {
  it("renders nothing when the slot is empty", () => {
    const markup = renderToStaticMarkup(
      <PowerupPanel panel={{ mode: "empty" }} isPaused={false} />,
    );

    expect(markup).toBe("");
  });

  it("shows the generating state", () => {
    const markup = renderToStaticMarkup(
      <PowerupPanel
        panel={{ mode: "generating", progress: 0.4 }}
        isPaused={false}
      />,
    );

    expect(markup).toContain("Generating new powerup...");
    expect(markup).toContain('role="progressbar"');
    expect(markup).toContain('aria-valuenow="0.4"');
    expect(markup).toContain("width:40%");
  });

  it("shows the ready powerup hint", () => {
    const markup = renderToStaticMarkup(
      <PowerupPanel
        panel={{ mode: "ready", label: "F: toggle size" }}
        isPaused={false}
      />,
    );

    expect(markup).toContain("F: toggle size");
  });

  it("shows the ready fallback label", () => {
    const markup = renderToStaticMarkup(
      <PowerupPanel
        panel={{ mode: "ready", label: "No powerups found" }}
        isPaused={false}
      />,
    );

    expect(markup).toContain("No powerups found");
  });
});
