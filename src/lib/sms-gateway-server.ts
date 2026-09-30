import { createSingleMySQLConnection } from "@/lib/mysql-server";
import { ensureMySQLTablesExist } from "@/lib/auth.functions";

export type SmsGatewaySettings = {
  provider: string;
  api_url: string;
  balance_url: string;
  api_key: string;
  sender_id: string;
  label: "transactional" | "promotional";
  is_enabled: boolean;
  updated_at: string | null;
};

export type SmsGatewayPublicSettings = Omit<SmsGatewaySettings, "api_key"> & {
  has_api_key: boolean;
  api_key_masked: string;
};

export type SmsSettingsUpdate = {
  api_url: string;
  balance_url: string;
  api_key?: string | undefined;
  sender_id: string;
  label: "transactional" | "promotional";
  is_enabled: boolean;
};

async function withConnection<T>(
  fn: (conn: Awaited<ReturnType<typeof createSingleMySQLConnection>>) => Promise<T>,
): Promise<T> {
  const conn = await createSingleMySQLConnection();
  try {
    await ensureMySQLTablesExist(conn);
    return await fn(conn);
  } finally {
    await conn.end();
  }
}

export async function loadSmsSettings(): Promise<SmsGatewaySettings> {
  return withConnection(async (conn) => {
    const [rows] = await conn.query(
      "SELECT * FROM `sms_gateway_settings` WHERE `id` = 'default' LIMIT 1",
    );
    const r = (rows as Record<string, unknown>[])[0] || {};
    return {
      provider: String(r["provider"] || "MRAM Technologies"),
      api_url: String(r["api_url"] || "https://sms.mram.com.bd/smsapi"),
      balance_url: String(
        r["balance_url"] || "https://sms.mram.com.bd/miscapi/{API_KEY}/getBalance",
      ),
      api_key: String(r["api_key"] || ""),
      sender_id: String(r["sender_id"] || ""),
      label: r["label"] === "promotional" ? "promotional" : "transactional",
      is_enabled: Number(r["is_enabled"] ?? 1) === 1,
      updated_at: r["updated_at"] ? String(r["updated_at"]) : null,
    };
  });
}

export function toPublicSettings(s: SmsGatewaySettings): SmsGatewayPublicSettings {
  const { api_key, ...rest } = s;
  return {
    ...rest,
    has_api_key: Boolean(api_key),
    api_key_masked: api_key ? `${"•".repeat(8)}${api_key.slice(-4)}` : "",
  };
}

export async function saveSmsSettings(input: SmsSettingsUpdate, userId: string | null) {
  await withConnection(async (conn) => {
    const sets = [
      "`api_url` = ?",
      "`balance_url` = ?",
      "`sender_id` = ?",
      "`label` = ?",
      "`is_enabled` = ?",
      "`updated_by` = ?",
    ];
    const params: unknown[] = [
      input.api_url,
      input.balance_url,
      input.sender_id,
      input.label,
      input.is_enabled ? 1 : 0,
      userId,
    ];
    if (input.api_key) {
      sets.push("`api_key` = ?");
      params.push(input.api_key);
    }
    await conn.query(
      `UPDATE \`sms_gateway_settings\` SET ${sets.join(", ")} WHERE \`id\` = 'default'`,
      params,
    );
  });
}

/** Converts local formats (01XXXXXXXXX, +8801..., 1XXXXXXXXX) to 8801XXXXXXXXX. */
export function normalizeBdPhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("01") && digits.length === 11) digits = `88${digits}`;
  else if (digits.startsWith("1") && digits.length === 10) digits = `880${digits}`;
  return /^8801\d{9}$/.test(digits) ? digits : null;
}

// eslint-disable-next-line no-control-regex
const isUnicodeText = (text: string) => /[^\u0000-ÿ]/.test(text);

export type GatewayResult = { success: boolean; response: string };

// ponytail: success is guessed from the reply text (MRAM error replies are 4-digit codes like
// "1002"); switch to a strict check once the provider's documented reply format is confirmed.
const looksLikeError = (text: string) => /^\s*(\d{4}\b|error|invalid|failed)/i.test(text);

export async function sendViaGateway(phones: string[], message: string): Promise<GatewayResult> {
  const s = await loadSmsSettings();
  if (!s.is_enabled) return { success: false, response: "SMS gateway is disabled in settings." };
  if (!s.api_key || !s.sender_id) {
    return { success: false, response: "SMS gateway API key or Sender ID is not configured." };
  }

  const body = new URLSearchParams({
    api_key: s.api_key,
    type: isUnicodeText(message) ? "unicode" : "text",
    contacts: phones.join("+"),
    senderid: s.sender_id,
    msg: message,
    label: s.label,
  });

  try {
    const res = await fetch(s.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(20000),
    });
    const text = (await res.text()).trim();
    return { success: res.ok && !looksLikeError(text), response: text || `HTTP ${res.status}` };
  } catch (err) {
    return { success: false, response: (err as Error).message || "Gateway request failed." };
  }
}

export type SmsLogMeta = {
  recipient_name?: string | null | undefined;
  prospect_id?: string | null | undefined;
  mode: "Single" | "Bulk";
  sent_by?: string | null | undefined;
};

export async function logSmsAttempts(
  phones: string[],
  message: string,
  result: GatewayResult,
  meta: SmsLogMeta,
) {
  await withConnection(async (conn) => {
    for (const phone of phones) {
      await conn.query(
        `INSERT INTO \`sms_logs\`
          (\`id\`, \`recipient_phone\`, \`recipient_name\`, \`prospect_id\`, \`message\`, \`status\`,
           \`mode\`, \`provider_response\`, \`sent_by\`, \`created_at\`)
         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          phone,
          meta.recipient_name || null,
          meta.prospect_id || null,
          message,
          result.success ? "Sent" : "Failed",
          meta.mode,
          result.response.slice(0, 2000),
          meta.sent_by || null,
        ],
      );
    }
  });
}

export async function fetchGatewayBalance(): Promise<GatewayResult> {
  const s = await loadSmsSettings();
  if (!s.api_key) return { success: false, response: "API key is not configured." };
  const url = s.balance_url.replace("{API_KEY}", encodeURIComponent(s.api_key));
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000), cache: "no-store" });
    const text = (await res.text()).trim();
    return { success: res.ok && !looksLikeError(text), response: text || `HTTP ${res.status}` };
  } catch (err) {
    return { success: false, response: (err as Error).message || "Balance request failed." };
  }
}
