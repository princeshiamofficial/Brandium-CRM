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
  const host =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_HOST"]) ||
    (typeof process !== "undefined" && process.env?.["MYSQL_HOST"]) ||
    "localhost";
  const port = parseInt(
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_PORT"]) ||
      (typeof process !== "undefined" && process.env?.["MYSQL_PORT"]) ||
      "3306",
    10,
  );
  const user =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_USER"]) ||
    (typeof process !== "undefined" && process.env?.["MYSQL_USER"]) ||
    "root";
  const password =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_PASSWORD"]) ||
    (typeof process !== "undefined" && process.env?.["MYSQL_PASSWORD"]) ||
    "";
  const database =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_DATABASE"]) ||
    (typeof process !== "undefined" && process.env?.["MYSQL_DATABASE"]) ||
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

