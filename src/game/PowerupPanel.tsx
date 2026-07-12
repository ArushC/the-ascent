import type { GameUiState } from "./Game";

type PowerupPanelProps = {
  panel: GameUiState["powerupPanel"];
  isPaused: boolean;
};

export function PowerupPanel({ panel, isPaused }: PowerupPanelProps) {
  if (panel.mode === "empty") return null;

  return (
    <div className={`game-powerup-panel ${isPaused ? "is-paused" : ""}`}>
      {panel.mode === "generating" ? "Generating powerup..." : panel.label}
    </div>
  );
}
