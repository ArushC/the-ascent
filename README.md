# The Ascent

The Ascent is a vertical arcade platformer built with React, TypeScript, and Vite. It includes a local leaderboard API backed by SQLite for submitted scores and personal bests.

## Stack

- React, TypeScript, and Vite for the browser game
- Node `http` for the API and production static serving
- Node `node:sqlite` for the leaderboard database

## Development

```bash
npm run dev
npm run dev:server
npm run dev:all
npm test
npm run build
```

## Production-Shaped Local Run

```bash
npm run build
npm start
```

Production deployment details live in [docs/DEPLOY.md](docs/DEPLOY.md).
