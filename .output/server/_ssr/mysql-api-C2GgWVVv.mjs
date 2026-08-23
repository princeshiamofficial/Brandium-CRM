import { t as executeMySQLQueryFn } from "./crm.functions-DTipqmZ4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mysql-api-C2GgWVVv.js
/**
* Direct MySQL API Client Bridge
* Routes database operations securely through Node.js Vite server endpoint (/api/mysql) in browser
* and TanStack Start server functions (`executeMySQLQueryFn`) in SSR/production.
* Ensures 100% persistence to local MySQL database `brandium_crm`.
*/
async function runMySQLQuery(sql, params = []) {
	if (typeof window !== "undefined" && typeof fetch !== "undefined") try {
		const response = await fetch("/api/mysql", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				action: "query",
				sql,
				params
			})
		});
		if (response.ok) {
			const result = await response.json();
			if (result.success) return result;
		}
	} catch (err) {
		console.warn("Direct /api/mysql browser fetch notice:", err);
	}
	try {
		const sanitizedParams = params.map((p) => p === void 0 || p === null ? null : typeof p === "number" || typeof p === "boolean" ? p : String(p));
		const res = await executeMySQLQueryFn({ data: {
			sql,
			params: sanitizedParams
		} });
		if (res && res.success) return {
			success: true,
			data: res.data
		};
		return {
			success: false,
			error: res?.error || "Database query failed."
		};
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Network error"
		};
	}
}
//#endregion
export { runMySQLQuery as t };
