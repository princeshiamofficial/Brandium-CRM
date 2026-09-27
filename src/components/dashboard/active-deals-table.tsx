"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface DealItem {
  id: string;
  clientName: string;
  clientEmail: string;
  clientAvatar?: string;
  task: string;
  dueDate: string;
  dueDateRaw?: string;
  revenue: number;
  status: "In progress" | "Pending" | "Completed" | "Won";
}

const DEFAULT_DEALS: DealItem[] = [
  {
    id: "1",
    clientName: "Lena Harper",
    clientEmail: "lena.harper@influxmedia.co",
    clientAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    task: "Summer Collab with Glossi..",
    dueDate: "May 21",
    dueDateRaw: "2025-05-21",
    revenue: 125,
    status: "In progress",
  },
  {
    id: "2",
    clientName: "Sophie Kim",
    clientEmail: "sophie.kim@creatorhive.com",
    clientAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    task: "Back-to-School with Notio..",
    dueDate: "May 11",
    dueDateRaw: "2025-05-11",
    revenue: 320,
    status: "Pending",
  },
  {
    id: "3",
    clientName: "Noah Bennett",
    clientEmail: "noah.b@bennettstudio.com",
    clientAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    task: "YouTube Integration for Sq..",
    dueDate: "May 19",
    dueDateRaw: "2025-05-19",
    revenue: 450,
    status: "Completed",
  },
];

interface ActiveDealsTableProps {
  deals?: DealItem[];
}

export function ActiveDealsTable({ deals = DEFAULT_DEALS }: ActiveDealsTableProps) {
  const [sortField, setSortField] = useState<"dueDate" | "revenue" | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedDeals = useMemo(() => {
    if (!sortField) return deals;
    return [...deals].sort((a, b) => {
      if (sortField === "revenue") {
        return sortAsc ? a.revenue - b.revenue : b.revenue - a.revenue;
      }
      if (sortField === "dueDate") {
        const dA = a.dueDateRaw || a.dueDate;
        const dB = b.dueDateRaw || b.dueDate;
        return sortAsc ? dA.localeCompare(dB) : dB.localeCompare(dA);
      }
      return 0;
    });
  }, [deals, sortField, sortAsc]);

  const handleSort = (field: "dueDate" | "revenue") => {
    if (sortField === field) {
      if (sortAsc) {
        setSortAsc(false);
      } else {
        setSortField(null);
        setSortAsc(true);
      }
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getStatusBadge = (status: DealItem["status"]) => {
    switch (status) {
      case "In progress":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-[#eef4ff] text-[#4379ee] dark:bg-blue-950/40 dark:text-blue-400 border border-[#d7e4fe]/80 dark:border-blue-900/60">
            In progress
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-[#fff8ee] text-[#ee9443] dark:bg-amber-950/40 dark:text-amber-400 border border-[#fedeb7]/80 dark:border-amber-900/60">
            Pending
          </span>
        );
      case "Completed":
      case "Won":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-[#effdf4] text-[#22c55e] dark:bg-emerald-950/40 dark:text-emerald-400 border border-[#bbf7d0]/80 dark:border-emerald-900/60">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-left border-collapse min-w-145">
        <thead>
          <tr className="border-b border-transparent text-[12px] font-semibold text-slate-400 dark:text-slate-500">
            <th className="pb-3 font-semibold tracking-normal w-[36%]">Client</th>
            <th className="pb-3 font-semibold tracking-normal w-[30%]">Task</th>
            <th
              className="pb-3 font-semibold tracking-normal w-[14%] cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none transition-colors"
              onClick={() => handleSort("dueDate")}
            >
              <div className="flex items-center gap-1">
                <span>Due date</span>
                {sortField === "dueDate" ? (
                  sortAsc ? (
                    <ChevronUp className="size-3 text-slate-700 dark:text-slate-200" />
                  ) : (
                    <ChevronDown className="size-3 text-slate-700 dark:text-slate-200" />
                  )
                ) : (
                  <ArrowUpDown className="size-3 opacity-60" />
                )}
              </div>
            </th>
            <th
              className="pb-3 font-semibold tracking-normal w-[10%] cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none transition-colors"
              onClick={() => handleSort("revenue")}
            >
              <div className="flex items-center gap-1">
                <span>Revenue</span>
                {sortField === "revenue" ? (
                  sortAsc ? (
                    <ChevronUp className="size-3 text-slate-700 dark:text-slate-200" />
                  ) : (
                    <ChevronDown className="size-3 text-slate-700 dark:text-slate-200" />
                  )
                ) : (
                  <ArrowUpDown className="size-3 opacity-60" />
                )}
              </div>
            </th>
            <th className="pb-3 font-semibold tracking-normal text-right w-[10%]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
          {sortedDeals.map((deal) => (
            <tr
              key={deal.id}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
            >
              {/* Client Name & Email */}
              <td className="py-3.5 pr-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 rounded-full border border-slate-100 dark:border-slate-800 shrink-0">
                    <AvatarImage
                      src={deal.clientAvatar}
                      alt={deal.clientName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {deal.clientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {deal.clientName}
                    </span>
                    <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {deal.clientEmail}
                    </span>
                  </div>
                </div>
              </td>

              {/* Task Title */}
              <td className="py-3.5 pr-3">
                <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate block max-w-55">
                  {deal.task}
                </span>
              </td>

              {/* Due Date */}
              <td className="py-3.5 pr-3">
                <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  {deal.dueDate}
                </span>
              </td>

              {/* Revenue */}
              <td className="py-3.5 pr-3">
                <span className="text-[13px] font-extrabold text-slate-900 dark:text-white">
                  ${deal.revenue}
                </span>
              </td>

              {/* Status Badge */}
              <td className="py-3.5 text-right whitespace-nowrap">{getStatusBadge(deal.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
