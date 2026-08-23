import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";

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
    const prospectsRes = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        p.id,
        p.assigned_to,
        p.created_at,
        COALESCE(s.name, 'Prospect') AS stage_name
      FROM \`prospects\` p
      LEFT JOIN \`stages\` s ON p.stage_id = s.id
      WHERE p.is_active = 1;`,
    );

    const invoicesRes = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        i.id,
        i.total_amount,
        i.paid_amount,
        i.due_amount,
        i.created_by,
        i.created_at
      FROM \`invoices\` i
      WHERE i.status != 'Cancelled';`,
    );

    let prospectsList = Array.isArray(prospectsRes.data) ? prospectsRes.data : [];
    let invoicesList = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];

    if (filters.from_date) {
      prospectsList = prospectsList.filter((p) => String(p["created_at"]) >= filters.from_date!);
      invoicesList = invoicesList.filter((i) => String(i["created_at"]) >= filters.from_date!);
    }
    if (filters.to_date) {
      prospectsList = prospectsList.filter(
        (p) => String(p["created_at"]) <= `${filters.to_date} 23:59:59`,
      );
      invoicesList = invoicesList.filter(
        (i) => String(i["created_at"]) <= `${filters.to_date} 23:59:59`,
      );
    }
    if (filters.agent_id && filters.agent_id !== "all") {
      prospectsList = prospectsList.filter((p) => p["assigned_to"] === filters.agent_id);
      invoicesList = invoicesList.filter((i) => i["created_by"] === filters.agent_id);
    }

    const totalProspects = prospectsList.length;
    let salesWon = 0;
    let followup = 0;
    const stageMap = new Map<string, number>();

    for (const p of prospectsList) {
      const sName = String(p["stage_name"] || "Prospect").trim();
      const lower = sName.toLowerCase();

      if (lower.includes("won")) {
        salesWon++;
      }
      if (lower.includes("follow")) {
        followup++;
      }

      stageMap.set(sName, (stageMap.get(sName) || 0) + 1);
    }

    let totalBilled = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    for (const inv of invoicesList) {
      const tot = Number(inv["total_amount"] || 0);
      const pd = Number(inv["paid_amount"] || 0);
      const due = Number(inv["due_amount"] ?? Math.max(0, tot - pd));
      totalBilled += tot;
      totalPaid += pd;
      totalOutstanding += Math.max(0, due);
    }

    const activeClients = Math.max(0, totalProspects - salesWon);

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
  } catch (err) {
    console.warn("fetchReportsData error:", err);
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
