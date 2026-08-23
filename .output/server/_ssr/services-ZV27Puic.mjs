import { t as runMySQLQuery } from "./mysql-api-C2GgWVVv.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-ZV27Puic.js
function generateUUID() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
async function fetchServices(search) {
	try {
		const res = await runMySQLQuery("SELECT id, name, description, icon, is_active, created_at, updated_at FROM `services` WHERE is_active = 1 ORDER BY name ASC;");
		if (!res.success || !Array.isArray(res.data)) return [];
		return applySearchToServices(res.data.map((s) => ({
			id: String(s["id"]),
			name: String(s["name"] || "Service"),
			description: s["description"] || null,
			icon: s["icon"] || "Layers",
			status: Number(s["is_active"] ?? 1) === 1 ? "Active" : "Inactive",
			is_deleted: false,
			created_at: String(s["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
			updated_at: String(s["updated_at"] || (/* @__PURE__ */ new Date()).toISOString())
		})), search);
	} catch (err) {
		console.warn("fetchServices MySQL error:", err);
		return [];
	}
}
function applySearchToServices(list, search) {
	let activeList = list.filter((s) => !s.is_deleted);
	if (search && search.trim() !== "") {
		const q = search.toLowerCase().trim();
		activeList = activeList.filter((s) => s.name.toLowerCase().includes(q) || s.description && s.description.toLowerCase().includes(q));
	}
	return activeList;
}
async function createService(input) {
	if (!input.name || !input.name.trim()) throw new Error("Service name is required.");
	const id = generateUUID();
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const res = await runMySQLQuery(`INSERT INTO \`services\` (\`id\`, \`name\`, \`description\`, \`icon\`, \`is_active\`, \`created_at\`, \`updated_at\`)
     VALUES (?, ?, ?, ?, ?, ?, ?);`, [
		id,
		input.name.trim(),
		input.description?.trim() || null,
		input.icon || "Layers",
		input.status === "Inactive" ? 0 : 1,
		now,
		now
	]);
	if (!res.success) throw new Error(res.error || "Failed to create service in database.");
	return {
		id,
		name: input.name.trim(),
		description: input.description?.trim() || null,
		icon: input.icon || "Layers",
		status: input.status || "Active",
		is_deleted: false,
		created_at: now,
		updated_at: now
	};
}
async function updateService(id, input) {
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	await runMySQLQuery(`UPDATE \`services\` SET \`name\` = ?, \`description\` = ?, \`icon\` = ?, \`is_active\` = ?, \`updated_at\` = ? WHERE \`id\` = ?;`, [
		input.name.trim(),
		input.description?.trim() || null,
		input.icon || "Layers",
		input.status === "Inactive" ? 0 : 1,
		now,
		id
	]);
	return {
		id,
		name: input.name.trim(),
		description: input.description?.trim() || null,
		icon: input.icon || "Layers",
		status: input.status || "Active",
		is_deleted: false,
		created_at: now,
		updated_at: now
	};
}
async function toggleServiceStatus(id, newStatus) {
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const res = await runMySQLQuery("UPDATE `services` SET `is_active` = ?, `updated_at` = ? WHERE `id` = ?;", [
		newStatus === "Active" ? 1 : 0,
		now,
		id
	]);
	return Boolean(res.success);
}
async function softDeleteService(id) {
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const res = await runMySQLQuery("UPDATE `services` SET `is_active` = 0, `updated_at` = ? WHERE `id` = ?;", [now, id]);
	return Boolean(res.success);
}
var servicesQueryOptions = (search) => queryOptions({
	queryKey: ["crm-services", search],
	queryFn: () => fetchServices(search)
});
//#endregion
export { updateService as a, toggleServiceStatus as i, servicesQueryOptions as n, softDeleteService as r, createService as t };
