export const PLAYER_ID_KEY = "the-ascent:player-id";

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
