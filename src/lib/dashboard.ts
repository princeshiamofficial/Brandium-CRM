import { queryOptions } from "@tanstack/react-query";
import { fetchMySQLProspects } from "@/lib/prospects.functions";
import { executeMySQLQueryFn } from "@/lib/crm.functions";

export type DashboardMetrics = {
  total_prospects: number;
  active_prospects: number;
  won_sales: number;
  pending_tasks: number;
  follow_up_stage: number;
  total_sales: number;
  paid_sales: number;
  outstanding_amount: number;
};

export type RecentProspect = {
  id: string;
  contact_name: string;
  business_name: string | null;
  service_name: string | null;
  stage_name: string | null;
  stage_group: string;
  created_at: string;
};

export type ActivityItem = {
  id: string;
  message: string;
  activity_type: string;
  created_at: string;
};

export const STAGE_GROUPS = [
  { key: "new", label: "New" },
  { key: "in_progress", label: "In Progress" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
] as const;

const EMPTY_METRICS: DashboardMetrics = {
  total_prospects: 0,
  active_prospects: 0,
  won_sales: 0,
  pending_tasks: 0,
  follow_up_stage: 0,
  total_sales: 0,
  paid_sales: 0,
  outstanding_amount: 0,
};

export type ProspectBucket =
  "new_prospects" | "won_sales" | "follow_up_stage" | "pending_tasks" | "lost";

export function getProspectBucket(p: {
  stage_name?: string | null | undefined;
  stage_group?: string | null | undefined;
}): ProspectBucket {
  const sName = String(p.stage_name || "")
    .toLowerCase()
    .trim();
  const sGroup = String(p.stage_group || "")
    .toLowerCase()
    .trim();

  // 1. Won Sales
  if (sName.includes("won") || sGroup === "won") {
    return "won_sales";
  }

  // 2. Follow-up Stage (Strictly follow-up)
  if (sName.includes("follow")) {
    return "follow_up_stage";
  }

  // 3. Pending Tasks (In-progress pipeline deals: Opportunity, Meeting, Quotation)
  if (
    sName.includes("opportunity") ||
    sName.includes("meeting") ||
    sName.includes("quotation") ||
    (sGroup === "in_progress" && sName !== "prospect")
  ) {
    return "pending_tasks";
  }

  // 4. Lost / Unreachable
  if (
    sGroup === "lost" ||
    sGroup === "unreachable" ||
    sName.includes("dnp") ||
    sName.includes("switched") ||
    sName.includes("invalid") ||
    sName.includes("lost")
  ) {
    return "lost";
  }

  // 5. Default / Initial New Prospects
  return "new_prospects";
}

// ─── PRIMARY: All dashboard data comes directly from MySQL database ───

export const dashboardMetricsQuery = (_userId: string) =>
  queryOptions({
    queryKey: ["dashboard", "metrics"],
    queryFn: async (): Promise<DashboardMetrics> => {
      let all: Record<string, unknown>[] = [];
      try {
        const res = await fetchMySQLProspects();
        if (res?.success && Array.isArray(res.prospects) && res.prospects.length > 0) {
          all = res.prospects;
        }
      } catch (err) {
        console.warn("dashboardMetricsQuery error:", err);
      }

      if (all.length === 0) return EMPTY_METRICS;

      const totalProspects = all.length;
      let newProspects = 0;
      let wonSales = 0;
      let followUp = 0;
      let pendingTasks = 0;

      for (const p of all) {
        const bucket = getProspectBucket({
          stage_name: p["stage_name"] as string,
          stage_group: p["stage_group"] as string,
        });

        if (bucket === "won_sales") {
          wonSales++;
        } else if (bucket === "follow_up_stage") {
          followUp++;
        } else if (bucket === "pending_tasks") {
          pendingTasks++;
        } else if (bucket === "new_prospects") {
          newProspects++;
        }
      }

      let totalSales = 0;
      let paidSales = 0;
      try {
        const invRes = (await executeMySQLQueryFn({
          data: {
            sql: "SELECT COALESCE(SUM(total_amount), 0) AS total_sales, COALESCE(SUM(paid_amount), 0) AS paid_sales FROM invoices;",
          },
        })) as { success?: boolean; data?: Record<string, unknown>[] };

        totalSales = Number(invRes?.data?.[0]?.["total_sales"] || 0);
        paidSales = Number(invRes?.data?.[0]?.["paid_sales"] || 0);
      } catch {
        // Fallback
      }

      return {
        total_prospects: totalProspects,
        active_prospects: newProspects,
        won_sales: wonSales,
        pending_tasks: pendingTasks,
        follow_up_stage: followUp,
        total_sales: totalSales,
        paid_sales: paidSales,
        outstanding_amount: Math.max(0, totalSales - paidSales),
      };
    },
  });

export const recentProspectsQuery = (_userId: string) =>
  queryOptions({
    queryKey: ["dashboard", "recent-prospects"],
    queryFn: async (): Promise<RecentProspect[]> => {
      let all: Record<string, unknown>[] = [];
      try {
        const res = await fetchMySQLProspects();
        if (res?.success && Array.isArray(res.prospects) && res.prospects.length > 0) {
          all = res.prospects;
        }
      } catch (err) {
        console.warn("recentProspectsQuery error:", err);
      }

      return all.slice(0, 50).map((p) => {
        const sName = String((p["stage_name"] as string) || "Prospect").toLowerCase();
        let group = "in_progress";
        if (sName.includes("won") || sName.includes("sales won")) group = "won";
        else if (sName.includes("prospect")) group = "new";
        else if (sName.includes("lost")) group = "lost";

        return {
          id: String(p["id"]),
          contact_name: String(p["contact_name"] || "N/A"),
          business_name: (p["business_name"] as string) || null,
          service_name: (p["service_name"] as string) || null,
          stage_name: (p["stage_name"] as string) || "Prospect",
          stage_group: (p["stage_group"] as string) || group,
          created_at: String(p["created_at"] || new Date().toISOString()),
        };
      });
    },
  });

export const recentActivityQuery = (_userId: string) =>
  queryOptions({
    queryKey: ["dashboard", "activity"],
    queryFn: async (): Promise<ActivityItem[]> => {
      try {
        const res = (await executeMySQLQueryFn({
          data: {
            sql: `
              SELECT id, activity_type, message, created_at
              FROM activities
              ORDER BY created_at DESC
              LIMIT 15;
            `,
          },
        })) as { success?: boolean; data?: Record<string, unknown>[]; error?: string };

        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          return res.data.map((r) => ({
            id: String(r["id"]),
            activity_type: String(r["activity_type"] || "system"),
            message: String(r["message"]),
            created_at: String(r["created_at"]),
          }));
        }
      } catch (err) {
        console.warn("recentActivityQuery error:", err);
      }
      return [];
    },
  });

export function formatCurrency(value: number) {
  return `৳${Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
