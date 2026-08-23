/**
 * Standalone MySQL Database Engine & Connection Helper
 * Bypasses Supabase Cloud completely and enables Direct MySQL integration.
 */

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

export function getMySQLConfig(): MySQLConfig {
  const rawHost =
    (typeof process !== "undefined" && process.env?.["MYSQL_HOST"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_HOST"]) ||
    "127.0.0.1";
  const host = rawHost === "localhost" ? "127.0.0.1" : rawHost;
  const port = parseInt(
    (typeof process !== "undefined" && process.env?.["MYSQL_PORT"]) ||
      (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_PORT"]) ||
      "3306",
    10,
  );
  const user =
    (typeof process !== "undefined" && process.env?.["MYSQL_USER"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_USER"]) ||
    "root";
  const password =
    (typeof process !== "undefined" && process.env?.["MYSQL_PASSWORD"]) !== undefined
      ? (process.env?.["MYSQL_PASSWORD"] as string)
      : (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_PASSWORD"]) || "";
  const database =
    (typeof process !== "undefined" && process.env?.["MYSQL_DATABASE"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_DATABASE"]) ||
    "brandium_crm";

  return { host, port, user, password, database };
}

export function checkDatabaseConnection(): boolean {
  if (typeof window === "undefined") return false;
  return true;
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
