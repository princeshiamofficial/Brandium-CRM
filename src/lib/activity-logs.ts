import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";
import { getMySQLTimestamp } from "@/lib/mysql-client";

export type EntityType =
  | "prospect"
  | "opportunity"
  | "followup"
  | "meeting"
  | "sms"
  | "invoice"
  | "payment"
  | "user"
  | "stage";

export type ActivityLog = {
  id: string;
  user_id: string | null;
  user_name: string;
  action: string;
  entity_type: EntityType | string;
  entity_id: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

export type LogActivityInput = {
  action: string;
  entity_type: EntityType | string;
  entity_id?: string | null | undefined;
  metadata?: Record<string, unknown> | undefined;
};

export type ActivityLogFilters = {
  search?: string | undefined;
  entity_type?: string | "all" | undefined;
  user_id?: string | "all" | undefined;
};

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

export async function logActivity(
  input: LogActivityInput,
  user?: { id?: string; email?: string } | null,
): Promise<ActivityLog> {
  const logId = generateUUID();
  const now = getMySQLTimestamp();

  const newLog: ActivityLog = {
    id: logId,
    user_id: user?.id || null,
    user_name: user?.email || "Agent",
    action: input.action,
    entity_type: input.entity_type,
    entity_id: input.entity_id || null,
    metadata_json: input.metadata || {},
    created_at: now,
  };

  try {
    await runMySQLQuery(
      `INSERT INTO \`activities\` (\`id\`, \`actor_id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        logId,
        user?.id || null,
        input.entity_type === "prospect" ? input.entity_id : null,
        input.entity_type,
        input.action,
        now,
      ],
    );
  } catch (err) {
    console.warn("logActivity MySQL error:", err);
  }

  return newLog;
}

export async function fetchActivityLogs(filters: ActivityLogFilters = {}): Promise<ActivityLog[]> {
  try {
    const allLogs: ActivityLog[] = [];

    // 1. Fetch direct activities table
    try {
      const actRes = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT 
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
        LIMIT 100;`,
      );
      if (actRes.success && Array.isArray(actRes.data)) {
        for (const r of actRes.data) {
          allLogs.push({
            id: String(r["id"]),
            user_id: (r["user_id"] as string) || null,
            user_name: String(r["user_name"] || "Agent"),
            action: String(r["action"] || "Activity Logged"),
            entity_type: String(r["entity_type"] || "general"),
            entity_id: (r["entity_id"] as string) || null,
            metadata_json: {
              prospect_name: r["prospect_name"] || undefined,
              business_name: r["business_name"] || undefined,
              phone: r["phone"] || undefined,
              message: r["action"] || undefined,
              source_table: "activities",
            },
            created_at: String(r["created_at"] || new Date().toISOString()),
          });
        }
      }
    } catch (err) {
      console.warn("fetchActivityLogs activities query error:", err);
    }

    // 2. Fetch stage transitions from prospect_stage_history
    try {
      const stageRes = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT 
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
        LIMIT 50;`,
      );
      if (stageRes.success && Array.isArray(stageRes.data)) {
        for (const r of stageRes.data) {
          const toStage = String(r["to_stage_name"] || "Stage");
          const fromStage = String(r["from_stage_name"] || "Previous");
          const noteText = r["note"] ? ` - ${r["note"]}` : "";
          allLogs.push({
            id: `sh_${r["id"]}`,
            user_id: (r["user_id"] as string) || null,
            user_name: String(r["user_name"] || "Agent"),
            action: `Stage transitioned: ${fromStage} → ${toStage}${noteText}`,
            entity_type: "stage",
            entity_id: (r["entity_id"] as string) || null,
            metadata_json: {
              prospect_name: r["prospect_name"] || undefined,
              business_name: r["business_name"] || undefined,
              phone: r["phone"] || undefined,
              from_stage: fromStage,
              to_stage: toStage,
              note: r["note"] || undefined,
              source_table: "prospect_stage_history",
            },
            created_at: String(r["created_at"] || new Date().toISOString()),
          });
        }
      }
    } catch (err) {
      console.warn("fetchActivityLogs stage history query error:", err);
    }

    // 3. Fetch meetings
    try {
      const meetRes = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT 
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
        LIMIT 50;`,
      );
      if (meetRes.success && Array.isArray(meetRes.data)) {
        for (const r of meetRes.data) {
          allLogs.push({
            id: `mt_${r["id"]}`,
            user_id: (r["user_id"] as string) || null,
            user_name: String(r["user_name"] || "Agent"),
            action: `Meeting ${r["meeting_status"] || "Scheduled"}: ${r["title"] || "Client Meeting"} on ${r["meeting_date"] || "TBD"}`,
            entity_type: "meeting",
            entity_id: (r["entity_id"] as string) || null,
            metadata_json: {
              prospect_name: r["prospect_name"] || undefined,
              business_name: r["business_name"] || undefined,
              phone: r["phone"] || undefined,
              meeting_type: r["meeting_type"] || undefined,
              meeting_date: r["meeting_date"] || undefined,
              meeting_time: r["meeting_time"] || undefined,
              location: r["location"] || undefined,
              notes: r["notes"] || undefined,
              source_table: "meetings",
            },
            created_at: String(r["created_at"] || new Date().toISOString()),
          });
        }
      }
    } catch (err) {
      console.warn("fetchActivityLogs meetings query error:", err);
    }

    // 4. Fetch invoices
    try {
      const invRes = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT 
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
        LIMIT 50;`,
      );
      if (invRes.success && Array.isArray(invRes.data)) {
        for (const r of invRes.data) {
          allLogs.push({
            id: `inv_${r["id"]}`,
            user_id: (r["user_id"] as string) || null,
            user_name: String(r["user_name"] || "Agent"),
            action: `Invoice ${r["invoice_number"] || ""} generated (৳${r["total_amount"] || 0}) - ${r["description"] || "Service"}`,
            entity_type: "invoice",
            entity_id: (r["entity_id"] as string) || null,
            metadata_json: {
              prospect_name: r["prospect_name"] || undefined,
              business_name: r["business_name"] || undefined,
              phone: r["phone"] || undefined,
              invoice_number: r["invoice_number"] || undefined,
              total_amount: r["total_amount"] || 0,
              due_amount: r["due_amount"] || 0,
              status: r["invoice_status"] || "Pending",
              bill_date: r["bill_date"] || undefined,
              source_table: "invoices",
            },
            created_at: String(r["created_at"] || new Date().toISOString()),
          });
        }
      }
    } catch (err) {
      console.warn("fetchActivityLogs invoices query error:", err);
    }

    // 5. Fetch payments
    try {
      const payRes = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT 
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
        LIMIT 50;`,
      );
      if (payRes.success && Array.isArray(payRes.data)) {
        for (const r of payRes.data) {
          allLogs.push({
            id: `pay_${r["id"]}`,
            user_id: (r["user_id"] as string) || null,
            user_name: String(r["user_name"] || "Agent"),
            action: `Payment of ৳${r["amount"] || 0} received via ${r["payment_method"] || "Bank Transfer"}`,
            entity_type: "payment",
            entity_id: (r["entity_id"] as string) || null,
            metadata_json: {
              prospect_name: r["prospect_name"] || undefined,
              business_name: r["business_name"] || undefined,
              phone: r["phone"] || undefined,
              amount: r["amount"] || 0,
              payment_method: r["payment_method"] || undefined,
              transaction_reference: r["transaction_reference"] || undefined,
              payment_date: r["payment_date"] || undefined,
              notes: r["notes"] || undefined,
              source_table: "payments",
            },
            created_at: String(r["created_at"] || new Date().toISOString()),
          });
        }
      }
    } catch (err) {
      console.warn("fetchActivityLogs payments query error:", err);
    }

    // Sort all aggregated logs by created_at descending
    allLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return applyActivityFilters(allLogs, filters);
  } catch (err) {
    console.warn("fetchActivityLogs general error:", err);
    return [];
  }
}

function applyActivityFilters(list: ActivityLog[], filters: ActivityLogFilters): ActivityLog[] {
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

  if (filters.user_id && filters.user_id !== "all") {
    result = result.filter((log) => log.user_id === filters.user_id);
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        log.user_name.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        JSON.stringify(log.metadata_json).toLowerCase().includes(q),
    );
  }

  return result;
}

export const activityLogsQueryOptions = (filters: ActivityLogFilters = {}) =>
  queryOptions({
    queryKey: ["activity-logs", filters],
    queryFn: () => fetchActivityLogs(filters),
  });
