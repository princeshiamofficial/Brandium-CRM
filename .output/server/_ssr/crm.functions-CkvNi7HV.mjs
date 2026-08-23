import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { i as getMySQLPool, n as generateUUID, r as getMySQLConfig } from "./mysql-client-k5RcJc-f.mjs";
import { a as ensureMySQLTablesExist } from "./auth.functions-DaU64VEk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crm.functions-CkvNi7HV.js
async function ensureBootstrapped() {
	const pool = await getMySQLPool();
	const config = getMySQLConfig();
	const conn = await pool.getConnection();
	try {
		await ensureMySQLTablesExist(conn, config.database);
	} finally {
		conn.release();
	}
}
var fetchOpportunitiesFn_createServerFn_handler = createServerRpc({
	id: "caec5d0400563b475ec6eb4661986c585d1f7c60791f6202f67f44c29bcefe4f",
	name: "fetchOpportunitiesFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => fetchOpportunitiesFn.__executeServer(opts));
var fetchOpportunitiesFn = createServerFn({ method: "GET" }).validator((input) => input || {}).handler(fetchOpportunitiesFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const whereClauses = ["1=1"];
		const params = [];
		if (data?.search && data.search.trim()) {
			const term = `%${data.search.trim()}%`;
			whereClauses.push("(p.contact_name LIKE ? OR p.business_name LIKE ? OR p.email LIKE ? OR p.phone LIKE ? OR o.notes LIKE ?)");
			params.push(term, term, term, term, term);
		}
		if (data?.status && data.status.trim() && data.status !== "all") {
			whereClauses.push("o.stage = ?");
			params.push(data.status.trim());
		}
		if (data?.agent && data.agent.trim() && data.agent !== "all") {
			whereClauses.push("(o.assigned_to = ? OR u_agent.name LIKE ?)");
			params.push(data.agent.trim(), `%${data.agent.trim()}%`);
		}
		if (data?.from && data.from.trim()) {
			whereClauses.push("o.created_at >= ?");
			params.push(`${data.from.trim()} 00:00:00`);
		}
		if (data?.to && data.to.trim()) {
			whereClauses.push("o.created_at <= ?");
			params.push(`${data.to.trim()} 23:59:59`);
		}
		const sql = `
        SELECT 
          o.id,
          o.prospect_id,
          CAST(o.value AS DOUBLE) AS estimated_value,
          o.stage AS status,
          o.expected_close_date,
          o.created_at,
          o.created_at AS updated_at,
          p.contact_name AS prospect_name,
          p.business_name AS prospect_business,
          p.designation AS prospect_designation,
          p.email AS prospect_email,
          p.phone AS prospect_phone,
          p.assigned_to,
          p.created_by,
          p.notes,
          1 AS is_active,
          COALESCE(u_agent.name, 'Unassigned') AS agent_name,
          COALESCE(u_creator.name, 'System') AS creator_name
        FROM opportunities o
        LEFT JOIN prospects p ON o.prospect_id = p.id
        LEFT JOIN users u_agent ON p.assigned_to = u_agent.id
        LEFT JOIN users u_creator ON p.created_by = u_creator.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY o.created_at DESC;
      `;
		const [rows] = await pool.query(sql, params);
		return {
			success: true,
			data: rows.map((r) => ({
				id: String(r["id"]),
				prospect_id: String(r["prospect_id"]),
				estimated_value: Number(r["estimated_value"]) || 0,
				assigned_to: r["assigned_to"] ? String(r["assigned_to"]) : null,
				created_by: r["created_by"] ? String(r["created_by"]) : null,
				status: String(r["status"] || "Opportunity Created"),
				notes: r["notes"] ? String(r["notes"]) : null,
				is_active: true,
				created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
				updated_at: String(r["updated_at"] || (/* @__PURE__ */ new Date()).toISOString()),
				prospect_name: r["prospect_name"] ? String(r["prospect_name"]) : "Unknown Prospect",
				prospect_business: r["prospect_business"] ? String(r["prospect_business"]) : null,
				prospect_designation: r["prospect_designation"] ? String(r["prospect_designation"]) : null,
				prospect_email: r["prospect_email"] ? String(r["prospect_email"]) : null,
				prospect_phone: r["prospect_phone"] ? String(r["prospect_phone"]) : null,
				agent_name: r["agent_name"] ? String(r["agent_name"]) : "Unassigned",
				creator_name: r["creator_name"] ? String(r["creator_name"]) : "System"
			}))
		};
	} catch (err) {
		const errObj = err;
		console.error("fetchOpportunitiesFn error:", errObj?.message);
		return {
			success: false,
			data: [],
			error: errObj?.message || "Failed to fetch opportunities"
		};
	}
});
var saveOpportunityFn_createServerFn_handler = createServerRpc({
	id: "5d75a77ebd49d640b1ad86acd722f8125ec463c12dc4283ea8427a5d3b4b48ea",
	name: "saveOpportunityFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => saveOpportunityFn.__executeServer(opts));
var saveOpportunityFn = createServerFn({ method: "POST" }).validator((input) => input).handler(saveOpportunityFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const oppId = data.id?.trim() || generateUUID();
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await pool.query(`INSERT INTO opportunities (id, prospect_id, value, stage, expected_close_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           value = VALUES(value),
           stage = VALUES(stage),
           expected_close_date = VALUES(expected_close_date);`, [
			oppId,
			data.prospect_id,
			data.estimated_value || 0,
			data.status || "Opportunity Created",
			data.expected_close_date || null,
			now
		]);
		await pool.query(`INSERT INTO activities (id, prospect_id, activity_type, message, created_at)
         VALUES (?, ?, 'opportunity_update', ?, ?);`, [
			generateUUID(),
			data.prospect_id,
			`Opportunity updated: Stage '${data.status}', Value ৳${data.estimated_value}`,
			now
		]);
		return {
			success: true,
			id: oppId
		};
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to save opportunity"
		};
	}
});
var deleteOpportunityFn_createServerFn_handler = createServerRpc({
	id: "b2ce7e63b018a1272a35ae9e0988f2e5c17c6d054b7d1eb762894b3549825004",
	name: "deleteOpportunityFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => deleteOpportunityFn.__executeServer(opts));
var deleteOpportunityFn = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteOpportunityFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		await (await getMySQLPool()).query("DELETE FROM opportunities WHERE id = ?;", [data.id]);
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to delete opportunity"
		};
	}
});
var fetchMeetingsFn_createServerFn_handler = createServerRpc({
	id: "1c2eb5b0dca9c4b1c106beb01f913ebebe051493858d289aa15125deb360fc59",
	name: "fetchMeetingsFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => fetchMeetingsFn.__executeServer(opts));
var fetchMeetingsFn = createServerFn({ method: "GET" }).validator((input) => input || {}).handler(fetchMeetingsFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const whereClauses = ["1=1"];
		const params = [];
		if (data?.search && data.search.trim()) {
			const term = `%${data.search.trim()}%`;
			whereClauses.push("(m.title LIKE ? OR p.contact_name LIKE ? OR p.business_name LIKE ? OR m.notes LIKE ?)");
			params.push(term, term, term, term);
		}
		if (data?.status && data.status.trim() && data.status !== "all") {
			whereClauses.push("m.status = ?");
			params.push(data.status.trim());
		}
		if (data?.agent && data.agent.trim() && data.agent !== "all") {
			whereClauses.push("(m.assigned_to = ? OR u.name LIKE ?)");
			params.push(data.agent.trim(), `%${data.agent.trim()}%`);
		}
		if (data?.from && data.from.trim()) {
			whereClauses.push("m.scheduled_at >= ?");
			params.push(`${data.from.trim()} 00:00:00`);
		}
		if (data?.to && data.to.trim()) {
			whereClauses.push("m.scheduled_at <= ?");
			params.push(`${data.to.trim()} 23:59:59`);
		}
		const sql = `
        SELECT 
          m.id,
          m.prospect_id,
          m.assigned_to,
          m.title,
          m.scheduled_at,
          m.status,
          m.notes,
          m.created_at,
          COALESCE(p.contact_name, 'Unknown') AS prospect_name,
          p.business_name AS prospect_business,
          COALESCE(u.name, 'Unassigned') AS agent_name
        FROM meetings m
        LEFT JOIN prospects p ON m.prospect_id = p.id
        LEFT JOIN users u ON m.assigned_to = u.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY m.scheduled_at DESC;
      `;
		const [rows] = await pool.query(sql, params);
		return {
			success: true,
			data: rows.map((r) => ({
				id: String(r["id"]),
				prospect_id: String(r["prospect_id"]),
				assigned_to: r["assigned_to"] ? String(r["assigned_to"]) : null,
				title: String(r["title"]),
				scheduled_at: String(r["scheduled_at"]),
				status: String(r["status"] || "scheduled"),
				notes: r["notes"] ? String(r["notes"]) : null,
				created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
				prospect_name: String(r["prospect_name"] || "Unknown"),
				prospect_business: r["prospect_business"] ? String(r["prospect_business"]) : null,
				agent_name: String(r["agent_name"] || "Unassigned")
			}))
		};
	} catch (err) {
		const errObj = err;
		console.error("fetchMeetingsFn error:", errObj?.message);
		return {
			success: false,
			data: [],
			error: errObj?.message || "Failed to fetch meetings"
		};
	}
});
var saveMeetingFn_createServerFn_handler = createServerRpc({
	id: "bb0bd5c73a88a8eba7d581ea05a0f921443938b13ed3ca6170f1ad6e84fb89ac",
	name: "saveMeetingFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => saveMeetingFn.__executeServer(opts));
var saveMeetingFn = createServerFn({ method: "POST" }).validator((input) => input).handler(saveMeetingFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const meetingId = data.id?.trim() || generateUUID();
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await pool.query(`INSERT INTO meetings (id, prospect_id, assigned_to, title, scheduled_at, status, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           assigned_to = VALUES(assigned_to),
           title = VALUES(title),
           scheduled_at = VALUES(scheduled_at),
           status = VALUES(status),
           notes = VALUES(notes);`, [
			meetingId,
			data.prospect_id,
			data.assigned_to || null,
			data.title,
			data.scheduled_at,
			data.status || "scheduled",
			data.notes || null,
			now
		]);
		await pool.query(`INSERT INTO activities (id, prospect_id, activity_type, message, created_at)
         VALUES (?, ?, 'meeting_scheduled', ?, ?);`, [
			generateUUID(),
			data.prospect_id,
			`Meeting '${data.title}' scheduled for ${data.scheduled_at}`,
			now
		]);
		return {
			success: true,
			id: meetingId
		};
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to save meeting"
		};
	}
});
var deleteMeetingFn_createServerFn_handler = createServerRpc({
	id: "d9bc4096fa260826000fb2a6ec1819fe52a976cda9847ce3481818dbd25a20ef",
	name: "deleteMeetingFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => deleteMeetingFn.__executeServer(opts));
var deleteMeetingFn = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteMeetingFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		await (await getMySQLPool()).query("DELETE FROM meetings WHERE id = ?;", [data.id]);
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to delete meeting"
		};
	}
});
var fetchFollowUpsFn_createServerFn_handler = createServerRpc({
	id: "d677951d5718fc7690f7b64f6f3de023ac05b5a9edf7d7e347b2cfc9d4dddb28",
	name: "fetchFollowUpsFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => fetchFollowUpsFn.__executeServer(opts));
var fetchFollowUpsFn = createServerFn({ method: "GET" }).validator((input) => input || {}).handler(fetchFollowUpsFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const whereClauses = ["1=1"];
		const params = [];
		if (data?.search && data.search.trim()) {
			const term = `%${data.search.trim()}%`;
			whereClauses.push("(p.contact_name LIKE ? OR p.business_name LIKE ? OR f.note LIKE ?)");
			params.push(term, term, term);
		}
		if (data?.status && data.status.trim() && data.status !== "all") {
			whereClauses.push("f.status = ?");
			params.push(data.status.trim());
		}
		if (data?.agent && data.agent.trim() && data.agent !== "all") {
			whereClauses.push("(f.assigned_to = ? OR u.name LIKE ?)");
			params.push(data.agent.trim(), `%${data.agent.trim()}%`);
		}
		if (data?.from && data.from.trim()) {
			whereClauses.push("f.due_at >= ?");
			params.push(`${data.from.trim()} 00:00:00`);
		}
		if (data?.to && data.to.trim()) {
			whereClauses.push("f.due_at <= ?");
			params.push(`${data.to.trim()} 23:59:59`);
		}
		const sql = `
        SELECT 
          f.id,
          f.prospect_id,
          f.assigned_to,
          f.created_by,
          f.due_at,
          f.status,
          f.note,
          f.created_at,
          f.updated_at,
          COALESCE(p.contact_name, 'Unknown') AS prospect_name,
          p.business_name AS prospect_business,
          COALESCE(u.name, 'Unassigned') AS agent_name,
          COALESCE(c.name, 'System') AS creator_name
        FROM follow_ups f
        LEFT JOIN prospects p ON f.prospect_id = p.id
        LEFT JOIN users u ON f.assigned_to = u.id
        LEFT JOIN users c ON f.created_by = c.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY f.due_at ASC;
      `;
		const [rows] = await pool.query(sql, params);
		return {
			success: true,
			data: rows.map((r) => ({
				id: String(r["id"]),
				prospect_id: String(r["prospect_id"]),
				assigned_to: r["assigned_to"] ? String(r["assigned_to"]) : null,
				created_by: r["created_by"] ? String(r["created_by"]) : null,
				due_at: String(r["due_at"]),
				status: String(r["status"] || "pending"),
				note: r["note"] ? String(r["note"]) : null,
				created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
				updated_at: String(r["updated_at"] || (/* @__PURE__ */ new Date()).toISOString()),
				prospect_name: String(r["prospect_name"] || "Unknown"),
				prospect_business: r["prospect_business"] ? String(r["prospect_business"]) : null,
				agent_name: String(r["agent_name"] || "Unassigned"),
				creator_name: String(r["creator_name"] || "System")
			}))
		};
	} catch (err) {
		const errObj = err;
		console.error("fetchFollowUpsFn error:", errObj?.message);
		return {
			success: false,
			data: [],
			error: errObj?.message || "Failed to fetch follow-ups"
		};
	}
});
var saveFollowUpFn_createServerFn_handler = createServerRpc({
	id: "790dfe0411b078aa440981d8e768992261a242ddaafbc64cbde753bfe7c5979d",
	name: "saveFollowUpFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => saveFollowUpFn.__executeServer(opts));
var saveFollowUpFn = createServerFn({ method: "POST" }).validator((input) => input).handler(saveFollowUpFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const followUpId = data.id?.trim() || generateUUID();
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await pool.query(`INSERT INTO follow_ups (id, prospect_id, assigned_to, created_by, due_at, status, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           assigned_to = VALUES(assigned_to),
           due_at = VALUES(due_at),
           status = VALUES(status),
           note = VALUES(note),
           updated_at = VALUES(updated_at);`, [
			followUpId,
			data.prospect_id,
			data.assigned_to || null,
			data.created_by || null,
			data.due_at,
			data.status || "pending",
			data.note || null,
			now,
			now
		]);
		return {
			success: true,
			id: followUpId
		};
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to save follow-up"
		};
	}
});
var deleteFollowUpFn_createServerFn_handler = createServerRpc({
	id: "77453b94e70384f5679199a7fa11d5a521140e0eb5407ac1ede99c4c4bdcbceb",
	name: "deleteFollowUpFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => deleteFollowUpFn.__executeServer(opts));
var deleteFollowUpFn = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteFollowUpFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		await (await getMySQLPool()).query("DELETE FROM follow_ups WHERE id = ?;", [data.id]);
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to delete follow-up"
		};
	}
});
var fetchInvoicesFn_createServerFn_handler = createServerRpc({
	id: "f378fd324e9975867e2126d65557d665347591de23e9c0d68dde3be3bfdd1977",
	name: "fetchInvoicesFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => fetchInvoicesFn.__executeServer(opts));
var fetchInvoicesFn = createServerFn({ method: "GET" }).validator((input) => input || {}).handler(fetchInvoicesFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const whereClauses = ["1=1"];
		const params = [];
		if (data?.search && data.search.trim()) {
			const term = `%${data.search.trim()}%`;
			whereClauses.push("(i.invoice_number LIKE ? OR p.contact_name LIKE ? OR p.business_name LIKE ?)");
			params.push(term, term, term);
		}
		if (data?.status && data.status.trim() && data.status !== "all") {
			whereClauses.push("i.status = ?");
			params.push(data.status.trim());
		}
		if (data?.from_date && data.from_date.trim()) {
			whereClauses.push("i.created_at >= ?");
			params.push(`${data.from_date.trim()} 00:00:00`);
		}
		if (data?.to_date && data.to_date.trim()) {
			whereClauses.push("i.created_at <= ?");
			params.push(`${data.to_date.trim()} 23:59:59`);
		}
		const sql = `
        SELECT 
          i.id,
          i.invoice_number,
          i.prospect_id,
          CAST(i.total_amount AS DOUBLE) AS total_amount,
          CAST(i.paid_amount AS DOUBLE) AS paid_amount,
          i.status,
          i.created_by,
          i.created_at,
          i.updated_at,
          COALESCE(p.contact_name, 'Unknown Client') AS prospect_name,
          p.business_name,
          p.email AS client_email,
          p.phone AS client_phone,
          COALESCE(u.name, 'Admin') AS created_by_name
        FROM invoices i
        LEFT JOIN prospects p ON i.prospect_id = p.id
        LEFT JOIN users u ON i.created_by = u.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY i.created_at DESC;
      `;
		const [rows] = await pool.query(sql, params);
		return {
			success: true,
			data: rows.map((r) => {
				const total = Number(r["total_amount"]) || 0;
				const paid = Number(r["paid_amount"]) || 0;
				const due = Math.max(0, total - paid);
				let status = "Pending";
				if (paid >= total && total > 0) status = "Paid";
				else if (paid > 0) status = "Partially Paid";
				else if (String(r["status"]).toLowerCase() === "cancelled") status = "Cancelled";
				return {
					id: String(r["id"]),
					invoice_number: String(r["invoice_number"]),
					prospect_id: String(r["prospect_id"] || ""),
					prospect_name: String(r["prospect_name"]),
					business_name: r["business_name"] ? String(r["business_name"]) : void 0,
					client_email: r["client_email"] ? String(r["client_email"]) : void 0,
					client_phone: r["client_phone"] ? String(r["client_phone"]) : void 0,
					description: `Services Invoice #${r["invoice_number"]}`,
					total_amount: total,
					paid_amount: paid,
					due_amount: due,
					bill_date: String(r["created_at"]).slice(0, 10),
					due_date: String(r["created_at"]).slice(0, 10),
					status,
					notes: null,
					created_by: r["created_by"] ? String(r["created_by"]) : null,
					created_by_name: String(r["created_by_name"]),
					created_at: String(r["created_at"]),
					updated_at: String(r["updated_at"])
				};
			})
		};
	} catch (err) {
		const errObj = err;
		console.error("fetchInvoicesFn error:", errObj?.message);
		return {
			success: false,
			data: [],
			error: errObj?.message || "Failed to fetch invoices"
		};
	}
});
var saveInvoiceFn_createServerFn_handler = createServerRpc({
	id: "9e3881583e03981a7eafdaca67776efc6d3da5c1a9b60c449e7ce738752e41e6",
	name: "saveInvoiceFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => saveInvoiceFn.__executeServer(opts));
var saveInvoiceFn = createServerFn({ method: "POST" }).validator((input) => input).handler(saveInvoiceFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const invId = data.id?.trim() || generateUUID();
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		const invNumber = `INV-${Date.now().toString().slice(-6)}`;
		await pool.query(`INSERT INTO invoices (id, prospect_id, invoice_number, total_amount, paid_amount, status, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0.00, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           total_amount = VALUES(total_amount),
           status = VALUES(status),
           updated_at = VALUES(updated_at);`, [
			invId,
			data.prospect_id,
			invNumber,
			data.total_amount,
			data.status || "pending",
			data.created_by || null,
			now,
			now
		]);
		return {
			success: true,
			id: invId,
			invoice_number: invNumber
		};
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to save invoice"
		};
	}
});
var recordInvoicePaymentFn_createServerFn_handler = createServerRpc({
	id: "58c3f6e8d47f2188e77cf86fc786cfa23293b74acf534f618ff3df09b1e60f80",
	name: "recordInvoicePaymentFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => recordInvoicePaymentFn.__executeServer(opts));
var recordInvoicePaymentFn = createServerFn({ method: "POST" }).validator((input) => input).handler(recordInvoicePaymentFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const paymentId = generateUUID();
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await pool.query(`INSERT INTO payments (id, invoice_id, prospect_id, amount, payment_method, recorded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`, [
			paymentId,
			data.invoice_id,
			data.prospect_id || null,
			data.amount,
			data.payment_method || "Bank Transfer",
			data.recorded_by || null,
			now
		]);
		await pool.query(`UPDATE invoices 
         SET paid_amount = paid_amount + ?,
             status = CASE WHEN paid_amount + ? >= total_amount THEN 'paid' ELSE 'partially_paid' END,
             updated_at = ?
         WHERE id = ?;`, [
			data.amount,
			data.amount,
			now,
			data.invoice_id
		]);
		return {
			success: true,
			payment_id: paymentId
		};
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to record payment"
		};
	}
});
var fetchServicesFn_createServerFn_handler = createServerRpc({
	id: "2361e214cd7076b60cb6affc3f5d1a4cf7b55dcf4522163f25063533f6d7fc8b",
	name: "fetchServicesFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => fetchServicesFn.__executeServer(opts));
var fetchServicesFn = createServerFn({ method: "GET" }).handler(fetchServicesFn_createServerFn_handler, async () => {
	try {
		await ensureBootstrapped();
		const [rows] = await (await getMySQLPool()).query("SELECT * FROM services ORDER BY name ASC;");
		return {
			success: true,
			data: rows.map((r) => ({
				id: String(r["id"]),
				name: String(r["name"]),
				description: r["description"] ? String(r["description"]) : null,
				is_active: Boolean(r["is_active"] === 1 || r["is_active"] === true),
				created_at: String(r["created_at"]),
				updated_at: String(r["updated_at"])
			}))
		};
	} catch (err) {
		return {
			success: false,
			data: [],
			error: err?.message || "Failed to fetch services"
		};
	}
});
var saveServiceFn_createServerFn_handler = createServerRpc({
	id: "95145c495424b8f81dcca6f3c8a6541fb47c77fba121b74c28c1ce4c2b54b0c1",
	name: "saveServiceFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => saveServiceFn.__executeServer(opts));
var saveServiceFn = createServerFn({ method: "POST" }).validator((input) => input).handler(saveServiceFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const sId = data.id?.trim() || generateUUID();
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await pool.query(`INSERT INTO services (id, name, description, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           is_active = VALUES(is_active),
           updated_at = VALUES(updated_at);`, [
			sId,
			data.name.trim(),
			data.description || null,
			data.is_active ?? true ? 1 : 0,
			now,
			now
		]);
		return {
			success: true,
			id: sId
		};
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to save service"
		};
	}
});
var deleteServiceFn_createServerFn_handler = createServerRpc({
	id: "e686a3f621e5e2e0b91dc61b6426a6be779211dec7fd4484076d9c35c5a195e5",
	name: "deleteServiceFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => deleteServiceFn.__executeServer(opts));
var deleteServiceFn = createServerFn({ method: "POST" }).validator((input) => input).handler(deleteServiceFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		await (await getMySQLPool()).query("DELETE FROM services WHERE id = ?;", [data.id]);
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to delete service"
		};
	}
});
var fetchDashboardMetricsFn_createServerFn_handler = createServerRpc({
	id: "48c96ce71692d00d81c3f89a356cf5bf6c5036f72ba73a09a62cfadb3add12c6",
	name: "fetchDashboardMetricsFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => fetchDashboardMetricsFn.__executeServer(opts));
var fetchDashboardMetricsFn = createServerFn({ method: "GET" }).handler(fetchDashboardMetricsFn_createServerFn_handler, async () => {
	try {
		await ensureBootstrapped();
		const pool = await getMySQLPool();
		const [[prospectCount]] = await pool.query("SELECT COUNT(*) AS count FROM prospects WHERE is_active = 1;");
		const [[oppCount]] = await pool.query("SELECT COUNT(*) AS count, COALESCE(SUM(value), 0) AS total_val FROM opportunities;");
		const [[salesData]] = await pool.query("SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total_revenue FROM sales;");
		const [[followUpCount]] = await pool.query("SELECT COUNT(*) AS count FROM follow_ups WHERE status = 'pending';");
		const [[meetingCount]] = await pool.query("SELECT COUNT(*) AS count FROM meetings WHERE status = 'scheduled';");
		const [[billingData]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) AS invoiced, COALESCE(SUM(paid_amount), 0) AS collected FROM invoices;");
		const totalP = Number(prospectCount?.count) || 0;
		const totalS = Number(salesData?.count) || 0;
		const rate = totalP > 0 ? totalS / totalP * 100 : 0;
		return {
			success: true,
			data: {
				totalProspects: totalP,
				activeOpportunities: Number(oppCount?.count) || 0,
				totalWonSales: totalS,
				totalRevenue: Number(salesData?.total_revenue) || 0,
				pendingFollowUps: Number(followUpCount?.count) || 0,
				scheduledMeetings: Number(meetingCount?.count) || 0,
				totalInvoiced: Number(billingData?.invoiced) || 0,
				totalCollected: Number(billingData?.collected) || 0,
				conversionRate: Math.round(rate * 10) / 10
			}
		};
	} catch (err) {
		const errObj = err;
		console.error("fetchDashboardMetricsFn error:", errObj?.message);
		return {
			success: false,
			data: {
				totalProspects: 0,
				activeOpportunities: 0,
				totalWonSales: 0,
				totalRevenue: 0,
				pendingFollowUps: 0,
				scheduledMeetings: 0,
				totalInvoiced: 0,
				totalCollected: 0,
				conversionRate: 0
			},
			error: errObj?.message || "Failed to load dashboard metrics"
		};
	}
});
var executeMySQLQueryFn_createServerFn_handler = createServerRpc({
	id: "c1d503a5789980f86c491359217f9b6a4ad897027129dd34e459584adda00e03",
	name: "executeMySQLQueryFn",
	filename: "src/lib/crm.functions.ts"
}, (opts) => executeMySQLQueryFn.__executeServer(opts));
var executeMySQLQueryFn = createServerFn({ method: "POST" }).validator((input) => input).handler(executeMySQLQueryFn_createServerFn_handler, async ({ data }) => {
	try {
		await ensureBootstrapped();
		const [rows] = await (await getMySQLPool()).query(data.sql, data.params || []);
		if (Array.isArray(rows)) return {
			success: true,
			data: rows.map((r) => {
				const plain = {};
				if (r && typeof r === "object") for (const key of Object.keys(r)) {
					const val = r[key];
					if (val === null || val === void 0) plain[key] = null;
					else if (val instanceof Date) plain[key] = val.toISOString().slice(0, 19).replace("T", " ");
					else if (typeof val === "number" || typeof val === "boolean" || typeof val === "string") plain[key] = val;
					else plain[key] = String(val);
				}
				return plain;
			})
		};
		const ok = rows ?? {};
		return {
			success: true,
			data: [{
				affectedRows: typeof ok.affectedRows === "number" ? ok.affectedRows : 0,
				insertId: typeof ok.insertId === "number" ? ok.insertId : 0
			}]
		};
	} catch (err) {
		const errObj = err;
		console.error("executeMySQLQueryFn error:", errObj?.message);
		return {
			success: false,
			error: errObj?.message || "Database query failed"
		};
	}
});
//#endregion
export { deleteFollowUpFn_createServerFn_handler, deleteMeetingFn_createServerFn_handler, deleteOpportunityFn_createServerFn_handler, deleteServiceFn_createServerFn_handler, executeMySQLQueryFn_createServerFn_handler, fetchDashboardMetricsFn_createServerFn_handler, fetchFollowUpsFn_createServerFn_handler, fetchInvoicesFn_createServerFn_handler, fetchMeetingsFn_createServerFn_handler, fetchOpportunitiesFn_createServerFn_handler, fetchServicesFn_createServerFn_handler, recordInvoicePaymentFn_createServerFn_handler, saveFollowUpFn_createServerFn_handler, saveInvoiceFn_createServerFn_handler, saveMeetingFn_createServerFn_handler, saveOpportunityFn_createServerFn_handler, saveServiceFn_createServerFn_handler };
