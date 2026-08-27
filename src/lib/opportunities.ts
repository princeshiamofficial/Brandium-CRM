import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { runMySQLQuery } from "@/lib/mysql-api";
import { getMySQLTimestamp } from "@/lib/mysql-client";

export const PIPELINE_STAGES = [
  "Opportunity Created",
  "Follow-up",
  "Proposal Sent",
  "Negotiation",
  "Sales Won",
] as const;

export const REJECTED_STAGES = ["Sales Lost", "Denied Payment", "DNP"] as const;

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

const PAGE_SIZE = 10;

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

export const opportunitiesQuery = (filters: OpportunityFilters, userId: string, isAdmin: boolean) =>
  queryOptions({
    queryKey: ["opportunities", filters, userId, isAdmin],
    queryFn: async () => {
      let rows: Opportunity[] = [];
      try {
        const res = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            o.*,
            p.contact_name AS prospect_name,
            p.business_name AS prospect_business,
            p.designation AS prospect_designation,
            p.email AS prospect_email,
            p.phone AS prospect_phone,
            u_assign.name AS agent_name,
            u_create.name AS creator_name
          FROM \`opportunities\` o
          LEFT JOIN \`prospects\` p ON o.prospect_id = p.id
          LEFT JOIN \`users\` u_assign ON o.assigned_to = u_assign.id
          LEFT JOIN \`users\` u_create ON o.created_by = u_create.id
          WHERE o.is_active = 1
          ORDER BY o.created_at DESC;`,
        );

        if (res.success && Array.isArray(res.data)) {
          rows = res.data.map((r) => ({
            id: String(r["id"]),
            prospect_id: String(r["prospect_id"] || ""),
            estimated_value: Number(r["estimated_value"] || 0),
            assigned_to: (r["assigned_to"] as string) || null,
            created_by: (r["created_by"] as string) || null,
            status: String(r["status"] || "Opportunity Created") as OpportunityStatus,
            notes: (r["notes"] as string) || null,
            is_active: Boolean(Number(r["is_active"] ?? 1)),
            created_at: String(r["created_at"] || new Date().toISOString()),
            updated_at: String(r["updated_at"] || new Date().toISOString()),
            prospect_name: (r["prospect_name"] as string) || "Direct Client",
            prospect_business: (r["prospect_business"] as string) || null,
            prospect_designation: (r["prospect_designation"] as string) || null,
            prospect_email: (r["prospect_email"] as string) || null,
            prospect_phone: (r["prospect_phone"] as string) || null,
            agent_name: (r["agent_name"] as string) || "Unassigned",
            creator_name: (r["creator_name"] as string) || "Admin",
          }));
        }
      } catch (err) {
        console.warn("fetchOpportunities MySQL error:", err);
      }

      if (!isAdmin && userId) {
        rows = rows.filter((r) => r.assigned_to === userId || r.created_by === userId);
      }
      if (filters.agent && filters.agent !== "all") {
        rows = rows.filter((r) => r.assigned_to === filters.agent);
      }
      if (filters.status && filters.status !== "all") {
        rows = rows.filter((r) => r.status.toLowerCase() === filters.status!.toLowerCase());
      }
      if (filters.from) {
        rows = rows.filter((r) => r.created_at >= filters.from!);
      }
      if (filters.to) {
        rows = rows.filter((r) => r.created_at <= filters.to! + " 23:59:59");
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        rows = rows.filter(
          (r) =>
            (r.prospect_name || "").toLowerCase().includes(term) ||
            (r.prospect_business || "").toLowerCase().includes(term) ||
            (r.prospect_phone || "").toLowerCase().includes(term) ||
            (r.notes || "").toLowerCase().includes(term),
        );
      }

      const totalCount = rows.length;
      const from = (filters.page - 1) * PAGE_SIZE;
      const paginated = rows.slice(from, from + PAGE_SIZE);

      return {
        data: paginated,
        count: totalCount,
        pageCount: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
      };
    },
  });

export const opportunitySummaryQuery = (userId: string, isAdmin: boolean) =>
  queryOptions({
    queryKey: ["opportunity-summary", userId, isAdmin],
    queryFn: async () => {
      let rows: {
        status: string;
        estimated_value: number;
        assigned_to: string | null;
        created_by: string | null;
      }[] = [];
      try {
        const res = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            status, 
            estimated_value, 
            assigned_to,
            created_by 
          FROM \`opportunities\` WHERE is_active = 1;`,
        );
        if (res.success && Array.isArray(res.data)) {
          rows = res.data.map((r) => ({
            status: String(r["status"] || "Opportunity Created"),
            estimated_value: Number(r["estimated_value"] || 0),
            assigned_to: (r["assigned_to"] as string) || null,
            created_by: (r["created_by"] as string) || null,
          }));
        }
      } catch {
        // Fallback
      }

      if (!isAdmin && userId) {
        rows = rows.filter((r) => r.assigned_to === userId || r.created_by === userId);
      }

      const totalCount = rows.length;
      const totalValue = rows.reduce((sum, item) => sum + item.estimated_value, 0);
      const activeCount = rows.filter((item) =>
        (PIPELINE_STAGES.slice(0, 4) as readonly string[]).includes(item.status),
      ).length;
      const wonCount = rows.filter((item) => item.status === "Sales Won").length;
      const rejectedCount = rows.filter((item) =>
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
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT 
          o.*,
          p.contact_name AS prospect_name,
          p.business_name AS prospect_business,
          p.email AS prospect_email,
          p.phone AS prospect_phone,
          p.stage_id AS prospect_stage_id,
          u_assign.name AS agent_name,
          u_create.name AS creator_name
        FROM \`opportunities\` o
        LEFT JOIN \`prospects\` p ON o.prospect_id = p.id
        LEFT JOIN \`users\` u_assign ON o.assigned_to = u_assign.id
        LEFT JOIN \`users\` u_create ON o.created_by = u_create.id
        WHERE o.id = ? LIMIT 1;`,
        [id],
      );

      if (!res.success || !Array.isArray(res.data) || !res.data[0]) {
        throw new Error("Opportunity not found");
      }

      const r = res.data[0];
      return {
        id: String(r["id"]),
        prospect_id: String(r["prospect_id"] || ""),
        estimated_value: Number(r["estimated_value"] || 0),
        assigned_to: (r["assigned_to"] as string) || null,
        created_by: (r["created_by"] as string) || null,
        status: String(r["status"] || "Opportunity Created") as OpportunityStatus,
        notes: (r["notes"] as string) || null,
        is_active: Boolean(Number(r["is_active"] ?? 1)),
        created_at: String(r["created_at"] || new Date().toISOString()),
        updated_at: String(r["updated_at"] || new Date().toISOString()),
        prospect_name: (r["prospect_name"] as string) || "Direct Client",
        prospect_business: (r["prospect_business"] as string) || null,
        prospect_email: (r["prospect_email"] as string) || null,
        prospect_phone: (r["prospect_phone"] as string) || null,
        prospect_stage_id: (r["prospect_stage_id"] as string) || null,
        agent_name: (r["agent_name"] as string) || "Unassigned",
        creator_name: (r["creator_name"] as string) || "Admin",
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
      const oppId = generateUUID();
      const status = input.status ?? "Opportunity Created";
      const now = getMySQLTimestamp();

      const res = await runMySQLQuery(
        `INSERT INTO \`opportunities\` (
          \`id\`, \`prospect_id\`, \`estimated_value\`, \`assigned_to\`, \`created_by\`,
          \`status\`, \`notes\`, \`is_active\`, \`created_at\`, \`updated_at\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?);`,
        [
          oppId,
          input.prospect_id,
          input.estimated_value,
          input.assigned_to || null,
          input.created_by || null,
          status,
          input.notes || null,
          now,
          now,
        ],
      );

      if (!res.success) {
        throw new Error(res.error || "Failed to create opportunity in database.");
      }

      if (input.prospect_id) {
        const actId = generateUUID();
        await runMySQLQuery(
          `INSERT INTO \`activities\` (\`id\`, \`actor_id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
           VALUES (?, ?, ?, 'opportunity_created', ?, ?);`,
          [
            actId,
            input.created_by || null,
            input.prospect_id,
            `New opportunity created with estimated value ৳${input.estimated_value.toLocaleString()}${input.notes ? ` — ${input.notes}` : ""}`,
            now,
          ],
        );
      }

      return { success: true, id: oppId };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}

// Atomic Transaction Mutation for Updating Opportunity Status
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
      const now = getMySQLTimestamp();

      let sql = "UPDATE `opportunities` SET `status` = ?, `updated_at` = ? WHERE `id` = ?;";
      let params: (string | number | null)[] = [input.status, now, input.id];

      if (input.notes) {
        sql =
          "UPDATE `opportunities` SET `status` = ?, `notes` = ?, `updated_at` = ? WHERE `id` = ?;";
        params = [input.status, input.notes, now, input.id];
      }

      const res = await runMySQLQuery(sql, params);
      if (!res.success) {
        throw new Error(res.error || "Failed to update opportunity in database.");
      }

      // Sync prospect stage if matching stage exists
      if (input.prospectId) {
        try {
          const stageLookup = await runMySQLQuery<Record<string, unknown>[]>(
            "SELECT id FROM `stages` WHERE LOWER(name) LIKE LOWER(?) LIMIT 1;",
            [`%${input.status}%`],
          );
          const stId = stageLookup?.data?.[0]?.["id"] as string | undefined;
          if (stId) {
            await runMySQLQuery(
              "UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;",
              [stId, now, input.prospectId],
            );
            await runMySQLQuery(
              "INSERT INTO `prospect_stage_history` (`id`, `prospect_id`, `to_stage_id`, `notes`, `created_at`) VALUES (?, ?, ?, ?, ?);",
              [
                generateUUID(),
                input.prospectId,
                stId,
                input.notes || `Opportunity moved to ${input.status}`,
                now,
              ],
            );
          }
        } catch {
          // ignore
        }
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunity-detail", variables.id] });
      void queryClient.invalidateQueries({ queryKey: ["prospects"] });
      void queryClient.invalidateQueries({ queryKey: ["prospect-stage-history"] });
      void queryClient.invalidateQueries({ queryKey: ["denied-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["won-sales"] });
      void queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
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
      const now = getMySQLTimestamp();
      const res = await runMySQLQuery(
        "UPDATE `opportunities` SET `is_active` = 0, `updated_at` = ? WHERE `id` = ?;",
        [now, id],
      );
      if (!res.success) {
        throw new Error(res.error || "Failed to delete opportunity.");
      }
      return { success: true };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      void queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
    },
  });
}
