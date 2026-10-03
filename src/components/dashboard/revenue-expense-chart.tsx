"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, Receipt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalesExpenseBucket } from "@/lib/dashboard-finance";

const formatBdt = (value: number) =>
  `৳${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Short axis label: ৳950, ৳12.5k, ৳3.2M. */
const formatBdtShort = (value: number) => {
  if (value >= 1_000_000) return `৳${+(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `৳${+(value / 1_000).toFixed(1)}k`;
  return `৳${Math.round(value)}`;
};

interface RevenueExpenseChartProps {
  salesTotal: number;
  salesCount: number;
  expenseTotal: number;
  expenseCount: number;
  series: SalesExpenseBucket[];
  isLoading?: boolean;
}

/** Sales (blue bars) and expenses (green pills) for the dashboard date range, in BDT. */
export function RevenueExpenseChart({
  salesTotal,
  salesCount,
  expenseTotal,
  expenseCount,
  series,
  isLoading = false,
}: RevenueExpenseChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hovered = hoveredIndex !== null ? series[hoveredIndex] : null;
  const columns = Math.max(series.length, 1);
  const peak = Math.max(...series.map((b) => b.sales + b.expense), 0);
  // Rounded top of the scale so the axis reads 0 / ¼ / ½ / ¾ / max cleanly
  const scaleMax = peak > 0 ? Math.ceil(peak / 4 / 10) * 10 * 4 : 1000;
  const labelEvery = Math.ceil(columns / 15);

  return (
    <div className="space-y-6">
      {/* Top Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="rounded-[18px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex items-center justify-between gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#eef4ff] dark:bg-blue-950/60 text-[#5B8BF7] flex items-center justify-center">
              <Banknote className="size-5 stroke-[2.5]" />
            </div>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">Sales</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {isLoading ? <Skeleton className="h-6 w-20" /> : formatBdt(salesTotal)}
            </span>
            <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eef4ff] text-[#4379ee] dark:bg-blue-950/40 dark:text-blue-400 border border-[#d7e4fe]/80 dark:border-blue-900/60">
              {salesCount} {salesCount === 1 ? "order" : "orders"}
            </span>
          </div>
        </div>

        <div className="rounded-[18px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 flex items-center justify-between gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-[#f4fee7] dark:bg-lime-950/60 text-[#7cc025] flex items-center justify-center">
              <Receipt className="size-4.5 stroke-[2.5]" />
            </div>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
              Expenses
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {isLoading ? <Skeleton className="h-6 w-20" /> : formatBdt(expenseTotal)}
            </span>
            <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f4fee7] text-[#5f9a1c] dark:bg-lime-950/40 dark:text-lime-400 border border-[#d9f5b4]/80 dark:border-lime-900/60">
              {expenseCount} {expenseCount === 1 ? "entry" : "entries"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-1">
        <AnimatePresence>
          {hovered && hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                left: `calc(3rem + (${hoveredIndex} * (100% - 3rem) / ${columns}) + ((100% - 3rem) / ${columns * 2}))`,
              }}
              className="absolute -top-3.5 -translate-x-1/2 z-30 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none flex items-center gap-2 border border-slate-700/40 whitespace-nowrap"
            >
              <span className="font-bold">{hovered.title}</span>
              <span className="text-[#6095F9]">Sales: {formatBdt(hovered.sales)}</span>
              <span className="text-[#9ee338]">Exp: {formatBdt(hovered.expense)}</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900 dark:border-t-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end">
          {/* Y-Axis scale */}
          <div className="flex flex-col justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500 select-none pr-2 h-43.75 w-12 shrink-0 pb-1">
            {[1, 0.75, 0.5, 0.25].map((f) => (
              <span key={f}>{formatBdtShort(scaleMax * f)}</span>
            ))}
            <span>0</span>
          </div>

          <div className="relative flex-1 h-43.75">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
            </div>

            {isLoading ? (
              <Skeleton className="absolute inset-0 rounded-xl opacity-60" />
            ) : series.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-[13px] font-medium text-slate-400">
                No sales or expenses in this period.
              </div>
            ) : (
              <div
                className="relative z-10 w-full h-full grid items-end"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {series.map((b, index) => {
                  const isHovered = hoveredIndex === index;
                  const salesPct = (b.sales / scaleMax) * 100;
                  const expensePct = (b.expense / scaleMax) * 100;
                  return (
                    <div
                      key={`${b.title}-${index}`}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="relative h-full flex flex-col justify-end items-center cursor-pointer group"
                    >
                      <div className="absolute inset-y-0 w-px bg-slate-100 dark:bg-slate-800/80 pointer-events-none group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors" />

                      {b.expense > 0 && (
                        <motion.div
                          className="w-[6.5px] bg-[#9ee338] rounded-full z-20 shrink-0 mb-[2.5px]"
                          style={{ height: `max(${expensePct}%, 6px)` }}
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.015, ease: "easeOut" }}
                        />
                      )}

                      {b.sales > 0 && (
                        <motion.div
                          className={`w-[6.5px] rounded-full z-20 transition-all ${
                            isHovered ? "bg-[#4379EE] shadow-sm" : "bg-[#5B8BF7]"
                          }`}
                          initial={{ height: 0 }}
                          animate={{ height: `max(${salesPct}%, 6px)` }}
                          transition={{ duration: 0.5, delay: index * 0.012, ease: "easeOut" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* X-Axis labels, grid-matched to the bars */}
        <div className="flex items-center pl-12 mt-2.5">
          <div
            className="w-full grid text-[11px] font-medium text-slate-400 dark:text-slate-500 select-none"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {series.map((b, index) => (
              <div key={`${b.title}-${index}`} className="flex justify-center items-center">
                {index % labelEvery === 0 ? <span>{b.label}</span> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
