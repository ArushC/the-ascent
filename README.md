# The Ascent

The Ascent is a vertical arcade platformer built with React, TypeScript, and Vite. It includes a local leaderboard API backed by SQLite for submitted scores and personal bests.

## Stack

- React, TypeScript, and Vite for the browser game
- Node `http` for the API and production static serving
- `better-sqlite3` for the leaderboard database

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

Open http://localhost:3001 to preview the game.

## CI/CD

GitHub Actions runs CI on every pull request and every push to `main`. The CI workflow installs dependencies with `npm ci`, then runs linting, tests, and a production build:

```bash
npm ci
npm run lint
npm run test:run
npm run build
```

When code is pushed to `main`, the CD workflow builds the existing Dockerfile and pushes the image to GitHub Container Registry with `latest` and commit SHA tags.

```bash
docker pull ghcr.io/arushc/the-ascent:latest
docker run --rm -p 3001:3001 ghcr.io/arushc/the-ascent:latest
```
