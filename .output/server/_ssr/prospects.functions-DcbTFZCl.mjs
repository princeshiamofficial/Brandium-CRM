import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { n as generateUUID, r as getMySQLConfig } from "./mysql-client-BmUznhbS.mjs";
import { t as require_promise } from "../_libs/mysql2+[...].mjs";
import { a as ensureMySQLTablesExist } from "./auth.functions-DgmNluhz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prospects.functions-DcbTFZCl.js
var import_promise = /* @__PURE__ */ __toESM(require_promise());
async function getMySQLConn() {
	const config = getMySQLConfig();
	const conn = await import_promise.createConnection({
		host: config.host === "localhost" ? "127.0.0.1" : config.host,
		port: config.port,
		user: config.user,
		password: config.password ?? "",
		database: config.database
	});
	await ensureMySQLTablesExist(conn, config.database);
	return conn;
}
var saveMySQLProspect_createServerFn_handler = createServerRpc({
	id: "634bb8fcfc2d3747cbf5b5bd2c42247db01d232a6968b19d1c461e5f46d73e7f",
	name: "saveMySQLProspect",
	filename: "src/lib/prospects.functions.ts"
}, (opts) => saveMySQLProspect.__executeServer(opts));
var saveMySQLProspect = createServerFn({ method: "POST" }).validator((input) => input).handler(saveMySQLProspect_createServerFn_handler, async ({ data }) => {
	const contactName = String(data?.contact_name || "").trim();
	if (!contactName) return {
		success: false,
		error: "Contact name is required."
	};
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host === "localhost" ? "127.0.0.1" : config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		let prospectId = data.id && data.id.trim() ? data.id.trim() : "";
		if (!prospectId) try {
			const [rows] = await conn.query("SELECT `id` FROM `prospects` ORDER BY `created_at` DESC;");
			if (Array.isArray(rows) && rows.length > 0) {
				let maxNum = 0;
				for (const r of rows) {
					const match = String(r["id"] || "").match(/^0*(\d+)$/);
					if (match && match[1]) {
						const n = parseInt(match[1], 10);
						if (n > maxNum && n < 1e6) maxNum = n;
					}
				}
				prospectId = maxNum > 0 ? String(maxNum + 1).padStart(4, "0") : String(rows.length + 1).padStart(4, "0");
			} else prospectId = "0001";
		} catch {
			prospectId = "0001";
		}
		let resolvedStageId = data.stage_id && data.stage_id.trim() ? data.stage_id.trim() : null;
		if (!resolvedStageId) try {
			const [stgRows] = await conn.query("SELECT `id` FROM `stages` WHERE LOWER(`name`) LIKE '%prospect%' OR LOWER(`name`) LIKE '%lead%' ORDER BY `sort_order` ASC LIMIT 1;");
			if (Array.isArray(stgRows) && stgRows.length > 0) resolvedStageId = String(stgRows[0]["id"]);
			else resolvedStageId = "prospect";
		} catch {
			resolvedStageId = "prospect";
		}
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await conn.query(`INSERT INTO \`prospects\` (
          \`id\`, \`contact_name\`, \`business_name\`, \`designation\`, \`phone\`,
          \`alternative_phone\`, \`email\`, \`address\`, \`service_id\`, \`stage_id\`,
          \`assigned_to\`, \`created_by\`, \`notes\`, \`is_active\`, \`created_at\`, \`updated_at\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`contact_name\` = VALUES(\`contact_name\`),
          \`business_name\` = VALUES(\`business_name\`),
          \`designation\` = VALUES(\`designation\`),
          \`phone\` = VALUES(\`phone\`),
          \`alternative_phone\` = VALUES(\`alternative_phone\`),
          \`email\` = VALUES(\`email\`),
          \`address\` = VALUES(\`address\`),
          \`service_id\` = VALUES(\`service_id\`),
          \`stage_id\` = VALUES(\`stage_id\`),
          \`assigned_to\` = VALUES(\`assigned_to\`),
          \`created_by\` = VALUES(\`created_by\`),
          \`notes\` = VALUES(\`notes\`),
          \`updated_at\` = VALUES(\`updated_at\`);`, [
			prospectId,
			contactName,
			data.business_name || null,
			data.designation || null,
			data.phone || null,
			data.alternative_phone || null,
			data.email || null,
			data.address || null,
			data.service_id || null,
			resolvedStageId,
			data.assigned_to || null,
			data.created_by || null,
			data.notes || null,
			now,
			now
		]);
		await conn.end();
		return {
			success: true,
			id: prospectId
		};
	} catch (err) {
		const errObj = err;
		console.error("saveMySQLProspect error:", errObj);
		return {
			success: false,
			error: errObj?.message || "Failed to save prospect to MySQL database."
		};
	}
});
var fetchMySQLProspects_createServerFn_handler = createServerRpc({
	id: "989c390de9f9607f6445baeb29b776b2e8bb972a3df6baff55423f8858aec19d",
	name: "fetchMySQLProspects",
	filename: "src/lib/prospects.functions.ts"
}, (opts) => fetchMySQLProspects.__executeServer(opts));
var fetchMySQLProspects = createServerFn({ method: "GET" }).handler(fetchMySQLProspects_createServerFn_handler, async () => {
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host === "localhost" ? "127.0.0.1" : config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const [rows] = await conn.query(`SELECT 
          p.*,
          s.name AS service_name,
          COALESCE(st.name, p.stage_id, 'Prospect') AS stage_name,
          st.stage_group AS stage_group,
          st.color AS stage_color,
          st.icon AS stage_icon,
          u_assign.name AS assigned_agent_name,
          u_create.name AS creator_name
        FROM \`prospects\` p
        LEFT JOIN \`services\` s ON p.service_id = s.id
        LEFT JOIN \`stages\` st ON (p.stage_id = st.id OR p.stage_id = REPLACE(st.id, '-', '_') OR p.stage_id = st.name)
        LEFT JOIN \`users\` u_assign ON p.assigned_to = u_assign.id
        LEFT JOIN \`users\` u_create ON p.created_by = u_create.id
        WHERE (p.is_active = 1 OR p.is_active IS NULL)
        ORDER BY p.created_at DESC;`);
		await conn.end();
		return {
			success: true,
			prospects: rows.map((r) => {
				const plain = {};
				for (const key of Object.keys(r)) {
					const val = r[key];
					if (val === null || val === void 0) plain[key] = null;
					else if (val instanceof Date) plain[key] = val.toISOString().slice(0, 19).replace("T", " ");
					else if (typeof val === "number" || typeof val === "boolean" || typeof val === "string") plain[key] = val;
					else plain[key] = String(val);
				}
				return plain;
			})
		};
	} catch (err) {
		const errObj = err;
		console.error("fetchMySQLProspects error:", errObj);
		return {
			success: false,
			error: errObj?.message || "Failed to fetch prospects from MySQL database."
		};
	}
});
var seedMySQLProspects_createServerFn_handler = createServerRpc({
	id: "fb9036294f37134c9830ee41c58d2c863463a220c74f65630b75aba35acbbae7",
	name: "seedMySQLProspects",
	filename: "src/lib/prospects.functions.ts"
}, (opts) => seedMySQLProspects.__executeServer(opts));
var seedMySQLProspects = createServerFn({ method: "POST" }).validator((input) => input).handler(seedMySQLProspects_createServerFn_handler, async ({ data }) => {
	const list = data?.prospects || [];
	if (list.length === 0) return {
		success: true,
		count: 0
	};
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host === "localhost" ? "127.0.0.1" : config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		let insertedCount = 0;
		for (const item of list) {
			const prospectId = item.id && item.id.trim() ? item.id.trim() : generateUUID();
			const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
			await conn.query(`INSERT INTO \`prospects\` (
            \`id\`, \`contact_name\`, \`business_name\`, \`designation\`, \`phone\`,
            \`alternative_phone\`, \`email\`, \`address\`, \`service_id\`, \`stage_id\`,
            \`assigned_to\`, \`created_by\`, \`notes\`, \`is_active\`, \`created_at\`, \`updated_at\`
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
          ON DUPLICATE KEY UPDATE \`contact_name\` = VALUES(\`contact_name\`);`, [
				prospectId,
				item.contact_name,
				item.business_name || null,
				item.designation || null,
				item.phone || null,
				item.alternative_phone || null,
				item.email || null,
				item.address || null,
				item.service_id || null,
				item.stage_id || null,
				item.assigned_to || null,
				item.created_by || null,
				item.notes || null,
				now,
				now
			]);
			insertedCount++;
		}
		await conn.end();
		return {
			success: true,
			count: insertedCount
		};
	} catch (err) {
		const errObj = err;
		console.error("seedMySQLProspects error:", errObj);
		return {
			success: false,
			error: errObj?.message || "Failed to seed prospects into MySQL."
		};
	}
});
var deleteMySQLProspect_createServerFn_handler = createServerRpc({
	id: "192174d2f49f4de7b0ddb1fb2bbd65926d6c11d7b4101b2414c64bc0a9f2455c",
	name: "deleteMySQLProspect",
	filename: "src/lib/prospects.functions.ts"
}, (opts) => deleteMySQLProspect.__executeServer(opts));
var deleteMySQLProspect = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteMySQLProspect_createServerFn_handler, async ({ data }) => {
	const prospectId = String(data?.id || "").trim();
	if (!prospectId) return {
		success: false,
		error: "Prospect ID is required."
	};
	try {
		const conn = await getMySQLConn();
		await conn.query("DELETE FROM `prospects` WHERE `id` = ?", [prospectId]);
		await conn.end();
		return { success: true };
	} catch (err) {
		const errObj = err;
		console.error("deleteMySQLProspect error:", errObj);
		return {
			success: false,
			error: errObj?.message || "Failed to delete prospect from MySQL."
		};
	}
});
var updateMySQLProspect_createServerFn_handler = createServerRpc({
	id: "de5f7fbc5103c068b3c443600a30f286a455a708c437a5e475edf3361b9ec6b8",
	name: "updateMySQLProspect",
	filename: "src/lib/prospects.functions.ts"
}, (opts) => updateMySQLProspect.__executeServer(opts));
var updateMySQLProspect = createServerFn({ method: "POST" }).validator((input) => input).handler(updateMySQLProspect_createServerFn_handler, async ({ data }) => {
	const prospectId = String(data?.id || "").trim();
	if (!prospectId) return {
		success: false,
		error: "Prospect ID is required."
	};
	try {
		const conn = await getMySQLConn();
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await conn.query(`UPDATE \`prospects\` SET
          \`contact_name\` = ?,
          \`business_name\` = ?,
          \`designation\` = ?,
          \`phone\` = ?,
          \`alternative_phone\` = ?,
          \`email\` = ?,
          \`address\` = ?,
          \`service_id\` = ?,
          \`stage_id\` = ?,
          \`assigned_to\` = ?,
          \`created_by\` = ?,
          \`notes\` = ?,
          \`updated_at\` = ?
        WHERE \`id\` = ?`, [
			data.contact_name,
			data.business_name || null,
			data.designation || null,
			data.phone || null,
			data.alternative_phone || null,
			data.email || null,
			data.address || null,
			data.service_id || null,
			data.stage_id || null,
			data.assigned_to || null,
			data.created_by || null,
			data.notes || null,
			now,
			prospectId
		]);
		await conn.end();
		return { success: true };
	} catch (err) {
		const errObj = err;
		console.error("updateMySQLProspect error:", errObj);
		return {
			success: false,
			error: errObj?.message || "Failed to update prospect in MySQL."
		};
	}
});
//#endregion
export { deleteMySQLProspect_createServerFn_handler, fetchMySQLProspects_createServerFn_handler, saveMySQLProspect_createServerFn_handler, seedMySQLProspects_createServerFn_handler, updateMySQLProspect_createServerFn_handler };
