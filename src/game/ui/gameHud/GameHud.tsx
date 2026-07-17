import type { GamePhase, GameUiState } from "../../Game";
import { PowerupPanel } from "../powerupPanel/PowerupPanel";

type GameHudProps = {
  phase: GamePhase;
  runMode: GameUiState["runMode"];
  dailyTitle: GameUiState["dailyTitle"];
  score: number;
  powerupPanel: GameUiState["powerupPanel"];
  onOpenMenu: () => void;
};

const MENU_ICON = "☰";

export function GameHud({
  phase,
  runMode,
  dailyTitle,
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
        dailyTitle={runMode === "daily" ? dailyTitle : null}
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
  dailyTitle: string | null;
  isPaused: boolean;
  canOpenMenu: boolean;
  onOpenMenu: () => void;
};

function GameStatusBar({
  score,
  dailyTitle,
  isPaused,
  canOpenMenu,
  onOpenMenu,
}: GameStatusBarProps) {
  return (
    <div className={`game-hud ${isPaused ? "is-paused" : ""}`}>
      <div className="game-score">
        <div>Score: {score}</div>
        {dailyTitle ? (
          <div className="game-daily-title">Daily · {dailyTitle}</div>
        ) : null}
      </div>
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
