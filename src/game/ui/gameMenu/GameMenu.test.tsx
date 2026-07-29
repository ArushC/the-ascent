import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { GameControls } from "../../Game";
import type { DailyChallengeLoadState } from "../../dailyChallenge/useDailyChallenge/useDailyChallenge";
import { createFallbackChallenge } from "../../../../server/dailyChallenge/fallbackChallenge/FallbackChallenge.ts";
import { GameMenu } from "./GameMenu";

const TEST_CHALLENGE_DATE = "2026-07-17";

const CONTROLS: GameControls = {
  beginRun: vi.fn(),
  beginDailyRun: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  restart: vi.fn(),
  returnHome: vi.fn(),
  toggleHelp: vi.fn(),
  closeHelp: vi.fn(),
};

describe("GameMenu theme selector", () => {
  it("renders theme options on the ready menu", () => {
    const markup = renderReadyMenu({
      status: "loading",
      challenge: null,
      error: null,
    });

    expect(markup).toContain("Theme");
    expect(markup).toContain("Classic");
    expect(markup).toContain("Neon");
    expect(markup).toContain("Ocean");
    expect(markup.match(/class="theme-selector-swatch"/g)?.length).toBe(15);
  });
});

describe("GameMenu daily challenge CTA", () => {
  it("disables Daily Challenge until the challenge loads", () => {
    const markup = renderReadyMenu({
      status: "loading",
      challenge: null,
      error: null,
    });

    expect(markup).toContain("Daily Challenge");
    expect(markup).toContain("disabled");
  });

  it("keeps loaded daily details out of the home menu body", () => {
    const challenge = createFallbackChallenge(TEST_CHALLENGE_DATE);
    const markup = renderReadyMenu({
      status: "loaded",
      challenge,
      error: null,
    });

    expect(markup).not.toContain(challenge.title);
    expect(markup).not.toContain("disabled");
  });

  it("uses clear unavailable copy when the daily request fails", () => {
    const markup = renderReadyMenu({
      status: "error",
      challenge: null,
      error: new Error("offline"),
    });

    expect(markup).toContain("Daily challenge unavailable.");
  });

  it("adds a vs-normal hint to paused daily challenge copy", () => {
    const challenge = createFallbackChallenge(TEST_CHALLENGE_DATE);
    const markup = renderToStaticMarkup(
      <GameMenu
        phase="paused"
        score={0}
        controls={CONTROLS}
        leaderboard={{ status: "idle", entries: [] }}
        dailyChallengeState={{ status: "loaded", challenge, error: null }}
        runMode="daily"
        leaderboardTitle="Your Top Scores"
        selectedThemeId="classic"
        onThemeSelect={vi.fn()}
      />,
    );

    expect(markup).toContain("than normal.");
  });
});

function renderReadyMenu(dailyChallengeState: DailyChallengeLoadState): string {
  return renderToStaticMarkup(
    <GameMenu
      phase="ready"
      score={0}
      controls={CONTROLS}
      leaderboard={{ status: "idle", entries: [] }}
      dailyChallengeState={dailyChallengeState}
      runMode="classic"
      leaderboardTitle="Your Top Scores"
      selectedThemeId="classic"
      onThemeSelect={vi.fn()}
    />,
  );
}
