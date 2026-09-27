"use client";

import { Calendar } from "lucide-react";

export interface PendingTaskItem {
  id: string;
  title: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  platform: "notion" | "tiktok" | "instagram" | "other";
}

const DEFAULT_TASKS: PendingTaskItem[] = [
  {
    id: "1",
    title: "Invoice for Notion collab",
    dueDate: "May 4, 2025",
    priority: "High",
    platform: "notion",
  },
  {
    id: "2",
    title: "Tik Tok reels for Nical..",
    dueDate: "May 7, 2025",
    priority: "Medium",
    platform: "tiktok",
  },
  {
    id: "3",
    title: "Follow up with Gymshark",
    dueDate: "May 13, 2025",
    priority: "Low",
    platform: "instagram",
  },
];

interface PendingTasksListProps {
  tasks?: PendingTaskItem[];
}

export function PendingTasksList({ tasks = DEFAULT_TASKS }: PendingTasksListProps) {
  const getPlatformIcon = (platform: PendingTaskItem["platform"]) => {
    switch (platform) {
      case "notion":
        return (
          <div className="size-10 rounded-full bg-[#3ecf8e]/15 dark:bg-[#3ecf8e]/25 text-[#2cb67d] flex items-center justify-center shrink-0 border border-[#3ecf8e]/20">
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z" />
              <path d="M9 13h6" />
              <path d="M9 17h6" />
              <path d="M9 9h1" />
            </svg>
          </div>
        );
      case "tiktok":
        return (
          <div className="size-10 rounded-full bg-black dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
            <svg className="size-5 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .592.046.873.136V9.41a6.33 6.33 0 0 0-.873-.06A6.34 6.34 0 0 0 3 15.69a6.34 6.34 0 0 0 10.82 4.46v-7.14a8.16 8.16 0 0 0 5.77 2.29V11.8a4.85 4.85 0 0 1-3.77-1.34 4.85 4.85 0 0 1-1.23-3.77z" />
            </svg>
          </div>
        );
      case "instagram":
        return (
          <div className="size-10 rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white flex items-center justify-center shrink-0 shadow-sm">
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Calendar className="size-5" />
          </div>
        );
    }
  };

  const getPriorityBadge = (priority: PendingTaskItem["priority"]) => {
    switch (priority) {
      case "High":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef2f2] text-[#ef4444] dark:bg-rose-950/40 dark:text-rose-400 border border-[#fee2e2]/80 dark:border-rose-900/60">
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fffbeb] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400 border border-[#fef3c7]/80 dark:border-amber-900/60">
            Medium
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0fdf4] text-[#16a34a] dark:bg-emerald-950/40 dark:text-emerald-400 border border-[#dcfce7]/80 dark:border-emerald-900/60">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {getPlatformIcon(task.platform)}
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                {task.title}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-normal text-slate-400 dark:text-slate-500 mt-1">
                <Calendar className="size-3 shrink-0" />
                <span>{task.dueDate}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0">{getPriorityBadge(task.priority)}</div>
        </div>
      ))}
    </div>
  );
}
