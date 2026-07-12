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
      <PowerupPanel panel={{ mode: "generating" }} isPaused={false} />,
    );

    expect(markup).toContain("Generating powerup...");
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
