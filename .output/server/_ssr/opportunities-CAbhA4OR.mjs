import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as runMySQLQuery } from "./mysql-api-DK3LroIZ.mjs";
import { a as useQueryClient, n as queryOptions, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as stringType, i as objectType, r as numberType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/opportunities-CAbhA4OR.js
var PIPELINE_STAGES = [
	"Opportunity Created",
	"Follow-up",
	"Proposal Sent",
	"Negotiation",
	"Sales Won"
];
var REJECTED_STAGES = [
	"Sales Lost",
	"Denied Payment",
	"DNP"
];
var opportunityFiltersSchema = objectType({
	page: numberType().catch(1),
	search: stringType().optional(),
	status: stringType().optional(),
	agent: stringType().optional(),
	from: stringType().optional(),
	to: stringType().optional()
});
var PAGE_SIZE = 10;
function generateUUID() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
var opportunitiesQuery = (filters, userId, isAdmin) => queryOptions({
	queryKey: [
		"opportunities",
		filters,
		userId,
		isAdmin
	],
	queryFn: async () => {
		let rows = [];
		try {
			const res = await runMySQLQuery(`SELECT 
            o.*,
            p.contact_name AS prospect_name,
            p.business_name AS prospect_business,
            p.designation AS prospect_designation,
            p.email AS prospect_email,
            p.phone AS prospect_phone,
            u_assign.name AS agent_name,
            u_create.name AS creator_name
          FROM \`opportunities\` o
          LEFT JOIN \`prospects\` p ON o.prospect_id = p.id
          LEFT JOIN \`users\` u_assign ON o.assigned_to = u_assign.id
          LEFT JOIN \`users\` u_create ON o.created_by = u_create.id
          WHERE o.is_active = 1
          ORDER BY o.created_at DESC;`);
			if (res.success && Array.isArray(res.data)) rows = res.data.map((r) => ({
				id: String(r["id"]),
				prospect_id: String(r["prospect_id"] || ""),
				estimated_value: Number(r["estimated_value"] || 0),
				assigned_to: r["assigned_to"] || null,
				created_by: r["created_by"] || null,
				status: String(r["status"] || "Opportunity Created"),
				notes: r["notes"] || null,
				is_active: Boolean(Number(r["is_active"] ?? 1)),
				created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
				updated_at: String(r["updated_at"] || (/* @__PURE__ */ new Date()).toISOString()),
				prospect_name: r["prospect_name"] || "Direct Client",
				prospect_business: r["prospect_business"] || null,
				prospect_designation: r["prospect_designation"] || null,
				prospect_email: r["prospect_email"] || null,
				prospect_phone: r["prospect_phone"] || null,
				agent_name: r["agent_name"] || "Unassigned",
				creator_name: r["creator_name"] || "Admin"
			}));
		} catch (err) {
			console.warn("fetchOpportunities MySQL error:", err);
		}
		if (!isAdmin && userId) rows = rows.filter((r) => r.assigned_to === userId);
		if (filters.agent && filters.agent !== "all") rows = rows.filter((r) => r.assigned_to === filters.agent);
		if (filters.status && filters.status !== "all") rows = rows.filter((r) => r.status.toLowerCase() === filters.status.toLowerCase());
		if (filters.from) rows = rows.filter((r) => r.created_at >= filters.from);
		if (filters.to) rows = rows.filter((r) => r.created_at <= filters.to + " 23:59:59");
		if (filters.search) {
			const term = filters.search.toLowerCase();
			rows = rows.filter((r) => (r.prospect_name || "").toLowerCase().includes(term) || (r.prospect_business || "").toLowerCase().includes(term) || (r.prospect_phone || "").toLowerCase().includes(term) || (r.notes || "").toLowerCase().includes(term));
		}
		const totalCount = rows.length;
		const from = (filters.page - 1) * PAGE_SIZE;
		return {
			data: rows.slice(from, from + PAGE_SIZE),
			count: totalCount,
			pageCount: Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
		};
	}
});
var opportunitySummaryQuery = (userId, isAdmin) => queryOptions({
	queryKey: [
		"opportunity-summary",
		userId,
		isAdmin
	],
	queryFn: async () => {
		let rows = [];
		try {
			const res = await runMySQLQuery("SELECT status, estimated_value, assigned_to FROM `opportunities` WHERE is_active = 1;");
			if (res.success && Array.isArray(res.data)) rows = res.data.map((r) => ({
				status: String(r["status"] || "Opportunity Created"),
				estimated_value: Number(r["estimated_value"] || 0),
				assigned_to: r["assigned_to"] || null
			}));
		} catch {}
		if (!isAdmin && userId) rows = rows.filter((r) => r.assigned_to === userId);
		return {
			total: rows.length,
			totalValue: rows.reduce((sum, item) => sum + item.estimated_value, 0),
			active: rows.filter((item) => PIPELINE_STAGES.slice(0, 4).includes(item.status)).length,
			won: rows.filter((item) => item.status === "Sales Won").length,
			rejected: rows.filter((item) => REJECTED_STAGES.includes(item.status)).length
		};
	}
});
function useCreateOpportunity() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const oppId = generateUUID();
			const status = input.status ?? "Opportunity Created";
			const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
			const res = await runMySQLQuery(`INSERT INTO \`opportunities\` (
          \`id\`, \`prospect_id\`, \`estimated_value\`, \`assigned_to\`, \`created_by\`,
          \`status\`, \`notes\`, \`is_active\`, \`created_at\`, \`updated_at\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`, [
				oppId,
				input.prospect_id,
				input.estimated_value,
				input.assigned_to || null,
				input.created_by || null,
				status,
				input.notes || null,
				now,
				now
			]);
			if (!res.success) throw new Error(res.error || "Failed to create opportunity in database.");
			if (input.prospect_id) {
				const actId = generateUUID();
				await runMySQLQuery(`INSERT INTO \`activities\` (\`id\`, \`actor_id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
           VALUES (?, ?, ?, 'opportunity_created', ?, ?);`, [
					actId,
					input.created_by || null,
					input.prospect_id,
					`New opportunity created with estimated value ৳${input.estimated_value.toLocaleString()}${input.notes ? ` — ${input.notes}` : ""}`,
					now
				]);
			}
			return {
				success: true,
				id: oppId
			};
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["opportunities"] });
			queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["activities"] });
		}
	});
}
function useUpdateOpportunityStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
			let sql = "UPDATE `opportunities` SET `status` = ?, `updated_at` = ? WHERE `id` = ?;";
			let params = [
				input.status,
				now,
				input.id
			];
			if (input.notes) {
				sql = "UPDATE `opportunities` SET `status` = ?, `notes` = ?, `updated_at` = ? WHERE `id` = ?;";
				params = [
					input.status,
					input.notes,
					now,
					input.id
				];
			}
			const res = await runMySQLQuery(sql, params);
			if (!res.success) throw new Error(res.error || "Failed to update opportunity in database.");
			if (input.prospectId) try {
				const stId = (await runMySQLQuery("SELECT id FROM `stages` WHERE LOWER(name) LIKE LOWER(?) LIMIT 1;", [`%${input.status}%`]))?.data?.[0]?.["id"];
				if (stId) {
					await runMySQLQuery("UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;", [
						stId,
						now,
						input.prospectId
					]);
					await runMySQLQuery("INSERT INTO `prospect_stage_history` (`id`, `prospect_id`, `to_stage_id`, `notes`, `created_at`) VALUES (?, ?, ?, ?, ?);", [
						generateUUID(),
						input.prospectId,
						stId,
						input.notes || `Opportunity moved to ${input.status}`,
						now
					]);
				}
			} catch {}
			return { success: true };
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["opportunities"] });
			queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
			queryClient.invalidateQueries({ queryKey: ["opportunity-detail", variables.id] });
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospect-stage-history"] });
			queryClient.invalidateQueries({ queryKey: ["denied-payments"] });
			queryClient.invalidateQueries({ queryKey: ["won-sales"] });
			queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
			queryClient.invalidateQueries({ queryKey: ["activities"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
		}
	});
}
function useSoftDeleteOpportunity() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
			const res = await runMySQLQuery("UPDATE `opportunities` SET `is_active` = 0, `updated_at` = ? WHERE `id` = ?;", [now, id]);
			if (!res.success) throw new Error(res.error || "Failed to delete opportunity.");
			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["opportunities"] });
			queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
		}
	});
}
var $$splitComponentImporter = () => import("./opportunities-CWuZ68GZ.mjs");
var Route = createFileRoute("/_authenticated/opportunities")({
	validateSearch: opportunityFiltersSchema,
	head: () => ({ meta: [
		{ title: "Opportunities | Brandium Telesales CRM" },
		{
			name: "description",
			content: "Track and convert active sales opportunities through your pipeline."
		},
		{
			property: "og:title",
			content: "Opportunities | Brandium Telesales CRM"
		},
		{
			property: "og:description",
			content: "Track and convert active sales opportunities through your pipeline."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { opportunitySummaryQuery as a, useUpdateOpportunityStatus as c, opportunitiesQuery as i, REJECTED_STAGES as n, useCreateOpportunity as o, Route as r, useSoftDeleteOpportunity as s, PIPELINE_STAGES as t };
