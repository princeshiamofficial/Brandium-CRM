import { t as runMySQLQuery } from "./mysql-api-HtgmsbU7.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/billing-CEPvXinc.js
function generateUUID() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
async function fetchInvoices(filters = {}) {
	try {
		const res = await runMySQLQuery(`SELECT 
        i.*,
        p.contact_name AS prospect_name,
        p.business_name,
        p.email AS client_email,
        p.phone AS client_phone,
        u.name AS created_by_name
      FROM \`invoices\` i
      LEFT JOIN \`prospects\` p ON i.prospect_id = p.id
      LEFT JOIN \`users\` u ON i.created_by = u.id
      ORDER BY i.created_at DESC;`);
		if (!res.success || !Array.isArray(res.data)) return [];
		return applyInvoiceFilters(res.data.map((item) => {
			const totalAmount = Number(item["total_amount"] || 0);
			const paidAmount = Number(item["paid_amount"] || 0);
			const dueAmount = Number(item["due_amount"] ?? Math.max(0, totalAmount - paidAmount));
			return {
				id: String(item["id"]),
				invoice_number: String(item["invoice_number"] || `INV-2026-${item["id"]}`),
				prospect_id: String(item["prospect_id"] || ""),
				prospect_name: String(item["prospect_name"] || "Client"),
				business_name: item["business_name"] || void 0,
				client_email: item["client_email"] || void 0,
				client_phone: item["client_phone"] || void 0,
				description: String(item["description"] || "Software Services"),
				total_amount: totalAmount,
				paid_amount: paidAmount,
				due_amount: dueAmount,
				bill_date: String(item["bill_date"] || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]),
				due_date: String(item["due_date"] || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]),
				status: item["status"] || "Pending",
				notes: item["notes"] || null,
				created_by: item["created_by"] || null,
				created_by_name: String(item["created_by_name"] || "Agent"),
				created_at: String(item["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
				updated_at: String(item["updated_at"] || (/* @__PURE__ */ new Date()).toISOString())
			};
		}), filters);
	} catch (err) {
		console.warn("fetchInvoices MySQL error:", err);
		return [];
	}
}
function applyInvoiceFilters(list, filters) {
	let result = list;
	if (filters.status && filters.status !== "all") result = result.filter((inv) => inv.status === filters.status);
	if (filters.from_date) {
		const fromStr = filters.from_date;
		result = result.filter((inv) => inv.bill_date >= fromStr);
	}
	if (filters.to_date) {
		const toStr = filters.to_date;
		result = result.filter((inv) => inv.bill_date <= toStr);
	}
	if (filters.search && filters.search.trim() !== "") {
		const q = filters.search.toLowerCase().trim();
		result = result.filter((inv) => inv.invoice_number.toLowerCase().includes(q) || inv.prospect_name.toLowerCase().includes(q) || inv.business_name && inv.business_name.toLowerCase().includes(q) || inv.description.toLowerCase().includes(q) || inv.client_phone && inv.client_phone.includes(q) || inv.client_email && inv.client_email.toLowerCase().includes(q) || inv.created_by_name.toLowerCase().includes(q));
	}
	return result;
}
async function fetchInvoiceById(id) {
	return (await fetchInvoices()).find((inv) => inv.id === id) || null;
}
async function createInvoice(input, user) {
	const invId = generateUUID();
	const invNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const res = await runMySQLQuery(`INSERT INTO \`invoices\` (
      \`id\`, \`invoice_number\`, \`prospect_id\`, \`description\`, \`total_amount\`,
      \`paid_amount\`, \`due_amount\`, \`bill_date\`, \`due_date\`, \`status\`,
      \`notes\`, \`created_by\`, \`created_at\`, \`updated_at\`
    ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 'Pending', ?, ?, ?, ?);`, [
		invId,
		invNum,
		input.prospect_id,
		input.description,
		input.total_amount,
		input.total_amount,
		input.bill_date,
		input.due_date,
		input.notes || null,
		user?.id || null,
		now,
		now
	]);
	if (!res.success) throw new Error(res.error || "Failed to create invoice in database.");
	try {
		const oppCheck = await runMySQLQuery("SELECT id FROM `opportunities` WHERE `prospect_id` = ? AND `is_active` = 1 LIMIT 1;", [input.prospect_id]);
		if (oppCheck.success && Array.isArray(oppCheck.data) && oppCheck.data.length > 0) {
			const existingOppId = oppCheck.data[0]?.["id"];
			await runMySQLQuery("UPDATE `opportunities` SET `estimated_value` = ?, `notes` = COALESCE(?, `notes`), `updated_at` = ? WHERE `id` = ?;", [
				input.total_amount,
				input.description || null,
				now,
				existingOppId
			]);
		} else {
			const newOppId = generateUUID();
			const assignedTo = (await runMySQLQuery("SELECT assigned_to FROM `prospects` WHERE `id` = ? LIMIT 1;", [input.prospect_id])).data?.[0]?.["assigned_to"] || user?.id || null;
			await runMySQLQuery(`INSERT INTO \`opportunities\` (
            \`id\`, \`prospect_id\`, \`estimated_value\`, \`assigned_to\`, \`created_by\`,
            \`status\`, \`notes\`, \`is_active\`, \`created_at\`, \`updated_at\`
          ) VALUES (?, ?, ?, ?, ?, 'Opportunity Created', ?, 1, ?, ?);`, [
				newOppId,
				input.prospect_id,
				input.total_amount,
				assignedTo,
				user?.id || null,
				input.description || null,
				now,
				now
			]);
		}
		const stageRes = await runMySQLQuery("SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) LIKE '%opportunity%' LIMIT 1;");
		const oppStageId = stageRes?.success && stageRes.data?.[0] ? String(stageRes.data[0]["id"]) : "opportunity-created";
		let fromStageId = null;
		try {
			const currRes = await runMySQLQuery("SELECT `stage_id` FROM `prospects` WHERE `id` = ? LIMIT 1;", [input.prospect_id]);
			if (currRes?.success && currRes.data?.[0]) fromStageId = String(currRes.data[0]["stage_id"] || "") || null;
		} catch {}
		await runMySQLQuery("UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;", [
			oppStageId,
			now,
			input.prospect_id
		]);
		const historyId = generateUUID();
		await runMySQLQuery(`INSERT INTO \`prospect_stage_history\`
           (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_at\`)
         VALUES (?, ?, ?, ?, ?, ?);`, [
			historyId,
			input.prospect_id,
			fromStageId,
			oppStageId,
			`Invoice ${invNum} generated for ${input.description} (৳${input.total_amount})`,
			now
		]);
	} catch (err) {
		console.warn("Error synchronizing invoice to opportunities and stages:", err);
	}
	return {
		id: invId,
		invoice_number: invNum,
		prospect_id: input.prospect_id,
		prospect_name: "Client",
		description: input.description,
		total_amount: input.total_amount,
		paid_amount: 0,
		due_amount: input.total_amount,
		bill_date: input.bill_date,
		due_date: input.due_date,
		status: "Pending",
		notes: input.notes || null,
		created_by: user?.id || null,
		created_by_name: user?.email || "Agent",
		created_at: now,
		updated_at: now
	};
}
async function recordInvoicePayment(input, user) {
	if (input.amount <= 0) throw new Error("Payment amount must be greater than 0");
	const payId = generateUUID();
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const payRes = await runMySQLQuery(`INSERT INTO \`payments\` (
      \`id\`, \`invoice_id\`, \`amount\`, \`payment_method\`,
      \`transaction_reference\`, \`notes\`, \`recorded_by\`, \`payment_date\`, \`created_at\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`, [
		payId,
		input.invoice_id,
		input.amount,
		input.payment_method,
		input.transaction_reference || null,
		input.notes || null,
		user?.id || null,
		now,
		now
	]);
	if (!payRes.success) throw new Error(payRes.error || "Failed to record payment in database.");
	const invRes = await runMySQLQuery("SELECT total_amount FROM `invoices` WHERE `id` = ? LIMIT 1;", [input.invoice_id]);
	const totalAmount = Number(invRes?.data?.[0]?.["total_amount"] || 0);
	const sumRes = await runMySQLQuery("SELECT COALESCE(SUM(amount), 0) AS total_paid FROM `payments` WHERE `invoice_id` = ? AND `is_valid` = 1;", [input.invoice_id]);
	const totalPaid = Number(sumRes?.data?.[0]?.["total_paid"] || input.amount);
	const dueAmount = Math.max(0, totalAmount - totalPaid);
	const newStatus = dueAmount === 0 ? "Paid" : totalPaid > 0 ? "Partially Paid" : "Pending";
	await runMySQLQuery("UPDATE `invoices` SET `paid_amount` = ?, `due_amount` = ?, `status` = ?, `updated_at` = ? WHERE `id` = ?;", [
		totalPaid,
		dueAmount,
		newStatus,
		now,
		input.invoice_id
	]);
	return {
		success: true,
		dueAmount,
		status: newStatus
	};
}
async function cancelInvoice(id) {
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	await runMySQLQuery("UPDATE `invoices` SET `status` = 'Cancelled', `updated_at` = ? WHERE `id` = ?;", [now, id]);
}
async function deleteInvoice(id) {
	let prospectId = null;
	try {
		const invRes = await runMySQLQuery("SELECT prospect_id FROM `invoices` WHERE `id` = ? LIMIT 1;", [id]);
		if (invRes.success && invRes.data?.[0]) prospectId = invRes.data[0]["prospect_id"] || null;
	} catch {}
	await runMySQLQuery("DELETE FROM `payments` WHERE `invoice_id` = ?;", [id]);
	await runMySQLQuery("DELETE FROM `invoices` WHERE `id` = ?;", [id]);
	if (prospectId) try {
		const otherInvs = await runMySQLQuery("SELECT id FROM `invoices` WHERE `prospect_id` = ? LIMIT 1;", [prospectId]);
		if (!otherInvs.data || otherInvs.data.length === 0) {
			await runMySQLQuery("DELETE FROM `opportunities` WHERE `prospect_id` = ?;", [prospectId]);
			await runMySQLQuery("UPDATE `prospects` SET `stage_id` = 'prospect', `updated_at` = NOW() WHERE `id` = ? AND `stage_id` = 'opportunity-created';", [prospectId]);
		}
	} catch (err) {
		console.warn("Error cleaning up opportunity on invoice delete:", err);
	}
}
async function updateInvoice(id, updates) {
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const sets = ["`updated_at` = ?"];
	const params = [now];
	if (updates.description !== void 0) {
		sets.push("`description` = ?");
		params.push(updates.description);
	}
	if (updates.total_amount !== void 0) {
		sets.push("`total_amount` = ?");
		params.push(updates.total_amount);
	}
	if (updates.bill_date !== void 0) {
		sets.push("`bill_date` = ?");
		params.push(updates.bill_date);
	}
	if (updates.due_date !== void 0) {
		sets.push("`due_date` = ?");
		params.push(updates.due_date);
	}
	if (updates.notes !== void 0) {
		sets.push("`notes` = ?");
		params.push(updates.notes);
	}
	params.push(id);
	const sql = `UPDATE \`invoices\` SET ${sets.join(", ")} WHERE \`id\` = ?;`;
	await runMySQLQuery(sql, params);
	const inv = await fetchInvoiceById(id);
	if (!inv) throw new Error("Failed to find updated invoice");
	return inv;
}
var invoicesQueryOptions = (filters = {}) => queryOptions({
	queryKey: ["invoices", filters],
	queryFn: () => fetchInvoices(filters)
});
function exportBillingHistoryCSV(invoices) {
	const headers = [
		"Invoice Number",
		"Client Name",
		"Client ID",
		"Business Name",
		"Total Amount (৳)",
		"Paid Amount (৳)",
		"Due Amount (৳)",
		"Description",
		"Bill Date",
		"Due Date",
		"Status",
		"Created By",
		"Created At"
	];
	const rows = invoices.map((inv) => [
		`"${inv.invoice_number}"`,
		`"${inv.prospect_name.replace(/"/g, "\"\"")}"`,
		`"${inv.prospect_id}"`,
		`"${(inv.business_name || "").replace(/"/g, "\"\"")}"`,
		inv.total_amount,
		inv.paid_amount,
		inv.due_amount,
		`"${inv.description.replace(/"/g, "\"\"")}"`,
		`"${inv.bill_date}"`,
		`"${inv.due_date}"`,
		`"${inv.status}"`,
		`"${inv.created_by_name.replace(/"/g, "\"\"")}"`,
		`"${inv.created_at}"`
	]);
	const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.setAttribute("href", url);
	link.setAttribute("download", `Billing_History_Export_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
//#endregion
export { invoicesQueryOptions as a, exportBillingHistoryCSV as i, createInvoice as n, recordInvoicePayment as o, deleteInvoice as r, updateInvoice as s, cancelInvoice as t };
