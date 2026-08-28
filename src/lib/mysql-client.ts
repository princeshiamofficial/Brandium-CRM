import { v4 as uuidv4 } from "uuid";

/**
 * Pure Client & Universal MySQL Utility Functions.
 * Safe for both Client Components, Server Components, and API routes.
 */

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  connectionLimit: number;
  timezone: string;
}

export function getMySQLConfig(): MySQLConfig {
  const env =
    typeof process !== "undefined" && process.env
      ? (process.env as Record<string, string | undefined>)
      : {};

  const rawHost = env["MYSQL_HOST"] || env["NEXT_PUBLIC_MYSQL_HOST"] || "127.0.0.1";
  const host = rawHost === "localhost" ? "127.0.0.1" : rawHost;
  const port = parseInt(env["MYSQL_PORT"] || env["NEXT_PUBLIC_MYSQL_PORT"] || "3306", 10);
  const user = env["MYSQL_USER"] || env["NEXT_PUBLIC_MYSQL_USER"] || "root";
  const password = env["MYSQL_PASSWORD"] || env["NEXT_PUBLIC_MYSQL_PASSWORD"] || "";
  const database = env["MYSQL_DATABASE"] || env["NEXT_PUBLIC_MYSQL_DATABASE"] || "brandium_crm";
  const connectionLimit = parseInt(env["MYSQL_CONNECTION_LIMIT"] || "20", 10);
  const timezone = env["MYSQL_TIMEZONE"] || env["NEXT_PUBLIC_MYSQL_TIMEZONE"] || "+06:00";

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

/**
 * Utility to generate standard 36-character RFC4122 v4 UUIDs using uuid package / Web Crypto.
 * Compliant with MySQL VARCHAR(36) primary key schema definitions (exact same as erpapp).
 */
export function generateUUID(): string {
  try {
    return uuidv4();
  } catch {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
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
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
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
  fallback = "N/A",
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
  fallback = "12:00 AM",
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
  fallback = "N/A",
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
