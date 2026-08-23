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

// Activity Logs Dataset
const demoActivityLogs: ActivityLog[] = [];

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
