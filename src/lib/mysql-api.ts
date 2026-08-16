/**
 * Direct MySQL API Client Bridge
 * Sends SQL queries from the browser directly to Vite Node.js dev server endpoint (/api/mysql).
 * Ensures 100% persistence to local MySQL database `brandium_crm` in phpMyAdmin.
 */

export async function runMySQLQuery<T = unknown>(
  sql: string,
  params: unknown[] = [],
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch("/api/mysql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "query", sql, params }),
    });
    if (!response.ok) {
      const errJson = (await response.json().catch(() => ({}))) as { error?: string };
      return { success: false, error: errJson.error || "Server HTTP error" };
    }
    const result = (await response.json()) as { success: boolean; data?: T; error?: string };
    return result;
  } catch (err: unknown) {
    const errObj = err as { message?: string };
    return { success: false, error: errObj?.message || "Network error" };
  }
}
