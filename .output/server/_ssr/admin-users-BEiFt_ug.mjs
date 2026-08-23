import { t as runMySQLQuery } from "./mysql-api-BWYhfGzd.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { t as bcryptjs_default } from "../_libs/bcryptjs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-users-BEiFt_ug.js
function generateUUID() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
function hashPasswordBcrypt(plaintext) {
	try {
		const salt = bcryptjs_default.genSaltSync(10);
		return bcryptjs_default.hashSync(plaintext, salt);
	} catch {
		return plaintext;
	}
}
function verifyPasswordBcrypt(plaintext, hash) {
	try {
		return bcryptjs_default.compareSync(plaintext, hash);
	} catch {
		return false;
	}
}
var userAvatarMemoryMap = /* @__PURE__ */ new Map();
async function fetchCrmUsers(search) {
	let mapped = [];
	try {
		const dbRes = await runMySQLQuery("SELECT * FROM `users` WHERE is_deleted = 0 ORDER BY name ASC;");
		if (dbRes.success && Array.isArray(dbRes.data)) mapped = dbRes.data.map((u) => {
			const userId = String(u["id"]);
			const dbAvatar = u["avatar_url"] ? String(u["avatar_url"]) : null;
			const memoryAvatar = userAvatarMemoryMap.get(userId);
			const avatarUrl = memoryAvatar !== void 0 ? memoryAvatar : dbAvatar;
			if (avatarUrl) userAvatarMemoryMap.set(userId, avatarUrl);
			return {
				id: userId,
				name: String(u["name"] || "User"),
				email: String(u["email"] || ""),
				password_hash: String(u["password_hash"] || ""),
				role: u["role"] || "AGENT",
				status: u["status"] || "Active",
				avatar_url: avatarUrl,
				is_deleted: Boolean(Number(u["is_deleted"] ?? 0)),
				deleted_at: u["deleted_at"] || null,
				created_at: String(u["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
				updated_at: String(u["updated_at"] || (/* @__PURE__ */ new Date()).toISOString())
			};
		});
	} catch (err) {
		console.warn("fetchCrmUsers MySQL error:", err);
		mapped = [];
	}
	return applySearchToUsers(mapped, search);
}
function applySearchToUsers(list, search) {
	let activeList = list.filter((u) => !u.is_deleted);
	if (search && search.trim() !== "") {
		const q = search.toLowerCase().trim();
		activeList = activeList.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.status.toLowerCase().includes(q));
	}
	return activeList;
}
async function fetchCrmUserById(id) {
	return (await fetchCrmUsers()).find((u) => u.id === id) || null;
}
async function createCrmUser(input) {
	if (!input.email || !input.email.includes("@")) throw new Error("Please enter a valid email address.");
	if (!input.name || !input.name.trim()) throw new Error("User full name is required.");
	const existing = await runMySQLQuery("SELECT id FROM `users` WHERE LOWER(email) = LOWER(?) AND is_deleted = 0 LIMIT 1;", [input.email.trim()]);
	if (existing.success && Array.isArray(existing.data) && existing.data.length > 0) throw new Error(`A user account with email "${input.email}" already exists.`);
	const hashedPassword = hashPasswordBcrypt(input.password_hash);
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const userId = generateUUID();
	const insertRes = await runMySQLQuery(`INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`avatar_url\`, \`is_deleted\`, \`created_at\`, \`updated_at\`)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?);`, [
		userId,
		input.name.trim(),
		input.email.toLowerCase().trim(),
		hashedPassword,
		input.role,
		input.status,
		input.avatar_url || null,
		now,
		now
	]);
	if (!insertRes.success) throw new Error(insertRes.error || "Failed to create user in database.");
	return {
		id: userId,
		name: input.name.trim(),
		email: input.email.toLowerCase().trim(),
		password_hash: hashedPassword,
		role: input.role,
		status: input.status,
		avatar_url: input.avatar_url || null,
		is_deleted: false,
		created_at: now,
		updated_at: now
	};
}
async function updateCrmUser(id, input) {
	const inputEmail = input.email.toLowerCase().trim();
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const dupRes = await runMySQLQuery("SELECT id FROM `users` WHERE id != ? AND LOWER(email) = LOWER(?) AND is_deleted = 0 LIMIT 1;", [id, inputEmail]);
	if (dupRes.success && Array.isArray(dupRes.data) && dupRes.data.length > 0) throw new Error(`Another user account with email "${input.email}" already exists.`);
	await runMySQLQuery("UPDATE `users` SET `name` = ?, `email` = ?, `role` = ?, `status` = ?, `updated_at` = ? WHERE `id` = ?;", [
		input.name.trim(),
		inputEmail,
		input.role,
		input.status,
		now,
		id
	]);
	const updated = await fetchCrmUserById(id);
	if (!updated) throw new Error("Failed to load updated user.");
	return updated;
}
async function resetUserPassword(userId, newPlaintext) {
	if (!newPlaintext || newPlaintext.length < 6) throw new Error("New password must be at least 6 characters long.");
	const hashed = hashPasswordBcrypt(newPlaintext);
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	await runMySQLQuery("UPDATE `users` SET `password_hash` = ?, `updated_at` = ? WHERE `id` = ?;", [
		hashed,
		now,
		userId
	]);
	return true;
}
async function changeOwnPassword(userId, currentPlaintext, newPlaintext) {
	const user = await fetchCrmUserById(userId);
	if (!user) throw new Error("User account not found.");
	if (!verifyPasswordBcrypt(currentPlaintext, user.password_hash)) throw new Error("Current password entered is incorrect.");
	return resetUserPassword(userId, newPlaintext);
}
async function toggleUserStatus(userId, newStatus) {
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	await runMySQLQuery("UPDATE `users` SET `status` = ?, `is_active` = ?, `updated_at` = ? WHERE `id` = ?;", [
		newStatus,
		newStatus === "Active" ? 1 : 0,
		now,
		userId
	]);
	return true;
}
async function softDeleteCrmUser(userId) {
	const user = await fetchCrmUserById(userId);
	if (user?.email === "admin@example.com" || user?.email === "agent@brandium.com") throw new Error("System default accounts cannot be deleted.");
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	await runMySQLQuery("UPDATE `users` SET `is_deleted` = 1, `status` = 'Deleted', `deleted_at` = ?, `updated_at` = ? WHERE `id` = ?;", [
		now,
		now,
		userId
	]);
	return true;
}
async function updateUserAvatar(userId, avatarUrl) {
	const newAvatar = avatarUrl || null;
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	if (newAvatar) userAvatarMemoryMap.set(userId, newAvatar);
	else userAvatarMemoryMap.delete(userId);
	await runMySQLQuery("UPDATE `users` SET `avatar_url` = ?, `updated_at` = ? WHERE `id` = ?;", [
		newAvatar,
		now,
		userId
	]);
	return true;
}
var crmUsersQueryOptions = (search) => queryOptions({
	queryKey: ["crm-users", search],
	queryFn: () => fetchCrmUsers(search)
});
//#endregion
export { resetUserPassword as a, updateCrmUser as c, fetchCrmUsers as i, updateUserAvatar as l, createCrmUser as n, softDeleteCrmUser as o, crmUsersQueryOptions as r, toggleUserStatus as s, changeOwnPassword as t };
