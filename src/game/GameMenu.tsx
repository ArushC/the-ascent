import type { GamePhase } from "./Game";
import type { GameControls } from "./GameControls";
import { Leaderboard } from "./Leaderboard";
import { renderPersonalBestText } from "./leaderboardMenu";
import type { LeaderboardState, PersonalBestState } from "./leaderboardState";
import "./leaderboard-ui.css";

export type GameMenuPhase = Exclude<GamePhase, "playing">;

type GameMenuProps = {
  phase: GameMenuPhase;
  score: number;
  controls: GameControls;
  personalBest: PersonalBestState;
  leaderboard: LeaderboardState;
};

type GameMenuAction = {
  label: string;
  control: keyof GameControls;
};

const MENU_TITLES: Record<GameMenuPhase, string> = {
  ready: "Doodle Jump AI",
  paused: "Paused",
  over: "Game Over",
};

const MENU_ACTIONS: Record<GameMenuPhase, GameMenuAction[]> = {
  ready: [{ label: "Start", control: "beginRun" }],
  paused: [
    { label: "Resume", control: "resume" },
    { label: "Restart", control: "restart" },
  ],
  over: [{ label: "Restart", control: "restart" }],
};

export function GameMenu({
  phase,
  score,
  controls,
  personalBest,
  leaderboard,
}: GameMenuProps) {
  const title = MENU_TITLES[phase];
  const actions = MENU_ACTIONS[phase];

  return (
    <div className="game-menu-backdrop">
      <div className="game-menu" role="dialog" aria-modal="true">
        <h1>{title}</h1>
        {phase === "over" ? (
          <>
            <p>Final score: {score}</p>
            <p>{renderPersonalBestText(personalBest)}</p>
            <Leaderboard leaderboard={leaderboard} />
          </>
        ) : null}
        <div className="game-menu-actions">
          {actions.map((action) => (
            <button
              key={action.label}
              className="game-btn"
              type="button"
              onClick={() => controls[action.control]()}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
