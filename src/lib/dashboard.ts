import { queryOptions } from "@tanstack/react-query";
import { fetchMySQLProspects } from "@/lib/prospects.functions";

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
      let wonSales = 0;
      let followUp = 0;
      let pendingTasks = 0;

      for (const p of all) {
        const sName = String((p["stage_name"] as string) || "").toLowerCase();
        if (sName.includes("won") || sName.includes("sales won")) wonSales++;
        if (sName.includes("follow")) followUp++;
        if (
          sName.includes("follow") ||
          sName.includes("opportunity") ||
          sName.includes("meeting") ||
          sName.includes("prospect") ||
          sName.includes("quotation")
        )
          pendingTasks++;
      }

      const activeProspects = totalProspects - wonSales;

      return {
        total_prospects: totalProspects,
        active_prospects: activeProspects,
        won_sales: wonSales,
        pending_tasks: pendingTasks,
        follow_up_stage: followUp,
        total_sales: 0,
        paid_sales: 0,
        outstanding_amount: 0,
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
