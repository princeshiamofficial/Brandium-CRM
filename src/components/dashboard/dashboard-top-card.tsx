"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardTopCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change: string;
  isPositive: boolean;
  delay?: number;
}

export function DashboardTopCard({
  label,
  value,
  icon: Icon,
  change,
  isPositive,
  delay = 0,
}: DashboardTopCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="bg-white dark:bg-slate-900 rounded-[22px] p-5 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between"
    >
      {/* Top row: Icon + Label */}
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-slate-400 dark:text-slate-500 stroke-[1.75]" />
        <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>

      {/* Bottom row: Value + Trend Badge */}
      <div className="flex items-baseline justify-between mt-4">
        <span className="text-[28px] sm:text-[30px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          {value}
        </span>

        <span
          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
            isPositive
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60"
              : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/60"
          }`}
        >
          {change}
          {isPositive ? (
            <ArrowUpRight className="size-3 stroke-[2.5]" />
          ) : (
            <ArrowDownRight className="size-3 stroke-[2.5]" />
          )}
        </span>
      </div>
    </motion.div>
  );
}
