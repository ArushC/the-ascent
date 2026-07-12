# Deploy The Ascent

Production runs one Node 22 process that serves `dist/`, `/health`, and the leaderboard API. Scores are stored in SQLite, so production must mount a persistent volume at `/data`.

Use this runbook until the Northflank URL exists. After launch, the README can link to the live game while this file stays as the operational checklist.

## Environment

| Variable | Local value | Production value | Notes |
| --- | --- | --- | --- |
| `PORT` | `3001` | `3001` | Public HTTP port and server listen port. |
| `LEADERBOARD_DB` | `data/leaderboard.sqlite` | `/data/leaderboard.sqlite` | Use the mounted volume path in production. |
| `NODE_ENV` | unset | `production` | Enables a warning if the DB is not under `/data`. |

## Local Production Shape

```bash
npm ci
npm run build
LEADERBOARD_DB=data/leaderboard.sqlite npm start
```

Smoke checks:

```bash
curl -s http://localhost:3001/health
curl -s http://localhost:3001/api/leaderboard
```

Open `http://localhost:3001/`, play a run, submit a score, and confirm it appears on the leaderboard without running Vite.

## Docker

```bash
docker build -t the-ascent .
mkdir -p /tmp/ascent-data
docker run --rm -p 3001:3001 \
  -v /tmp/ascent-data:/data \
  -e LEADERBOARD_DB=/data/leaderboard.sqlite \
  -e PORT=3001 \
  the-ascent
```

Submit a score, stop the container, and run it again with the same `/tmp/ascent-data` mount. The score should still be present.

## Northflank Checklist

1. Create a combined service from the GitHub repo `the-ascent`.
2. Use the Dockerfile at `/Dockerfile` with the repo root as context.
3. Set public HTTP port `3001`.
4. Add environment variables: `PORT=3001`, `LEADERBOARD_DB=/data/leaderboard.sqlite`, `NODE_ENV=production`.
5. Add a single read/write volume mounted at `/data`; keep instances at `1`.
6. Configure health check `GET /health`.
7. Deploy, open the public URL, submit a score, restart the service, and verify the score persists.

## Troubleshooting

- Scores disappear after restart: confirm the volume is mounted at `/data` and `LEADERBOARD_DB=/data/leaderboard.sqlite`.
- Health check fails: confirm Northflank targets port `3001` and path `/health`.
- Server logs warn about `LEADERBOARD_DB`: in production, the database path should live under `/data`.
- SQLite permission errors: confirm the mounted volume is writable by the container.
- Game loads but API fails: check `/api/leaderboard` on the same public origin and confirm the service is not running as a static-only deploy.
