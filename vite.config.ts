// @lovable.dev/vite-tanstack-config already includes the following - do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";
import mysql from "mysql2/promise";

import type { IncomingMessage, ServerResponse } from "node:http";

import { getMySQLConfig } from "./src/lib/mysql-client.ts";

type MySQLRequestPayload = {
  action?: "query" | "execute";
  sql?: unknown;
  params?: unknown;
};

const maxBodyBytes = 512 * 1024;

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function isDevSqlBridgeEnabled(): boolean {
  return process.env["NODE_ENV"] !== "production" || process.env["ENABLE_DEV_SQL_API"] === "true";
}

async function readJsonBody(req: IncomingMessage): Promise<MySQLRequestPayload> {
  let body = "";

  for await (const chunk of req) {
    body += chunk.toString();

    if (Buffer.byteLength(body) > maxBodyBytes) {
      throw new Error("Request body too large");
    }
  }

  return JSON.parse(body) as MySQLRequestPayload;
}

function viteMySQLPlugin(): Plugin {
  let pool: mysql.Pool | null = null;

  function getPool() {
    if (!pool) {
      const config = getMySQLConfig();

      pool = mysql.createPool({
        host: config.host === "localhost" ? "127.0.0.1" : config.host,
        port: config.port,
        user: config.user,
        password: config.password ?? "",
        database: config.database,
        waitForConnections: true,
        connectionLimit: config.connectionLimit,
        queueLimit: 0,
        enableKeepAlive: true,
      });
    }

    return pool;
  }

  return {
    name: "vite-plugin-mysql-api",
    configureServer(server) {
      server.middlewares.use("/api/health", async (_req: IncomingMessage, res: ServerResponse) => {
        try {
          const dbPool = getPool();
          const [rows] = await dbPool.query("SELECT VERSION() AS version, DATABASE() AS db;");
          sendJson(res, 200, {
            success: true,
            service: "brandium-crm",
            database: rows,
          });
        } catch {
          sendJson(res, 503, {
            success: false,
            service: "brandium-crm",
            error: "Database health check failed.",
          });
        }
      });

      server.middlewares.use("/api/mysql", async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { success: false, error: "Method not allowed" });
          return;
        }

        if (!isDevSqlBridgeEnabled()) {
          sendJson(res, 403, {
            success: false,
            error:
              "Raw SQL bridge is disabled. Use server functions in production or set ENABLE_DEV_SQL_API=true for local migration compatibility.",
          });
          return;
        }

        try {
          const { action, sql, params } = await readJsonBody(req);

          if ((action !== "query" && action !== "execute") || typeof sql !== "string") {
            sendJson(res, 400, { success: false, error: "Invalid database request" });
            return;
          }

          const queryParams = Array.isArray(params) ? params : [];
          const dbPool = getPool();
          const [rows] = await dbPool.query(sql, queryParams);
          sendJson(res, 200, { success: true, data: rows });
        } catch (err: unknown) {
          const errObj = err as { message?: string };
          console.error("Vite MySQL Plugin Error:", errObj?.message || err);
          sendJson(res, 500, {
            success: false,
            error: "Database request failed.",
          });
        }
      });
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [viteMySQLPlugin()],
    server: {
      allowedHosts: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
