import { t as runMySQLQuery } from "./mysql-api-BWYhfGzd.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/meetings-kXkNTUcm.js
function generateUUID() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
async function fetchProspectsOptions() {
	try {
		const res = await runMySQLQuery("SELECT id, contact_name, business_name, phone FROM `prospects` WHERE is_active = 1 ORDER BY contact_name ASC;");
		if (!res.success || !Array.isArray(res.data)) return [];
		return res.data.map((p) => ({
			id: String(p["id"]),
			contact_name: String(p["contact_name"] || "Prospect"),
			business_name: p["business_name"] || null,
			phone: p["phone"] || null
		}));
	} catch (err) {
		console.warn("fetchProspectsOptions MySQL error:", err);
		return [];
	}
}
var prospectsOptionsQuery = () => queryOptions({
	queryKey: ["prospects", "options"],
	queryFn: fetchProspectsOptions
});
async function fetchMeetings(filters = {}) {
	try {
		const res = await runMySQLQuery(`SELECT 
        m.*,
        p.contact_name AS prospect_name,
        p.business_name,
        u.name AS assigned_user_name
      FROM \`meetings\` m
      LEFT JOIN \`prospects\` p ON m.prospect_id = p.id
      LEFT JOIN \`users\` u ON m.assigned_user_id = u.id
      ORDER BY m.created_at DESC, m.meeting_date DESC, m.meeting_time DESC;`);
		if (!res.success || !Array.isArray(res.data)) return [];
		return applyClientFilters(res.data.map((item) => ({
			id: String(item["id"]),
			title: String(item["title"] || "Meeting"),
			prospect_id: item["prospect_id"] || null,
			prospect_name: item["prospect_name"] || void 0,
			business_name: item["business_name"] || void 0,
			phone: item["phone"] || null,
			location: item["location"] || null,
			meeting_type: item["meeting_type"] || "Office",
			meeting_date: String(item["meeting_date"] || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]),
			meeting_time: String(item["meeting_time"] || "10:00:00"),
			assigned_user_id: item["assigned_user_id"] || null,
			assigned_user_name: item["assigned_user_name"] || void 0,
			notes: item["notes"] || null,
			status: item["status"] || "Scheduled",
			sms_sent: Boolean(Number(item["sms_sent"] ?? 0)),
			created_by: item["created_by"] || null,
			created_at: String(item["created_at"] || (/* @__PURE__ */ new Date()).toISOString()),
			updated_at: String(item["updated_at"] || (/* @__PURE__ */ new Date()).toISOString())
		})), filters);
	} catch (err) {
		console.warn("fetchMeetings MySQL error:", err);
		return [];
	}
}
function applyClientFilters(list, filters) {
	let filtered = list;
	if (filters.status && filters.status !== "all") filtered = filtered.filter((m) => m.status === filters.status);
	if (filters.meeting_type && filters.meeting_type !== "all") filtered = filtered.filter((m) => m.meeting_type === filters.meeting_type);
	if (filters.search && filters.search.trim() !== "") {
		const q = filters.search.toLowerCase().trim();
		filtered = filtered.filter((m) => m.title.toLowerCase().includes(q) || m.prospect_name && m.prospect_name.toLowerCase().includes(q) || m.business_name && m.business_name.toLowerCase().includes(q) || m.phone && m.phone.includes(q) || m.location && m.location.toLowerCase().includes(q));
	}
	if (filters.date_range && filters.date_range !== "all") {
		const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		if (filters.date_range === "today") filtered = filtered.filter((m) => m.meeting_date === todayStr);
		else if (filters.date_range === "next_7_days") {
			const next7 = new Date(Date.now() + 6048e5).toISOString().split("T")[0];
			filtered = filtered.filter((m) => m.meeting_date >= todayStr && m.meeting_date <= next7);
		} else if (filters.date_range === "this_month") {
			const now = /* @__PURE__ */ new Date();
			const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
			const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
			filtered = filtered.filter((m) => m.meeting_date >= firstDay && m.meeting_date <= lastDay);
		}
	}
	if (filters.start_date) filtered = filtered.filter((m) => m.meeting_date >= filters.start_date);
	if (filters.end_date) filtered = filtered.filter((m) => m.meeting_date <= filters.end_date);
	return filtered;
}
async function fetchMeetingById(id) {
	return (await fetchMeetings()).find((m) => m.id === id) || null;
}
async function createMeeting(input) {
	const newId = generateUUID();
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const res = await runMySQLQuery(`INSERT INTO \`meetings\` (
      \`id\`, \`title\`, \`prospect_id\`, \`phone\`, \`location\`,
      \`meeting_type\`, \`meeting_date\`, \`meeting_time\`, \`assigned_user_id\`,
      \`notes\`, \`status\`, \`sms_sent\`, \`created_at\`, \`updated_at\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?);`, [
		newId,
		input.title,
		input.prospect_id || null,
		input.phone || null,
		input.location || null,
		input.meeting_type,
		input.meeting_date,
		input.meeting_time,
		input.assigned_user_id || null,
		input.notes || null,
		input.send_sms_now ? 1 : 0,
		now,
		now
	]);
	if (!res.success) throw new Error(res.error || "Failed to create meeting in database.");
	if (input.prospect_id) try {
		const nowStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		const stageRes = await runMySQLQuery("SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) = 'meeting scheduled' LIMIT 1;");
		const meetingStageId = stageRes?.success && stageRes.data?.[0] ? String(stageRes.data[0]["id"]) : "meeting-scheduled";
		let fromStageId = null;
		try {
			const currRes = await runMySQLQuery("SELECT `stage_id` FROM `prospects` WHERE `id` = ? LIMIT 1;", [input.prospect_id]);
			if (currRes?.success && currRes.data?.[0]) fromStageId = String(currRes.data[0]["stage_id"] || "") || null;
		} catch {}
		await runMySQLQuery("UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;", [
			meetingStageId,
			nowStr,
			input.prospect_id
		]);
		const historyId = generateUUID();
		await runMySQLQuery(`INSERT INTO \`prospect_stage_history\`
           (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_at\`)
         VALUES (?, ?, ?, ?, ?, ?);`, [
			historyId,
			input.prospect_id,
			fromStageId,
			meetingStageId,
			"Stage auto-updated when meeting was scheduled",
			nowStr
		]);
	} catch (err) {
		console.warn("Auto stage-to-meeting-scheduled notice:", err);
	}
	const meeting = await fetchMeetingById(newId);
	if (!meeting) return {
		id: newId,
		title: input.title,
		prospect_id: input.prospect_id ?? null,
		phone: input.phone ?? null,
		location: input.location ?? null,
		meeting_type: input.meeting_type,
		meeting_date: input.meeting_date,
		meeting_time: input.meeting_time,
		assigned_user_id: input.assigned_user_id ?? null,
		notes: input.notes ?? null,
		status: "Scheduled",
		sms_sent: Boolean(input.send_sms_now),
		created_by: null,
		created_at: now,
		updated_at: now
	};
	return meeting;
}
async function updateMeeting(id, updates) {
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const sets = ["`updated_at` = ?"];
	const params = [now];
	if (updates.title !== void 0) {
		sets.push("`title` = ?");
		params.push(updates.title);
	}
	if (updates.prospect_id !== void 0) {
		sets.push("`prospect_id` = ?");
		params.push(updates.prospect_id);
	}
	if (updates.phone !== void 0) {
		sets.push("`phone` = ?");
		params.push(updates.phone);
	}
	if (updates.location !== void 0) {
		sets.push("`location` = ?");
		params.push(updates.location);
	}
	if (updates.meeting_type !== void 0) {
		sets.push("`meeting_type` = ?");
		params.push(updates.meeting_type);
	}
	if (updates.meeting_date !== void 0) {
		sets.push("`meeting_date` = ?");
		params.push(updates.meeting_date);
	}
	if (updates.meeting_time !== void 0) {
		sets.push("`meeting_time` = ?");
		params.push(updates.meeting_time);
	}
	if (updates.assigned_user_id !== void 0) {
		sets.push("`assigned_user_id` = ?");
		params.push(updates.assigned_user_id);
	}
	if (updates.notes !== void 0) {
		sets.push("`notes` = ?");
		params.push(updates.notes);
	}
	if (updates.status !== void 0) {
		sets.push("`status` = ?");
		params.push(updates.status);
	}
	if (updates.sms_sent !== void 0) {
		sets.push("`sms_sent` = ?");
		params.push(updates.sms_sent ? 1 : 0);
	}
	params.push(id);
	const sql = `UPDATE \`meetings\` SET ${sets.join(", ")} WHERE \`id\` = ?;`;
	await runMySQLQuery(sql, params);
	const updated = await fetchMeetingById(id);
	if (!updated) throw new Error("Meeting not found");
	return updated;
}
async function updateMeetingStatus(id, status) {
	return updateMeeting(id, { status });
}
async function updateMeetingNotes(id, notes) {
	return updateMeeting(id, { notes });
}
async function sendMeetingReminderSms(meetingId, customMessage) {
	const meeting = await fetchMeetingById(meetingId);
	if (!meeting) throw new Error("Meeting not found");
	const phone = meeting.phone || "+8801700000000";
	await updateMeeting(meetingId, { sms_sent: true });
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	await runMySQLQuery(`INSERT INTO \`activities\` (\`id\`, \`message\`, \`activity_type\`, \`created_at\`)
     VALUES (?, ?, 'sms_sent', ?);`, [
		generateUUID(),
		`SMS reminder sent to ${meeting.prospect_name || meeting.phone || "prospect"} for meeting "${meeting.title}"`,
		now
	]);
	return {
		success: true,
		message: `SMS reminder sent successfully to ${phone}`
	};
}
async function deleteMeeting(id) {
	const existing = await fetchMeetingById(id);
	await runMySQLQuery("DELETE FROM `meetings` WHERE `id` = ?;", [id]);
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	await runMySQLQuery(`INSERT INTO \`activities\` (\`id\`, \`message\`, \`activity_type\`, \`created_at\`)
     VALUES (?, ?, 'meeting_deleted', ?);`, [
		generateUUID(),
		`Deleted meeting "${existing?.title || id}" with ${existing?.prospect_name || existing?.phone || "client"}`,
		now
	]);
	return {
		success: true,
		message: "Meeting deleted successfully"
	};
}
var meetingsQueryOptions = (filters = {}) => queryOptions({
	queryKey: ["meetings", filters],
	queryFn: () => fetchMeetings(filters)
});
//#endregion
export { sendMeetingReminderSms as a, updateMeetingStatus as c, prospectsOptionsQuery as i, deleteMeeting as n, updateMeeting as o, meetingsQueryOptions as r, updateMeetingNotes as s, createMeeting as t };
