"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimelineStep } from "@/lib/dashboard-finance";

/** `#RRGGBB` → `rgba()`; framer-motion cannot animate 8-digit hex colours. */
const rgba = (hex: string, alpha: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? [...h].map((c) => c + c).join("") : h.slice(0, 6), 16);
  if (Number.isNaN(n)) return `rgba(103, 178, 57, ${alpha})`;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/** Stage circles joined by a line; the highlight moves every 3s (paused on hover, click to pick). */
function StatusTimeline({ steps, isLoading }: { steps: TimelineStep[]; isLoading: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (isLoading || paused || steps.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoading, paused, steps.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <Skeleton className="size-11 rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No stages to show.</p>;
  }

  const active = Math.min(activeIndex, steps.length - 1);
  const progress = steps.length > 1 ? (active / (steps.length - 1)) * 100 : 0;
  const gradient = `linear-gradient(to right, ${steps
    .slice(0, active + 1)
    .map((s) => s.color)
    .join(", ")}${active === 0 ? `, ${steps[0]?.color}` : ""})`;

  return (
    <div
      className="w-full overflow-x-auto pt-2 pb-1 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex min-w-max items-start justify-between px-2">
        <div className="absolute top-5.5 right-9 left-9 h-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${progress}%`, background: gradient }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step, index) => {
          const isActive = index === active;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="relative z-10 flex min-w-18 flex-1 cursor-pointer flex-col items-center outline-none sm:min-w-20"
            >
              <span className="rounded-full bg-white dark:bg-slate-900">
                <motion.span
                  className="flex size-11 items-center justify-center rounded-full text-sm font-bold tabular-nums"
                  animate={{
                    scale: isActive ? 1.08 : 1,
                    y: isActive ? -2 : 0,
                    backgroundColor: rgba(step.color, isActive ? 1 : 0.1),
                    color: isActive ? "rgba(255, 255, 255, 1)" : rgba(step.color, 1),
                    boxShadow: isActive
                      ? `0 0 0 5px ${rgba(step.color, 0.15)}, 0 8px 18px -6px ${rgba(step.color, 0.6)}`
                      : `0 0 0 1px ${rgba(step.color, 0.2)}, 0 0 0 0px ${rgba(step.color, 0)}`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  {step.count}
                </motion.span>
              </span>
              <span
                className="mt-2 max-w-22 text-center text-[11px] leading-tight font-medium transition-colors"
                style={{ color: isActive ? step.color : "var(--muted-foreground)" }}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StatusOverviewCard({
  title,
  description,
  icon: Icon,
  steps,
  isLoading,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  steps: TimelineStep[];
  isLoading: boolean;
}) {
  const total = steps.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.07)] sm:p-5 dark:border-slate-800/80 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#67B239]/10 text-[#67B239]">
            <Icon className="size-4.5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>
        {!isLoading && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {total} total
          </span>
        )}
      </div>
      <div className="mt-3">
        <StatusTimeline steps={steps} isLoading={isLoading} />
      </div>
    </div>
  );
}
