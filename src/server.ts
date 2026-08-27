import "./lib/error-capture";
import fs from "node:fs/promises";
import path from "node:path";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

import { fileURLToPath } from "node:url";

const MIME_TYPES: Record<string, string> = {
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

function getModuleDirectory(): string {
  try {
    if (typeof import.meta.url === "string") {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // Fall back to empty
  }
  return "";
}

async function tryServeStaticAsset(pathname: string): Promise<Response | null> {
  if (
    !pathname.startsWith("/assets/") &&
    !pathname.startsWith("/uploads/") &&
    !pathname.match(/\.(js|mjs|css|png|jpg|jpeg|svg|webp|ico|json|woff|woff2|ttf|txt)$/i)
  ) {
    return null;
  }

  const cleanPath = pathname.replace(/^\/+/, "");
  const modDir = getModuleDirectory();
  const cwd = process.cwd();

  const searchDirectories = [
    ...(modDir
      ? [
          path.resolve(modDir, "../public"),
          path.resolve(modDir, "../../public"),
          path.resolve(modDir, "../dist/client"),
        ]
      : []),
    path.resolve(cwd, ".output", "public"),
    path.resolve(cwd, "public"),
    path.resolve(cwd, "dist", "client"),
    "/home/crm.brandiumagency.com/public_html/.output/public",
    "/home/crm.brandiumagency.com/public_html/public",
    cwd,
  ];

  for (const baseDir of searchDirectories) {
    const baseName = path.basename(cleanPath);
    const candidates = [
      path.resolve(baseDir, cleanPath),
      path.resolve(baseDir, baseName),
      path.resolve(baseDir, "assets", baseName),
    ];

    // If hashed chunk is missing, find any latest chunk with same route prefix (e.g. meetings-*.js)
    const chunkPrefixMatch = baseName.match(
      /^([a-zA-Z0-9_\-\.]+?)-[a-zA-Z0-9_\-]{4,16}\.(js|css|mjs)$/,
    );
    if (chunkPrefixMatch) {
      const prefix = chunkPrefixMatch[1];
      const ext = chunkPrefixMatch[2];
      for (const targetDir of [baseDir, path.resolve(baseDir, "assets")]) {
        try {
          const files = await fs.readdir(targetDir);
          const matchedFile = files.find(
            (f) => f.startsWith(`${prefix}-`) && f.endsWith(`.${ext}`),
          );
          if (matchedFile) {
            candidates.push(path.resolve(targetDir, matchedFile));
          }
        } catch {
          // ignore
        }
      }
    }

    for (const fullPath of candidates) {
      try {
        const stat = await fs.stat(fullPath);
        if (stat.isFile()) {
          const fileBuffer = await fs.readFile(fullPath);
          const ext = path.extname(fullPath).toLowerCase();
          const contentType = MIME_TYPES[ext] || "application/octet-stream";
          const bodyBytes = new Uint8Array(
            fileBuffer.buffer,
            fileBuffer.byteOffset,
            fileBuffer.byteLength,
          );

          return new Response(bodyBytes, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Content-Length": String(stat.size),
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-Content-Type-Options": "nosniff",
            },
          });
        }
      } catch {
        // Continue checking candidates
      }
    }
  }

  return null;
}

function withSecurityHeaders(response: Response): Response {
  try {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    if (!response.headers.has("Cache-Control") && response.status >= 400) {
      response.headers.set("Cache-Control", "no-store");
    }

    return response;
  } catch {
    return response;
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"}; try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const staticResponse = await tryServeStaticAsset(url.pathname);
      if (staticResponse) {
        return staticResponse;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);
      return withSecurityHeaders(normalizedResponse);
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
