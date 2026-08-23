import { t as runMySQLQuery } from "./mysql-api-DGi25MCo.mjs";
import { a as useQueryClient, n as queryOptions, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as generateUUID } from "./mysql-client-k5RcJc-f.mjs";
import { t as supabase } from "./client-BI5xu_FF.mjs";
import { l as format } from "../_libs/date-fns.mjs";
import { i as fetchCrmUsers } from "./admin-users-BYVehisg.mjs";
import { a as stringType, i as objectType, r as numberType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/follow-ups-DgrNDG3G.js
var followUpFiltersSchema = objectType({
	page: numberType().catch(1),
	search: stringType().optional(),
	status: stringType().optional(),
	agent: stringType().optional(),
	from: stringType().optional(),
	to: stringType().optional()
});
var isOverdue = (row) => row.status === "pending" && new Date(row.due_at).getTime() < Date.now();
var effectiveStatus = (row) => isOverdue(row) ? "overdue" : row.status;
var statusBadgeVariant = (status) => {
	switch (status) {
		case "completed": return "default";
		case "overdue": return "destructive";
		case "cancelled": return "outline";
		default: return "secondary";
	}
};
var PAGE_SIZE = 10;
var followUpsQuery = (filters, userId, isAdmin) => queryOptions({
	queryKey: [
		"follow-ups",
		filters,
		userId,
		isAdmin
	],
	queryFn: async () => {
		try {
			const res = await runMySQLQuery(`SELECT 
            f.*,
            p.contact_name AS prospect_name,
            p.business_name AS prospect_business,
            p.phone AS prospect_phone,
            p.stage_id,
            s.name AS stage_name,
            s.stage_group,
            s.color AS stage_color,
            u.name AS agent_name,
            c.name AS creator_name
          FROM \`follow_ups\` f
          LEFT JOIN \`prospects\` p ON f.prospect_id = p.id
          LEFT JOIN \`stages\` s ON p.stage_id = s.id
          LEFT JOIN \`users\` u ON f.assigned_to = u.id
          LEFT JOIN \`users\` c ON f.created_by = c.id
          ORDER BY f.due_at DESC, f.created_at DESC;`);
			if (res.success && Array.isArray(res.data)) {
				let rows = res.data.map((item) => {
					const rawDue = String(item["due_at"] || (/* @__PURE__ */ new Date()).toISOString());
					const rawStatus = String(item["status"] || "pending");
					return {
						id: String(item["id"]),
						prospect_id: String(item["prospect_id"]),
						assigned_to: item["assigned_to"] || null,
						created_by: item["created_by"] || null,
						due_at: rawDue,
						note: item["note"] || null,
						status: rawStatus,
						created_at: String(item["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
						updated_at: String(item["updated_at"] || (/* @__PURE__ */ new Date()).toISOString()),
						prospect_name: item["prospect_name"] || "Contact Name",
						prospect_business: item["prospect_business"] || null,
						prospect_phone: item["prospect_phone"] || null,
						agent_name: item["agent_name"] || "Assigned Agent",
						creator_name: item["creator_name"] || "Admin",
						stage_name: item["stage_name"] || null,
						stage_group: item["stage_group"] || null,
						stage_color: item["stage_color"] || null,
						effective_status: effectiveStatus({
							status: rawStatus,
							due_at: rawDue
						})
					};
				});
				if (!isAdmin && userId) rows = rows.filter((r) => r.assigned_to === userId);
				if (filters.agent) rows = rows.filter((r) => r.assigned_to === filters.agent);
				if (filters.status) {
					if (filters.status === "overdue") rows = rows.filter((r) => r.effective_status === "overdue");
					else rows = rows.filter((r) => r.status === filters.status);
				}
				if (filters.from) {
					const fromTime = new Date(filters.from).getTime();
					rows = rows.filter((r) => new Date(r.due_at).getTime() >= fromTime);
				}
				if (filters.to) {
					const toTime = (/* @__PURE__ */ new Date(`${filters.to}T23:59:59`)).getTime();
					rows = rows.filter((r) => new Date(r.due_at).getTime() <= toTime);
				}
				if (filters.search) {
					const term = filters.search.toLowerCase();
					rows = rows.filter((r) => (r.prospect_name || "").toLowerCase().includes(term) || (r.prospect_business || "").toLowerCase().includes(term) || (r.prospect_phone || "").toLowerCase().includes(term) || (r.note || "").toLowerCase().includes(term));
				}
				const total = rows.length;
				const page = filters.page || 1;
				return {
					data: rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
					count: total,
					pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE))
				};
			}
		} catch (err) {
			console.warn("followUpsQuery MySQL notice:", err);
		}
		return {
			data: [],
			count: 0,
			pageCount: 1
		};
	}
});
var followUpSummaryQuery = (userId, isAdmin) => queryOptions({
	queryKey: [
		"follow-up-summary",
		userId,
		isAdmin
	],
	queryFn: async () => {
		try {
			const res = await runMySQLQuery(`SELECT 
            status, 
            due_at, 
            assigned_to 
          FROM \`follow_ups\`;`);
			if (res.success && Array.isArray(res.data)) {
				let list = res.data;
				if (!isAdmin && userId) list = list.filter((r) => String(r["assigned_to"]) === userId);
				const nowStr = (/* @__PURE__ */ new Date()).toISOString();
				const pending = list.filter((r) => String(r["status"]) === "pending" && String(r["due_at"] || "") >= nowStr).length;
				const completed = list.filter((r) => String(r["status"]) === "completed").length;
				const cancelled = list.filter((r) => String(r["status"]) === "cancelled").length;
				const overdue = list.filter((r) => String(r["status"]) === "pending" && String(r["due_at"] || "") < nowStr).length;
				return {
					total: list.length,
					pending,
					completed,
					cancelled,
					overdue
				};
			}
		} catch (err) {
			console.warn("followUpSummaryQuery MySQL notice:", err);
		}
		return {
			total: 0,
			pending: 0,
			completed: 0,
			cancelled: 0,
			overdue: 0
		};
	}
});
var prospectTimelineQuery = (prospectId) => queryOptions({
	queryKey: ["prospect-timeline", prospectId],
	queryFn: async () => {
		try {
			const events = [];
			const fuRes = await runMySQLQuery(`SELECT 
            f.id,
            f.due_at AS raw_due_at,
            f.created_at,
            f.updated_at,
            f.note,
            f.status,
            COALESCE(u.name, 'Agent') AS agent_name,
            COALESCE(s.name, 'Follow-up') AS stage_name
          FROM \`follow_ups\` f
          LEFT JOIN \`prospects\` p ON f.prospect_id = p.id
          LEFT JOIN \`stages\` s ON p.stage_id = s.id
          LEFT JOIN \`users\` u ON f.assigned_to = u.id
          WHERE f.prospect_id = '${prospectId}'
          ORDER BY f.created_at ASC;`);
			if (fuRes.success && Array.isArray(fuRes.data)) for (const r of fuRes.data) {
				const dateObj = new Date(String(r["updated_at"] || r["created_at"] || r["raw_due_at"]));
				const rawStatus = String(r["status"] || "pending");
				const rawDue = String(r["raw_due_at"] || (/* @__PURE__ */ new Date()).toISOString());
				events.push({
					id: String(r["id"]),
					date: format(dateObj, "dd MMM yyyy"),
					time: format(dateObj, "hh:mm a"),
					note: r["note"] || "Follow-up note",
					agent: String(r["agent_name"] || "Agent"),
					status: effectiveStatus({
						status: rawStatus,
						due_at: rawDue
					}),
					raw_due_at: rawDue,
					created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
					stage_name: r["stage_name"] || "Follow-up"
				});
			}
			const histRes = await runMySQLQuery(`SELECT 
            h.id,
            h.changed_at,
            h.note,
            COALESCE(u.name, 'System') AS agent_name,
            COALESCE(s.name, 'Stage Updated') AS stage_name
          FROM \`prospect_stage_history\` h
          LEFT JOIN \`stages\` s ON h.to_stage_id = s.id
          LEFT JOIN \`users\` u ON h.changed_by = u.id
          WHERE h.prospect_id = '${prospectId}'
          ORDER BY h.changed_at ASC;`);
			if (histRes.success && Array.isArray(histRes.data)) for (const h of histRes.data) {
				const dateObj = new Date(String(h["changed_at"]));
				events.push({
					id: String(h["id"]),
					date: format(dateObj, "dd MMM yyyy"),
					time: format(dateObj, "hh:mm a"),
					note: h["note"] || `Stage updated to ${String(h["stage_name"] || "Stage")}`,
					agent: String(h["agent_name"] || "System"),
					status: "completed",
					raw_due_at: String(h["changed_at"]),
					created_at: String(h["changed_at"]),
					stage_name: String(h["stage_name"])
				});
			}
			events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
			return events;
		} catch (err) {
			console.warn("prospectTimelineQuery MySQL notice:", err);
		}
		return [];
	}
});
var agentsQuery = () => queryOptions({
	queryKey: ["agent-profiles"],
	queryFn: async () => {
		try {
			const users = await fetchCrmUsers();
			if (users && users.length > 0) return users.map((u) => ({
				id: u.id,
				name: `${u.name}${u.role ? ` (${u.role})` : ""}`
			}));
		} catch {}
		return [
			{
				id: "usr-admin-1",
				name: "Admin (Executive)"
			},
			{
				id: "usr-agent-1",
				name: "Tanvir Hasan (Agent)"
			},
			{
				id: "usr-agent-2",
				name: "Nusrat Jahan (Agent)"
			},
			{
				id: "usr-agent-3",
				name: "Rafiqul Islam (Agent)"
			}
		];
	}
});
function useSetFollowUpStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const escape = (str) => str ? str.replace(/'/g, "''") : "";
			try {
				await runMySQLQuery(`UPDATE \`follow_ups\` 
           SET \`status\` = '${input.status}', 
               \`updated_at\` = NOW() 
               ${input.note ? `, \`note\` = '${escape(input.note)}'` : ""}
           WHERE \`id\` = '${input.id}';`);
			} catch (err) {
				console.warn("useSetFollowUpStatus MySQL notice:", err);
			}
			if (input.prospectId) try {
				const actId = generateUUID();
				await runMySQLQuery(`INSERT INTO \`activities\` (\`id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
             VALUES ('${actId}', '${input.prospectId}', 'follow_up_${input.status}', 'Follow-up task marked ${input.status}${input.prospectName ? ` for ${escape(input.prospectName)}` : ""}${input.note ? ` — ${escape(input.note)}` : ""}', NOW());`);
			} catch {}
			return { success: true };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
			queryClient.invalidateQueries({ queryKey: ["follow-up-summary"] });
			queryClient.invalidateQueries({ queryKey: ["prospect-follow-ups"] });
			queryClient.invalidateQueries({ queryKey: ["prospect-timeline"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["activities"] });
		}
	});
}
function useCreateFollowUp() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const escape = (str) => str ? str.replace(/'/g, "''") : "";
			const newId = generateUUID();
			const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
			const isoDue = new Date(input.due_at).toISOString().slice(0, 19).replace("T", " ");
			try {
				await runMySQLQuery(`INSERT INTO \`follow_ups\` (\`id\`, \`prospect_id\`, \`assigned_to\`, \`created_by\`, \`due_at\`, \`status\`, \`note\`, \`created_at\`, \`updated_at\`)
           VALUES ('${newId}', '${input.prospect_id}', '${input.assigned_to}', '${input.created_by}', '${isoDue}', 'pending', ${input.note ? `'${escape(input.note)}'` : "NULL"}, NOW(), NOW());`);
				const actId = generateUUID();
				await runMySQLQuery(`INSERT INTO \`activities\` (\`id\`, \`prospect_id\`, \`actor_id\`, \`activity_type\`, \`message\`, \`created_at\`)
           VALUES ('${actId}', '${input.prospect_id}', '${input.created_by}', 'follow_up_created', 'New follow-up task scheduled for ${format(new Date(input.due_at), "dd MMM yyyy, hh:mm a")}${input.note ? ` — ${escape(input.note)}` : ""}', NOW());`);
				const stageRes = await runMySQLQuery("SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) LIKE '%follow%' LIMIT 1;");
				const followUpStageId = stageRes?.success && stageRes.data?.[0] ? String(stageRes.data[0]["id"]) : "follow-up";
				let fromStageId = null;
				try {
					const currRes = await runMySQLQuery("SELECT `stage_id` FROM `prospects` WHERE `id` = ? LIMIT 1;", [input.prospect_id]);
					if (currRes?.success && currRes.data?.[0]) fromStageId = String(currRes.data[0]["stage_id"] || "") || null;
				} catch {}
				await runMySQLQuery("UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;", [
					followUpStageId,
					now,
					input.prospect_id
				]);
				const historyId = generateUUID();
				await runMySQLQuery(`INSERT INTO \`prospect_stage_history\` (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_at\`)
           VALUES (?, ?, ?, ?, ?, ?);`, [
					historyId,
					input.prospect_id,
					fromStageId,
					followUpStageId,
					`Follow-up scheduled for ${format(new Date(input.due_at), "dd MMM yyyy, hh:mm a")}${input.note ? ` — ${input.note}` : ""}`,
					now
				]);
				try {
					await supabase.from("prospects").update({
						stage_id: followUpStageId,
						stage_name: "Follow-up",
						updated_at: (/* @__PURE__ */ new Date()).toISOString()
					}).eq("id", input.prospect_id);
				} catch {}
			} catch (err) {
				console.warn("useCreateFollowUp MySQL notice:", err);
			}
			return {
				id: newId,
				prospect_id: input.prospect_id
			};
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
			queryClient.invalidateQueries({ queryKey: ["follow-up-summary"] });
			queryClient.invalidateQueries({ queryKey: ["prospect-follow-ups"] });
			queryClient.invalidateQueries({ queryKey: ["prospect-timeline"] });
			queryClient.invalidateQueries({ queryKey: ["activities"] });
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			if (data?.prospect_id) queryClient.invalidateQueries({ queryKey: ["stage-history", data.prospect_id] });
		}
	});
}
//#endregion
export { prospectTimelineQuery as a, useSetFollowUpStatus as c, followUpsQuery as i, followUpFiltersSchema as n, statusBadgeVariant as o, followUpSummaryQuery as r, useCreateFollowUp as s, agentsQuery as t };
