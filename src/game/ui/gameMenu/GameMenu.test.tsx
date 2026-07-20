import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { GameControls } from "../../Game";
import type { DailyChallengeLoadState } from "../../dailyChallenge/useDailyChallenge/useDailyChallenge";
import { createFallbackChallenge } from "../../../../server/dailyChallenge/fallbackChallenge/FallbackChallenge.ts";
import { GameMenu } from "./GameMenu";

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
    const challenge = createFallbackChallenge("2026-07-17");
    const markup = renderReadyMenu({
      status: "loaded",
      challenge,
      error: null,
    });

    expect(markup).not.toContain(challenge.title);
    expect(markup).not.toContain(challenge.blurb);
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
    />,
  );
}
