import type { GamePhase, GameUiState } from "../../Game";
import { PowerupPanel } from "../powerupPanel/PowerupPanel";

type GameHudProps = {
  phase: GamePhase;
  score: number;
  powerupPanel: GameUiState["powerupPanel"];
  onOpenMenu: () => void;
};

const MENU_ICON = "☰";

export function GameHud({
  phase,
  score,
  powerupPanel,
  onOpenMenu,
}: GameHudProps) {
  if (phase === "ready" || phase === "over") return null;

  const isPaused = phase === "paused";

  return (
    <>
      <GameStatusBar
        score={score}
        isPaused={isPaused}
        canOpenMenu={phase === "playing"}
        onOpenMenu={onOpenMenu}
      />
      <PowerupPanel panel={powerupPanel} isPaused={isPaused} />
    </>
  );
}

type GameStatusBarProps = {
  score: number;
  isPaused: boolean;
  canOpenMenu: boolean;
  onOpenMenu: () => void;
};

function GameStatusBar({
  score,
  isPaused,
  canOpenMenu,
  onOpenMenu,
}: GameStatusBarProps) {
  return (
    <div className={`game-hud ${isPaused ? "is-paused" : ""}`}>
      <div className="game-score">Score: {score}</div>
      <button
        className="game-icon-button"
        type="button"
        aria-label="Open pause menu"
        onClick={onOpenMenu}
        disabled={!canOpenMenu}
      >
        {MENU_ICON}
      </button>
    </div>
  );
}
