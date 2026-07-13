# The Ascent

The Ascent is a vertical arcade platformer built with React, TypeScript, and Vite. It includes a local leaderboard API backed by SQLite for submitted scores and personal bests.

## Stack

- React, TypeScript, and Vite for the browser game
- Node `http` for the API and production static serving
- Node `node:sqlite` for the leaderboard database

## Development

Two processes: Vite for the game, Node for the API.

```bash
npm run dev          # game at http://localhost:5173
npm run dev:server   # API at http://localhost:3001
npm run dev:all      # both
npm test
```

## Production-shaped local run

One process serves the built game and the API.

```bash
npm run build
npm start
```

Open http://localhost:3001
