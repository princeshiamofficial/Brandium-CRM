import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";
import {
  ORDER_STATUSES,
  ORDER_SUBMITTED_STATUS_ID,
  resolveOrderStatus,
  type CrmOrder,
} from "@/lib/orders";
import { resolveStageColor } from "@/lib/stages";
import type { DashboardDateRange } from "@/lib/dashboard";

export type TimelineStep = { key: string; title: string; color: string; count: number };

export type FinanceSummary = {
  totalSales: number;
  salesCount: number;
  invoiceDue: number;
  dueCount: number;
  advancePaid: number;
  advancePaidCount: number;
  cashCollection: number;
  cashCollectionCount: number;
  repeatSales: number;
  repeatSalesCount: number;
};

const CANCELLED_STATUS = "canceled";
const COD_METHODS = ["cod", "courier", "system auto-settled"];

const inRange = (value: string | null | undefined, range: DashboardDateRange) => {
  const day = String(value ?? "").slice(0, 10);
  if (!day) return false;
  if (range.from && day < range.from) return false;
  if (range.to && day > range.to) return false;
  return true;
};

/**
 * Mirrors ERPAPP's dashboard cards. Sales, due and repeat use orders created in the range;
 * advance paid and cash collection use payments received in the range on any order.
 * `userId` limits orders to that CRM contact or assignee.
 */
export function computeFinanceSummary(
  allOrders: CrmOrder[],
  range: DashboardDateRange,
  userId?: string,
): FinanceSummary {
  const validOrders = allOrders.filter((o) => o.status !== CANCELLED_STATUS);

  const repeatOrderIds = new Set<string>();
  const seenJobIds = new Set<string>();
  [...validOrders]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .forEach((o) => {
      const jobId = (o.job_id || "").trim().toLowerCase();
      if (!jobId) return;
      if (seenJobIds.has(jobId)) repeatOrderIds.add(o.id);
      else seenJobIds.add(jobId);
    });

  const orders = userId
    ? validOrders.filter((o) => o.crm_user_id === userId || o.designer_id === userId)
    : validOrders;

  const summary: FinanceSummary = {
    totalSales: 0,
    salesCount: 0,
    invoiceDue: 0,
    dueCount: 0,
    advancePaid: 0,
    advancePaidCount: 0,
    cashCollection: 0,
    cashCollectionCount: 0,
    repeatSales: 0,
    repeatSalesCount: 0,
  };

  for (const order of orders) {
    if (inRange(order.created_at, range)) {
      summary.totalSales += order.total_amount;
      summary.salesCount += 1;
      if (order.due_amount > 0.01) {
        summary.invoiceDue += order.due_amount;
        summary.dueCount += 1;
      }
      if (repeatOrderIds.has(order.id)) {
        summary.repeatSales += order.total_amount;
        summary.repeatSalesCount += 1;
      }
    }

    for (const payment of order.advance_payments) {
      if (!inRange(payment.date, range)) continue;
      summary.cashCollection += payment.amount;
      summary.cashCollectionCount += 1;
      if (!COD_METHODS.includes((payment.paymentMethod || "").toLowerCase())) {
        summary.advancePaid += payment.amount;
        summary.advancePaidCount += 1;
      }
    }
  }

  return summary;
}

export const dashboardExpenseQuery = (range: DashboardDateRange, recordedBy?: string) =>
  queryOptions({
    queryKey: ["dashboard", "expenses", range, recordedBy],
    queryFn: async (): Promise<{ total: number; count: number }> => {
      const conditions = ["1=1"];
      const params: string[] = [];
      if (range.from) {
        conditions.push("DATE(expense_date) >= ?");
        params.push(range.from);
      }
      if (range.to) {
        conditions.push("DATE(expense_date) <= ?");
        params.push(range.to);
      }
      if (recordedBy) {
        conditions.push("recorded_by = ?");
        params.push(recordedBy);
      }
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS cnt FROM \`expenses\` WHERE ${conditions.join(" AND ")};`,
        params,
      );
      const row = res.data?.[0];
      return { total: Number(row?.["total"] || 0), count: Number(row?.["cnt"] || 0) };
    },
  });

/** Orders created in the range per production stage; unknown/legacy statuses count as Order Submitted. */
export function computeOrderStatusSteps(
  allOrders: CrmOrder[],
  range: DashboardDateRange,
  userId?: string,
): TimelineStep[] {
  const counts = new Map<string, number>(ORDER_STATUSES.map((s) => [s.id, 0]));
  for (const order of allOrders) {
    if (userId && order.crm_user_id !== userId && order.designer_id !== userId) continue;
    if (!inRange(order.created_at, range)) continue;
    const id = resolveOrderStatus(order.status).id;
    const key = counts.has(id) ? id : ORDER_SUBMITTED_STATUS_ID;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return ORDER_STATUSES.map((s) => ({
    key: s.id,
    title: s.name,
    color: s.color,
    count: counts.get(s.id) ?? 0,
  }));
}

/** Active prospects created in the range per active pipeline stage (same user scoping as the dashboard). */
export const prospectStageStepsQuery = (range: DashboardDateRange, scopeUserId?: string) =>
  queryOptions({
    queryKey: ["dashboard", "pipeline-steps", range, scopeUserId],
    queryFn: async (): Promise<TimelineStep[]> => {
      const joinConditions = ["p.is_active = 1"];
      const params: string[] = [];
      if (range.from) {
        joinConditions.push("DATE(p.created_at) >= ?");
        params.push(range.from);
      }
      if (range.to) {
        joinConditions.push("DATE(p.created_at) <= ?");
        params.push(range.to);
      }
      if (scopeUserId) {
        joinConditions.push("(p.assigned_to = ? OR p.assigned_artist_id = ? OR p.created_by = ?)");
        params.push(scopeUserId, scopeUserId, scopeUserId);
      }
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT s.id, s.name, s.color, COUNT(p.id) AS cnt
         FROM \`stages\` s
         LEFT JOIN \`prospects\` p
           ON (p.stage_id = s.id OR p.stage_id = REPLACE(s.id, '-', '_') OR p.stage_id = s.name)
          AND ${joinConditions.join(" AND ")}
         WHERE s.is_active = 1
         GROUP BY s.id, s.name, s.color, s.sort_order
         ORDER BY s.sort_order ASC, s.name ASC;`,
        params,
      );
      return (res.data || []).map((r) => ({
        key: String(r["id"]),
        title: String(r["name"]),
        color: resolveStageColor(String(r["name"]), (r["color"] as string) || null),
        count: Number(r["cnt"] || 0),
      }));
    },
  });

/** Orders whose status history records a move to Delivered inside the range (ERPAPP rule). */
export function computeDeliveredCount(
  allOrders: CrmOrder[],
  range: DashboardDateRange,
  userId?: string,
): number {
  return allOrders.filter((order) => {
    if (userId && order.crm_user_id !== userId && order.designer_id !== userId) return false;
    const deliveredEntries = order.status_history.filter(
      (h) => resolveOrderStatus(h.status).id === "delivered",
    );
    if (deliveredEntries.length) return deliveredEntries.some((h) => inRange(h.timestamp, range));
    return resolveOrderStatus(order.status).id === "delivered" && inRange(order.updated_at, range);
  }).length;
}

/** Meetings dated in the range (not cancelled) and quotations dated in the range. */
export const dashboardActivityCountsQuery = (range: DashboardDateRange, scopeUserId?: string) =>
  queryOptions({
    queryKey: ["dashboard", "activity-counts", range, scopeUserId],
    queryFn: async (): Promise<{ meetings: number; quotations: number }> => {
      const dateFilter = (column: string, params: string[]) => {
        const parts: string[] = [];
        if (range.from) {
          parts.push(`DATE(${column}) >= ?`);
          params.push(range.from);
        }
        if (range.to) {
          parts.push(`DATE(${column}) <= ?`);
          params.push(range.to);
        }
        return parts;
      };

      const meetingParams: string[] = [];
      const meetingWhere = [
        "COALESCE(status, '') <> 'Cancelled'",
        ...dateFilter("COALESCE(meeting_date, scheduled_at, created_at)", meetingParams),
      ];
      if (scopeUserId) {
        meetingWhere.push("(assigned_user_id = ? OR assigned_to = ? OR created_by = ?)");
        meetingParams.push(scopeUserId, scopeUserId, scopeUserId);
      }

      const quotationParams: string[] = [];
      const quotationWhere = [
        "COALESCE(is_active, 1) = 1",
        ...dateFilter("COALESCE(order_date, created_at)", quotationParams),
      ];
      if (scopeUserId) {
        quotationWhere.push("(created_by = ? OR assigned_agent_id = ? OR assigned_artist_id = ?)");
        quotationParams.push(scopeUserId, scopeUserId, scopeUserId);
      }

      const [meetingsRes, quotationsRes] = await Promise.all([
        runMySQLQuery<Record<string, unknown>[]>(
          `SELECT COUNT(*) AS cnt FROM \`meetings\` WHERE ${meetingWhere.join(" AND ")};`,
          meetingParams,
        ),
        runMySQLQuery<Record<string, unknown>[]>(
          `SELECT COUNT(*) AS cnt FROM \`quotations\` WHERE ${quotationWhere.join(" AND ")};`,
          quotationParams,
        ),
      ]);
      return {
        meetings: Number(meetingsRes.data?.[0]?.["cnt"] || 0),
        quotations: Number(quotationsRes.data?.[0]?.["cnt"] || 0),
      };
    },
  });
