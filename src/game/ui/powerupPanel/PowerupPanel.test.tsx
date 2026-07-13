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
        panel={{ mode: "ready", label: "F: toggle size", armed: false }}
        isPaused={false}
      />,
    );

    expect(markup).toContain("F: toggle size");
  });

  it("shows the armed Big Shot treatment", () => {
    const markup = renderToStaticMarkup(
      <PowerupPanel
        panel={{ mode: "ready", label: "B: toggle big shot", armed: true }}
        isPaused={false}
      />,
    );

    expect(markup).toContain("is-armed");
    expect(markup).toContain("game-powerup-shot-glyph");
    expect(markup).toContain("BIG SHOT ARMED");
    expect(markup).toContain("B: toggle off");
    expect(markup).not.toContain("B: toggle big shot");
  });

  it("shows the ready fallback label", () => {
    const markup = renderToStaticMarkup(
      <PowerupPanel
        panel={{
          mode: "ready",
          label: "No powerups found",
          armed: false,
        }}
        isPaused={false}
      />,
    );

    expect(markup).toContain("No powerups found");
  });
});
