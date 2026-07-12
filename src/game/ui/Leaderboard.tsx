import { useState } from "react";
import {
  getLeaderboardPage,
  getLeaderboardPageCount,
} from "../leaderboardMenu";
import type { LeaderboardState } from "../leaderboardState";

type LeaderboardProps = {
  leaderboard: LeaderboardState;
};

export function Leaderboard({ leaderboard }: LeaderboardProps) {
  const [page, setPage] = useState(0);

  if (leaderboard.status === "loading") {
    return <p>Loading leaderboard...</p>;
  }

  if (leaderboard.status === "error") {
    return <p>Leaderboard unavailable</p>;
  }

  if (leaderboard.status !== "loaded") {
    return null;
  }

  const pageCount = getLeaderboardPageCount(leaderboard.entries.length);
  const currentPage = Math.min(page, pageCount - 1);
  const visibleEntries = getLeaderboardPage(leaderboard.entries, currentPage);

  return (
    <div className="game-leaderboard" aria-label="Leaderboard">
      <h2>Top Scores</h2>
      {visibleEntries.length > 0 ? (
        visibleEntries.map((entry) => (
          <div className="game-leaderboard-row" key={`${entry.rank}-${entry.createdAt}`}>
            <span>{entry.rank}.</span>
            <span>{entry.playerName}</span>
            <strong>{entry.score}</strong>
          </div>
        ))
      ) : (
        <p>No scores yet</p>
      )}
      {pageCount > 1 ? (
        <div className="game-leaderboard-pagination">
          <button
            className="game-btn"
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            {currentPage + 1} / {pageCount}
          </span>
          <button
            className="game-btn"
            type="button"
            disabled={currentPage === pageCount - 1}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
