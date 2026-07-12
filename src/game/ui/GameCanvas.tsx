import { useEffect, useRef, useState } from "react";
import { Game, type GameUiState } from "../Game";
import type { GameControls } from "../GameControls";
import { GameHud } from "./GameHud";
import { GameMenu, type GameMenuPhase } from "./GameMenu";
import { PlayerNamePrompt } from "./PlayerNamePrompt";
import {
  getOrCreatePlayerId,
  getPlayerName,
  setPlayerName,
} from "../playerIdentity";
import { useGameOverLeaderboard } from "../useGameOverLeaderboard";
import "./game-ui.css";

type GameCanvasProps = {
  width: number;
  height: number;
};

export function GameCanvas({ width, height }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uiControls, setUiControls] = useState<GameControls | null>(null);
  const [playerId] = useState(() => getOrCreatePlayerId());
  const [playerName, setPlayerNameState] = useState<string | null>(() =>
    getPlayerName(),
  );
  const [ui, setUi] = useState<GameUiState>({
    phase: "ready",
    score: 0,
    powerupPanel: { mode: "empty" },
  });
  const { personalBest, leaderboard } = useGameOverLeaderboard({
    phase: ui.phase,
    playerId,
    playerName,
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
    });

    game.start();

    return () => {
      game.stop();
      setUiControls(null);
    };
  }, []);

  const menuPhase: GameMenuPhase | null =
    ui.phase === "playing" ? null : ui.phase;

  function handlePlayerNameSubmit(nextPlayerName: string): void {
    setPlayerName(nextPlayerName);
    setPlayerNameState(nextPlayerName);
  }

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
          personalBest={personalBest}
          leaderboard={leaderboard}
        />
      ) : null}
      {ui.phase === "over" && !playerName ? (
        <PlayerNamePrompt onSubmit={handlePlayerNameSubmit} />
      ) : null}
    </div>
  );
}
