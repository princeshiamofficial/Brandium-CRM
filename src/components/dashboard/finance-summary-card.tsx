"use client";

import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FinanceSummaryCardProps {
  label: string;
  amount: number;
  /** Show `amount` as a plain number instead of Taka. */
  isCount?: boolean;
  count: number;
  countLabel: string;
  icon: LucideIcon;
  /** Circle background, e.g. `bg-amber-100 dark:bg-amber-500/20`. */
  circleClass: string;
  /** Icon colour, e.g. `text-amber-600`. */
  iconClass: string;
  loading?: boolean;
}

const formatTaka = (value: number) =>
  `৳${Math.round(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Clone of the ERPAPP dashboard summary card. */
export function FinanceSummaryCard({
  label,
  amount,
  isCount,
  count,
  countLabel,
  icon: Icon,
  circleClass,
  iconClass,
  loading,
}: FinanceSummaryCardProps) {
  return (
    <Card
      title={`${count} ${countLabel}`}
      className="group relative gap-0 overflow-hidden bg-card p-2.5 sm:p-4 rounded-2xl sm:rounded-lg border-none sm:border shadow-sm sm:shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 sm:active:scale-100"
    >
      <div
        className={cn(
          "absolute inset-0 opacity-[0.03] sm:hidden transition-opacity group-active:opacity-[0.06]",
          circleClass,
        )}
      />
      <div className="relative z-10 flex flex-col items-center space-y-2.5 text-center sm:flex-row sm:space-y-0 sm:space-x-4 sm:text-left">
        <div
          className={cn(
            "p-2.5 sm:p-3 rounded-xl sm:rounded-full shadow-sm sm:shadow-none transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
            circleClass,
          )}
        >
          <Icon className={cn("size-5 sm:size-6", iconClass)} />
        </div>
        <div className="w-full min-w-0 flex-1">
          <p className="truncate px-1 text-[10px] sm:text-sm font-bold sm:font-medium uppercase sm:capitalize tracking-widest sm:tracking-normal text-muted-foreground/80 sm:text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mx-1 mt-1 h-7 w-24" />
          ) : (
            <p className="mt-0.5 sm:mt-0 px-1 font-mono text-[15px] sm:text-2xl font-bold leading-tight text-foreground truncate">
              {isCount ? amount.toLocaleString("en-US") : formatTaka(amount)}
            </p>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute -right-4 -bottom-4 rotate-12 scale-110 opacity-[0.04] sm:hidden">
        <Icon className={cn("size-20", iconClass)} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/10 to-transparent sm:hidden" />
    </Card>
  );
}
