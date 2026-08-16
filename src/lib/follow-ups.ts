import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { fetchCrmUsers } from "@/lib/admin-users";

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
};

type FollowUpRow = {
  id: string;
  prospect_id: string;
  assigned_to: string | null;
  created_by: string | null;
  due_at: string;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  prospects?: {
    contact_name?: string | null;
    business_name?: string | null;
    phone?: string | null;
  } | null;
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

async function resolveNames(ids: (string | null | undefined)[]) {
  const unique = Array.from(new Set(ids.filter(Boolean) as string[]));
  const nameById = new Map<string, string>();

  try {
    const crmUsers = await fetchCrmUsers();
    for (const u of crmUsers) {
      if (u.id && u.name) {
        nameById.set(u.id, u.name);
      }
    }
  } catch (err) {
    console.warn("Error resolving CRM user names:", err);
  }

  if (unique.length === 0) return nameById;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", unique);
    for (const p of (data as Record<string, unknown>[] | null) ?? []) {
      const id = String(p["id"] ?? "");
      const fullName = p["full_name"] as string | null;
      const email = p["email"] as string | null;
      if (!nameById.has(id)) {
        nameById.set(id, fullName || email || "Unknown");
      }
    }
  } catch {
    // ignore
  }

  return nameById;
}

async function resolveProspects(ids: (string | null | undefined)[]) {
  const unique = Array.from(new Set(ids.filter(Boolean) as string[]));
  const prospectById = new Map<
    string,
    {
      contact_name?: string | undefined;
      business_name?: string | undefined;
      phone?: string | undefined;
    }
  >();
  if (unique.length === 0) return prospectById;
  const { data } = await supabase
    .from("prospects")
    .select("id, contact_name, business_name, phone")
    .in("id", unique);
  for (const p of (data as Record<string, unknown>[] | null) ?? []) {
    const id = String(p["id"] ?? "");
    prospectById.set(id, {
      contact_name: (p["contact_name"] as string) || undefined,
      business_name: (p["business_name"] as string) || undefined,
      phone: (p["phone"] as string) || undefined,
    });
  }
  return prospectById;
}

export const followUpsQuery = (filters: FollowUpFilters, userId: string, isAdmin: boolean) =>
  queryOptions({
    queryKey: ["follow-ups", filters, userId],
    queryFn: async () => {
      const from = (filters.page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("follow_ups")
        .select("*, prospects(contact_name, business_name, phone)", { count: "exact" });

      if (!isAdmin) query = query.eq("assigned_to", userId);
      if (filters.agent) query = query.eq("assigned_to", filters.agent);
      if (filters.from) query = query.gte("due_at", filters.from);
      if (filters.to) query = query.lte("due_at", `${filters.to}T23:59:59`);

      if (filters.status === "overdue") {
        query = query.eq("status", "pending").lt("due_at", new Date().toISOString());
      } else if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, count, error } = await query
        .order("due_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.warn("Error loading follow ups:", error);
      }

      let rows = (data ?? []) as unknown as FollowUpRow[];

      const prospectById = await resolveProspects(rows.map((r) => r.prospect_id));
      const nameById = await resolveNames(rows.flatMap((r) => [r.assigned_to, r.created_by]));

      // Search is applied on the joined prospect fields and the note text.
      if (filters.search) {
        const term = filters.search.toLowerCase();
        rows = rows.filter((r) => {
          const p = prospectById.get(r.prospect_id) || r.prospects;
          return (
            (p?.contact_name ?? "").toLowerCase().includes(term) ||
            (p?.business_name ?? "").toLowerCase().includes(term) ||
            (p?.phone ?? "").toLowerCase().includes(term) ||
            (r.note ?? "").toLowerCase().includes(term)
          );
        });
      }

      return {
        data: rows.map((r) => {
          const p = prospectById.get(r.prospect_id) || r.prospects;
          return {
            ...r,
            prospect_name: p?.contact_name || p?.business_name || "Contact Name",
            prospect_business: p?.business_name ?? null,
            prospect_phone: p?.phone ?? null,
            agent_name: r.assigned_to
              ? nameById.get(r.assigned_to) || "Assigned Agent"
              : "Unassigned",
            creator_name: r.created_by ? nameById.get(r.created_by) || "Admin" : "System",
            effective_status: effectiveStatus(r),
          };
        }) as FollowUp[],
        count: count ?? rows.length,
        pageCount: Math.max(1, Math.ceil((count ?? rows.length) / PAGE_SIZE)),
      };
    },
  });

export const followUpSummaryQuery = (userId: string, isAdmin?: boolean) =>
  queryOptions({
    queryKey: ["follow-up-summary", userId, isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("follow_up_summary" as never);
      if (!error && data) {
        const raw = (data ?? {}) as Record<string, number>;
        return {
          total: Number(raw["total"] ?? 0),
          pending: Number(raw["pending"] ?? 0),
          completed: Number(raw["completed"] ?? 0),
          cancelled: Number(raw["cancelled"] ?? 0),
          overdue: Number(raw["overdue"] ?? 0),
        };
      }

      // Fallback count query if RPC fails
      const { data: rows } = await supabase.from("follow_ups").select("status, due_at");
      const list = (rows ?? []) as { status: string; due_at: string }[];
      const nowStr = new Date().toISOString();
      const pending = list.filter((r) => r.status === "pending").length;
      const completed = list.filter((r) => r.status === "completed").length;
      const cancelled = list.filter((r) => r.status === "cancelled").length;
      const overdue = list.filter((r) => r.status === "pending" && r.due_at < nowStr).length;

      return {
        total: list.length,
        pending,
        completed,
        cancelled,
        overdue,
      };
    },
  });

export const prospectFollowUpsQuery = (prospectId: string) =>
  queryOptions({
    queryKey: ["prospect-follow-ups", prospectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_ups")
        .select("*")
        .eq("prospect_id", prospectId)
        .order("due_at", { ascending: false });

      if (error) {
        console.warn("Error fetching prospect follow-ups:", error);
      }

      const rows = (data ?? []) as unknown as FollowUpRow[];
      const prospectById = await resolveProspects([prospectId]);
      const nameById = await resolveNames(rows.flatMap((r) => [r.assigned_to, r.created_by]));
      const p = prospectById.get(prospectId);
      return rows.map((r) => ({
        ...r,
        prospect_name: p?.contact_name || p?.business_name || "Contact Name",
        prospect_business: p?.business_name ?? null,
        prospect_phone: p?.phone ?? null,
        agent_name: r.assigned_to ? nameById.get(r.assigned_to) || "Agent" : "Unassigned",
        creator_name: r.created_by ? nameById.get(r.created_by) || "Admin" : "System",
        effective_status: effectiveStatus(r),
      })) as FollowUp[];
    },
  });

export const prospectTimelineQuery = (prospectId: string) =>
  queryOptions({
    queryKey: ["prospect-timeline", prospectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_ups")
        .select("*")
        .eq("prospect_id", prospectId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("Error fetching prospect timeline:", error);
      }

      const rows = (data ?? []) as unknown as FollowUpRow[];
      const nameById = await resolveNames(rows.flatMap((r) => [r.assigned_to, r.created_by]));

      return rows.map((r) => {
        const updateDate = new Date(r.updated_at || r.created_at || r.due_at);
        const agentName =
          (r.assigned_to ? nameById.get(r.assigned_to) : null) ||
          (r.created_by ? nameById.get(r.created_by) : null) ||
          "Agent";

        return {
          id: r.id,
          date: format(updateDate, "dd MMM yyyy"),
          time: format(updateDate, "hh:mm a"),
          note: r.note || "No details specified",
          agent: agentName,
          status: effectiveStatus(r),
          raw_due_at: r.due_at,
          created_at: r.created_at,
          updated_at: r.updated_at,
        } as TimelineRecord;
      });
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

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");

      if (!error && data && data.length > 0) {
        return ((data as Record<string, unknown>[]) ?? []).map((p) => ({
          id: String(p["id"] ?? ""),
          name: String((p["full_name"] as string) || (p["email"] as string) || "Unknown Agent"),
        }));
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
      // 1. Try RPC function set_follow_up_status
      const { data: rpcData, error: rpcErr } = await supabase.rpc(
        "set_follow_up_status" as never,
        {
          p_follow_up_id: input.id,
          p_status: input.status,
          ...(input.note ? { p_note: input.note } : {}),
        } as never,
      );

      if (!rpcErr) return rpcData;

      // 2. Direct database update fallback
      const { data, error } = await supabase
        .from("follow_ups")
        .update({
          status: input.status,
          updated_at: new Date().toISOString(),
          ...(input.note ? { note: input.note } : {}),
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) console.warn("Direct update fallback:", error);

      // 3. Create activity log on completing or updating task
      if (input.prospectId) {
        const { data: userData } = await supabase.auth.getUser();
        const actorId = (userData?.user as { id?: string } | null)?.id || null;
        await supabase.from("activities").insert({
          actor_id: actorId,
          prospect_id: input.prospectId,
          activity_type: `follow_up_${input.status}`,
          message: `Follow-up task marked ${input.status}${input.prospectName ? ` for ${input.prospectName}` : ""}${input.note ? ` — ${input.note}` : ""}`,
        });
      }

      return data;
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
      const { data, error } = await supabase
        .from("follow_ups")
        .insert({
          prospect_id: input.prospect_id,
          assigned_to: input.assigned_to,
          due_at: input.due_at,
          status: "pending",
          note: input.note ?? null,
          created_by: input.created_by,
        })
        .select()
        .single();

      // Log activity for scheduling new follow-up
      if (!error && input.prospect_id) {
        await supabase.from("activities").insert({
          actor_id: input.created_by,
          prospect_id: input.prospect_id,
          activity_type: "follow_up_created",
          message: `New follow-up task scheduled for ${format(new Date(input.due_at), "dd MMM yyyy, hh:mm a")}${input.note ? ` — ${input.note}` : ""}`,
        } as never);
      }

      if (error) {
        const errObj = error as { message?: string };
        throw new Error(errObj?.message || "Failed to create follow up");
      }
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      void queryClient.invalidateQueries({ queryKey: ["follow-up-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["prospect-follow-ups"] });
      void queryClient.invalidateQueries({ queryKey: ["prospect-timeline"] });
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
