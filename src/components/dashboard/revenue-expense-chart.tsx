"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, DollarSign, RefreshCw } from "lucide-react";

interface DayData {
  day: number;
  revHeight: number; // percentage (0 to 100)
  revenue: number; // in dollars
  expense: number; // in dollars
  hasExpensePill: boolean;
  expensePillHeight?: number; // in pixels
}

const DAYS_DATA: DayData[] = [
  {
    day: 1,
    revHeight: 58,
    revenue: 1250,
    expense: 520,
    hasExpensePill: true,
    expensePillHeight: 22,
  },
  { day: 2, revHeight: 22, revenue: 450, expense: 0, hasExpensePill: false },
  {
    day: 3,
    revHeight: 32,
    revenue: 620,
    expense: 280,
    hasExpensePill: true,
    expensePillHeight: 16,
  },
  { day: 4, revHeight: 25, revenue: 500, expense: 0, hasExpensePill: false },
  {
    day: 5,
    revHeight: 20,
    revenue: 380,
    expense: 120,
    hasExpensePill: true,
    expensePillHeight: 12,
  },
  { day: 6, revHeight: 52, revenue: 1100, expense: 0, hasExpensePill: false },
  {
    day: 7,
    revHeight: 35,
    revenue: 700,
    expense: 220,
    hasExpensePill: true,
    expensePillHeight: 16,
  },
  {
    day: 8,
    revHeight: 44,
    revenue: 880,
    expense: 260,
    hasExpensePill: true,
    expensePillHeight: 18,
  },
  {
    day: 9,
    revHeight: 26,
    revenue: 520,
    expense: 150,
    hasExpensePill: true,
    expensePillHeight: 14,
  },
  {
    day: 10,
    revHeight: 36,
    revenue: 720,
    expense: 200,
    hasExpensePill: true,
    expensePillHeight: 16,
  },
  {
    day: 11,
    revHeight: 46,
    revenue: 920,
    expense: 380,
    hasExpensePill: true,
    expensePillHeight: 24,
  },
  {
    day: 12,
    revHeight: 30,
    revenue: 600,
    expense: 180,
    hasExpensePill: true,
    expensePillHeight: 14,
  },
  {
    day: 13,
    revHeight: 68,
    revenue: 1450,
    expense: 480,
    hasExpensePill: true,
    expensePillHeight: 22,
  },
  { day: 14, revHeight: 34, revenue: 680, expense: 0, hasExpensePill: false },
  {
    day: 15,
    revHeight: 26,
    revenue: 520,
    expense: 410,
    hasExpensePill: true,
    expensePillHeight: 24,
  },
  { day: 16, revHeight: 36, revenue: 720, expense: 0, hasExpensePill: false },
  {
    day: 17,
    revHeight: 24,
    revenue: 480,
    expense: 140,
    hasExpensePill: true,
    expensePillHeight: 14,
  },
  { day: 18, revHeight: 42, revenue: 840, expense: 0, hasExpensePill: false },
  {
    day: 19,
    revHeight: 32,
    revenue: 640,
    expense: 210,
    hasExpensePill: true,
    expensePillHeight: 16,
  },
  { day: 20, revHeight: 26, revenue: 520, expense: 0, hasExpensePill: false },
  {
    day: 21,
    revHeight: 64,
    revenue: 1320,
    expense: 490,
    hasExpensePill: true,
    expensePillHeight: 22,
  },
  {
    day: 22,
    revHeight: 40,
    revenue: 800,
    expense: 220,
    hasExpensePill: true,
    expensePillHeight: 16,
  },
  {
    day: 23,
    revHeight: 50,
    revenue: 1020,
    expense: 360,
    hasExpensePill: true,
    expensePillHeight: 20,
  },
  {
    day: 24,
    revHeight: 22,
    revenue: 440,
    expense: 110,
    hasExpensePill: true,
    expensePillHeight: 12,
  },
  {
    day: 25,
    revHeight: 66,
    revenue: 1380,
    expense: 450,
    hasExpensePill: true,
    expensePillHeight: 22,
  },
  { day: 26, revHeight: 34, revenue: 680, expense: 0, hasExpensePill: false },
  { day: 27, revHeight: 46, revenue: 920, expense: 0, hasExpensePill: false },
  {
    day: 28,
    revHeight: 32,
    revenue: 640,
    expense: 200,
    hasExpensePill: true,
    expensePillHeight: 16,
  },
  { day: 29, revHeight: 24, revenue: 480, expense: 0, hasExpensePill: false },
  { day: 30, revHeight: 56, revenue: 1180, expense: 0, hasExpensePill: false },
];

interface RevenueExpenseChartProps {
  revenueTotal?: string;
  revenueChange?: string;
  expenseTotal?: string;
  expenseChange?: string;
}

export function RevenueExpenseChart({
  revenueTotal = "$7260,00",
  revenueChange = "+5.2%",
  expenseTotal = "$2523,00",
  expenseChange = "-1.7%",
}: RevenueExpenseChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hoveredDay = hoveredIndex !== null ? DAYS_DATA[hoveredIndex] : null;

  return (
    <div className="space-y-6">
      {/* Top Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Revenue Box */}
        <div className="rounded-[18px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#eef4ff] dark:bg-blue-950/60 text-[#5B8BF7] flex items-center justify-center">
              <DollarSign className="size-5 stroke-[2.5]" />
            </div>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
              Revenue
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">
              {revenueTotal}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/60">
              {revenueChange}
              <ArrowUpRight className="size-3 stroke-[2.5]" />
            </span>
          </div>
        </div>

        {/* Expenses Box */}
        <div className="rounded-[18px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#f4fee7] dark:bg-lime-950/60 text-[#9ee338] flex items-center justify-center">
              <RefreshCw className="size-4.5 stroke-[2.5]" />
            </div>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
              Expenses
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">
              {expenseTotal}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/70 dark:border-rose-900/60">
              {expenseChange}
              <ArrowDownRight className="size-3 stroke-[2.5]" />
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-1">
        {/* Dynamic Tooltip Following Hovered Column */}
        <AnimatePresence>
          {hoveredDay && hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                left: `calc(2.25rem + (${hoveredIndex} * (100% - 2.25rem) / 30) + ((100% - 2.25rem) / 60))`,
              }}
              className="absolute -top-3.5 -translate-x-1/2 z-30 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none flex items-center gap-2 border border-slate-700/40 whitespace-nowrap"
            >
              <span className="font-bold">Day {hoveredDay.day}</span>
              <span className="text-[#6095F9]">Rev: ${hoveredDay.revenue}</span>
              {hoveredDay.hasExpensePill && (
                <span className="text-[#9ee338]">Exp: ${hoveredDay.expense}</span>
              )}
              {/* Tooltip triangle caret */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end">
          {/* Y-Axis scale */}
          <div className="flex flex-col justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 select-none pr-3 h-43.75 w-9 shrink-0 pb-1">
            <span>$2k</span>
            <span>$1.5k</span>
            <span>$1k</span>
            <span>$500</span>
            <span>0</span>
          </div>

          {/* Bars Graphic Area */}
          <div className="relative flex-1 h-43.75">
            {/* Background Horizontal Guide Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
            </div>

            {/* 30 Columns Grid */}
            <div
              className="relative z-10 w-full h-full grid items-end"
              style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}
            >
              {DAYS_DATA.map((d, index) => {
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={d.day}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative h-full flex flex-col justify-end items-center cursor-pointer group"
                  >
                    {/* Vertical subtle background line guideline */}
                    <div className="absolute inset-y-0 w-px bg-slate-100 dark:bg-slate-800/80 pointer-events-none group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors" />

                    {/* Green Floating Pill (Directly on top of blue bar with 2.5px gap) */}
                    {d.hasExpensePill && (
                      <motion.div
                        className="w-[6.5px] bg-[#9ee338] rounded-full z-20 shrink-0 mb-[2.5px]"
                        style={{ height: `${d.expensePillHeight || 16}px` }}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.015, ease: "easeOut" }}
                      />
                    )}

                    {/* Blue Revenue Bottom Bar */}
                    <motion.div
                      className={`w-[6.5px] rounded-full z-20 transition-all ${
                        isHovered ? "bg-[#4379EE] shadow-sm" : "bg-[#5B8BF7]"
                      }`}
                      style={{ height: `${d.revHeight}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${d.revHeight}%` }}
                      transition={{ duration: 0.5, delay: index * 0.012, ease: "easeOut" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-Axis Day Numbers: Grid-matched to 30 columns for 100% center alignment */}
        <div className="flex items-center pl-9 mt-2.5">
          <div
            className="w-full grid text-[11px] font-medium text-slate-400 dark:text-slate-500 select-none"
            style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}
          >
            {DAYS_DATA.map((d) => (
              <div key={d.day} className="flex justify-center items-center">
                {d.day % 2 !== 0 ? <span>{d.day}</span> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
