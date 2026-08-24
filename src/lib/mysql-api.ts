/**
 * Direct MySQL API Client Bridge
 * Routes database operations securely through Node.js Vite server endpoint (/api/mysql) in browser
 * and TanStack Start server functions (`executeMySQLQueryFn`) in SSR/production.
 * Ensures 100% persistence to local MySQL database `brandium_crm`.
 */
import { executeMySQLQueryFn } from "./crm.functions";

let isApiMysqlDisabled = false;

export async function runMySQLQuery<T = unknown>(
  sql: string,
  params: unknown[] = [],
): Promise<{ success: boolean; data?: T; error?: string }> {
  const isDev = Boolean(import.meta.env?.DEV);

  // 1. In browser dev mode: execute directly via Vite Node.js endpoint if available
  if (
    isDev &&
    !isApiMysqlDisabled &&
    typeof window !== "undefined" &&
    typeof fetch !== "undefined"
  ) {
    try {
      const response = await fetch("/api/mysql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "query", sql, params }),
      });
      if (response.ok) {
        const result = (await response.json()) as { success: boolean; data?: T; error?: string };
        if (result.success) return result;
      } else if (response.status === 404 || response.status === 403) {
        isApiMysqlDisabled = true;
      }
    } catch (err) {
      isApiMysqlDisabled = true;
      console.warn("Direct /api/mysql browser fetch notice:", err);
    }
  }

  // 2. Server / SSR / Fallback: Execute via TanStack Start Server Function
  try {
    const sanitizedParams = params.map((p) =>
      p === undefined || p === null
        ? null
        : typeof p === "number" || typeof p === "boolean"
          ? p
          : String(p),
    );
    const res = (await executeMySQLQueryFn({
      data: { sql, params: sanitizedParams },
    })) as { success?: boolean; data?: unknown; error?: string };

    if (res && res.success) {
      return { success: true, data: res.data as T };
    }

    return { success: false, error: res?.error || "Database query failed." };
  } catch (err: unknown) {
    const errObj = err as { message?: string };
    return { success: false, error: errObj?.message || "Network error" };
  }
}
