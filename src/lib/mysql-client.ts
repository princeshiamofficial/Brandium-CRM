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
  if (typeof process !== "undefined" && process.versions?.node && !process.env?.["MYSQL_USER"]) {
    try {
      const fs = require("fs");
      const path = require("path");
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach((line: string) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
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
        });
      }
    } catch {
      // Ignore if unavailable
    }
  }

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
    "crm_brandium";
  const rawPassword =
    (typeof process !== "undefined" && process.env?.["MYSQL_PASSWORD"]) !== undefined &&
    process.env?.["MYSQL_PASSWORD"] !== ""
      ? (process.env?.["MYSQL_PASSWORD"] as string)
      : (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_PASSWORD"]) ||
        "Brandium456";
  const password = rawPassword;
  const database =
    (typeof process !== "undefined" && process.env?.["MYSQL_DATABASE"]) ||
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_MYSQL_DATABASE"]) ||
    "crm_brandium";

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
