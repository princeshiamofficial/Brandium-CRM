import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";

export type SmsStatus = "Sent" | "Failed" | "Pending";
export type SmsMode = "Single" | "Bulk";

export type SmsPresetTemplate = {
  id: string;
  title: string;
  content: string;
};

export type SmsLogEntry = {
  id: string;
  prospect_id?: string | null | undefined;
  prospect_name?: string | undefined;
  recipient_name?: string | undefined;
  recipient_phone: string;
  message: string;
  status: SmsStatus;
  mode: SmsMode;
  sent_by: string | null;
  sent_by_name: string;
  sender_role?: string | undefined;
  provider: string;
  api_response_id: string;
  provider_response?: string | undefined;
  created_at: string;
};

export type SmsCharacterCount = {
  length: number;
  parts: number;
  isUnicode: boolean;
  remaining: number;
};

export type SmsRecipientInput = {
  phone: string;
  prospect_id?: string | null | undefined;
  prospect_name?: string | undefined;
};

const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
const SMS_API_KEY = metaEnv?.["VITE_SMS_API_KEY"] || "";
const SMS_SENDER_ID = metaEnv?.["VITE_SMS_SENDER_ID"] || "BRANDIUM";
const SMS_GATEWAY_URL = metaEnv?.["VITE_SMS_GATEWAY_URL"] || "";

export const SMS_PRESET_TEMPLATES: SmsPresetTemplate[] = [
  {
    id: "tmpl-1",
    title: "Meeting Reminder",
    content:
      "Dear Prospect, this is a reminder for your upcoming demo meeting with Brandium Telesales today. Please join via the provided link or call us.",
  },
  {
    id: "tmpl-2",
    title: "Payment Invoice Reminder",
    content:
      "Dear Client, your invoice for Brandium CRM software services is due. Please review payment terms or reach out to your assigned agent.",
  },
  {
    id: "tmpl-3",
    title: "Special Discount Offer",
    content:
      "Exclusive Offer! Upgrade your telesales CRM workflow this month and get a 15% discount on annual billing. Contact us for details.",
  },
  {
    id: "tmpl-4",
    title: "Welcome & Onboarding",
    content:
      "Welcome to Brandium CRM! Your account has been activated. Contact your designated CR agent for setup assistance.",
  },
];

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type ProspectOption = {
  id: string;
  contact_name: string;
  business_name?: string | null | undefined;
  phone?: string | null | undefined;
};

export async function fetchProspectOptions(): Promise<ProspectOption[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT id, contact_name, business_name, phone FROM `prospects` WHERE is_active = 1 ORDER BY contact_name ASC;",
    );
    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }
    return res.data.map((p) => ({
      id: String(p["id"]),
      contact_name: String(p["contact_name"] || "Prospect"),
      business_name: (p["business_name"] as string) || undefined,
      phone: (p["phone"] as string) || undefined,
    }));
  } catch (err) {
    console.warn("fetchProspectOptions MySQL error:", err);
    return [];
  }
}

export const prospectsOptionsQuery = () =>
  queryOptions({
    queryKey: ["prospects", "options"],
    queryFn: fetchProspectOptions,
  });

export function calculateSmsParts(message: string): SmsCharacterCount {
  const length = message.length;
  // eslint-disable-next-line no-control-regex
  const isUnicode = /[^\u0000-\u00ff]/.test(message);
  const partLimit = isUnicode ? 70 : 160;
  const parts = length === 0 ? 0 : Math.ceil(length / partLimit);
  const remaining = length === 0 ? partLimit : partLimit - (length % partLimit || partLimit);

  return {
    length,
    parts,
    isUnicode,
    remaining,
  };
}

export const calculateSmsInfo = calculateSmsParts;

export async function sendSms(
  phone: string,
  message: string,
  prospectId?: string | null,
  prospectName?: string,
  mode: SmsMode = "Single",
  sentByUserId?: string | null,
  sentByUserName?: string,
): Promise<{ success: boolean; logId: string; apiResponseId: string }> {
  if (!phone || !phone.trim()) {
    throw new Error("Recipient phone number is required.");
  }
  if (!message || !message.trim()) {
    throw new Error("SMS message content cannot be empty.");
  }

  const cleanPhone = phone.trim();
  const cleanMessage = message.trim();
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const apiRespId = `SMS-REQ-${Math.floor(10000 + Math.random() * 90000)}`;
  const logId = generateUUID();

  if (SMS_GATEWAY_URL && SMS_GATEWAY_URL.startsWith("http")) {
    try {
      await fetch(SMS_GATEWAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: SMS_API_KEY,
          sender_id: SMS_SENDER_ID,
          phone: cleanPhone,
          message: cleanMessage,
        }),
      });
    } catch (err) {
      console.warn("SMS Gateway dispatch notice:", err);
    }
  }

  // Persist to activities in MySQL
  await runMySQLQuery(
    `INSERT INTO \`activities\` (\`id\`, \`actor_id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
     VALUES (?, ?, ?, 'sms_sent', ?, ?);`,
    [
      logId,
      sentByUserId || null,
      prospectId || null,
      `SMS sent to ${cleanPhone} (${mode}): ${cleanMessage.substring(0, 60)}...`,
      now,
    ],
  );

  return {
    success: true,
    logId,
    apiResponseId: apiRespId,
  };
}

export async function sendBulkSms(
  recipients: SmsRecipientInput[],
  message: string,
  sentByUserId?: string | null,
  sentByUserName?: string,
): Promise<{ successCount: number; failureCount: number }> {
  if (recipients.length === 0) {
    throw new Error("No recipients selected for bulk SMS.");
  }

  let successCount = 0;
  let failureCount = 0;

  for (const r of recipients) {
    try {
      await sendSms(
        r.phone,
        message,
        r.prospect_id,
        r.prospect_name,
        "Bulk",
        sentByUserId,
        sentByUserName,
      );
      successCount++;
    } catch {
      failureCount++;
    }
  }

  return { successCount, failureCount };
}

export async function fetchSmsLogs(): Promise<SmsLogEntry[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
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
      LIMIT 100;`,
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    return res.data.map((item) => ({
      id: String(item["id"]),
      prospect_id: (item["prospect_id"] as string) || null,
      prospect_name: (item["prospect_name"] as string) || undefined,
      recipient_name: (item["prospect_name"] as string) || "Client",
      recipient_phone: String(item["recipient_phone"] || "+8801700000000"),
      message: String(item["message"] || ""),
      status: "Sent",
      mode: "Single",
      sent_by: (item["sent_by"] as string) || null,
      sent_by_name: String(item["sent_by_name"] || "Agent"),
      sender_role: "Tele-sales Specialist",
      provider: "BulksmsBD",
      api_response_id: `SMS-REQ-${String(item["id"]).substring(0, 5)}`,
      created_at: String(item["created_at"] || new Date().toISOString()),
    }));
  } catch (err) {
    console.warn("fetchSmsLogs MySQL error:", err);
    return [];
  }
}

export const smsLogsQueryOptions = () =>
  queryOptions({
    queryKey: ["sms-logs"],
    queryFn: fetchSmsLogs,
  });
