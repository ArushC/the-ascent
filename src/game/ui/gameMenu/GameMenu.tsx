import {
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { GamePhase, RunMode } from "../../Game";
import type { GameControls } from "../../Game";
import { Leaderboard } from "../leaderboard/Leaderboard";
import type { LeaderboardState } from "../../leaderboard/state/leaderboardState";
import type { DailyChallenge } from "../../../../shared/dailyChallenge/types.ts";
import { getChallengeDifferenceHint } from "../../../../shared/dailyChallenge/challengeDifferenceHint.ts";
import type { DailyChallengeLoadState } from "../../dailyChallenge/useDailyChallenge/useDailyChallenge";
import "../leaderboard/leaderboard-ui.css";

export type GameMenuPhase = Exclude<GamePhase, "playing">;

type GameMenuProps = {
  phase: GameMenuPhase;
  score: number;
  controls: GameControls;
  leaderboard: LeaderboardState;
  dailyChallengeState: DailyChallengeLoadState;
  runMode: RunMode;
  leaderboardTitle: string;
};

type GameMenuAction = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  tooltip?: GameMenuTooltip;
};

type GameMenuTooltip = {
  title: string;
  body: string;
};

type TooltipPosition = {
  x: number;
  y: number;
};

type DailyChallengeMenuModel = {
  challenge: DailyChallenge | null;
  readyDetail: ReactNode;
  dailyActionDisabled: boolean;
  dailyActionTooltip?: GameMenuTooltip;
};

const MENU_TITLES: Record<GameMenuPhase, string> = {
  ready: "The Ascent",
  paused: "Paused",
  over: "Game Over",
};

export function GameMenu({
  phase,
  score,
  controls,
  leaderboard,
  dailyChallengeState,
  runMode,
  leaderboardTitle,
}: GameMenuProps) {
  const title = MENU_TITLES[phase];
  const dailyMenu = getDailyChallengeMenuModel(dailyChallengeState);

  return (
    <div className="game-menu-backdrop">
      <div className="game-menu" role="dialog" aria-modal="true">
        <h1>{title}</h1>
        <GameMenuBody
          phase={phase}
          score={score}
          leaderboard={leaderboard}
          dailyMenu={dailyMenu}
          runMode={runMode}
          leaderboardTitle={leaderboardTitle}
        />
        {phase === "ready" ? (
          <ReadyMenuActions
            controls={controls}
            dailyMenu={dailyMenu}
          />
        ) : (
          <GameMenuActions actions={getMenuActions(phase, controls)} />
        )}
      </div>
    </div>
  );
}

/** Renders phase-specific content above the menu actions. */
function GameMenuBody({
  phase,
  score,
  leaderboard,
  dailyMenu,
  runMode,
  leaderboardTitle,
}: Pick<
  GameMenuProps,
  "phase" | "score" | "leaderboard" | "runMode" | "leaderboardTitle"
> & {
  dailyMenu: DailyChallengeMenuModel;
}) {
  if (phase === "over") {
    return (
      <>
        <p>Final score: {score}</p>
        <Leaderboard leaderboard={leaderboard} title={leaderboardTitle} />
      </>
    );
  }

  if (phase === "ready") {
    return isRenderableDetail(dailyMenu.readyDetail)
      ? dailyMenu.readyDetail
      : null;
  }

  if (phase === "paused" && runMode === "daily") {
    return dailyMenu.challenge ? (
      <DailyChallengeSummary dailyChallenge={dailyMenu.challenge} />
    ) : null;
  }

  return null;
}

function DailyChallengeSummary({
  dailyChallenge,
}: {
  dailyChallenge: DailyChallenge;
}) {
  return (
    <p className="game-menu-detail">
      <span className="game-menu-detail-title">
        Daily · {dailyChallenge.title}
      </span>
      <span className="game-menu-detail-hint">
        {getChallengeDifferenceHint(dailyChallenge.modifiers)}
      </span>
    </p>
  );
}

function ReadyMenuActions({
  controls,
  dailyMenu,
}: Pick<GameMenuProps, "controls"> & { dailyMenu: DailyChallengeMenuModel }) {
  return (
    <GameMenuActions
      actions={[
        { label: "Start", onSelect: controls.beginRun },
        {
          label: "Daily Challenge",
          onSelect: () => {
            if (dailyMenu.challenge) {
              controls.beginDailyRun(dailyMenu.challenge);
            }
          },
          disabled: dailyMenu.dailyActionDisabled,
          tooltip: dailyMenu.dailyActionTooltip,
        },
        { label: "Help", onSelect: controls.toggleHelp },
      ]}
    />
  );
}

function getDailyChallengeMenuModel(
  state: DailyChallengeLoadState,
): DailyChallengeMenuModel {
  if (state.status === "loaded") {
    return {
      challenge: state.challenge,
      readyDetail: null,
      dailyActionDisabled: false,
      dailyActionTooltip: {
        title: `Daily · ${state.challenge.title}`,
        body: getChallengeDifferenceHint(state.challenge.modifiers),
      },
    };
  }

  return {
    challenge: null,
    readyDetail: state.status === "error" ? (
      <p className="game-menu-detail">Daily challenge unavailable.</p>
    ) : null,
    dailyActionDisabled: true,
  };
}

function isRenderableDetail(detail: ReactNode): boolean {
  return detail !== null && detail !== undefined && detail !== false;
}

/** Renders menu buttons and optional in-game tooltips. */
function GameMenuActions({ actions }: { actions: readonly GameMenuAction[] }) {
  return (
    <div className="game-menu-actions">
      {actions.map((action) => (
        <GameMenuActionButton key={action.label} action={action} />
      ))}
    </div>
  );
}

function GameMenuActionButton({ action }: { action: GameMenuAction }) {
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null);
  const tooltipId = getTooltipId(action.label);
  const tooltipStyle: CSSProperties | undefined = tooltipPosition
    ? { left: tooltipPosition.x, top: tooltipPosition.y }
    : undefined;

  return (
    <div className="game-menu-action">
      <button
        className="game-btn"
        type="button"
        aria-describedby={
          action.tooltip && tooltipPosition ? tooltipId : undefined
        }
        disabled={action.disabled}
        onClick={action.onSelect}
        onMouseEnter={(event) => setTooltipFromPointer(event, setTooltipPosition)}
        onMouseMove={(event) => setTooltipFromPointer(event, setTooltipPosition)}
        onMouseLeave={() => setTooltipPosition(null)}
        onFocus={(event) => setTooltipFromFocus(event, setTooltipPosition)}
        onBlur={() => setTooltipPosition(null)}
      >
        {action.label}
      </button>
      {action.tooltip && tooltipPosition ? (
        <div
          id={tooltipId}
          className="game-menu-tooltip"
          role="tooltip"
          style={tooltipStyle}
        >
          <span className="game-menu-tooltip-title">{action.tooltip.title}</span>
          <span className="game-menu-tooltip-body">{action.tooltip.body}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Maps pause and game-over phases to their available controls. */
function getMenuActions(
  phase: Exclude<GameMenuPhase, "ready">,
  controls: GameControls,
): GameMenuAction[] {
  if (phase === "paused") {
    return [
      { label: "Resume", onSelect: controls.resume },
      { label: "Restart", onSelect: controls.restart },
      { label: "Home", onSelect: controls.returnHome },
      { label: "Help", onSelect: controls.toggleHelp },
    ];
  }

  return [
    { label: "Restart", onSelect: controls.restart },
    { label: "Home", onSelect: controls.returnHome },
  ];
}

function getTooltipId(label: string): string {
  return `game-menu-tooltip-${label.toLowerCase().replaceAll(" ", "-")}`;
}

function setTooltipFromPointer(
  event: MouseEvent<HTMLButtonElement>,
  setTooltipPosition: (position: TooltipPosition) => void,
): void {
  setTooltipPosition({ x: event.clientX, y: event.clientY });
}

function setTooltipFromFocus(
  event: FocusEvent<HTMLButtonElement>,
  setTooltipPosition: (position: TooltipPosition) => void,
): void {
  const rect = event.currentTarget.getBoundingClientRect();

  setTooltipPosition({
    x: rect.left + rect.width / 2,
    y: rect.top,
  });
}
