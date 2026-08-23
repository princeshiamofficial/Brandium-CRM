import { o as __toESM } from "../_runtime.mjs";
import { O as isRedirect, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bd2L1jDU.mjs";
import { t as runMySQLQuery } from "./mysql-api-5N6cl0NN.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as useQueryClient, n as queryOptions, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as generateUUID } from "./mysql-client-k5RcJc-f.mjs";
import { t as supabase } from "./client-ITZ-Lz0R.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as stringType, i as objectType, r as numberType, t as booleanType } from "../_libs/zod.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-_0dfMNIG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stages-jI-xa6bm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
/**
* Reusable stage engine entry point.
*/
var changeProspectStage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	prospectId: stringType().min(1),
	stageId: stringType().min(1),
	note: stringType().trim().max(1e3).optional()
}).parse(input)).handler(createSsrRpc("949e422fe576dceba0733980b7807562b0bfd4dc7a3a6e280bb7b244711796a9"));
var createStage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	name: stringType().trim().min(1).max(100),
	stage_group: stringType().trim().min(1).max(50),
	sort_order: numberType().int().min(0),
	is_follow_up: booleanType().default(false),
	color: stringType().optional(),
	icon: stringType().optional()
}).parse(input)).handler(createSsrRpc("3a0ba4bb28b1821a429bff3b0dfe98a820a3257ec553d22bad11303405f1da8e"));
var updateStage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
	id: stringType().min(1),
	name: stringType().trim().min(1).max(100).optional(),
	stage_group: stringType().trim().min(1).max(50).optional(),
	sort_order: numberType().int().min(0).optional(),
	is_follow_up: booleanType().optional(),
	is_active: booleanType().optional(),
	color: stringType().optional(),
	icon: stringType().optional()
}).parse(input)).handler(createSsrRpc("0a01dd8c28cfb8624f3e5b9aba3936ef28f823a1e499f2259363646509560ef7"));
var deleteStage = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({ id: stringType().min(1) }).parse(input)).handler(createSsrRpc("f17761f879f5ed2354a80513baebfda01706eb946b488de7f7f91201c6214db3"));
function resolveStageColor(name, customColor) {
	if (customColor && customColor.trim() && customColor !== "#0a2e5c" && customColor !== "#94a3b8") return customColor;
	const norm = (name || "").toLowerCase().replace(/[-_\s()]/g, "");
	if (norm.includes("prospect") || norm.includes("lead")) return "#2563EB";
	if (norm.includes("follow")) return "#D97706";
	if (norm.includes("opportunity")) return "#8B5CF6";
	if (norm.includes("won") || norm.includes("sale")) return "#16A34A";
	if (norm.includes("dnp") || norm.includes("didnotpick")) return "#EA580C";
	if (norm.includes("switchedoff") || norm.includes("switchoff")) return "#E11D48";
	if (norm.includes("invalid") || norm.includes("wrong")) return "#DC2626";
	if (norm.includes("meeting")) return "#4F46E5";
	if (norm.includes("quotation") || norm.includes("quote")) return "#0891B2";
	if (norm.includes("denied")) return "#9333EA";
	if (norm.includes("notinterested")) return "#64748B";
	return customColor || "#2563EB";
}
function resolveStageIcon(name, customIcon) {
	if (customIcon && customIcon.trim() && customIcon !== "Circle") return customIcon;
	const norm = (name || "").toLowerCase().replace(/[-_\s()]/g, "");
	if (norm.includes("prospect") || norm.includes("lead")) return "UserPlus";
	if (norm.includes("follow")) return "CalendarClock";
	if (norm.includes("opportunity")) return "Sparkles";
	if (norm.includes("won") || norm.includes("sale")) return "Trophy";
	if (norm.includes("dnp") || norm.includes("didnotpick")) return "PhoneMissed";
	if (norm.includes("switchedoff") || norm.includes("switchoff")) return "PowerOff";
	if (norm.includes("invalid") || norm.includes("wrong")) return "PhoneOff";
	if (norm.includes("meeting")) return "CalendarCheck";
	if (norm.includes("quotation") || norm.includes("quote")) return "FileText";
	if (norm.includes("denied")) return "ShieldAlert";
	if (norm.includes("notinterested")) return "UserX";
	return customIcon || "Circle";
}
function isSystemStage(stage) {
	if (stage.is_system) return true;
	const normName = (stage.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
	const normId = (stage.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
	const SYSTEM_KEYS = [
		"prospect",
		"followup",
		"opportunitycreated",
		"saleswon",
		"won",
		"dnp",
		"dnpdidnotpick",
		"switchedoff",
		"invalidnumber",
		"meetingscheduled",
		"quotationsent",
		"deniedpayment",
		"notinterested"
	];
	return SYSTEM_KEYS.includes(normName) || SYSTEM_KEYS.includes(normId);
}
var FALLBACK_STAGES = [
	{
		id: "prospect",
		name: "Prospect",
		stage_group: "new",
		sort_order: 1,
		is_follow_up: false,
		is_active: true,
		color: "#2563EB",
		icon: "UserPlus"
	},
	{
		id: "follow-up",
		name: "Follow-up",
		stage_group: "in_progress",
		sort_order: 2,
		is_follow_up: true,
		is_active: true,
		color: "#D97706",
		icon: "CalendarClock"
	},
	{
		id: "opportunity-created",
		name: "Opportunity Created",
		stage_group: "in_progress",
		sort_order: 3,
		is_follow_up: false,
		is_active: true,
		color: "#8B5CF6",
		icon: "Sparkles"
	},
	{
		id: "sales-won",
		name: "Sales won",
		stage_group: "won",
		sort_order: 4,
		is_follow_up: false,
		is_active: true,
		color: "#16A34A",
		icon: "Trophy"
	},
	{
		id: "dnp",
		name: "DNP (Did Not Pick)",
		stage_group: "unreachable",
		sort_order: 5,
		is_follow_up: false,
		is_active: true,
		color: "#EA580C",
		icon: "PhoneMissed"
	},
	{
		id: "switched-off",
		name: "Switched Off",
		stage_group: "unreachable",
		sort_order: 6,
		is_follow_up: false,
		is_active: true,
		color: "#E11D48",
		icon: "PowerOff"
	},
	{
		id: "invalid-number",
		name: "Invalid Number",
		stage_group: "unreachable",
		sort_order: 7,
		is_follow_up: false,
		is_active: true,
		color: "#DC2626",
		icon: "PhoneOff"
	},
	{
		id: "meeting-scheduled",
		name: "Meeting Scheduled",
		stage_group: "in_progress",
		sort_order: 8,
		is_follow_up: true,
		is_active: true,
		color: "#4F46E5",
		icon: "CalendarCheck"
	},
	{
		id: "quotation-sent",
		name: "Quotation Sent",
		stage_group: "in_progress",
		sort_order: 9,
		is_follow_up: false,
		is_active: true,
		color: "#0891B2",
		icon: "FileText"
	}
];
var stagesQuery = () => queryOptions({
	queryKey: ["stages"],
	staleTime: 3e5,
	queryFn: async () => {
		try {
			const mysqlRes = await runMySQLQuery(`SELECT id, name, stage_group, sort_order, is_follow_up, is_active, color, icon, is_system
           FROM \`stages\`
           ORDER BY sort_order ASC;`);
			if (mysqlRes?.success && Array.isArray(mysqlRes.data) && mysqlRes.data.length > 0) return mysqlRes.data.map((s) => ({
				id: String(s["id"]),
				name: String(s["name"]),
				stage_group: String(s["stage_group"] || "new"),
				sort_order: Number(s["sort_order"] || 0),
				is_follow_up: Boolean(s["is_follow_up"]),
				is_active: Boolean(s["is_active"]),
				color: resolveStageColor(String(s["name"]), s["color"] || null),
				icon: resolveStageIcon(String(s["name"]), s["icon"] || null),
				is_system: isSystemStage({
					is_system: s["is_system"] ? Boolean(s["is_system"]) : false,
					name: String(s["name"]),
					id: String(s["id"])
				})
			}));
		} catch (err) {
			console.warn("stagesQuery MySQL notice:", err);
		}
		try {
			const { data, error } = await supabase.from("stages").select("id, name, stage_group, sort_order, is_follow_up, is_active, color, icon, is_system").eq("is_active", true).order("sort_order", { ascending: true });
			if (error || !data || data.length === 0) return FALLBACK_STAGES;
			return data;
		} catch {
			return FALLBACK_STAGES;
		}
	}
});
function formatStageSlugOrName(str) {
	if (!str) return "";
	const lower = str.toLowerCase().trim();
	if (lower === "prospect" || lower === "new lead" || lower === "new_lead") return "Prospect";
	if (lower === "follow_up" || lower === "follow-up" || lower === "followup") return "Follow-up";
	if (lower === "opportunity_created" || lower === "opportunity-created" || lower === "opportunity created") return "Opportunity Created";
	if (lower === "sales_won" || lower === "sales-won" || lower === "sales won") return "Sales won";
	if (lower === "denied_payment" || lower === "denied-payment" || lower === "denied payment") return "Denied Payment";
	if (lower === "dnp" || lower.includes("dnp") || lower.includes("did not pick")) return "DNP";
	if (lower === "switched_off" || lower === "switched-off" || lower.includes("switched off")) return "Switched Off";
	if (lower === "invalid_number" || lower === "invalid-number" || lower.includes("invalid number")) return "Invalid Number";
	if (lower === "not_interested" || lower === "not-interested" || lower.includes("not interested")) return "Not Interested";
	return str.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
var stageHistoryQuery = (prospectId) => queryOptions({
	queryKey: ["stage-history", prospectId],
	queryFn: async () => {
		let rows = [];
		try {
			const mysqlRes = await runMySQLQuery(`SELECT psh.*, st.name AS to_stage_name 
           FROM \`prospect_stage_history\` psh 
           LEFT JOIN \`stages\` st ON psh.to_stage_id = st.id 
           WHERE psh.prospect_id = ? 
           ORDER BY psh.changed_at DESC;`, [prospectId]);
			if (mysqlRes?.success && Array.isArray(mysqlRes.data)) rows = mysqlRes.data;
		} catch (err) {
			console.warn("stageHistoryQuery MySQL notice:", err);
		}
		if (rows.length === 0) try {
			const { data, error } = await supabase.from("prospect_stage_history").select("id, prospect_id, from_stage_id, to_stage_id, note, changed_by, changed_at").eq("prospect_id", prospectId).order("changed_at", { ascending: false });
			if (!error && data) rows = data;
		} catch (err) {
			console.warn("stageHistoryQuery Supabase notice:", err);
		}
		const stageMap = /* @__PURE__ */ new Map();
		try {
			const { data: stagesList } = await supabase.from("stages").select("id, name");
			(stagesList || []).forEach((s) => {
				const sId = s["id"] || "";
				const sName = s["name"] || "";
				if (sId && sName) stageMap.set(sId, sName);
			});
		} catch {}
		const actorIds = Array.from(new Set(rows.map((row) => row["changed_by"]).filter(Boolean)));
		const nameById = /* @__PURE__ */ new Map();
		if (actorIds.length > 0) try {
			const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", actorIds);
			for (const profile of profiles ?? []) {
				const id = String(profile["id"] ?? "");
				const fullName = profile["full_name"];
				const email = profile["email"];
				nameById.set(id, fullName || email || "Unknown");
			}
		} catch {}
		const rawEntries = rows.map((row) => {
			const fromStageId = row["from_stage_id"] ?? null;
			const toStageId = row["to_stage_id"] ?? null;
			const changedBy = row["changed_by"];
			const resolvedFrom = fromStageId ? stageMap.get(fromStageId) || formatStageSlugOrName(fromStageId) : null;
			const resolvedTo = toStageId ? stageMap.get(toStageId) || formatStageSlugOrName(toStageId) : null;
			return {
				id: String(row["id"]),
				prospect_id: String(row["prospect_id"]),
				from_stage_id: fromStageId,
				to_stage_id: toStageId,
				note: row["note"] ?? null,
				changed_by: row["changed_by"] ?? null,
				changed_at: String(row["changed_at"] ?? (/* @__PURE__ */ new Date()).toISOString()),
				from_stage_name: resolvedFrom ?? null,
				to_stage_name: resolvedTo ?? null,
				changed_by_name: changedBy ? nameById.get(changedBy) : void 0
			};
		});
		const seen = /* @__PURE__ */ new Set();
		const finalEntries = [];
		for (const entry of rawEntries) {
			const normStageName = formatStageSlugOrName(entry.to_stage_name || entry.to_stage_id);
			entry.to_stage_name = normStageName;
			const timeSec = Math.floor(new Date(entry.changed_at).getTime() / 1e4);
			const key = `${entry.prospect_id}-${normStageName}-${entry.note || ""}-${timeSec}`;
			if (!seen.has(key)) {
				seen.add(key);
				finalEntries.push(entry);
			}
		}
		finalEntries.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
		return finalEntries;
	}
});
/** Shared mutation wrapper around the stage engine server function. */
function useChangeProspectStage() {
	const queryClient = useQueryClient();
	const changeStage = useServerFn(changeProspectStage);
	return useMutation({
		mutationFn: async (input) => {
			const isValidUuid = (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
			if (isValidUuid(input.prospectId) && isValidUuid(input.stageId)) try {
				const res = await changeStage({ data: {
					prospectId: input.prospectId,
					stageId: input.stageId,
					...input.note ? { note: input.note } : {}
				} });
				if (res) return res;
			} catch (err) {
				console.warn("Server changeProspectStage notice, applying direct update fallback:", err);
			}
			let resolvedStageName = input.stageName || formatStageSlugOrName(input.stageId) || "Stage Update";
			let realStageId = input.stageId;
			try {
				const mysqlStages = await runMySQLQuery("SELECT id, name FROM `stages` ORDER BY sort_order ASC;");
				if (mysqlStages?.success && Array.isArray(mysqlStages.data) && mysqlStages.data.length > 0) {
					const normalize = (str) => str.toLowerCase().replace(/[-_]/g, " ").trim();
					const targetNorm = normalize(input.stageName || input.stageId);
					const match = mysqlStages.data.find((s) => s["id"] === input.stageId || normalize(s["name"] || "") === targetNorm || normalize(s["id"] || "") === targetNorm);
					if (match) {
						realStageId = match["id"] || realStageId;
						resolvedStageName = match["name"] || resolvedStageName;
					}
				}
			} catch (err) {
				console.warn("stage lookup MySQL notice:", err);
			}
			if (input.prospectId) {
				try {
					const nowStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
					let fromStageId = null;
					try {
						const currRes = await runMySQLQuery(`SELECT stage_id FROM \`prospects\` WHERE \`id\` = ? LIMIT 1;`, [input.prospectId]);
						if (currRes?.success && currRes.data?.[0]) fromStageId = currRes.data[0]["stage_id"] || null;
					} catch {}
					await runMySQLQuery(`UPDATE \`prospects\` SET \`stage_id\` = ?, \`updated_at\` = ? WHERE \`id\` = ?;`, [
						realStageId,
						nowStr,
						input.prospectId
					]);
					const historyId = generateUUID();
					await runMySQLQuery(`INSERT INTO \`prospect_stage_history\` (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_at\`)
             VALUES (?, ?, ?, ?, ?, ?);`, [
						historyId,
						input.prospectId,
						fromStageId,
						realStageId,
						input.note || null,
						nowStr
					]);
				} catch (err) {
					console.warn("Direct MySQL stage update notice:", err);
				}
				try {
					const updatePayload = {
						updated_at: (/* @__PURE__ */ new Date()).toISOString(),
						stage_name: resolvedStageName,
						stage_id: realStageId
					};
					await supabase.from("prospects").update(updatePayload).eq("id", input.prospectId);
					await supabase.from("prospect_stage_history").insert({
						prospect_id: input.prospectId,
						to_stage_id: realStageId,
						note: input.note || null,
						changed_at: (/* @__PURE__ */ new Date()).toISOString()
					});
				} catch {}
			}
			return {
				changed: true,
				stage_name: resolvedStageName
			};
		},
		onSuccess: (result, input) => {
			if (result?.changed) toast.success(`Stage updated to ${result.stage_name || "new stage"}`);
			else toast.info("Prospect stage updated");
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
			queryClient.invalidateQueries({ queryKey: ["stage-history", input.prospectId] });
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not update the stage");
		}
	});
}
var stagesWithCountsQuery = () => queryOptions({
	queryKey: ["stages-with-counts"],
	queryFn: async () => {
		try {
			const mysqlRes = await runMySQLQuery(`SELECT 
             st.*,
             COUNT(p.id) AS prospect_count
           FROM \`stages\` st
           LEFT JOIN \`prospects\` p ON p.stage_id = st.id AND p.is_active = 1
           GROUP BY st.id
           ORDER BY st.sort_order ASC;`);
			if (mysqlRes?.success && Array.isArray(mysqlRes.data) && mysqlRes.data.length > 0) {
				const totalProspects = mysqlRes.data.reduce((acc, row) => acc + Number(row["prospect_count"] || 0), 0);
				return mysqlRes.data.map((s) => {
					const count = Number(s["prospect_count"] || 0);
					const percentage = totalProspects > 0 ? Math.round(count / totalProspects * 100) : 0;
					return {
						id: String(s["id"]),
						name: String(s["name"]),
						stage_group: String(s["stage_group"] || "new"),
						sort_order: Number(s["sort_order"] || 0),
						is_follow_up: Boolean(s["is_follow_up"]),
						is_active: Boolean(s["is_active"]),
						color: resolveStageColor(String(s["name"]), s["color"] || null),
						icon: resolveStageIcon(String(s["name"]), s["icon"] || null),
						is_system: isSystemStage({
							is_system: s["is_system"] ? Boolean(s["is_system"]) : false,
							name: String(s["name"]),
							id: String(s["id"])
						}),
						prospect_count: count,
						prospect_percentage: percentage
					};
				});
			}
		} catch (err) {
			console.warn("stagesWithCountsQuery MySQL notice:", err);
		}
		try {
			const { data, error } = await supabase.rpc("get_stages_with_counts");
			const rpcData = data;
			if (!error && rpcData && Array.isArray(rpcData) && rpcData.length > 0) return rpcData;
		} catch {}
		return FALLBACK_STAGES.map((stg) => ({
			...stg,
			prospect_count: 0,
			prospect_percentage: 0
		}));
	}
});
function useCreateStage() {
	const queryClient = useQueryClient();
	const createStageFn = useServerFn(createStage);
	return useMutation({
		mutationFn: async (input) => {
			const newId = generateUUID();
			try {
				await runMySQLQuery(`INSERT INTO \`stages\` (\`id\`, \`name\`, \`stage_group\`, \`sort_order\`, \`is_follow_up\`, \`color\`, \`icon\`, \`is_active\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1);`, [
					newId,
					input.name,
					input.stage_group,
					input.sort_order,
					input.is_follow_up ? 1 : 0,
					input.color || null,
					input.icon || null
				]);
			} catch (err) {
				console.warn("Direct MySQL stage creation notice:", err);
			}
			try {
				await createStageFn({ data: input });
			} catch {}
			return {
				id: newId,
				name: input.name
			};
		},
		onSuccess: () => {
			toast.success("Stage created successfully");
			queryClient.invalidateQueries({ queryKey: ["stages"] });
			queryClient.invalidateQueries({ queryKey: ["stages-with-counts"] });
			queryClient.invalidateQueries({ queryKey: ["stage-management-summary"] });
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not create stage");
		}
	});
}
function useUpdateStage() {
	const queryClient = useQueryClient();
	const updateStageFn = useServerFn(updateStage);
	return useMutation({
		mutationFn: async (input) => {
			try {
				const fields = [];
				const values = [];
				if (input.name !== void 0) {
					fields.push("`name` = ?");
					values.push(input.name);
				}
				if (input.stage_group !== void 0) {
					fields.push("`stage_group` = ?");
					values.push(input.stage_group);
				}
				if (input.sort_order !== void 0) {
					fields.push("`sort_order` = ?");
					values.push(input.sort_order);
				}
				if (input.is_follow_up !== void 0) {
					fields.push("`is_follow_up` = ?");
					values.push(input.is_follow_up ? 1 : 0);
				}
				if (input.is_active !== void 0) {
					fields.push("`is_active` = ?");
					values.push(input.is_active ? 1 : 0);
				}
				if (input.color !== void 0) {
					fields.push("`color` = ?");
					values.push(input.color);
				}
				if (input.icon !== void 0) {
					fields.push("`icon` = ?");
					values.push(input.icon);
				}
				if (fields.length > 0) {
					values.push(input.id);
					await runMySQLQuery(`UPDATE \`stages\` SET ${fields.join(", ")}, \`updated_at\` = NOW() WHERE \`id\` = ?;`, values);
				}
			} catch (err) {
				console.warn("Direct MySQL stage update notice:", err);
			}
			try {
				await updateStageFn({ data: input });
			} catch {}
			return { success: true };
		},
		onSuccess: () => {
			toast.success("Stage updated successfully");
			queryClient.invalidateQueries({ queryKey: ["stages"] });
			queryClient.invalidateQueries({ queryKey: ["stages-with-counts"] });
			queryClient.invalidateQueries({ queryKey: ["stage-management-summary"] });
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not update stage");
		}
	});
}
function useDeleteStage() {
	const queryClient = useQueryClient();
	const deleteStageFn = useServerFn(deleteStage);
	return useMutation({
		mutationFn: async (stageId) => {
			try {
				await runMySQLQuery(`DELETE FROM \`stages\` WHERE \`id\` = ?;`, [stageId]);
			} catch (err) {
				console.warn("Direct MySQL stage delete notice:", err);
			}
			try {
				const res = await deleteStageFn({ data: { id: stageId } });
				if (res) return res;
			} catch (err) {
				console.warn("Server deleteStage notice, trying direct client delete:", err);
			}
			const { error } = await supabase.from("stages").delete().eq("id", stageId);
			if (error) await supabase.from("stages").update({ is_active: false }).eq("id", stageId);
			return { success: true };
		},
		onSuccess: () => {
			toast.success("Stage deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["stages"] });
			queryClient.invalidateQueries({ queryKey: ["stages-with-counts"] });
			queryClient.invalidateQueries({ queryKey: ["stage-management-summary"] });
			queryClient.invalidateQueries({ queryKey: ["prospects"] });
			queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
			queryClient.invalidateQueries({ queryKey: ["dashboard"] });
			queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
		},
		onError: (error) => {
			toast.error(error instanceof Error ? error.message : "Could not delete stage");
		}
	});
}
async function deleteStageHistoryEntry(historyId, prospectId) {
	if (!historyId) return false;
	try {
		const { error } = await supabase.from("prospect_stage_history").delete().eq("id", historyId);
		if (error && !isNaN(Number(historyId))) await supabase.from("prospect_stage_history").delete().eq("id", Number(historyId));
	} catch (err) {
		console.warn("deleteStageHistoryEntry notice:", err);
	}
	if (prospectId) try {
		const { data: remaining } = await supabase.from("prospect_stage_history").select("to_stage_id, changed_at").eq("prospect_id", prospectId).order("changed_at", { ascending: false }).limit(1);
		const firstRem = (remaining || [])[0];
		if (firstRem && firstRem["to_stage_id"]) {
			const latestStageId = String(firstRem["to_stage_id"]);
			const { data: stg } = await supabase.from("stages").select("name").eq("id", latestStageId).maybeSingle();
			const stgObj = stg;
			await supabase.from("prospects").update({
				stage_id: latestStageId,
				stage_name: stgObj?.["name"] || "Prospect",
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", prospectId);
		} else await supabase.from("prospects").update({
			stage_name: "Prospect",
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", prospectId);
	} catch {}
	return true;
}
//#endregion
export { resolveStageColor as a, stagesQuery as c, useCreateStage as d, useDeleteStage as f, isSystemStage as i, stagesWithCountsQuery as l, deleteStageHistoryEntry as n, resolveStageIcon as o, useUpdateStage as p, formatStageSlugOrName as r, stageHistoryQuery as s, FALLBACK_STAGES as t, useChangeProspectStage as u };
