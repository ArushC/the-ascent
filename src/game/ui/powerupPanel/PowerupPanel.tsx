import type { GameUiState } from "../../Game";
import "./PowerupPanel.css";

type PowerupPanelProps = {
  panel: GameUiState["powerupPanel"];
  isPaused: boolean;
};

export function PowerupPanel({ panel, isPaused }: PowerupPanelProps) {
  if (panel.mode === "empty") return null;

  return (
    <div className={`game-powerup-panel ${isPaused ? "is-paused" : ""}`}>
      {panel.mode === "generating" ? (
        <div className="game-powerup-generating">
          <span className="game-powerup-generating-label">
            Generating new powerup...
          </span>
          <PowerupProgressBar progress={panel.progress} />
        </div>
      ) : (
        panel.label
      )}
    </div>
  );
}

type PowerupProgressBarProps = {
  progress: number;
};

function PowerupProgressBar({ progress }: PowerupProgressBarProps) {
  return (
    <div
      className="game-powerup-progress"
      role="progressbar"
      aria-label="Powerup generation progress"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={progress}
    >
      <div
        className="game-powerup-progress-fill"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
