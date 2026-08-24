/**
 * Standalone MySQL Database Engine & Connection Helper.
 * Server code reads secrets from MYSQL_* only; client-visible VITE_* values are limited to non-secret hints.
 */
import fs from "fs";
import path from "path";
import type mysql from "mysql2/promise";

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connectionLimit: number;
  timezone: string;
}

let envLoaded = false;
function loadEnvFromFile(): void {
  if (envLoaded || typeof process === "undefined" || !process.versions?.node) return;
  envLoaded = true;
  try {
    const cwd = process.cwd();
    const envPaths = [path.resolve(cwd, ".env"), "/home/crm.brandiumagency.com/public_html/.env"];

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

  const rawHost = serverEnv?.["MYSQL_HOST"] || clientEnv?.["VITE_MYSQL_HOST"] || "127.0.0.1";
  const host = rawHost === "localhost" ? "127.0.0.1" : rawHost;
  const port = parseInt(serverEnv?.["MYSQL_PORT"] || clientEnv?.["VITE_MYSQL_PORT"] || "3306", 10);
  const user = serverEnv?.["MYSQL_USER"] || clientEnv?.["VITE_MYSQL_USER"] || "crm_brandium";
  const password =
    serverEnv?.["MYSQL_PASSWORD"] !== undefined && serverEnv["MYSQL_PASSWORD"] !== ""
      ? (serverEnv["MYSQL_PASSWORD"] as string)
      : clientEnv?.["VITE_MYSQL_PASSWORD"] !== undefined && clientEnv["VITE_MYSQL_PASSWORD"] !== ""
        ? (clientEnv["VITE_MYSQL_PASSWORD"] as string)
        : "Brandium456";
  const database =
    serverEnv?.["MYSQL_DATABASE"] || clientEnv?.["VITE_MYSQL_DATABASE"] || "crm_brandium";
  const connectionLimit = parseInt(serverEnv?.["MYSQL_CONNECTION_LIMIT"] || "20", 10);
  const timezone = serverEnv?.["MYSQL_TIMEZONE"] || clientEnv?.["VITE_MYSQL_TIMEZONE"] || "+06:00";

  return {
    host,
    port: Number.isFinite(port) ? port : 3306,
    user,
    password,
    database,
    connectionLimit: Number.isFinite(connectionLimit) ? connectionLimit : 20,
    timezone,
  };
}

export function checkDatabaseConnection(): boolean {
  if (typeof window === "undefined") return false;
  return true;
}

export function sanitizeParams(params: unknown[] = []): unknown[] {
  return params.map((p) => {
    if (p instanceof Date) {
      return getMySQLTimestamp(p);
    }
    return p;
  });
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
    timezone: config.timezone,
    dateStrings: true,
  });

  try {
    globalPool.on("connection", (connection) => {
      connection.query("SET time_zone = '+06:00';");
    });
  } catch {
    // Ignore if listener fails
  }

  return globalPool;
}

export async function createSingleMySQLConnection(): Promise<mysql.Connection> {
  const mysqlModule = await import("mysql2/promise");
  const config = getMySQLConfig();
  const conn = await mysqlModule.default.createConnection({
    host: config.host === "localhost" ? "127.0.0.1" : config.host,
    port: config.port,
    user: config.user,
    password: config.password ?? "",
    database: config.database,
    timezone: config.timezone,
    dateStrings: true,
  });
  try {
    await conn.query("SET time_zone = '+06:00';");
  } catch {
    // Ignore
  }
  return conn;
}

/**
 * Executes a parameterized SQL query against the singleton MySQL connection pool.
 */
export async function queryPool<T = Record<string, unknown>[]>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const pool = await getMySQLPool();
  const cleanParams = sanitizeParams(params);
  const [rows] = await pool.query(sql, cleanParams);
  return rows as T;
}

export async function executePool(
  sql: string,
  params: unknown[] = [],
): Promise<{ affectedRows: number; insertId?: number | undefined }> {
  const pool = await getMySQLPool();
  const cleanParams = sanitizeParams(params);
  const [result] = await pool.query(sql, cleanParams);
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

/**
 * Helper to get current local timestamp formatted for MySQL DATETIME columns ("YYYY-MM-DD HH:mm:ss").
 */
export function getMySQLTimestamp(date: Date = new Date()): string {
  try {
    return date.toLocaleString("sv-SE", { timeZone: "Asia/Dhaka" }).replace("T", " ");
  } catch {
    return date.toISOString().slice(0, 19).replace("T", " ");
  }
}

/**
 * Helper to safely parse MySQL DATETIME string into a local Date object
 * preserving exact year, month, day, hour, minute, second values without timezone shifting.
 */
export function parseCrmDate(input: string | Date | null | undefined): Date {
  if (!input) return new Date();
  if (input instanceof Date) return isNaN(input.getTime()) ? new Date() : input;
  const str = String(input).trim();
  const match = str.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
  );
  if (match) {
    const year = parseInt(match[1]!, 10);
    const monthIdx = parseInt(match[2]!, 10) - 1;
    const day = parseInt(match[3]!, 10);
    const hour = match[4] ? parseInt(match[4]!, 10) : 0;
    const min = match[5] ? parseInt(match[5]!, 10) : 0;
    const sec = match[6] ? parseInt(match[6]!, 10) : 0;
    return new Date(year, monthIdx, day, hour, min, sec);
  }
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Formats DB timestamp or date string cleanly into "MMM D, YYYY" (e.g. "Aug 24, 2026")
 * avoiding unintended client timezone date shifting.
 */
export function formatCrmDate(
  dateInput: string | Date | null | undefined,
  fallback = "N/A"
): string {
  if (!dateInput) return fallback;
  try {
    const d = parseCrmDate(dateInput);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
}

/**
 * Formats DB timestamp or date string cleanly into "h:mm a" (e.g. "11:07 AM").
 */
export function formatCrmTime(
  dateInput: string | Date | null | undefined,
  fallback = "12:00 AM"
): string {
  if (!dateInput) return fallback;
  try {
    const d = parseCrmDate(dateInput);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return fallback;
  }
}

/**
 * Formats DB timestamp or date string cleanly into "MMM D, YYYY, h:mm a" (e.g. "Aug 24, 2026, 11:07 AM").
 */
export function formatCrmDateTime(
  dateInput: string | Date | null | undefined,
  fallback = "N/A"
): string {
  if (!dateInput) return fallback;
  try {
    const d = parseCrmDate(dateInput);
    const datePart = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  } catch {
    return fallback;
  }
}


