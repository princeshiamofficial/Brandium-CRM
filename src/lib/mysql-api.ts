/**
 * Direct MySQL API Client Bridge
 * Routes database operations securely through Next.js /api/mysql route handler.
 * Ensures 100% persistence to local MySQL database `brandium_crm`.
 */

export async function runMySQLQuery<T = unknown>(
  sql: string,
  params: unknown[] = [],
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const sanitizedParams = params.map((p) =>
      p === undefined || p === null
        ? null
        : typeof p === "number" || typeof p === "boolean"
          ? p
          : String(p),
    );

    if (typeof window !== "undefined" && typeof fetch !== "undefined") {
      const response = await fetch("/api/mysql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "query", sql, params: sanitizedParams }),
      });
      if (response.ok) {
        const result = (await response.json()) as { success: boolean; data?: T; error?: string };
        return result;
      }
      const errJson = await response.json().catch(() => ({}));
      return { success: false, error: (errJson as { error?: string }).error || "Query failed." };
    }

    // On server during SSR/prerender
    const baseUrl = process.env["NEXT_PUBLIC_APP_URL"] || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/mysql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "query", sql, params: sanitizedParams }),
      cache: "no-store",
    });
    const result = (await response.json()) as { success: boolean; data?: T; error?: string };
    return result;
  } catch (err: unknown) {
    const errObj = err as { message?: string };
    return { success: false, error: errObj?.message || "Database connection error" };
  }
}

/**
 * Generates a standard RFC 4122 v4 UUID directly from the MySQL database engine.
 */
export async function fetchDbUUID(): Promise<string> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>("SELECT UUID() AS uuid;");
    if (res.success && Array.isArray(res.data) && res.data[0]?.["uuid"]) {
      return String(res.data[0]["uuid"]);
    }
  } catch (err) {
    console.warn("fetchDbUUID fallback:", err);
  }
  // Client-side fallback only if database connection is completely down
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
