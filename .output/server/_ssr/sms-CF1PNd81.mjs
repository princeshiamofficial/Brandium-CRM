import { t as runMySQLQuery } from "./mysql-api-D0egMBD0.mjs";
import { n as queryOptions } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sms-CF1PNd81.js
var metaEnv = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
};
var SMS_API_KEY = metaEnv?.["VITE_SMS_API_KEY"] || "";
var SMS_SENDER_ID = metaEnv?.["VITE_SMS_SENDER_ID"] || "BRANDIUM";
var SMS_GATEWAY_URL = metaEnv?.["VITE_SMS_GATEWAY_URL"] || "";
function generateUUID() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
async function fetchProspectOptions() {
	try {
		const res = await runMySQLQuery("SELECT id, contact_name, business_name, phone FROM `prospects` WHERE is_active = 1 ORDER BY contact_name ASC;");
		if (!res.success || !Array.isArray(res.data)) return [];
		return res.data.map((p) => ({
			id: String(p["id"]),
			contact_name: String(p["contact_name"] || "Prospect"),
			business_name: p["business_name"] || void 0,
			phone: p["phone"] || void 0
		}));
	} catch (err) {
		console.warn("fetchProspectOptions MySQL error:", err);
		return [];
	}
}
var prospectsOptionsQuery = () => queryOptions({
	queryKey: ["prospects", "options"],
	queryFn: fetchProspectOptions
});
function calculateSmsParts(message) {
	const length = message.length;
	const isUnicode = /[^\u0000-\u00ff]/.test(message);
	const partLimit = isUnicode ? 70 : 160;
	return {
		length,
		parts: length === 0 ? 0 : Math.ceil(length / partLimit),
		isUnicode,
		remaining: length === 0 ? partLimit : partLimit - (length % partLimit || partLimit)
	};
}
var calculateSmsInfo = calculateSmsParts;
async function sendSms(phone, message, prospectId, prospectName, mode = "Single", sentByUserId, sentByUserName) {
	if (!phone || !phone.trim()) throw new Error("Recipient phone number is required.");
	if (!message || !message.trim()) throw new Error("SMS message content cannot be empty.");
	const cleanPhone = phone.trim();
	const cleanMessage = message.trim();
	const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
	const apiRespId = `SMS-REQ-${Math.floor(1e4 + Math.random() * 9e4)}`;
	const logId = generateUUID();
	if (SMS_GATEWAY_URL && SMS_GATEWAY_URL.startsWith("http")) try {
		await fetch(SMS_GATEWAY_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				api_key: SMS_API_KEY,
				sender_id: SMS_SENDER_ID,
				phone: cleanPhone,
				message: cleanMessage
			})
		});
	} catch (err) {
		console.warn("SMS Gateway dispatch notice:", err);
	}
	await runMySQLQuery(`INSERT INTO \`activities\` (\`id\`, \`actor_id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
     VALUES (?, ?, ?, 'sms_sent', ?, ?);`, [
		logId,
		sentByUserId || null,
		prospectId || null,
		`SMS sent to ${cleanPhone} (${mode}): ${cleanMessage.substring(0, 60)}...`,
		now
	]);
	return {
		success: true,
		logId,
		apiResponseId: apiRespId
	};
}
async function sendBulkSms(recipients, message, sentByUserId, sentByUserName) {
	if (recipients.length === 0) throw new Error("No recipients selected for bulk SMS.");
	let successCount = 0;
	let failureCount = 0;
	for (const r of recipients) try {
		await sendSms(r.phone, message, r.prospect_id, r.prospect_name, "Bulk", sentByUserId, sentByUserName);
		successCount++;
	} catch {
		failureCount++;
	}
	return {
		successCount,
		failureCount
	};
}
async function fetchSmsLogs() {
	try {
		const res = await runMySQLQuery(`SELECT 
        a.id,
        a.prospect_id,
        p.contact_name AS prospect_name,
        p.phone AS recipient_phone,
        a.message,
        a.actor_id AS sent_by,
        COALESCE(u.name, 'Agent') AS sent_by_name,
        a.created_at
      FROM \`activities\` a
      LEFT JOIN \`prospects\` p ON a.prospect_id = p.id
      LEFT JOIN \`users\` u ON a.actor_id = u.id
      WHERE a.activity_type = 'sms_sent'
      ORDER BY a.created_at DESC
      LIMIT 100;`);
		if (!res.success || !Array.isArray(res.data)) return [];
		return res.data.map((item) => ({
			id: String(item["id"]),
			prospect_id: item["prospect_id"] || null,
			prospect_name: item["prospect_name"] || void 0,
			recipient_name: item["prospect_name"] || "Client",
			recipient_phone: String(item["recipient_phone"] || "+8801700000000"),
			message: String(item["message"] || ""),
			status: "Sent",
			mode: "Single",
			sent_by: item["sent_by"] || null,
			sent_by_name: String(item["sent_by_name"] || "Agent"),
			sender_role: "Tele-sales Specialist",
			provider: "BulksmsBD",
			api_response_id: `SMS-REQ-${String(item["id"]).substring(0, 5)}`,
			created_at: String(item["created_at"] || (/* @__PURE__ */ new Date()).toISOString())
		}));
	} catch (err) {
		console.warn("fetchSmsLogs MySQL error:", err);
		return [];
	}
}
var smsLogsQueryOptions = () => queryOptions({
	queryKey: ["sms-logs"],
	queryFn: fetchSmsLogs
});
//#endregion
export { smsLogsQueryOptions as a, sendSms as i, prospectsOptionsQuery as n, sendBulkSms as r, calculateSmsInfo as t };
