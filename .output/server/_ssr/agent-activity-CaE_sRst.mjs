import { o as __toESM } from "../_runtime.mjs";
import { t as runMySQLQuery } from "./mysql-api-DK3LroIZ.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Button } from "./button-Cef07JZR.mjs";
import { t as Card } from "./card-CtX3ithx.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Skeleton } from "./skeleton-D9W9wFsj.mjs";
import { t as StatCard } from "./stat-card-C9FEmuAx.mjs";
import { $t as Building2, At as Clock, E as ShieldCheck, H as Phone, I as RefreshCw, L as Receipt, P as RotateCcw, X as MessageSquare, Zt as CalendarClock, b as Tag, c as UsersRound, ct as Layers, k as Search, l as User, ln as Activity, rt as Lock, s as Users, y as Target, yt as FileBraces } from "../_libs/lucide-react.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B85j8UA0.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-Dg1urBTx.mjs";
import { a as useQueryClient, n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as agentOptionsQueryOptions } from "./won-sales-M30PUlkq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-activity-CaE_sRst.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function fetchActivityLogs(filters = {}) {
	try {
		const allLogs = [];
		try {
			const actRes = await runMySQLQuery(`SELECT 
          a.id,
          a.actor_id AS user_id,
          COALESCE(u.name, u.email, 'Agent') AS user_name,
          COALESCE(a.message, a.activity_type) AS action,
          a.activity_type AS entity_type,
          a.prospect_id AS entity_id,
          p.contact_name AS prospect_name,
          p.business_name,
          p.phone,
          a.created_at
        FROM \`activities\` a
        LEFT JOIN \`users\` u ON a.actor_id = u.id
        LEFT JOIN \`prospects\` p ON a.prospect_id = p.id
        ORDER BY a.created_at DESC
        LIMIT 100;`);
			if (actRes.success && Array.isArray(actRes.data)) for (const r of actRes.data) allLogs.push({
				id: String(r["id"]),
				user_id: r["user_id"] || null,
				user_name: String(r["user_name"] || "Agent"),
				action: String(r["action"] || "Activity Logged"),
				entity_type: String(r["entity_type"] || "general"),
				entity_id: r["entity_id"] || null,
				metadata_json: {
					prospect_name: r["prospect_name"] || void 0,
					business_name: r["business_name"] || void 0,
					phone: r["phone"] || void 0,
					message: r["action"] || void 0,
					source_table: "activities"
				},
				created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString())
			});
		} catch (err) {
			console.warn("fetchActivityLogs activities query error:", err);
		}
		try {
			const stageRes = await runMySQLQuery(`SELECT 
          sh.id,
          sh.changed_by AS user_id,
          COALESCE(u.name, 'Agent') AS user_name,
          COALESCE(s_to.name, 'New Stage') AS to_stage_name,
          COALESCE(s_from.name, 'Previous Stage') AS from_stage_name,
          sh.notes AS note,
          sh.prospect_id AS entity_id,
          p.contact_name AS prospect_name,
          p.business_name,
          p.phone,
          sh.created_at
        FROM \`prospect_stage_history\` sh
        LEFT JOIN \`users\` u ON sh.changed_by = u.id
        LEFT JOIN \`stages\` s_from ON sh.from_stage_id = s_from.id
        LEFT JOIN \`stages\` s_to ON sh.to_stage_id = s_to.id
        LEFT JOIN \`prospects\` p ON sh.prospect_id = p.id
        ORDER BY sh.created_at DESC
        LIMIT 50;`);
			if (stageRes.success && Array.isArray(stageRes.data)) for (const r of stageRes.data) {
				const toStage = String(r["to_stage_name"] || "Stage");
				const fromStage = String(r["from_stage_name"] || "Previous");
				const noteText = r["note"] ? ` - ${r["note"]}` : "";
				allLogs.push({
					id: `sh_${r["id"]}`,
					user_id: r["user_id"] || null,
					user_name: String(r["user_name"] || "Agent"),
					action: `Stage transitioned: ${fromStage} → ${toStage}${noteText}`,
					entity_type: "stage",
					entity_id: r["entity_id"] || null,
					metadata_json: {
						prospect_name: r["prospect_name"] || void 0,
						business_name: r["business_name"] || void 0,
						phone: r["phone"] || void 0,
						from_stage: fromStage,
						to_stage: toStage,
						note: r["note"] || void 0,
						source_table: "prospect_stage_history"
					},
					created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString())
				});
			}
		} catch (err) {
			console.warn("fetchActivityLogs stage history query error:", err);
		}
		try {
			const meetRes = await runMySQLQuery(`SELECT 
          m.id,
          m.assigned_user_id AS user_id,
          COALESCE(u.name, 'Agent') AS user_name,
          m.title,
          m.status AS meeting_status,
          m.meeting_type,
          m.meeting_date,
          m.meeting_time,
          m.location,
          m.notes,
          m.prospect_id AS entity_id,
          p.contact_name AS prospect_name,
          p.business_name,
          p.phone,
          m.created_at
        FROM \`meetings\` m
        LEFT JOIN \`users\` u ON m.assigned_user_id = u.id
        LEFT JOIN \`prospects\` p ON m.prospect_id = p.id
        ORDER BY m.created_at DESC
        LIMIT 50;`);
			if (meetRes.success && Array.isArray(meetRes.data)) for (const r of meetRes.data) allLogs.push({
				id: `mt_${r["id"]}`,
				user_id: r["user_id"] || null,
				user_name: String(r["user_name"] || "Agent"),
				action: `Meeting ${r["meeting_status"] || "Scheduled"}: ${r["title"] || "Client Meeting"} on ${r["meeting_date"] || "TBD"}`,
				entity_type: "meeting",
				entity_id: r["entity_id"] || null,
				metadata_json: {
					prospect_name: r["prospect_name"] || void 0,
					business_name: r["business_name"] || void 0,
					phone: r["phone"] || void 0,
					meeting_type: r["meeting_type"] || void 0,
					meeting_date: r["meeting_date"] || void 0,
					meeting_time: r["meeting_time"] || void 0,
					location: r["location"] || void 0,
					notes: r["notes"] || void 0,
					source_table: "meetings"
				},
				created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString())
			});
		} catch (err) {
			console.warn("fetchActivityLogs meetings query error:", err);
		}
		try {
			const invRes = await runMySQLQuery(`SELECT 
          i.id,
          i.created_by AS user_id,
          COALESCE(u.name, 'Agent') AS user_name,
          i.invoice_number,
          i.total_amount,
          i.due_amount,
          i.status AS invoice_status,
          i.description,
          i.bill_date,
          i.due_date,
          i.prospect_id AS entity_id,
          p.contact_name AS prospect_name,
          p.business_name,
          p.phone,
          i.created_at
        FROM \`invoices\` i
        LEFT JOIN \`users\` u ON i.created_by = u.id
        LEFT JOIN \`prospects\` p ON i.prospect_id = p.id
        ORDER BY i.created_at DESC
        LIMIT 50;`);
			if (invRes.success && Array.isArray(invRes.data)) for (const r of invRes.data) allLogs.push({
				id: `inv_${r["id"]}`,
				user_id: r["user_id"] || null,
				user_name: String(r["user_name"] || "Agent"),
				action: `Invoice ${r["invoice_number"] || ""} generated (৳${r["total_amount"] || 0}) - ${r["description"] || "Service"}`,
				entity_type: "invoice",
				entity_id: r["entity_id"] || null,
				metadata_json: {
					prospect_name: r["prospect_name"] || void 0,
					business_name: r["business_name"] || void 0,
					phone: r["phone"] || void 0,
					invoice_number: r["invoice_number"] || void 0,
					total_amount: r["total_amount"] || 0,
					due_amount: r["due_amount"] || 0,
					status: r["invoice_status"] || "Pending",
					bill_date: r["bill_date"] || void 0,
					source_table: "invoices"
				},
				created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString())
			});
		} catch (err) {
			console.warn("fetchActivityLogs invoices query error:", err);
		}
		try {
			const payRes = await runMySQLQuery(`SELECT 
          py.id,
          py.recorded_by AS user_id,
          COALESCE(u.name, 'Agent') AS user_name,
          py.amount,
          py.payment_method,
          py.transaction_reference,
          py.payment_date,
          py.notes,
          inv.prospect_id AS entity_id,
          p.contact_name AS prospect_name,
          p.business_name,
          p.phone,
          py.created_at
        FROM \`payments\` py
        LEFT JOIN \`users\` u ON py.recorded_by = u.id
        LEFT JOIN \`invoices\` inv ON py.invoice_id = inv.id
        LEFT JOIN \`prospects\` p ON inv.prospect_id = p.id
        ORDER BY py.created_at DESC
        LIMIT 50;`);
			if (payRes.success && Array.isArray(payRes.data)) for (const r of payRes.data) allLogs.push({
				id: `pay_${r["id"]}`,
				user_id: r["user_id"] || null,
				user_name: String(r["user_name"] || "Agent"),
				action: `Payment of ৳${r["amount"] || 0} received via ${r["payment_method"] || "Bank Transfer"}`,
				entity_type: "payment",
				entity_id: r["entity_id"] || null,
				metadata_json: {
					prospect_name: r["prospect_name"] || void 0,
					business_name: r["business_name"] || void 0,
					phone: r["phone"] || void 0,
					amount: r["amount"] || 0,
					payment_method: r["payment_method"] || void 0,
					transaction_reference: r["transaction_reference"] || void 0,
					payment_date: r["payment_date"] || void 0,
					notes: r["notes"] || void 0,
					source_table: "payments"
				},
				created_at: String(r["created_at"] || (/* @__PURE__ */ new Date()).toISOString())
			});
		} catch (err) {
			console.warn("fetchActivityLogs payments query error:", err);
		}
		allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
		return applyActivityFilters(allLogs, filters);
	} catch (err) {
		console.warn("fetchActivityLogs general error:", err);
		return [];
	}
}
function applyActivityFilters(list, filters) {
	let result = list;
	if (filters.entity_type && filters.entity_type !== "all") {
		const et = filters.entity_type.toLowerCase();
		result = result.filter((log) => {
			const currentEt = log.entity_type.toLowerCase();
			if (et === "followup" && (currentEt === "followup" || currentEt === "meeting")) return true;
			if (et === "invoice" && (currentEt === "invoice" || currentEt === "billing")) return true;
			return currentEt === et;
		});
	}
	if (filters.user_id && filters.user_id !== "all") result = result.filter((log) => log.user_id === filters.user_id);
	if (filters.search && filters.search.trim() !== "") {
		const q = filters.search.toLowerCase().trim();
		result = result.filter((log) => log.action.toLowerCase().includes(q) || log.user_name.toLowerCase().includes(q) || log.entity_type.toLowerCase().includes(q) || JSON.stringify(log.metadata_json).toLowerCase().includes(q));
	}
	return result;
}
var activityLogsQueryOptions = (filters = {}) => queryOptions({
	queryKey: ["activity-logs", filters],
	queryFn: () => fetchActivityLogs(filters)
});
function ActivityLogMetadataModal({ open, onOpenChange, log }) {
	if (!log) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
				className: "flex items-center gap-2 text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileBraces, { className: "size-5 text-[#67B239]" }), "Audit Log Metadata Details"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
				className: "text-xs",
				children: [
					"Action: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: log.action }),
					" · Entity: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: log.entity_type })
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 py-2 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3 bg-slate-50 dark:bg-muted/40 p-3 rounded-lg border font-mono",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground block font-medium",
							children: "Logged By"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-foreground flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3 text-[#67B239]" }), log.user_name]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-muted-foreground block font-medium",
							children: "Timestamp"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-foreground flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3 text-slate-400" }), new Date(log.created_at).toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
								month: "short",
								day: "numeric"
							})]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 p-2.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-900 dark:text-blue-200 text-[11px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 shrink-0 text-blue-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Audit logs are immutable. Editing or deleting audit records is strictly prohibited." })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-foreground flex items-center gap-1 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-3.5 text-slate-500" }), "Event Payload Metadata JSON:"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-56 border border-slate-800 leading-relaxed",
							children: JSON.stringify(log.metadata_json, null, 2)
						})]
					})
				]
			})]
		})
	});
}
function AgentActivityPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [entityFilter, setEntityFilter] = (0, import_react.useState)("all");
	const [agentFilter, setAgentFilter] = (0, import_react.useState)("all");
	const [isRefreshing, setIsRefreshing] = (0, import_react.useState)(false);
	const [modalState, setModalState] = (0, import_react.useState)({
		open: false,
		log: null
	});
	const { data: rawLogs = [], isLoading, refetch } = useQuery(activityLogsQueryOptions());
	const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());
	const logs = Array.isArray(rawLogs) ? rawLogs : [];
	const agents = Array.isArray(rawAgents) ? rawAgents : [];
	const totalLogsCount = logs.length;
	const prospectLogsCount = logs.filter((l) => l.entity_type === "prospect" || l.entity_type === "stage").length;
	const financeLogsCount = logs.filter((l) => l.entity_type === "invoice" || l.entity_type === "payment" || l.entity_type === "billing").length;
	const tasksMeetingsCount = logs.filter((l) => l.entity_type === "meeting" || l.entity_type === "followup").length;
	const handleRefresh = async () => {
		setIsRefreshing(true);
		await refetch();
		queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
		setTimeout(() => setIsRefreshing(false), 400);
	};
	const filteredLogs = logs.filter((log) => {
		if (entityFilter !== "all") {
			const ef = entityFilter.toLowerCase();
			const currentEt = log.entity_type.toLowerCase();
			if (ef === "followup" && (currentEt === "followup" || currentEt === "meeting")) {} else if (ef === "invoice" && (currentEt === "invoice" || currentEt === "billing")) {} else if (currentEt !== ef) return false;
		}
		if (agentFilter !== "all") {
			if (log.user_id !== agentFilter) {
				const agentObj = agents.find((a) => a.id === agentFilter);
				if (!agentObj || log.user_name.toLowerCase() !== agentObj.name.toLowerCase()) return false;
			}
		}
		if (search && search.trim() !== "") {
			const searchLower = search.toLowerCase().trim();
			const prospectName = String(log.metadata_json["prospect_name"] || "").toLowerCase();
			const businessName = String(log.metadata_json["business_name"] || "").toLowerCase();
			const phone = String(log.metadata_json["phone"] || "").toLowerCase();
			return log.action?.toLowerCase().includes(searchLower) || log.user_name?.toLowerCase().includes(searchLower) || log.entity_type?.toLowerCase().includes(searchLower) || prospectName.includes(searchLower) || businessName.includes(searchLower) || phone.includes(searchLower) || JSON.stringify(log.metadata_json)?.toLowerCase().includes(searchLower);
		}
		return true;
	});
	const getCategoryBadge = (entityType) => {
		switch (entityType.toLowerCase()) {
			case "prospect": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 text-[10px] px-2 py-0.5 gap-1 font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersRound, { className: "size-3" }), "Prospect"]
			});
			case "stage": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 text-[10px] px-2 py-0.5 gap-1 font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }), "Stage Change"]
			});
			case "opportunity": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 text-[10px] px-2 py-0.5 gap-1 font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-3" }), "Opportunity"]
			});
			case "meeting": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px] px-2 py-0.5 gap-1 font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3" }), "Meeting"]
			});
			case "followup": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px] px-2 py-0.5 gap-1 font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { className: "size-3" }), "Follow-up"]
			});
			case "invoice":
			case "billing": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px] px-2 py-0.5 gap-1 font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-3" }), "Invoice"]
			});
			case "payment": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px] px-2 py-0.5 gap-1 font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-3" }), "Payment"]
			});
			case "sms": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 text-[10px] px-2 py-0.5 gap-1 font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-3" }), "SMS"]
			});
			case "user": return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				className: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 text-[10px] px-2 py-0.5 gap-1 font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-3" }), "User Admin"]
			});
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				className: "text-[10px] px-2 py-0.5",
				children: entityType
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-7 text-[#67B239]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-bold tracking-tight text-foreground",
						children: "Agent Activity & Audit Logs"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: "Real-time live audit trail of agent actions across prospects, stages, meetings, invoices, and payments."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: handleRefresh,
						disabled: isRefreshing || isLoading,
						className: "h-9 px-3 text-xs gap-1.5 font-semibold cursor-pointer rounded-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `size-3.5 ${isRefreshing ? "animate-spin" : ""}` }), "Refresh Stream"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "bg-emerald-50 text-emerald-700 border-emerald-300 text-xs px-3 py-1.5 font-semibold gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4 text-emerald-600" }), "Live Audit Stream"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Total Audit Events",
						value: String(totalLogsCount),
						icon: Activity,
						colorScheme: "pastelPurple"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Prospect & Stage Events",
						value: String(prospectLogsCount),
						icon: UsersRound,
						colorScheme: "pastelTeal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Financial & Invoices",
						value: String(financeLogsCount),
						icon: Receipt,
						colorScheme: "pastelEmerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Meetings & Follow-ups",
						value: String(tasksMeetingsCount),
						icon: CalendarClock,
						colorScheme: "pastelPeach"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: agentFilter,
						onValueChange: (val) => setAgentFilter(val),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
							className: "w-44 bg-white rounded-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Agents" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All Agents"
						}), agents.map((ag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: ag.id,
							children: ag.name
						}, ag.id))] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative max-w-sm flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Search action, prospect name, phone, notes...",
							value: search,
							onChange: (e) => setSearch(e.target.value),
							className: "pl-9 pr-8 bg-white rounded-xl"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: entityFilter,
						onValueChange: setEntityFilter,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger, {
							className: "w-48 bg-white rounded-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Categories" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All Categories"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "stage",
								children: "Stage Transitions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "meeting",
								children: "Meetings"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "prospect",
								children: "Prospects"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "opportunity",
								children: "Opportunities"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "followup",
								children: "Follow-ups"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "invoice",
								children: "Invoices"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "payment",
								children: "Payments"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "sms",
								children: "SMS Dispatches"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "user",
								children: "User Administration"
							})
						] })]
					}), (search || entityFilter !== "all" || agentFilter !== "all") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => {
							setSearch("");
							setEntityFilter("all");
							setAgentFilter("all");
						},
						className: "rounded-xl",
						title: "Reset Filters",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "bg-white dark:bg-card border-slate-200/80 shadow-xs overflow-hidden rounded-2xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left border-collapse text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b bg-slate-50/80 dark:bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Action & Details"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Category"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Agent / User"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Prospect / Entity"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4",
									children: "Timestamp"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-3.5 px-4 text-right",
									children: "Payload"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border/60",
							children: isLoading ? Array.from({ length: 6 }).map((_, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 6,
								className: "py-4 px-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded-xl" })
							}) }, idx)) : filteredLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								colSpan: 6,
								className: "py-12 text-center text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-8 mx-auto text-slate-300 mb-2" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-foreground",
										children: "No activity logs match your search"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: "Try resetting search filters or selecting \"All Categories\"."
									})
								]
							}) }) : filteredLogs.map((log) => {
								const prospectName = log.metadata_json["prospect_name"];
								const businessName = log.metadata_json["business_name"];
								const phone = log.metadata_json["phone"];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "py-3.5 px-4 max-w-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "font-bold text-foreground text-xs flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "size-3.5 text-[#67B239] shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: log.action })]
											}), (prospectName || businessName || phone) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-muted-foreground text-[11px] flex items-center gap-2 mt-1 truncate",
												children: [
													prospectName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-slate-700 dark:text-slate-300",
														children: prospectName
													}),
													businessName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-slate-500 truncate flex items-center gap-0.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-3 inline" }), businessName]
													}),
													phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-slate-400 font-mono text-[10px] flex items-center gap-0.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-2.5 inline" }), phone]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap",
											children: getCategoryBadge(log.entity_type)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap font-medium text-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300",
													children: log.user_name.charAt(0).toUpperCase()
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: log.user_name })]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400",
											children: prospectName || log.entity_id || "System"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3 text-slate-400" }), new Date(log.created_at).toLocaleTimeString("en-US", {
													hour: "2-digit",
													minute: "2-digit",
													month: "short",
													day: "numeric"
												})]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-3.5 px-4 text-right whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "outline",
												size: "sm",
												className: "h-7 px-2 text-xs gap-1 rounded-lg font-semibold cursor-pointer",
												onClick: () => setModalState({
													open: true,
													log
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileBraces, { className: "size-3.5 text-blue-600" }), "Inspect"]
											})
										})
									]
								}, log.id);
							})
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityLogMetadataModal, {
				open: modalState.open,
				onOpenChange: (open) => setModalState((prev) => ({
					...prev,
					open
				})),
				log: modalState.log
			})
		]
	});
}
//#endregion
export { AgentActivityPage as component };
