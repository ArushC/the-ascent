import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createLeaderboardDb, type LeaderboardDb } from "./leaderboard/db.ts";
import { HTTP_STATUS, type JsonResponse } from "./http.ts";
import { DEFAULT_DATABASE_FILE } from "./leaderboard/schema.ts";
import { getLeaderboardEntries } from "./leaderboard/routes/getLeaderboardEntries.ts";
import { getTopPlayerScore } from "./leaderboard/routes/getPlayerBest.ts";
import { recordScore } from "./leaderboard/routes/postScoreSubmission.ts";
import { serveStatic } from "./static.ts";

const DEFAULT_PORT = 3001;
const MAX_PORT_ATTEMPTS = 10;
const START_PORT = Number(process.env.PORT ?? DEFAULT_PORT);
const DATABASE_FILE = process.env.LEADERBOARD_DB ?? DEFAULT_DATABASE_FILE;
const db = createLeaderboardDb(DATABASE_FILE);
let currentPort = START_PORT;
let portAttempts = 0;

const server = createServer((req, res) => {
  handleRequest(req, res, db).catch((error: unknown) => {
    console.error(error);
    sendJson(res, {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      body: { error: "internal_server_error" },
    });
  });
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    if (portAttempts < MAX_PORT_ATTEMPTS) {
      console.warn(`Port ${currentPort} is already in use. Trying ${currentPort + 1}.`);
      currentPort += 1;
      listen();
      return;
    }

    console.error(
      `Ports ${START_PORT}-${currentPort} are already in use. Set PORT to run elsewhere.`,
    );
  } else {
    console.error(error);
  }

  db.close();
  process.exit(1);
});

server.on("listening", () => {
  console.log(`The Ascent listening on http://0.0.0.0:${currentPort}`);
});

if (process.env.NODE_ENV === "production" && !DATABASE_FILE.startsWith("/data/")) {
  console.warn(`Production LEADERBOARD_DB is not under /data: ${DATABASE_FILE}`);
}

listen();

function listen(): void {
  portAttempts += 1;
  server.listen(currentPort, "0.0.0.0");
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  database: LeaderboardDb,
): Promise<void> {
  if (req.method === "OPTIONS") {
    sendJson(res, { status: HTTP_STATUS.NO_CONTENT, body: null });
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  const pathname = stripApiPrefix(url.pathname);

  if (req.method === "GET" && pathname === "/health") {
    sendJson(res, { status: HTTP_STATUS.OK, body: { ok: true } });
    return;
  }

  // Tiny REST router: Node's built-in http server does not provide routing.
  if (req.method === "POST" && pathname === "/scores") {
    sendJson(res, recordScore(database, await readJson(req)));
    return;
  }

  if (req.method === "GET" && pathname === "/leaderboard") {
    sendJson(res, getLeaderboardEntries(database));
    return;
  }

  const playerBestMatch = /^\/players\/([^/]+)\/best$/.exec(pathname);

  if (req.method === "GET" && playerBestMatch) {
    sendJson(res, getTopPlayerScore(database, decodeURIComponent(playerBestMatch[1])));
    return;
  }

  if (req.method === "GET") {
    serveStatic(url.pathname, res);
    return;
  }

  sendJson(res, { status: HTTP_STATUS.NOT_FOUND, body: { error: "not_found" } });
}

function stripApiPrefix(pathname: string): string {
  return pathname.startsWith("/api/") ? pathname.slice(4) : pathname;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return null;
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

function sendJson(res: ServerResponse, response: JsonResponse): void {
  res.statusCode = response.status;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (response.status === HTTP_STATUS.NO_CONTENT) {
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(response.body));
}
