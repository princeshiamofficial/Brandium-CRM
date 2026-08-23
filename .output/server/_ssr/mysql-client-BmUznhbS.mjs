import { o as __toESM } from "../_runtime.mjs";
import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/mysql-client-BmUznhbS.js
function getMySQLConfig() {
	const serverEnv = typeof processModule !== "undefined" ? processModule.env : void 0;
	const clientEnv = typeof import.meta !== "undefined" ? {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	} : void 0;
	const host = serverEnv?.["MYSQL_HOST"] || clientEnv?.["VITE_MYSQL_HOST"] || "localhost";
	const port = parseInt(serverEnv?.["MYSQL_PORT"] || clientEnv?.["VITE_MYSQL_PORT"] || "3306", 10);
	const user = serverEnv?.["MYSQL_USER"] || clientEnv?.["VITE_MYSQL_USER"] || "root";
	const password = serverEnv?.["MYSQL_PASSWORD"] || "";
	const database = serverEnv?.["MYSQL_DATABASE"] || clientEnv?.["VITE_MYSQL_DATABASE"] || "brandium_crm";
	const connectionLimit = parseInt(serverEnv?.["MYSQL_CONNECTION_LIMIT"] || "20", 10);
	return {
		host,
		port: Number.isFinite(port) ? port : 3306,
		user,
		password,
		database,
		connectionLimit: Number.isFinite(connectionLimit) ? connectionLimit : 20
	};
}
function checkDatabaseConnection() {
	if (typeof window === "undefined") return false;
	return true;
}
var globalPool = null;
async function getMySQLPool() {
	if (globalPool) return globalPool;
	const mysqlModule = await import("../_libs/mysql2+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
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
		keepAliveInitialDelay: 1e4,
		charset: "utf8mb4"
	});
	return globalPool;
}
/**
* Utility to generate standard 36-character RFC4122 v4 UUIDs using Web/Node Crypto.
* Compliant with MySQL VARCHAR(36) primary key schema definitions.
*/
function generateUUID() {
	try {
		if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
		const globalCrypto = typeof window !== "undefined" ? window.crypto : void 0;
		if (globalCrypto && typeof globalCrypto.randomUUID === "function") return globalCrypto.randomUUID();
	} catch {}
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
//#endregion
export { getMySQLPool as i, generateUUID as n, getMySQLConfig as r, checkDatabaseConnection as t };
