import {
  normalizePlayerName,
  validatePlayerName,
} from "../../shared/validation.ts";

const PLAYER_ID_KEY = "doodle-jump:player-id";
const PLAYER_NAME_KEY = "doodle-jump:player-name";

// Anonymous local identity avoids auth while still preserving personal bests.
export function getOrCreatePlayerId(): string {
  const existingPlayerId = localStorage.getItem(PLAYER_ID_KEY);

  if (existingPlayerId) {
    return existingPlayerId;
  }

  const playerId = crypto.randomUUID();
  localStorage.setItem(PLAYER_ID_KEY, playerId);
  return playerId;
}

export function getPlayerName(): string | null {
  const playerName = localStorage.getItem(PLAYER_NAME_KEY);

  if (!playerName || !validatePlayerName(playerName).ok) {
    return null;
  }

  return normalizePlayerName(playerName);
}

export function setPlayerName(playerName: string): void {
  localStorage.setItem(PLAYER_NAME_KEY, normalizePlayerName(playerName));
}
