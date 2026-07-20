import { useEffect, useRef, useState } from "react";
import { Game, type GameUiState } from "../../Game";
import type { GameControls } from "../../Game";
import { AscensionBanner } from "../ascensionBanner/AscensionBanner";
import { GameHud } from "../gameHud/GameHud";
import { HelpMenu } from "../helpMenu/HelpMenu";
import { GameMenu, type GameMenuPhase } from "../gameMenu/GameMenu";
import { getOrCreatePlayerId } from "../../leaderboard/playerIdentity/playerIdentity";
import { useGameOverLeaderboard } from "../../leaderboard/useGameOverLeaderboard/useGameOverLeaderboard";
import { useDailyChallenge } from "../../dailyChallenge/useDailyChallenge/useDailyChallenge";
import "./game-ui.css";

type GameCanvasProps = {
  width: number;
  height: number;
};

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export function GameCanvas({ width, height }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uiControls, setUiControls] = useState<GameControls | null>(null);
  const [playerId] = useState(() => getOrCreatePlayerId());
  const [ascensionBannerDismissed, setAscensionBannerDismissed] =
    useState(false);
  const dailyChallengeState = useDailyChallenge();
  const [ui, setUi] = useState<GameUiState>({
    phase: "ready",
    runMode: "classic",
    dailyTitle: null,
    dailyChallengeDate: null,
    score: 0,
    powerupPanel: { mode: "empty" },
    helpOpen: false,
    ascension: {
      voidActive: false,
      messageReady: false,
    },
  });
  const { leaderboard } = useGameOverLeaderboard({
    phase: ui.phase,
    playerId,
    score: ui.score,
    mode: ui.runMode,
    challengeDate: ui.dailyChallengeDate,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const game = new Game(canvas, ctx, setUi);

    setUiControls({
      beginRun: () => game.beginRun(),
      beginDailyRun: (challenge) => game.beginDailyRun(challenge),
      pause: () => game.pause(),
      resume: () => game.resume(),
      restart: () => game.restart(),
      returnHome: () => game.returnHome(),
      toggleHelp: () => game.toggleHelp(),
      closeHelp: () => game.closeHelp(),
    });

    game.start();

    return () => {
      game.stop();
      setUiControls(null);
    };
  }, []);

  useEffect(() => {
    if (!ui.ascension.voidActive) {
      setAscensionBannerDismissed(false);
    }
  }, [ui.ascension.voidActive]);

  const menuPhase: GameMenuPhase | null =
    ui.phase === "playing" ? null : ui.phase;

  return (
    <div className="game-shell" style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} />
      {uiControls ? (
        <GameHud
          phase={ui.phase}
          runMode={ui.runMode}
          dailyTitle={ui.dailyTitle}
          score={ui.score}
          powerupPanel={ui.powerupPanel}
          onOpenMenu={() => uiControls.pause()}
        />
      ) : null}
      {menuPhase && uiControls ? (
        <GameMenu
          phase={menuPhase}
          score={ui.score}
          controls={uiControls}
          leaderboard={leaderboard}
          dailyChallengeState={dailyChallengeState}
          runMode={ui.runMode}
          leaderboardTitle={
            ui.runMode === "daily" ? "Today’s Daily Runs" : "Your Top Scores"
          }
        />
      ) : null}
      {ui.helpOpen && uiControls ? (
        <HelpMenu onClose={() => uiControls.closeHelp()} />
      ) : null}
      {ui.ascension.messageReady && !ascensionBannerDismissed ? (
        <AscensionBanner onDismiss={() => setAscensionBannerDismissed(true)} />
      ) : null}
    </div>
  );
}
