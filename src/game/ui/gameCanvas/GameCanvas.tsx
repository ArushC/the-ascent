import { useEffect, useRef, useState } from "react";
import { Game, type GameUiState } from "../../Game";
import type { GameControls } from "../../Game";
import { GameHud } from "../gameHud/GameHud";
import { HelpMenu } from "../helpMenu/HelpMenu";
import { GameMenu, type GameMenuPhase } from "../gameMenu/GameMenu";
import { getOrCreatePlayerId } from "../../leaderboard/playerIdentity/playerIdentity";
import { useGameOverLeaderboard } from "../../leaderboard/useGameOverLeaderboard/useGameOverLeaderboard";
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
  const [ui, setUi] = useState<GameUiState>({
    phase: "ready",
    score: 0,
    powerupPanel: { mode: "empty" },
    helpOpen: false,
  });
  const { leaderboard } = useGameOverLeaderboard({
    phase: ui.phase,
    playerId,
    score: ui.score,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const game = new Game(canvas, ctx, setUi);

    setUiControls({
      beginRun: () => game.beginRun(),
      pause: () => game.pause(),
      resume: () => game.resume(),
      restart: () => game.restart(),
      toggleHelp: () => game.toggleHelp(),
      closeHelp: () => game.closeHelp(),
    });

    game.start();

    return () => {
      game.stop();
      setUiControls(null);
    };
  }, []);

  const menuPhase: GameMenuPhase | null =
    ui.phase === "playing" ? null : ui.phase;

  return (
    <div className="game-shell" style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} />
      {uiControls ? (
        <GameHud
          phase={ui.phase}
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
        />
      ) : null}
      {ui.helpOpen && uiControls ? (
        <HelpMenu onClose={() => uiControls.closeHelp()} />
      ) : null}
    </div>
  );
}
