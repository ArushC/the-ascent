import { useState, type FormEvent } from "react";
import {
  normalizePlayerName,
  validatePlayerName,
} from "../../shared/leaderboard/validation.ts";
import "./leaderboard-ui.css";

type PlayerNamePromptProps = {
  onSubmit: (playerName: string) => void;
};

export function PlayerNamePrompt({ onSubmit }: PlayerNamePromptProps) {
  const [name, setName] = useState("");
  const validation = validatePlayerName(name);
  const canSubmit = validation.ok;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmit(normalizePlayerName(name));
  }

  return (
    <div className="game-menu-backdrop">
      <form
        className="game-menu"
        role="dialog"
        aria-modal="true"
        onSubmit={handleSubmit}
      >
        <h1>Player Name</h1>
        <input
          className="game-name-input"
          aria-label="Player name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {!validation.ok ? (
          <p className="game-menu-error">{validation.message}</p>
        ) : null}
        <div className="game-menu-actions">
          <button className="game-btn" type="submit" disabled={!canSubmit}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
