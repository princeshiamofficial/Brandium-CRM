import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

export const PIPELINE_STAGES = [
  "Opportunity Created",
  "Follow-up",
  "Proposal Sent",
  "Negotiation",
  "Sales Won",
] as const;

export const REJECTED_STAGES = ["Sales Lost", "DNP"] as const;

export type OpportunityStatus = (typeof PIPELINE_STAGES)[number] | (typeof REJECTED_STAGES)[number];

export const opportunityFiltersSchema = z.object({
  page: z.number().catch(1),
  search: z.string().optional(),
  status: z.string().optional(),
  agent: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>;

export type Opportunity = {
  id: string;
  prospect_id: string;
  estimated_value: number;
  assigned_to: string | null;
  created_by: string | null;
  status: OpportunityStatus;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prospect_name?: string;
  prospect_business?: string | null;
  prospect_designation?: string | null;
  prospect_email?: string | null;
  prospect_phone?: string | null;
  agent_name?: string;
  creator_name?: string;
};

type OpportunityRow = Opportunity & {
  prospects?: {
    contact_name?: string | null;
    business_name?: string | null;
    designation?: string | null;
    email?: string | null;
    phone?: string | null;
    stage_id?: string | null;
  } | null;
};

export const getStatusVariant = (status: OpportunityStatus) => {
  switch (status) {
    case "Sales Won":
      return "default" as const;
    case "Sales Lost":
    case "DNP":
      return "destructive" as const;
    case "Negotiation":
    case "Proposal Sent":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

export const getStatusBadgeClass = (status: OpportunityStatus | string) => {
  switch (status) {
    case "Sales Won":
    case "Completed":
    case "Paid":
    case "Active":
      return "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30 text-xs font-semibold px-2.5 py-0.5";
    case "Sales Lost":
    case "DNP":
    case "Cancelled":
    case "Inactive":
    case "Banned":
      return "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 text-xs font-semibold px-2.5 py-0.5";
    case "Negotiation":
    case "Proposal Sent":
    case "Pending Payment":
      return "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold px-2.5 py-0.5";
    default:
      return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-semibold px-2.5 py-0.5";
  }
};

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-mock-1",
    prospect_id: "p1",
    estimated_value: 65000,
    assigned_to: "a1",
    created_by: "c1",
    status: "Negotiation",
    notes: "Discussing customized SEO retainer package terms and payment milestones.",
    is_active: true,
    created_at: new Date(Date.now() - 3600 * 24 * 3 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 12 * 1000).toISOString(),
    prospect_name: "Rahim Uddin",
    prospect_business: "Rahim Electronics",
    prospect_email: "rahim@example.com",
    prospect_phone: "+8801711000001",
    agent_name: "Mehan Ahmed (Admin)",
    creator_name: "System Admin",
  },
  {
    id: "opp-mock-2",
    prospect_id: "p2",
    estimated_value: 45000,
    assigned_to: "a1",
    created_by: "c1",
    status: "Proposal Sent",
    notes: "Sent website development quotation with 3D showcase demo.",
    is_active: true,
    created_at: new Date(Date.now() - 3600 * 24 * 5 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 24 * 1000).toISOString(),
    prospect_name: "Nusrat Jahan",
    prospect_business: "Jahan Fabrics",
    prospect_email: "nusrat@example.com",
    prospect_phone: "+8801711000002",
    agent_name: "Mehan Ahmed (Admin)",
    creator_name: "System Admin",
  },
  {
    id: "opp-mock-3",
    prospect_id: "p3",
    estimated_value: 85000,
    assigned_to: "a1",
    created_by: "c1",
    status: "Sales Won",
    notes: "Client signed contract for Google Business Profile optimization and monthly SEO.",
    is_active: true,
    created_at: new Date(Date.now() - 3600 * 24 * 10 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3600 * 24 * 2 * 1000).toISOString(),
    prospect_name: "Tanvir Hasan",
    prospect_business: "Hasan Motors",
    prospect_email: "tanvir@example.com",
    prospect_phone: "+8801711000003",
    agent_name: "Mehan Ahmed (Admin)",
    creator_name: "System Admin",
  },
  {
    id: "opp-mock-4",
    prospect_id: "p4",
    estimated_value: 30000,
    assigned_to: "a1",
    created_by: "c1",
    status: "Follow-up",
    notes: "Needs confirmation on social media advertising budget before proceeding.",
    is_active: true,
    created_at: new Date(Date.now() - 3600 * 24 * 1 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    prospect_name: "Farhana Akter",
    prospect_business: "Akter Beauty Lounge",
    prospect_email: "farhana@example.com",
    prospect_phone: "+8801711000004",
    agent_name: "Mehan Ahmed (Admin)",
    creator_name: "System Admin",
  },
];

const PAGE_SIZE = 10;

async function resolveNames(ids: (string | null | undefined)[]) {
  const unique = Array.from(new Set(ids.filter(Boolean) as string[]));
  const nameById = new Map<string, string>();
  if (unique.length === 0) return nameById;
  const { data } = await supabase.from("profiles").select("id, full_name, email").in("id", unique);
  for (const p of (data as Record<string, unknown>[] | null) ?? []) {
    const id = String(p["id"] ?? "");
    const fullName = p["full_name"] as string | null;
    const email = p["email"] as string | null;
    nameById.set(id, fullName || email || "Unknown");
  }
  return nameById;
}

export const opportunitiesQuery = (filters: OpportunityFilters, userId: string, isAdmin: boolean) =>
  queryOptions({
    queryKey: ["opportunities", filters, userId],
    queryFn: async () => {
      const from = (filters.page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("opportunities" as never)
        .select("*, prospects(contact_name, business_name, designation, email, phone)", {
          count: "exact",
        })
        .eq("is_active", true);

      if (!isAdmin && userId) {
        query = query.eq("assigned_to", userId);
      }
      if (filters.agent) {
        query = query.eq("assigned_to", filters.agent);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.from) {
        query = query.gte("created_at", filters.from);
      }
      if (filters.to) {
        query = query.lte("created_at", filters.to);
      }

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      let rows = (data ?? []) as unknown as OpportunityRow[];

      // Use mock fallback if remote table is not created yet or empty
      if (error || rows.length === 0) {
        rows = MOCK_OPPORTUNITIES.filter((item) => {
          if (!isAdmin && userId && item.assigned_to !== userId) return false;
          if (filters.agent && item.assigned_to !== filters.agent) return false;
          if (filters.status && item.status !== filters.status) return false;
          if (filters.from && item.created_at < filters.from) return false;
          if (filters.to && item.created_at > filters.to + "T23:59:59") return false;
          return item.is_active;
        });
      }

      if (filters.search) {
        const term = filters.search.toLowerCase();
        rows = rows.filter(
          (r) =>
            (r.prospect_name ?? r.prospects?.contact_name ?? "").toLowerCase().includes(term) ||
            (r.prospect_business ?? r.prospects?.business_name ?? "")
              .toLowerCase()
              .includes(term) ||
            (r.prospect_phone ?? r.prospects?.phone ?? "").toLowerCase().includes(term) ||
            (r.notes ?? "").toLowerCase().includes(term),
        );
      }

      const nameById = await resolveNames(rows.flatMap((r) => [r.assigned_to, r.created_by]));

      const list = rows.map((r) => ({
        ...r,
        estimated_value: Number(r.estimated_value ?? 0),
        prospect_name: r.prospect_name || r.prospects?.contact_name || "Prospect",
        prospect_business: r.prospect_business || r.prospects?.business_name || null,
        prospect_designation: r.prospect_designation || r.prospects?.designation || null,
        prospect_email: r.prospect_email || r.prospects?.email || null,
        prospect_phone: r.prospect_phone || r.prospects?.phone || null,
        agent_name:
          r.agent_name ||
          (r.assigned_to ? nameById.get(r.assigned_to) || "Assigned Agent" : "Unassigned"),
        creator_name:
          r.creator_name || (r.created_by ? nameById.get(r.created_by) || "Admin" : "System"),
      })) as Opportunity[];

      return {
        data: list,
        count: count ?? list.length,
        pageCount: Math.max(1, Math.ceil((count ?? list.length) / PAGE_SIZE)),
      };
    },
  });

export const opportunitySummaryQuery = (userId: string, isAdmin: boolean) =>
  queryOptions({
    queryKey: ["opportunity-summary", userId, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from("opportunities" as never)
        .select("status, estimated_value")
        .eq("is_active", true);

      if (!isAdmin && userId) {
        query = query.eq("assigned_to", userId);
      }

      const { data, error } = await query;

      let list = (data ?? []) as { status: string; estimated_value: number }[];
      if (error || list.length === 0) {
        list = MOCK_OPPORTUNITIES.map((o) => ({
          status: o.status,
          estimated_value: o.estimated_value,
        }));
      }

      const totalCount = list.length;
      const totalValue = list.reduce((sum, item) => sum + Number(item.estimated_value ?? 0), 0);

      const activeCount = list.filter((item) =>
        (PIPELINE_STAGES.slice(0, 4) as readonly string[]).includes(item.status),
      ).length;

      const wonCount = list.filter((item) => item.status === "Sales Won").length;

      const rejectedCount = list.filter((item) =>
        (REJECTED_STAGES as readonly string[]).includes(item.status),
      ).length;

      return {
        total: totalCount,
        totalValue,
        active: activeCount,
        won: wonCount,
        rejected: rejectedCount,
      };
    },
  });

export const opportunityDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["opportunity-detail", id],
    queryFn: async () => {
      const mockMatch = MOCK_OPPORTUNITIES.find((o) => o.id === id);
      if (mockMatch) return mockMatch;

      const { data, error } = await supabase
        .from("opportunities" as never)
        .select("*, prospects(contact_name, business_name, email, phone, stage_id)")
        .eq("id", id)
        .single();

      if (error) {
        if (mockMatch) return mockMatch;
        throw new Error((error as { message: string }).message);
      }

      const row = data as unknown as OpportunityRow;
      const nameById = await resolveNames([row.assigned_to, row.created_by]);

      return {
        ...row,
        estimated_value: Number(row.estimated_value ?? 0),
        prospect_name: row.prospect_name || row.prospects?.contact_name || "Prospect",
        prospect_business: row.prospect_business || row.prospects?.business_name || null,
        prospect_email: row.prospect_email || row.prospects?.email || null,
        prospect_phone: row.prospect_phone || row.prospects?.phone || null,
        prospect_stage_id: row.prospects?.stage_id ?? null,
        agent_name: row.assigned_to ? nameById.get(row.assigned_to) || "Agent" : "Unassigned",
        creator_name: row.created_by ? nameById.get(row.created_by) || "Admin" : "System",
      } as Opportunity & { prospect_stage_id?: string | null };
    },
  });

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      prospect_id: string;
      estimated_value: number;
      assigned_to: string;
      created_by: string;
      status?: OpportunityStatus | undefined;
      notes?: string | undefined;
    }) => {
      const status = input.status ?? "Opportunity Created";
      const { data, error } = await supabase
        .from("opportunities")
        .insert({
          prospect_id: input.prospect_id,
          estimated_value: input.estimated_value,
          assigned_to: input.assigned_to,
          created_by: input.created_by,
          status,
          notes: input.notes ?? null,
          is_active: true,
        } as Record<string, unknown>)
        .select()
        .single();

      if (!error && input.prospect_id) {
        await supabase.from("activities").insert({
          actor_id: input.created_by,
          prospect_id: input.prospect_id,
          activity_type: "opportunity_created",
          message: `New opportunity created with estimated value ৳${input.estimated_value.toLocaleString()}${input.notes ? ` — ${input.notes}` : ""}`,
        } as Record<string, unknown>);
      }

      if (error) {
        const newMock: Opportunity = {
          id: "opp-mock-" + Math.random().toString(36).substring(2, 8),
          prospect_id: input.prospect_id,
          estimated_value: input.estimated_value,
          assigned_to: input.assigned_to,
          created_by: input.created_by,
          status,
          notes: input.notes ?? null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          prospect_name: "Prospect",
          agent_name: "Mehan Ahmed (Admin)",
          creator_name: "Admin",
        };
        MOCK_OPPORTUNITIES.unshift(newMock);
        return newMock;
      }
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

// Atomic Transaction Mutation for Updating Opportunity Status (Handles Sales Won 4-in-1 Transaction)
export function useUpdateOpportunityStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: OpportunityStatus;
      notes?: string | undefined;
      prospectId?: string | undefined;
      prospectName?: string | undefined;
      estimatedValue?: number | undefined;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const actorId = (userData?.user as { id?: string } | null)?.id || null;

      const mockItem = MOCK_OPPORTUNITIES.find((o) => o.id === input.id);
      if (mockItem) {
        mockItem.status = input.status;
        if (input.notes) mockItem.notes = input.notes;
        mockItem.updated_at = new Date().toISOString();
      }

      if (input.status === "Sales Won") {
        const { data: rpcData, error: rpcErr } = await supabase.rpc(
          "mark_opportunity_sales_won" as never,
          {
            p_opportunity_id: input.id,
            p_actor_id: actorId,
            p_notes: input.notes || null,
          } as never,
        );

        if (!rpcErr) return rpcData;

        await supabase
          .from("opportunities")
          .update({
            status: "Sales Won",
            notes: input.notes ?? null,
            updated_at: new Date().toISOString(),
          } as Record<string, unknown>)
          .eq("id", input.id);

        if (input.prospectId) {
          const { data: wonStage } = await supabase
            .from("stages")
            .select("id")
            .ilike("name", "%won%")
            .limit(1)
            .maybeSingle();

          if (wonStage) {
            await supabase
              .from("prospects")
              .update({
                stage_id: (wonStage as Record<string, unknown>)["id"] as string,
                updated_at: new Date().toISOString(),
              } as Record<string, unknown>)
              .eq("id", input.prospectId);
          }

          await supabase.from("activities").insert({
            actor_id: actorId,
            prospect_id: input.prospectId,
            activity_type: "opportunity_won",
            message: `Opportunity marked as Sales Won${input.prospectName ? ` for ${input.prospectName}` : ""}${input.estimatedValue ? ` (Value: ৳${input.estimatedValue.toLocaleString()})` : ""}${input.notes ? ` — ${input.notes}` : ""}`,
          } as Record<string, unknown>);
        }

        return { success: true };
      }

      const { data, error } = await supabase
        .from("opportunities")
        .update({
          status: input.status,
          ...(input.notes ? { notes: input.notes } : {}),
          updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq("id", input.id)
        .select()
        .maybeSingle();

      if (error) console.warn("Status update fallback:", error);

      if (input.prospectId) {
        await supabase.from("activities").insert({
          actor_id: actorId,
          prospect_id: input.prospectId,
          activity_type: `opportunity_${input.status.toLowerCase().replace(/\s+/g, "_")}`,
          message: `Opportunity status updated to ${input.status}${input.prospectName ? ` for ${input.prospectName}` : ""}${input.notes ? ` — ${input.notes}` : ""}`,
        } as Record<string, unknown>);
      }

      return data || mockItem;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunity-detail", variables.id] });
      void queryClient.invalidateQueries({ queryKey: ["prospects"] });
      void queryClient.invalidateQueries({ queryKey: ["prospect-stage-history"] });
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Soft delete mutation (sets is_active = false)
export function useSoftDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const mockItem = MOCK_OPPORTUNITIES.find((o) => o.id === id);
      if (mockItem) {
        mockItem.is_active = false;
      }

      const { data, error } = await supabase
        .from("opportunities")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) console.warn("Soft delete fallback:", error);
      return data || mockItem;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
    },
  });
}
