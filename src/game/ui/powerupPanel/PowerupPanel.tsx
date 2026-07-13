import clsx from "clsx";
import type { PowerupPanelState } from "../../powerups/powerupPanelState/powerupPanelState";
import "./PowerupPanel.css";

type PowerupPanelProps = {
  panel: PowerupPanelState;
  isPaused: boolean;
};

export function PowerupPanel({ panel, isPaused }: PowerupPanelProps) {
  if (panel.mode === "empty") return null;

  const isArmed = panel.mode === "ready" && panel.armed;

  return (
    <div
      className={clsx("game-powerup-panel", {
        "is-paused": isPaused,
        "is-armed": isArmed,
      })}
    >
      {panel.mode === "generating" ? (
        <div className="game-powerup-generating">
          <span className="game-powerup-generating-label">
            Generating new powerup...
          </span>
          <PowerupProgressBar progress={panel.progress} />
        </div>
      ) : isArmed ? (
        <div className="game-powerup-armed">
          <span className="game-powerup-shot-glyph" aria-hidden="true" />
          <span className="game-powerup-armed-copy">
            <span className="game-powerup-armed-label">BIG SHOT ARMED</span>
            <span className="game-powerup-armed-hint">B: toggle off</span>
          </span>
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
