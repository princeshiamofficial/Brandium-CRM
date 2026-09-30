import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";
import { generateUUID, getMySQLTimestamp } from "@/lib/mysql-client";

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
  const now = getMySQLTimestamp();
  const logId = generateUUID();

  const gatewayRes = await fetch("/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phones: [cleanPhone],
      message: cleanMessage,
      recipient_name: prospectName || null,
      prospect_id: prospectId || null,
      mode,
      sent_by: sentByUserId || null,
    }),
  });
  const gateway = (await gatewayRes.json().catch(() => null)) as {
    success?: boolean;
    response?: string;
  } | null;
  if (!gateway?.success) {
    throw new Error(gateway?.response || "SMS gateway rejected the message.");
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
    apiResponseId: gateway.response || "",
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
        l.*,
        p.contact_name AS prospect_name,
        COALESCE(u.name, 'System') AS sent_by_name,
        u.role AS sender_role
      FROM \`sms_logs\` l
      LEFT JOIN \`prospects\` p ON l.prospect_id = p.id
      LEFT JOIN \`users\` u ON l.sent_by = u.id
      ORDER BY l.created_at DESC
      LIMIT 1000;`,
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    return res.data.map((item) => ({
      id: String(item["id"]),
      prospect_id: (item["prospect_id"] as string) || null,
      prospect_name: (item["prospect_name"] as string) || undefined,
      recipient_name:
        (item["recipient_name"] as string) || (item["prospect_name"] as string) || undefined,
      recipient_phone: String(item["recipient_phone"] || ""),
      message: String(item["message"] || ""),
      status: (["Sent", "Failed", "Pending"].includes(String(item["status"]))
        ? item["status"]
        : "Sent") as SmsStatus,
      mode: item["mode"] === "Bulk" ? "Bulk" : "Single",
      sent_by: (item["sent_by"] as string) || null,
      sent_by_name: String(item["sent_by_name"] || "System"),
      sender_role: (item["sender_role"] as string) || undefined,
      provider: "MRAM Technologies",
      api_response_id: String(item["id"]).substring(0, 8),
      provider_response: (item["provider_response"] as string) || undefined,
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
