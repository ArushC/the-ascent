import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import type { ServerResponse } from "node:http";
import { HTTP_STATUS } from "./http.ts";

const DIST_DIR = resolve("dist");
const INDEX_FILE = join(DIST_DIR, "index.html");

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export function serveStatic(pathname: string, res: ServerResponse): void {
  const requestedFile = getStaticFilePath(pathname);

  if (!requestedFile) {
    sendText(res, HTTP_STATUS.NOT_FOUND, "Not found");
    return;
  }

  if (fileExists(requestedFile)) {
    streamFile(requestedFile, res);
    return;
  }

  if (isAssetPath(pathname) || !fileExists(INDEX_FILE)) {
    sendText(res, HTTP_STATUS.NOT_FOUND, "Not found");
    return;
  }

  streamFile(INDEX_FILE, res);
}

function getStaticFilePath(pathname: string): string | null {
  let decodedPathname: string;

  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = decodedPathname.replace(/^\/+/, "");
  const filePath = resolve(DIST_DIR, relativePath || "index.html");

  if (filePath !== DIST_DIR && !filePath.startsWith(`${DIST_DIR}${sep}`)) {
    return null;
  }

  return filePath;
}

function fileExists(filePath: string): boolean {
  return existsSync(filePath) && statSync(filePath).isFile();
}

function isAssetPath(pathname: string): boolean {
  return extname(pathname) !== "";
}

function streamFile(filePath: string, res: ServerResponse): void {
  res.statusCode = HTTP_STATUS.OK;
  res.setHeader("Content-Type", MIME_TYPES[extname(filePath)] ?? "application/octet-stream");
  createReadStream(filePath).pipe(res);
}

function sendText(res: ServerResponse, status: number, message: string): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(message);
}
