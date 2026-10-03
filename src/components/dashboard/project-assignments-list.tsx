"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { Calendar, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/components/orders/assign-stage-dialog";
import type { DashboardDateRange } from "@/lib/dashboard";
import { resolveOrderStatus, type CrmOrder } from "@/lib/orders";

// The list scrolls inside the card; cap keeps the DOM small
const MAX_ROWS = 50;
// Notes written by the Assign Stage dialog (and older ERPAPP-style imports):
// 'Order moved to "Videographer" and assigned to Nusrat Jahan.' / 'Assigned to Designer Representative X.'
const ASSIGNED_TO = /assigned to (?:designer representative )?(.+?)\.?$/i;

/** Dashboard card: latest stage assignments from order `status_history`, newest first. */
export function ProjectAssignmentsList({
  orders,
  isLoading,
  range,
  filterUserId,
}: {
  orders: CrmOrder[];
  isLoading: boolean;
  /** Dashboard date filter (`yyyy-MM-dd`), matched against the assignment date. */
  range: DashboardDateRange;
  /** Admin user filter: orders where the user is the CRM contact or current assignee. */
  filterUserId?: string | undefined;
}) {
  const rows = useMemo(() => {
    const list: {
      id: string;
      assignee: string;
      company: string;
      stageName: string;
      stageColor: string;
      date: Date;
      by: string;
    }[] = [];
    for (const order of orders) {
      if (
        filterUserId &&
        order.crm_user_id !== filterUserId &&
        order.designer_id !== filterUserId
      ) {
        continue;
      }
      for (const entry of order.status_history) {
        const match = ASSIGNED_TO.exec(entry.notes || "");
        const date = new Date(entry.timestamp);
        if (!match?.[1] || Number.isNaN(date.getTime())) continue;
        const day = format(date, "yyyy-MM-dd");
        if ((range.from && day < range.from) || (range.to && day > range.to)) continue;
        const stage = resolveOrderStatus(entry.status);
        list.push({
          id: `${order.id}-${entry.id}`,
          assignee: match[1].trim(),
          company: order.company_name || order.job_id || order.order_number,
          stageName: stage.name,
          stageColor: stage.color,
          date,
          by: entry.changedByUserName,
        });
      }
    }
    return list.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, MAX_ROWS);
  }, [orders, range.from, range.to, filterUserId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-10 text-slate-400 dark:text-slate-500">
        <UserCheck className="size-5 opacity-40" />
        <span className="text-[13px] font-medium">No assignments in this period.</span>
      </div>
    );
  }

  return (
    <div className="max-h-90 space-y-4 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div
              className="size-10 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold border"
              style={{
                backgroundColor: `${row.stageColor}1A`,
                color: row.stageColor,
                borderColor: `${row.stageColor}33`,
              }}
            >
              {getInitials(row.assignee)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                {row.assignee}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {row.company}
              </span>
              <div
                className="flex items-center gap-1.5 text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-0.5"
                title={`${format(row.date, "PPpp")} · assigned by ${row.by}`}
              >
                <Calendar className="size-3 shrink-0" />
                <span className="truncate">{format(row.date, "MMM d, h:mm a")}</span>
              </div>
            </div>
          </div>
          <span
            className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border max-w-28 truncate"
            style={{
              backgroundColor: `${row.stageColor}1A`,
              color: row.stageColor,
              borderColor: `${row.stageColor}33`,
            }}
            title={row.stageName}
          >
            {row.stageName}
          </span>
        </div>
      ))}
    </div>
  );
}
