import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ReportsFilters = {
  from_date?: string | undefined;
  to_date?: string | undefined;
  agent_id?: string | "all" | undefined;
};

export type ReportsKpis = {
  total_prospects: number;
  sales_won: number;
  followup: number;
  total_sales: number;
  paid_sales: number;
  total_billed: number;
  total_outstanding: number;
  total_paid: number;
  active_clients: number;
};

export type StageChartItem = {
  stage: string;
  count: number;
  percentage: number;
  color?: string | undefined;
};

export type ReportsData = {
  kpis: ReportsKpis;
  stage_distribution: StageChartItem[];
  stage_counts: StageChartItem[];
};

const CHART_COLORS = [
  "#67B239",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#06B6D4",
  "#EF4444",
  "#EC4899",
  "#10B981",
];

export async function fetchReportsData(filters: ReportsFilters = {}): Promise<ReportsData> {
  try {
    // 1. Query prospects directly from Supabase
    let prospectQuery = supabase
      .from("prospects")
      .select("id, stage_name, stage_id, assigned_to, created_at");

    if (filters.from_date) {
      prospectQuery = prospectQuery.gte("created_at", filters.from_date);
    }
    if (filters.to_date) {
      prospectQuery = prospectQuery.lte("created_at", `${filters.to_date}T23:59:59`);
    }
    if (filters.agent_id && filters.agent_id !== "all") {
      prospectQuery = prospectQuery.eq("assigned_to", filters.agent_id);
    }

    const { data: prospectsData } = await prospectQuery;
    const prospectsList = (prospectsData ?? []) as {
      id: string;
      stage_name?: string | null;
      stage_id?: string | null;
      assigned_to?: string | null;
      created_at: string;
    }[];

    const totalProspects = prospectsList.length;
    let salesWon = 0;
    let followup = 0;
    const stageMap = new Map<string, number>();

    for (const p of prospectsList) {
      const sName = (p.stage_name || "Prospect").trim();
      const lower = sName.toLowerCase();

      if (lower.includes("won") || lower.includes("sales won")) {
        salesWon++;
      }
      if (lower.includes("follow")) {
        followup++;
      }

      const key = sName === "New Lead" || sName === "new_lead" ? "Prospect" : sName;
      stageMap.set(key, (stageMap.get(key) || 0) + 1);
    }

    // 2. Query invoices directly from Supabase for financial metrics
    let invoiceQuery = supabase
      .from("invoices")
      .select("id, total_amount, paid_amount, due_amount, status, created_at, created_by");

    if (filters.from_date) {
      invoiceQuery = invoiceQuery.gte("created_at", filters.from_date);
    }
    if (filters.to_date) {
      invoiceQuery = invoiceQuery.lte("created_at", `${filters.to_date}T23:59:59`);
    }
    if (filters.agent_id && filters.agent_id !== "all") {
      invoiceQuery = invoiceQuery.eq("created_by", filters.agent_id);
    }

    const { data: invoicesData } = await invoiceQuery;

    let totalBilled = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    if (invoicesData && invoicesData.length > 0) {
      for (const inv of invoicesData as Record<string, unknown>[]) {
        const tot = Number(inv["total_amount"] || 0);
        const pd = Number(inv["paid_amount"] || 0);
        const due = Number(inv["due_amount"] || Math.max(0, tot - pd));
        totalBilled += tot;
        totalPaid += pd;
        totalOutstanding += Math.max(0, due);
      }
    }

    const activeClients = Math.max(0, totalProspects - salesWon);

    // Build stage distribution array
    const stageDistribution: StageChartItem[] = Array.from(stageMap.entries()).map(
      ([stage, count], idx) => ({
        stage,
        count,
        percentage: totalProspects > 0 ? Number(((count / totalProspects) * 100).toFixed(1)) : 0,
        color: CHART_COLORS[idx % CHART_COLORS.length] || "#67B239",
      }),
    );

    stageDistribution.sort((a, b) => b.count - a.count);

    return {
      kpis: {
        total_prospects: totalProspects,
        sales_won: salesWon,
        followup: followup,
        total_sales: totalBilled,
        paid_sales: totalPaid,
        total_billed: totalBilled,
        total_outstanding: totalOutstanding,
        total_paid: totalPaid,
        active_clients: activeClients,
      },
      stage_distribution: stageDistribution,
      stage_counts: stageDistribution,
    };
  } catch {
    return {
      kpis: {
        total_prospects: 0,
        sales_won: 0,
        followup: 0,
        total_sales: 0,
        paid_sales: 0,
        total_billed: 0,
        total_outstanding: 0,
        total_paid: 0,
        active_clients: 0,
      },
      stage_distribution: [],
      stage_counts: [],
    };
  }
}

export const reportsQueryOptions = (filters: ReportsFilters = {}) =>
  queryOptions({
    queryKey: ["reports", filters],
    queryFn: () => fetchReportsData(filters),
  });
