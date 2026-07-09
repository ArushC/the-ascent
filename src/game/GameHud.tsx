import type { GamePhase } from "./Game";

type GameHudProps = {
  phase: GamePhase;
  score: number;
  onOpenMenu: () => void;
};

const MENU_ICON = "☰";

export function GameHud({ phase, score, onOpenMenu }: GameHudProps) {
  if (phase === "ready" || phase === "over") return null;

  return (
    <div className={`game-hud ${phase === "paused" ? "is-paused" : ""}`}>
      <div className="game-score">Score: {score}</div>
      <button
        className="game-icon-button"
        type="button"
        aria-label="Open pause menu"
        onClick={onOpenMenu}
        disabled={phase !== "playing"}
      >
        {MENU_ICON}
      </button>
    </div>
  );
}
