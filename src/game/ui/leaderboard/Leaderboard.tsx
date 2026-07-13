import { useState } from "react";
import {
  getLeaderboardPage,
  getLeaderboardPageCount,
} from "../../leaderboard/menu/leaderboardMenu";
import { formatScoreTimestamp } from "../../leaderboard/formatScoreTimestamp/formatScoreTimestamp";
import type { LeaderboardState } from "../../leaderboard/state/leaderboardState";

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
      <h2>Your Top Scores:</h2>
      {visibleEntries.length > 0 ? (
        <div className="game-leaderboard-body">
          <table className="game-leaderboard-table">
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Score</th>
                <th scope="col">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {visibleEntries.map((entry) => (
                <tr key={`${entry.rank}-${entry.createdAt}`}>
                  <td>{entry.rank}</td>
                  <td>
                    <strong>{entry.score}</strong>
                  </td>
                  <td>{formatScoreTimestamp(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
