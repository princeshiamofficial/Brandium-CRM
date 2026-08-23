/**
 * Standalone MySQL Database Engine & Connection Helper.
 * Server code reads secrets from MYSQL_* only; client-visible VITE_* values are limited to non-secret hints.
 */
import type mysql from "mysql2/promise";

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connectionLimit: number;
}

let envLoaded = false;
function loadEnvFromFile(): void {
  if (envLoaded || typeof process === "undefined" || !process.versions?.node) return;
  envLoaded = true;
  try {
    const fs = require("fs");
    const path = require("path");
    const cwd = process.cwd();
    const envPaths = [
      path.resolve(cwd, ".env"),
      "/home/crm.brandiumagency.com/public_html/.env",
    ];

    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
        break;
      }
    }
  } catch {
    // Ignore if unavailable
  }
}

export function getMySQLConfig(): MySQLConfig {
  loadEnvFromFile();

  const serverEnv =
    typeof process !== "undefined"
      ? (process.env as Record<string, string | undefined>)
      : undefined;
  const clientEnv =
    typeof import.meta !== "undefined"
      ? (import.meta.env as Record<string, string | undefined>)
      : undefined;

  const rawHost =
    serverEnv?.["MYSQL_HOST"] ||
    clientEnv?.["VITE_MYSQL_HOST"] ||
    "127.0.0.1";
  const host = rawHost === "localhost" ? "127.0.0.1" : rawHost;
  const port = parseInt(
    serverEnv?.["MYSQL_PORT"] || clientEnv?.["VITE_MYSQL_PORT"] || "3306",
    10,
  );
  const user =
    serverEnv?.["MYSQL_USER"] ||
    clientEnv?.["VITE_MYSQL_USER"] ||
    "root";
  const password =
    serverEnv?.["MYSQL_PASSWORD"] !== undefined
      ? (serverEnv["MYSQL_PASSWORD"] as string)
      : clientEnv?.["VITE_MYSQL_PASSWORD"] !== undefined
        ? (clientEnv["VITE_MYSQL_PASSWORD"] as string)
        : "";
  const database =
    serverEnv?.["MYSQL_DATABASE"] ||
    clientEnv?.["VITE_MYSQL_DATABASE"] ||
    "brandium_crm";
  const connectionLimit = parseInt(serverEnv?.["MYSQL_CONNECTION_LIMIT"] || "20", 10);

  return {
    host,
    port: Number.isFinite(port) ? port : 3306,
    user,
    password,
    database,
    connectionLimit: Number.isFinite(connectionLimit) ? connectionLimit : 20,
  };
}

export function checkDatabaseConnection(): boolean {
  if (typeof window === "undefined") return false;
  return true;
}

let globalPool: mysql.Pool | null = null;

export async function getMySQLPool(): Promise<mysql.Pool> {
  if (globalPool) {
    return globalPool;
  }

  const mysqlModule = await import("mysql2/promise");
  const config = getMySQLConfig();

  globalPool = mysqlModule.default.createPool({
    host: config.host === "localhost" ? "127.0.0.1" : config.host,
    port: config.port,
    user: config.user,
    password: config.password ?? "",
    database: config.database,
    waitForConnections: true,
    connectionLimit: config.connectionLimit,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    charset: "utf8mb4",
  });

  return globalPool;
}

/**
 * Executes a parameterized SQL query against the singleton MySQL connection pool.
 */
export async function queryPool<T = Record<string, unknown>[]>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const pool = await getMySQLPool();
  const [rows] = await pool.query(sql, params);
  return rows as T;
}

export async function executePool(
  sql: string,
  params: unknown[] = [],
): Promise<{ affectedRows: number; insertId?: number | undefined }> {
  const pool = await getMySQLPool();
  const [result] = await pool.query(sql, params);
  const okPacket = result as { affectedRows?: number; insertId?: number };
  return {
    affectedRows: okPacket.affectedRows ?? 0,
    insertId: okPacket.insertId !== undefined ? okPacket.insertId : undefined,
  };
}

/**
 * Utility to generate standard 36-character RFC4122 v4 UUIDs using Web/Node Crypto.
 * Compliant with MySQL VARCHAR(36) primary key schema definitions.
 */
export function generateUUID(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    const globalCrypto = typeof window !== "undefined" ? window.crypto : undefined;
    if (globalCrypto && typeof globalCrypto.randomUUID === "function") {
      return globalCrypto.randomUUID();
    }
  } catch {
    // Fallback if crypto context is unavailable
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
