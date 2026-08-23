import { t as runMySQLQuery } from "./mysql-api-DGi25MCo.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { a as stringType, i as objectType, r as numberType } from "../_libs/zod.mjs";
import { n as fetchMySQLProspects, r as saveMySQLProspect, t as deleteMySQLProspect } from "./prospects.functions-CVN-CD9b.mjs";
import { r as formatStageSlugOrName } from "./stages-C4suQd8u.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prospects-DJVgI52x.js
var prospectFiltersSchema = objectType({
	page: numberType().catch(1),
	search: stringType().optional(),
	stage: stringType().optional(),
	agent: stringType().optional(),
	service: stringType().optional(),
	from: stringType().optional(),
	to: stringType().optional()
});
function getProspectArtistName(prospect) {
	if (prospect.artist && prospect.artist.trim() && prospect.artist.toLowerCase() !== "none") return prospect.artist.trim();
	if (prospect.notes) {
		const match = prospect.notes.match(/\[Artist:\s*([^\]]+)\]/i);
		if (match && match[1] && match[1].trim() && match[1].toLowerCase() !== "none") return match[1].trim();
	}
	if (prospect.assigned_agent_name && prospect.assigned_agent_name.trim() && prospect.assigned_agent_name.toLowerCase() !== "unknown") return prospect.assigned_agent_name.trim();
	return "Unassigned";
}
function getProspectAgentName(prospect) {
	if (prospect.notes) {
		const match = prospect.notes.match(/\[Agent:\s*([^\]]+)\]/i);
		if (match && match[1] && match[1].trim() && match[1].toLowerCase() !== "none") return match[1].trim();
	}
	if (prospect.assigned_agent_name && prospect.assigned_agent_name.trim() && prospect.assigned_agent_name.toLowerCase() !== "unknown" && prospect.assigned_agent_name.toLowerCase() !== "agent") return prospect.assigned_agent_name.trim();
	if (prospect.creator_name && prospect.creator_name.trim() && prospect.creator_name.toLowerCase() !== "system") return prospect.creator_name.trim();
	return "Mehan Ahmed";
}
var prospectsQuery = (filters, _userId, _isAdmin) => queryOptions({
	queryKey: ["prospects", filters],
	queryFn: async () => {
		const pageSize = 10;
		const from = (filters.page - 1) * pageSize;
		let fetchedRows = [];
		let mysqlSuccess = false;
		try {
			const res = await runMySQLQuery(`SELECT 
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
			if (res?.success && Array.isArray(res.data)) {
				mysqlSuccess = true;
				fetchedRows = res.data.map((p) => {
					const stId = String(p["stage_id"] || "");
					return {
						id: String(p["id"]),
						contact_name: String(p["contact_name"] || "Client"),
						business_name: p["business_name"] || null,
						designation: p["designation"] || null,
						phone: p["phone"] || null,
						alternative_phone: p["alternative_phone"] || null,
						email: p["email"] || null,
						address: p["address"] || null,
						service_id: p["service_id"] || null,
						stage_id: stId || null,
						assigned_to: p["assigned_to"] || null,
						created_by: p["created_by"] || null,
						notes: p["notes"] || null,
						created_at: String(p["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
						updated_at: String(p["updated_at"] || (/* @__PURE__ */ new Date()).toISOString()),
						service_name: p["service_name"] || void 0,
						stage_name: String(p["stage_name"] || formatStageSlugOrName(stId) || "Prospect"),
						stage_group: p["stage_group"] || "new",
						stage_color: p["stage_color"] || null,
						stage_icon: p["stage_icon"] || null,
						assigned_agent_name: p["assigned_agent_name"] || void 0,
						creator_name: p["creator_name"] || void 0
					};
				});
			}
		} catch (err) {
			console.warn("prospectsQuery API error:", err);
		}
		if (!mysqlSuccess) try {
			const mysqlRes = await fetchMySQLProspects();
			if (mysqlRes?.success && Array.isArray(mysqlRes.prospects)) {
				mysqlSuccess = true;
				fetchedRows = mysqlRes.prospects.map((p) => {
					const stId = String(p["stage_id"] || "");
					return {
						id: String(p["id"]),
						contact_name: String(p["contact_name"] || "Client"),
						business_name: p["business_name"] || null,
						designation: p["designation"] || null,
						phone: p["phone"] || null,
						alternative_phone: p["alternative_phone"] || null,
						email: p["email"] || null,
						address: p["address"] || null,
						service_id: p["service_id"] || null,
						stage_id: stId || null,
						assigned_to: p["assigned_to"] || null,
						created_by: p["created_by"] || null,
						notes: p["notes"] || null,
						created_at: String(p["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
						updated_at: String(p["updated_at"] || (/* @__PURE__ */ new Date()).toISOString()),
						service_name: p["service_name"] || void 0,
						stage_name: String(p["stage_name"] || formatStageSlugOrName(stId) || "Prospect"),
						stage_group: p["stage_group"] || "new",
						stage_color: p["stage_color"] || null,
						stage_icon: p["stage_icon"] || null,
						assigned_agent_name: p["assigned_agent_name"] || void 0,
						creator_name: p["creator_name"] || void 0
					};
				});
			}
		} catch {}
		let rows = fetchedRows;
		if (filters.search) {
			const q = filters.search.toLowerCase().trim();
			rows = rows.filter((p) => p.contact_name.toLowerCase().includes(q) || p.business_name && p.business_name.toLowerCase().includes(q) || p.phone && p.phone.includes(q) || p.alternative_phone && p.alternative_phone.includes(q) || p.email && p.email.toLowerCase().includes(q) || p.designation && p.designation.toLowerCase().includes(q) || p.address && p.address.toLowerCase().includes(q) || p.service_name && p.service_name.toLowerCase().includes(q) || p.stage_name && p.stage_name.toLowerCase().includes(q) || p.notes && p.notes.toLowerCase().includes(q) || p.assigned_agent_name && p.assigned_agent_name.toLowerCase().includes(q) || p.creator_name && p.creator_name.toLowerCase().includes(q));
		}
		if (filters.stage && filters.stage !== "all") {
			const target = filters.stage.replace(/[-_]/g, " ").toLowerCase();
			rows = rows.filter((p) => {
				if (p.stage_id === filters.stage) return true;
				const sName = (p.stage_name || "").toLowerCase();
				if (target.includes("follow") && sName.includes("follow")) return true;
				if (target.includes("opportunity") && sName.includes("opportunity")) return true;
				if ((target.includes("won") || target.includes("sales")) && (sName.includes("won") || sName.includes("sales"))) return true;
				if (target.includes("prospect") && sName.includes("prospect")) return true;
				return sName.includes(target) || target.includes(sName);
			});
		}
		if (filters.agent && filters.agent !== "all") rows = rows.filter((p) => p.assigned_to === filters.agent);
		if (filters.service && filters.service !== "all") rows = rows.filter((p) => p.service_id === filters.service);
		if (filters.from) rows = rows.filter((p) => p.created_at >= filters.from);
		if (filters.to) rows = rows.filter((p) => p.created_at <= filters.to);
		const totalCount = rows.length;
		return {
			data: rows.slice(from, from + pageSize),
			count: totalCount,
			pageCount: Math.ceil(totalCount / pageSize) || 1
		};
	}
});
var prospectsStatsQuery = (_userId, _isAdmin) => queryOptions({
	queryKey: ["prospects-stats"],
	queryFn: async () => {
		let allProspects = [];
		try {
			const res = await runMySQLQuery(`SELECT 
            p.id,
            p.stage_id,
            COALESCE(st.name, p.stage_id, 'Prospect') AS stage_name
          FROM \`prospects\` p
          LEFT JOIN \`stages\` st ON (p.stage_id = st.id OR p.stage_id = REPLACE(st.id, '-', '_') OR p.stage_id = st.name)
          WHERE (p.is_active = 1 OR p.is_active IS NULL) 
          ORDER BY p.created_at DESC;`);
			if (res?.success && Array.isArray(res.data) && res.data.length > 0) allProspects = res.data;
		} catch {}
		if (allProspects.length === 0) try {
			const mysqlRes = await fetchMySQLProspects();
			if (mysqlRes?.success && Array.isArray(mysqlRes.prospects) && mysqlRes.prospects.length > 0) allProspects = mysqlRes.prospects;
		} catch {}
		const totalProspects = allProspects.length;
		let salesWon = 0;
		let activeProspects = 0;
		let pendingTasks = 0;
		let followUps = 0;
		const stageCounts = {};
		for (const p of allProspects) {
			const rawStage = String(p["stage_name"] || p["stage_id"] || "Prospect");
			const stageName = rawStage.toLowerCase();
			const isWon = stageName.includes("won") || stageName.includes("sales won");
			const isFollowUp = stageName.includes("follow");
			const isPending = isFollowUp || stageName.includes("opportunity") || stageName.includes("prospect") || stageName.includes("meeting") || stageName.includes("quotation");
			if (isWon) salesWon++;
			else activeProspects++;
			if (isPending) pendingTasks++;
			if (isFollowUp) followUps++;
			const trimmedKey = rawStage.trim();
			stageCounts[trimmedKey] = (stageCounts[trimmedKey] || 0) + 1;
		}
		const successRate = totalProspects > 0 ? (salesWon / totalProspects * 100).toFixed(1) + "%" : "0.0%";
		return {
			totalProspects,
			activeProspects,
			salesWon,
			pendingTasks,
			followUps,
			stageCounts,
			successRate
		};
	}
});
function formatProspectId(id) {
	if (!id) return "0001";
	const trimmed = id.trim();
	if (/^\d+$/.test(trimmed)) return trimmed.padStart(4, "0");
	const match = trimmed.match(/^prospect-(\d+)$/i);
	if (match && match[1]) return match[1].slice(-4).padStart(4, "0");
	return trimmed;
}
async function generateNextProspectId() {
	try {
		const res = await runMySQLQuery("SELECT `id` FROM `prospects` ORDER BY `created_at` DESC;");
		if (res.success && Array.isArray(res.data) && res.data.length > 0) {
			let maxNum = 0;
			for (const row of res.data) {
				const numMatch = String(row["id"] || "").match(/^0*(\d+)$/);
				if (numMatch && numMatch[1]) {
					const n = parseInt(numMatch[1], 10);
					if (n > maxNum && n < 1e6) maxNum = n;
				}
			}
			if (maxNum > 0) return String(maxNum + 1).padStart(4, "0");
			const count = res.data.length;
			return String(count + 1).padStart(4, "0");
		}
		return "0001";
	} catch {
		return "0001";
	}
}
async function createProspect(input) {
	const nextId = await generateNextProspectId();
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const newProspect = {
		id: nextId,
		contact_name: input.contact_name,
		business_name: input.business_name || null,
		designation: input.designation || null,
		phone: input.phone || null,
		alternative_phone: input.alternative_phone || null,
		email: input.email || null,
		address: input.address || null,
		service_id: input.service_id || null,
		stage_id: input.stage_id || null,
		assigned_to: input.assigned_to || null,
		created_by: input.created_by || null,
		notes: input.notes || null,
		created_at: (/* @__PURE__ */ new Date()).toISOString(),
		updated_at: (/* @__PURE__ */ new Date()).toISOString(),
		service_name: void 0,
		stage_name: "Prospect",
		stage_group: "new",
		assigned_agent_name: void 0,
		creator_name: void 0
	};
	const insertSql = `
    INSERT INTO \`prospects\` (
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
      \`updated_at\` = VALUES(\`updated_at\`);
  `;
	const insertParams = [
		nextId,
		input.contact_name,
		input.business_name || null,
		input.designation || null,
		input.phone || null,
		input.alternative_phone || null,
		input.email || null,
		input.address || null,
		input.service_id || null,
		input.stage_id || null,
		input.assigned_to || null,
		input.created_by || null,
		input.notes || null,
		now,
		now
	];
	const res = await runMySQLQuery(insertSql, insertParams);
	if (!res?.success) console.warn("Direct MySQL Query insert warning:", res?.error);
	saveMySQLProspect({ data: {
		id: newProspect.id,
		contact_name: input.contact_name,
		business_name: input.business_name || null,
		designation: input.designation || null,
		phone: input.phone || null,
		alternative_phone: input.alternative_phone || null,
		email: input.email || null,
		address: input.address || null,
		service_id: input.service_id || null,
		stage_id: input.stage_id || null,
		assigned_to: input.assigned_to || null,
		created_by: input.created_by || null,
		notes: input.notes || null
	} }).catch((e) => console.warn("saveMySQLProspect error notice:", e));
	return newProspect;
}
async function deleteProspect(prospectId) {
	if (!prospectId) return false;
	await runMySQLQuery("DELETE FROM `prospects` WHERE `id` = ?", [prospectId]);
	deleteMySQLProspect({ data: { id: prospectId } }).catch(() => {});
	return true;
}
//#endregion
export { getProspectArtistName as a, prospectsStatsQuery as c, getProspectAgentName as i, deleteProspect as n, prospectFiltersSchema as o, formatProspectId as r, prospectsQuery as s, createProspect as t };
