import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// Safe DB accessor wrapper
const dynamicDb = supabase as unknown as {
  from: (table: string) => {
    select: (cols: string) => {
      order: (
        col: string,
        opts?: { ascending?: boolean },
      ) => Promise<{ data: unknown[]; error: unknown }>;
    };
  };
  rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

// Rich Seed Audit Log Records covering all 9 required categories
const demoActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    user_id: "usr-admin-1",
    user_name: "Mehan Ahmed (Admin)",
    action: "Payment Recorded",
    entity_type: "payment",
    entity_id: "pay-101",
    metadata_json: { amount: 125000, method: "Bank Transfer", invoice_number: "INV-2026-801" },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "log-2",
    user_id: "usr-agent-1",
    user_name: "Tanvir Hasan",
    action: "Stage Changed",
    entity_type: "prospect",
    entity_id: "prospect-1",
    metadata_json: {
      from_stage: "Proposal Sent",
      to_stage: "Sales Won",
      client_name: "AurevixSoft",
    },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "log-3",
    user_id: "usr-admin-1",
    user_name: "Mehan Ahmed (Admin)",
    action: "Bill Created",
    entity_type: "invoice",
    entity_id: "inv-801",
    metadata_json: {
      invoice_number: "INV-2026-801",
      total_amount: 125000,
      prospect_name: "AurevixSoft",
    },
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "log-4",
    user_id: "usr-agent-2",
    user_name: "Nusrat Jahan",
    action: "Follow-up Completed",
    entity_type: "followup",
    entity_id: "fup-102",
    metadata_json: { title: "Follow-up Call: Contract Discussion", client_name: "GreenTech BD" },
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: "log-5",
    user_id: "usr-agent-1",
    user_name: "Tanvir Hasan",
    action: "Opportunity Won",
    entity_type: "opportunity",
    entity_id: "opp-201",
    metadata_json: { title: "Annual Telesales CRM Retainer", estimated_value: 125000 },
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: "log-6",
    user_id: "usr-agent-2",
    user_name: "Nusrat Jahan",
    action: "SMS Sent",
    entity_type: "sms",
    entity_id: "sms-301",
    metadata_json: {
      recipient: "+8801822334455",
      status: "Sent",
      message_snippet: "Your invoice #INV-802 is ready.",
    },
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "log-7",
    user_id: "usr-admin-1",
    user_name: "Mehan Ahmed (Admin)",
    action: "User Created",
    entity_type: "user",
    entity_id: "usr-agent-3",
    metadata_json: { name: "Rafiqul Islam", role: "AGENT", email: "rafiq.agent@brandium.com" },
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "log-8",
    user_id: "usr-agent-1",
    user_name: "Tanvir Hasan",
    action: "Meeting Scheduled",
    entity_type: "meeting",
    entity_id: "mtg-401",
    metadata_json: { title: "Onboarding Strategy Session", meeting_date: "2026-08-12" },
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: "log-9",
    user_id: "usr-admin-1",
    user_name: "Mehan Ahmed (Admin)",
    action: "Prospect Created",
    entity_type: "prospect",
    entity_id: "prospect-5",
    metadata_json: { contact_name: "Kazi Farhan", business_name: "Skyline Travels" },
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

/**
 * Reusable Logging Engine used across all 9 event categories:
 * - Prospect created/edited
 * - Stage changed
 * - Follow-up created/completed
 * - Opportunity created/won/lost
 * - Meeting scheduled
 * - SMS sent/failed
 * - Bill created/edited/cancelled
 * - Payment recorded
 * - User created/updated/deactivated
 */
export async function logActivity(
  input: LogActivityInput,
  user?: { id?: string; email?: string } | null,
): Promise<ActivityLog> {
  const now = new Date().toISOString();
  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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
    const { data, error } = await dynamicDb.rpc("log_crm_activity", {
      p_user_id: user?.id || null,
      p_user_name: user?.email || "Agent",
      p_action: input.action,
      p_entity_type: input.entity_type,
      p_entity_id: input.entity_id || null,
      p_metadata: input.metadata || {},
    });

    if (!error && data) {
      newLog.id = String(data);
    }
  } catch {
    // Fallback local logging
  }

  demoActivityLogs.unshift(newLog);
  return newLog;
}

export async function fetchActivityLogs(filters: ActivityLogFilters = {}): Promise<ActivityLog[]> {
  try {
    const { data, error } = await dynamicDb
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return applyActivityFilters(demoActivityLogs, filters);
    }

    const mapped: ActivityLog[] = (data as Record<string, unknown>[]).map((log) => ({
      id: String(log["id"]),
      user_id: (log["user_id"] as string) || null,
      user_name: String(log["user_name"] || "Agent"),
      action: String(log["action"] || "Action"),
      entity_type: String(log["entity_type"] || "general"),
      entity_id: (log["entity_id"] as string) || null,
      metadata_json: (log["metadata_json"] as Record<string, unknown>) || {},
      created_at: String(log["created_at"] || new Date().toISOString()),
    }));

    return applyActivityFilters(mapped, filters);
  } catch {
    return applyActivityFilters(demoActivityLogs, filters);
  }
}

function applyActivityFilters(list: ActivityLog[], filters: ActivityLogFilters): ActivityLog[] {
  let result = list;

  if (filters.entity_type && filters.entity_type !== "all") {
    const et = filters.entity_type.toLowerCase();
    result = result.filter((log) => log.entity_type.toLowerCase() === et);
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
