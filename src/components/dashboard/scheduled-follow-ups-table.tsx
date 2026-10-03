"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFollowUpDate } from "@/components/follow-ups/follow-up-card";
import { getInitials } from "@/components/orders/assign-stage-dialog";
import {
  followUpBoardQueryOptions,
  followUpStageFor,
  followUpStagesQueryOptions,
} from "@/lib/follow-ups";
import { getContrastTextColor } from "@/lib/orders";
import type { DashboardDateRange } from "@/lib/dashboard";
import { parseNotesToItems } from "@/lib/stages";
import { cn } from "@/lib/utils";

const MAX_ROWS = 5;
const isClosedStage = (name: string) => /complet|cancel|done|closed/i.test(name);

/** Dashboard card: open follow-ups (not in a Completed/Canceled column), soonest first. */
export function ScheduledFollowUpsTable({
  userId,
  isAdmin,
  filterUserId,
  range,
}: {
  userId: string | undefined;
  isAdmin: boolean;
  /** Admin user filter from the dashboard header. */
  filterUserId?: string | undefined;
  /** Dashboard date filter (`yyyy-MM-dd`); matched against the follow-up date. */
  range?: DashboardDateRange | undefined;
}) {
  const { data: items = [], isLoading } = useQuery({
    ...followUpBoardQueryOptions(userId, isAdmin),
    enabled: Boolean(userId),
  });
  const { data: stages = [] } = useQuery(followUpStagesQueryOptions());
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    const now = Date.now();
    const today = format(new Date(), "yyyy-MM-dd");
    return items
      .filter((item) => !filterUserId || [item.assigned_to, item.created_by].includes(filterUserId))
      .filter((item) => {
        // due_at is "yyyy-MM-dd HH:mm:ss", so its date part compares as a string.
        // Upcoming only: today and later; earlier dates are hidden.
        const day = item.due_at.slice(0, 10);
        return (
          day >= today && (!range?.from || day >= range.from) && (!range?.to || day <= range.to)
        );
      })
      .map((item) => {
        const stage = followUpStageFor(item.status, stages);
        const dueTime = new Date(item.due_at).getTime();
        return {
          item,
          stageName: stage?.name || item.status,
          // Same colour as this card's column header on the follow-up board
          stageColor: stage?.color || "#64748B",
          note: parseNotesToItems(item.note).at(-1)?.text || "No note",
          dueTime: Number.isNaN(dueTime) ? 0 : dueTime,
          isOverdue: !Number.isNaN(dueTime) && dueTime < now,
        };
      })
      .filter((row) => !isClosedStage(row.stageName))
      .sort((a, b) => (sortAsc ? a.dueTime - b.dueTime : b.dueTime - a.dueTime))
      .slice(0, MAX_ROWS);
  }, [items, stages, filterUserId, range?.from, range?.to, sortAsc]);

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full table-fixed text-left border-collapse min-w-145">
        <thead>
          <tr className="border-b border-transparent text-[12px] font-semibold text-slate-400 dark:text-slate-500">
            <th className="pb-3 font-semibold tracking-normal w-[30%]">Client</th>
            <th className="pb-3 font-semibold tracking-normal w-[24%]">Note</th>
            <th
              className="pb-3 font-semibold tracking-normal w-[18%] whitespace-nowrap cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none transition-colors"
              onClick={() => setSortAsc((v) => !v)}
            >
              <div className="flex items-center gap-1">
                <span>Follow-up</span>
                {sortAsc ? (
                  <ChevronUp className="size-3 text-slate-700 dark:text-slate-200" />
                ) : (
                  <ChevronDown className="size-3 text-slate-700 dark:text-slate-200" />
                )}
              </div>
            </th>
            <th className="pb-3 font-semibold tracking-normal w-[16%]">Agent</th>
            <th className="pb-3 font-semibold tracking-normal text-right w-[12%]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <tr key={i}>
                <td colSpan={5} className="py-3.5">
                  <Skeleton className="h-9 w-full rounded-lg" />
                </td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-10 text-center">
                <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
                  <CalendarClock className="size-5 opacity-40" />
                  <span className="text-[13px] font-medium">
                    No upcoming follow-ups in this period.
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map(({ item, stageName, stageColor, note, isOverdue }) => {
              const clientName = item.business_name || item.contact_name || "Unnamed prospect";
              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-full border border-slate-100 dark:border-slate-800 shrink-0">
                        <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {getInitials(clientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {clientName}
                        </span>
                        <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {item.phone || "No phone"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 pr-3">
                    <span
                      className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate block max-w-48"
                      title={note}
                    >
                      {note}
                    </span>
                  </td>

                  <td className="py-3.5 pr-3">
                    <div className="flex items-baseline gap-1 whitespace-nowrap">
                      <span
                        className={cn(
                          "text-[13px] font-medium",
                          isOverdue
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-700 dark:text-slate-300",
                        )}
                        title={isOverdue ? "Overdue" : undefined}
                      >
                        {formatFollowUpDate(item.due_at, "MMM d,")}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {formatFollowUpDate(item.due_at, "h:mm a")}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="size-6 shrink-0">
                        <AvatarImage src={item.agent_avatar || undefined} alt={item.agent_name} />
                        <AvatarFallback className="text-[9px] font-bold">
                          {getInitials(item.agent_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-24">
                        {item.agent_name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 text-right whitespace-nowrap">
                    <span
                      className="inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
                      style={{
                        backgroundColor: stageColor,
                        color: getContrastTextColor(stageColor),
                      }}
                      title={stageName}
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "currentColor", opacity: 0.85 }}
                      />
                      <span className="truncate">{stageName}</span>
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
