"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface PerformanceGaugeProps {
  percentage?: number;
  successLabel?: string;
  tasks?: Array<{
    id: string;
    label: string;
    progressText: string;
    completed: boolean;
    color: "yellow" | "blue" | "green";
  }>;
}

export function PerformanceGauge({
  percentage = 88,
  successLabel = "Success",
  tasks = [
    {
      id: "1",
      label: "Send 3 pitches",
      progressText: "(2/3)",
      completed: false,
      color: "yellow",
    },
    {
      id: "2",
      label: "Complete 2 campaigns",
      progressText: "(2/2)",
      completed: true,
      color: "blue",
    },
    {
      id: "3",
      label: "Upload a new brief",
      progressText: "(1/1)",
      completed: true,
      color: "green",
    },
  ],
}: PerformanceGaugeProps) {
  // Center (150, 125), Radius: 85, Stroke width: 22
  // Upward semi-circle arch from 180° (left) up to 90° (top) down to 0° (right)
  const cx = 150;
  const cy = 125;
  const r = 85;
  const strokeWidth = 22;

  const getArcPoint = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
    };
  };

  const createArc = (startAngleDeg: number, endAngleDeg: number) => {
    const start = getArcPoint(startAngleDeg);
    const end = getArcPoint(endAngleDeg);
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  };

  // 3 distinct color segments (matching reference image exactly):
  // 1. Lime Green (Left): 180° to 138°
  // 2. Vibrant Blue (Middle / Peak): 133° to 47°
  // 3. Warm Orange / Golden Yellow (Right): 42° to 0°
  const pathGreen = createArc(180, 138);
  const pathBlue = createArc(133, 47);
  const pathYellow = createArc(42, 0);

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Semi-circle Gauge Arch */}
      <div className="relative flex items-center justify-center w-full py-1">
        <svg viewBox="0 0 300 145" className="w-full max-w-65 h-auto overflow-visible select-none">
          {/* Segment 1: Lime Green (Left) */}
          <motion.path
            d={pathGreen}
            fill="none"
            stroke="#A3E635"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Segment 2: Vibrant Royal Blue (Middle Peak) */}
          <motion.path
            d={pathBlue}
            fill="none"
            stroke="#5B8BF7"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          />

          {/* Segment 3: Warm Golden Yellow / Orange (Right) */}
          <motion.path
            d={pathYellow}
            fill="none"
            stroke="#FBBF24"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          />

          {/* Center Metric Text inside Arc */}
          <text
            x={cx}
            y={cy - 22}
            textAnchor="middle"
            className="fill-slate-900 dark:fill-white font-extrabold text-[36px] tracking-tight"
            style={{ fontWeight: 800 }}
          >
            {percentage}%
          </text>
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            className="fill-slate-400 font-medium text-[13px]"
          >
            {successLabel}
          </text>
        </svg>
      </div>

      {/* Target Items / Checklist */}
      <div className="space-y-3 pt-3 border-t border-transparent">
        {tasks.map((t) => {
          const dotColor =
            t.color === "yellow"
              ? "bg-[#F59E0B]"
              : t.color === "blue"
                ? "bg-[#5B8BF7]"
                : "bg-[#84CC16]";

          return (
            <div key={t.id} className="flex items-center justify-between text-[13px] group">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`size-2 rounded-full ${dotColor} shrink-0`} />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {t.label}{" "}
                  <span className="text-slate-400 dark:text-slate-500 font-normal">
                    {t.progressText}
                  </span>
                </span>
              </div>

              {t.completed ? (
                <div className="size-5 rounded-full border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <Check className="size-3.5 text-emerald-500 stroke-[2.5]" />
                </div>
              ) : (
                <div className="size-5 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <div className="size-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
