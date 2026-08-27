import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { fetchCrmUsers } from "@/lib/admin-users";
import { runMySQLQuery } from "@/lib/mysql-api";
import { generateUUID, getMySQLTimestamp } from "@/lib/mysql-client";

export const followUpFiltersSchema = z.object({
  page: z.number().catch(1),
  search: z.string().optional(),
  status: z.string().optional(),
  agent: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type FollowUpFilters = z.infer<typeof followUpFiltersSchema>;

export type FollowUpStatus = "pending" | "completed" | "cancelled" | "overdue";

export type FollowUp = {
  id: string;
  prospect_id: string;
  assigned_to: string | null;
  created_by: string | null;
  due_at: string;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  prospect_name?: string;
  prospect_business?: string | null;
  prospect_phone?: string | null;
  agent_name?: string;
  creator_name?: string;
  effective_status: FollowUpStatus;
  stage_name?: string | null;
  stage_group?: string | null;
  stage_color?: string | null;
};

export type TimelineRecord = {
  id: string;
  date: string;
  time: string;
  note: string;
  agent: string;
  status: FollowUpStatus;
  raw_due_at: string;
  created_at: string;
  stage_name?: string | null;
};

export const isOverdue = (row: { status: string; due_at: string }) =>
  row.status === "pending" && new Date(row.due_at).getTime() < Date.now();

export const effectiveStatus = (row: { status: string; due_at: string }): FollowUpStatus =>
  isOverdue(row) ? "overdue" : (row.status as FollowUpStatus);

export const statusBadgeVariant = (status: FollowUpStatus) => {
  switch (status) {
    case "completed":
      return "default" as const;
    case "overdue":
      return "destructive" as const;
    case "cancelled":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

const PAGE_SIZE = 10;

export const followUpsQuery = (filters: FollowUpFilters, userId: string, isAdmin: boolean) =>
  queryOptions({
    queryKey: ["follow-ups", filters, userId, isAdmin],
    queryFn: async () => {
      try {
        const res = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            f.*,
            p.contact_name AS prospect_name,
            p.business_name AS prospect_business,
            p.phone AS prospect_phone,
            p.stage_id,
            s.name AS stage_name,
            s.stage_group,
            s.color AS stage_color,
            u.name AS agent_name,
            c.name AS creator_name
          FROM \`follow_ups\` f
          LEFT JOIN \`prospects\` p ON f.prospect_id = p.id
          LEFT JOIN \`stages\` s ON p.stage_id = s.id
          LEFT JOIN \`users\` u ON f.assigned_to = u.id
          LEFT JOIN \`users\` c ON f.created_by = c.id
          ORDER BY f.due_at DESC, f.created_at DESC;`,
        );

        if (res.success && Array.isArray(res.data)) {
          let rows: FollowUp[] = res.data.map((item) => {
            const rawDue = String(item["due_at"] || new Date().toISOString());
            const rawStatus = String(item["status"] || "pending");
            return {
              id: String(item["id"]),
              prospect_id: String(item["prospect_id"]),
              assigned_to: (item["assigned_to"] as string) || null,
              created_by: (item["created_by"] as string) || null,
              due_at: rawDue,
              note: (item["note"] as string) || null,
              status: rawStatus,
              created_at: String(item["created_at"] || new Date().toISOString()),
              updated_at: String(item["updated_at"] || new Date().toISOString()),
              prospect_name: (item["prospect_name"] as string) || "Contact Name",
              prospect_business: (item["prospect_business"] as string) || null,
              prospect_phone: (item["prospect_phone"] as string) || null,
              agent_name: (item["agent_name"] as string) || "Assigned Agent",
              creator_name: (item["creator_name"] as string) || "Admin",
              stage_name: (item["stage_name"] as string) || null,
              stage_group: (item["stage_group"] as string) || null,
              stage_color: (item["stage_color"] as string) || null,
              effective_status: effectiveStatus({ status: rawStatus, due_at: rawDue }),
            };
          });

          // Role permission filter
          if (!isAdmin && userId) {
            rows = rows.filter((r) => r.assigned_to === userId || r.created_by === userId);
          }
          if (filters.agent) {
            rows = rows.filter((r) => r.assigned_to === filters.agent);
          }
          if (filters.status) {
            if (filters.status === "overdue") {
              rows = rows.filter((r) => r.effective_status === "overdue");
            } else {
              rows = rows.filter((r) => r.status === filters.status);
            }
          }
          if (filters.from) {
            const fromTime = new Date(filters.from).getTime();
            rows = rows.filter((r) => new Date(r.due_at).getTime() >= fromTime);
          }
          if (filters.to) {
            const toTime = new Date(`${filters.to}T23:59:59`).getTime();
            rows = rows.filter((r) => new Date(r.due_at).getTime() <= toTime);
          }
          if (filters.search) {
            const term = filters.search.toLowerCase();
            rows = rows.filter(
              (r) =>
                (r.prospect_name || "").toLowerCase().includes(term) ||
                (r.prospect_business || "").toLowerCase().includes(term) ||
                (r.prospect_phone || "").toLowerCase().includes(term) ||
                (r.note || "").toLowerCase().includes(term),
            );
          }

          const total = rows.length;
          const page = filters.page || 1;
          const paginated = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

          return {
            data: paginated,
            count: total,
            pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
          };
        }
      } catch (err) {
        console.warn("followUpsQuery MySQL notice:", err);
      }

      return {
        data: [],
        count: 0,
        pageCount: 1,
      };
    },
  });

export const followUpSummaryQuery = (userId: string, isAdmin?: boolean) =>
  queryOptions({
    queryKey: ["follow-up-summary", userId, isAdmin],
    queryFn: async () => {
      try {
        const res = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            status, 
            due_at, 
            assigned_to,
            created_by 
          FROM \`follow_ups\`;`,
        );

        if (res.success && Array.isArray(res.data)) {
          let list = res.data;
          if (!isAdmin && userId) {
            list = list.filter(
              (r) => String(r["assigned_to"]) === userId || String(r["created_by"]) === userId,
            );
          }
          const nowStr = new Date().toISOString();
          const pending = list.filter(
            (r) => String(r["status"]) === "pending" && String(r["due_at"] || "") >= nowStr,
          ).length;
          const completed = list.filter((r) => String(r["status"]) === "completed").length;
          const cancelled = list.filter((r) => String(r["status"]) === "cancelled").length;
          const overdue = list.filter(
            (r) => String(r["status"]) === "pending" && String(r["due_at"] || "") < nowStr,
          ).length;

          return {
            total: list.length,
            pending,
            completed,
            cancelled,
            overdue,
          };
        }
      } catch (err) {
        console.warn("followUpSummaryQuery MySQL notice:", err);
      }

      return {
        total: 0,
        pending: 0,
        completed: 0,
        cancelled: 0,
        overdue: 0,
      };
    },
  });

export const prospectFollowUpsQuery = (prospectId: string) =>
  queryOptions({
    queryKey: ["prospect-follow-ups", prospectId],
    queryFn: async () => {
      try {
        const res = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            f.*,
            p.contact_name AS prospect_name,
            p.business_name AS prospect_business,
            p.phone AS prospect_phone,
            s.name AS stage_name,
            u.name AS agent_name,
            c.name AS creator_name
          FROM \`follow_ups\` f
          LEFT JOIN \`prospects\` p ON f.prospect_id = p.id
          LEFT JOIN \`stages\` s ON p.stage_id = s.id
          LEFT JOIN \`users\` u ON f.assigned_to = u.id
          LEFT JOIN \`users\` c ON f.created_by = c.id
          WHERE f.prospect_id = '${prospectId}'
          ORDER BY f.due_at DESC;`,
        );

        if (res.success && Array.isArray(res.data)) {
          return res.data.map((item) => {
            const rawDue = String(item["due_at"] || new Date().toISOString());
            const rawStatus = String(item["status"] || "pending");
            return {
              id: String(item["id"]),
              prospect_id: String(item["prospect_id"]),
              assigned_to: (item["assigned_to"] as string) || null,
              created_by: (item["created_by"] as string) || null,
              due_at: rawDue,
              note: (item["note"] as string) || null,
              status: rawStatus,
              created_at: String(item["created_at"] || new Date().toISOString()),
              updated_at: String(item["updated_at"] || new Date().toISOString()),
              prospect_name: (item["prospect_name"] as string) || "Contact Name",
              prospect_business: (item["prospect_business"] as string) || null,
              prospect_phone: (item["prospect_phone"] as string) || null,
              agent_name: (item["agent_name"] as string) || "Agent",
              creator_name: (item["creator_name"] as string) || "Admin",
              stage_name: (item["stage_name"] as string) || null,
              effective_status: effectiveStatus({ status: rawStatus, due_at: rawDue }),
            } as FollowUp;
          });
        }
      } catch (err) {
        console.warn("prospectFollowUpsQuery MySQL notice:", err);
      }
      return [];
    },
  });

export const prospectTimelineQuery = (prospectId: string) =>
  queryOptions({
    queryKey: ["prospect-timeline", prospectId],
    queryFn: async () => {
      try {
        const events: TimelineRecord[] = [];

        // 1. Follow ups from MySQL
        const fuRes = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            f.id,
            f.due_at AS raw_due_at,
            f.created_at,
            f.updated_at,
            f.note,
            f.status,
            COALESCE(u.name, 'Agent') AS agent_name,
            COALESCE(s.name, 'Follow-up') AS stage_name
          FROM \`follow_ups\` f
          LEFT JOIN \`prospects\` p ON f.prospect_id = p.id
          LEFT JOIN \`stages\` s ON p.stage_id = s.id
          LEFT JOIN \`users\` u ON f.assigned_to = u.id
          WHERE f.prospect_id = '${prospectId}'
          ORDER BY f.created_at ASC;`,
        );

        if (fuRes.success && Array.isArray(fuRes.data)) {
          for (const r of fuRes.data) {
            const dateObj = new Date(String(r["updated_at"] || r["created_at"] || r["raw_due_at"]));
            const rawStatus = String(r["status"] || "pending");
            const rawDue = String(r["raw_due_at"] || new Date().toISOString());
            events.push({
              id: String(r["id"]),
              date: format(dateObj, "dd MMM yyyy"),
              time: format(dateObj, "hh:mm a"),
              note: (r["note"] as string) || "Follow-up note",
              agent: String(r["agent_name"] || "Agent"),
              status: effectiveStatus({ status: rawStatus, due_at: rawDue }),
              raw_due_at: rawDue,
              created_at: String(r["created_at"] || new Date().toISOString()),
              stage_name: (r["stage_name"] as string) || "Follow-up",
            });
          }
        }

        // 2. Stage changes from MySQL prospect_stage_history
        const histRes = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            h.id,
            h.changed_at,
            h.note,
            COALESCE(u.name, 'System') AS agent_name,
            COALESCE(s.name, 'Stage Updated') AS stage_name
          FROM \`prospect_stage_history\` h
          LEFT JOIN \`stages\` s ON h.to_stage_id = s.id
          LEFT JOIN \`users\` u ON h.changed_by = u.id
          WHERE h.prospect_id = '${prospectId}'
          ORDER BY h.changed_at ASC;`,
        );

        if (histRes.success && Array.isArray(histRes.data)) {
          for (const h of histRes.data) {
            const dateObj = new Date(String(h["changed_at"]));
            events.push({
              id: String(h["id"]),
              date: format(dateObj, "dd MMM yyyy"),
              time: format(dateObj, "hh:mm a"),
              note:
                (h["note"] as string) || `Stage updated to ${String(h["stage_name"] || "Stage")}`,
              agent: String(h["agent_name"] || "System"),
              status: "completed",
              raw_due_at: String(h["changed_at"]),
              created_at: String(h["changed_at"]),
              stage_name: String(h["stage_name"]),
            });
          }
        }

        // Sort events chronologically
        events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        return events;
      } catch (err) {
        console.warn("prospectTimelineQuery MySQL notice:", err);
      }
      return [];
    },
  });

export const agentsQuery = () =>
  queryOptions({
    queryKey: ["agent-profiles"],
    queryFn: async () => {
      try {
        const users = await fetchCrmUsers();
        if (users && users.length > 0) {
          return users.map((u) => ({
            id: u.id,
            name: `${u.name}${u.role ? ` (${u.role})` : ""}`,
          }));
        }
      } catch {
        // Fallback
      }

      return [
        { id: "usr-admin-1", name: "Admin (Executive)" },
        { id: "usr-agent-1", name: "Tanvir Hasan (Agent)" },
        { id: "usr-agent-2", name: "Nusrat Jahan (Agent)" },
        { id: "usr-agent-3", name: "Rafiqul Islam (Agent)" },
      ];
    },
  });

export function useSetFollowUpStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: "pending" | "completed" | "cancelled";
      note?: string | undefined;
      prospectId?: string | undefined;
      prospectName?: string | undefined;
    }) => {
      const escape = (str?: string | null) => (str ? str.replace(/'/g, "''") : "");

      try {
        await runMySQLQuery(
          `UPDATE \`follow_ups\` 
           SET \`status\` = '${input.status}', 
               \`updated_at\` = NOW() 
               ${input.note ? `, \`note\` = '${escape(input.note)}'` : ""}
           WHERE \`id\` = '${input.id}';`,
        );
      } catch (err) {
        console.warn("useSetFollowUpStatus MySQL notice:", err);
      }

      // Log activity
      if (input.prospectId) {
        try {
          const actId = generateUUID();
          await runMySQLQuery(
            `INSERT INTO \`activities\` (\`id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
             VALUES ('${actId}', '${input.prospectId}', 'follow_up_${input.status}', 'Follow-up task marked ${input.status}${input.prospectName ? ` for ${escape(input.prospectName)}` : ""}${input.note ? ` — ${escape(input.note)}` : ""}', NOW());`,
          );
        } catch {
          // ignore
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      void queryClient.invalidateQueries({ queryKey: ["follow-up-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["prospect-follow-ups"] });
      void queryClient.invalidateQueries({ queryKey: ["prospect-timeline"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      prospect_id: string;
      assigned_to: string;
      created_by: string;
      due_at: string;
      note?: string;
    }) => {
      const escape = (str?: string | null) => (str ? str.replace(/'/g, "''") : "");
      const newId = generateUUID();
      const now = getMySQLTimestamp();
      const isoDue = new Date(input.due_at).toISOString().slice(0, 19).replace("T", " ");

      try {
        await runMySQLQuery(
          `INSERT INTO \`follow_ups\` (\`id\`, \`prospect_id\`, \`assigned_to\`, \`created_by\`, \`due_at\`, \`status\`, \`note\`, \`created_at\`, \`updated_at\`)
           VALUES ('${newId}', '${input.prospect_id}', '${input.assigned_to}', '${input.created_by}', '${isoDue}', 'pending', ${input.note ? `'${escape(input.note)}'` : "NULL"}, NOW(), NOW());`,
        );

        // Activity log
        const actId = generateUUID();
        await runMySQLQuery(
          `INSERT INTO \`activities\` (\`id\`, \`prospect_id\`, \`actor_id\`, \`activity_type\`, \`message\`, \`created_at\`)
           VALUES ('${actId}', '${input.prospect_id}', '${input.created_by}', 'follow_up_created', 'New follow-up task scheduled for ${format(new Date(input.due_at), "dd MMM yyyy, hh:mm a")}${input.note ? ` — ${escape(input.note)}` : ""}', NOW());`,
        );

        // Resolve "Follow-up" stage ID from MySQL
        const stageRes = await runMySQLQuery<Record<string, unknown>[]>(
          "SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) LIKE '%follow%' LIMIT 1;",
        );
        const followUpStageId =
          stageRes?.success && stageRes.data?.[0] ? String(stageRes.data[0]["id"]) : "follow-up";

        // Get prospect's current stage for transition history
        let fromStageId: string | null = null;
        try {
          const currRes = await runMySQLQuery<Record<string, unknown>[]>(
            "SELECT `stage_id` FROM `prospects` WHERE `id` = ? LIMIT 1;",
            [input.prospect_id],
          );
          if (currRes?.success && currRes.data?.[0]) {
            fromStageId = String(currRes.data[0]["stage_id"] || "") || null;
          }
        } catch {
          // ignore
        }

        // Update prospect stage to Follow-up
        await runMySQLQuery(
          "UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;",
          [followUpStageId, now, input.prospect_id],
        );

        // Write stage transition history
        const historyId = generateUUID();
        await runMySQLQuery(
          `INSERT INTO \`prospect_stage_history\` (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_at\`)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [
            historyId,
            input.prospect_id,
            fromStageId,
            followUpStageId,
            `Follow-up scheduled for ${format(new Date(input.due_at), "dd MMM yyyy, hh:mm a")}${input.note ? ` — ${input.note}` : ""}`,
            now,
          ],
        );

        // Cloud Supabase fallback update if active
        try {
          await supabase
            .from("prospects")
            .update({
              stage_id: followUpStageId,
              stage_name: "Follow-up",
              updated_at: new Date().toISOString(),
            })
            .eq("id", input.prospect_id);
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn("useCreateFollowUp MySQL notice:", err);
      }

      return { id: newId, prospect_id: input.prospect_id };
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      void queryClient.invalidateQueries({ queryKey: ["follow-up-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["prospect-follow-ups"] });
      void queryClient.invalidateQueries({ queryKey: ["prospect-timeline"] });
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      void queryClient.invalidateQueries({ queryKey: ["prospects"] });
      void queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (data?.prospect_id) {
        void queryClient.invalidateQueries({ queryKey: ["stage-history", data.prospect_id] });
      }
    },
  });
}
