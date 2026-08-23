process.env.NITRO_PRESET = process.env.NITRO_PRESET || "node-server";

// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";
import mysql from "mysql2/promise";

import type { IncomingMessage, ServerResponse } from "node:http";

function viteMySQLPlugin(): Plugin {
  let pool: mysql.Pool | null = null;

  function getPool() {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.MYSQL_HOST || "127.0.0.1",
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || "crm_brandium",
        password: process.env.MYSQL_PASSWORD || "Brandium456",
        database: process.env.MYSQL_DATABASE || "crm_brandium",
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
      });
    }
    return pool;
  }

  return {
    name: "vite-plugin-mysql-api",
    configureServer(server) {
      server.middlewares.use("/api/mysql", async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
          body += chunk.toString();
        });

        req.on("end", async () => {
          try {
            const { action, sql, params } = JSON.parse(body);
            const dbPool = getPool();

            if (action === "query" || action === "execute") {
              const [rows] = await dbPool.query(sql, params || []);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, data: rows }));
              return;
            }

            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid action" }));
          } catch (err: unknown) {
            const errObj = err as { message?: string };
            console.error("Vite MySQL Plugin Error:", errObj?.message || err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                success: false,
                error: errObj?.message || "Database error",
              }),
            );
          }
        });
      });
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [viteMySQLPlugin()],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
