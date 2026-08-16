import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
  hint?: string;
  colorScheme?:
    | "teal"
    | "blue"
    | "amber"
    | "indigo"
    | "emerald"
    | "purple"
    | "rose"
    | "sky"
    | "orange"
    | "pastelPurple"
    | "pastelTeal"
    | "pastelEmerald"
    | "pastelPeach"
    | "pastelYellow";
  className?: string;
};

const colorVariants = {
  teal: {
    bg: "bg-teal-50 dark:bg-teal-500/10",
    iconBg: "bg-teal-100 dark:bg-teal-500/20",
    iconText: "text-teal-600 dark:text-teal-400",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
    iconText: "text-blue-600 dark:text-blue-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
    iconText: "text-amber-600 dark:text-amber-400",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    iconBg: "bg-indigo-100 dark:bg-indigo-500/20",
    iconText: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-500/10",
    iconBg: "bg-purple-100 dark:bg-purple-500/20",
    iconText: "text-purple-600 dark:text-purple-400",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    iconBg: "bg-rose-100 dark:bg-rose-500/20",
    iconText: "text-rose-600 dark:text-rose-400",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-500/10",
    iconBg: "bg-sky-100 dark:bg-sky-500/20",
    iconText: "text-sky-600 dark:text-sky-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    iconBg: "bg-orange-100 dark:bg-orange-500/20",
    iconText: "text-orange-600 dark:text-orange-400",
  },
  pastelPurple: {
    cardBg: "bg-[#F1E8FF] border-[#E3D5FF]",
    iconBg: "bg-white/90 text-purple-600 shadow-xs",
    iconText: "text-purple-600",
    labelColor: "text-slate-800 font-bold",
    valueColor: "text-slate-950 font-black",
  },
  pastelTeal: {
    cardBg: "bg-[#E1F1F0] border-[#C8E7E4]",
    iconBg: "bg-white/90 text-teal-600 shadow-xs",
    iconText: "text-teal-600",
    labelColor: "text-slate-800 font-bold",
    valueColor: "text-slate-950 font-black",
  },
  pastelEmerald: {
    cardBg: "bg-[#E3F2E1] border-[#CDE9C9]",
    iconBg: "bg-white/90 text-emerald-600 shadow-xs",
    iconText: "text-emerald-600",
    labelColor: "text-slate-800 font-bold",
    valueColor: "text-slate-950 font-black",
  },
  pastelPeach: {
    cardBg: "bg-[#FCE8E2] border-[#F8D4C8]",
    iconBg: "bg-white/90 text-orange-600 shadow-xs",
    iconText: "text-orange-600",
    labelColor: "text-slate-800 font-bold",
    valueColor: "text-slate-950 font-black",
  },
  pastelYellow: {
    cardBg: "bg-[#FBF3D5] border-[#F5E6B5]",
    iconBg: "bg-white/90 text-amber-600 shadow-xs",
    iconText: "text-amber-600",
    labelColor: "text-slate-800 font-bold",
    valueColor: "text-slate-950 font-black",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  loading = false,
  hint,
  colorScheme = "teal",
  className,
}: StatCardProps) {
  const scheme = colorVariants[colorScheme as keyof typeof colorVariants] ?? colorVariants.teal;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl sm:rounded-xl border p-4 shadow-2xs transition-all duration-300 hover:shadow-md active:scale-[0.99] select-none",
        "cardBg" in scheme && scheme.cardBg
          ? scheme.cardBg
          : "border-slate-200/80 dark:border-border bg-card text-card-foreground",
        className,
      )}
    >
      {/* Subtle background highlight overlay */}
      {"bg" in scheme && scheme.bg && (
        <div
          className={cn(
            "absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]",
            scheme.bg,
          )}
        />
      )}

      <div className="relative z-10 flex items-center gap-3 sm:gap-4">
        {/* Left Circular Icon Badge */}
        <div
          className={cn(
            "p-3 rounded-full shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xs",
            scheme.iconBg,
          )}
        >
          <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", scheme.iconText)} />
        </div>

        {/* Right Label & Value */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-xs sm:text-sm font-semibold truncate px-0.5",
              "labelColor" in scheme && scheme.labelColor
                ? scheme.labelColor
                : "text-muted-foreground",
            )}
          >
            {label}
          </p>

          {loading ? (
            <Skeleton className="mt-1 h-7 w-24 rounded-md" />
          ) : (
            <p
              className={cn(
                "text-xl sm:text-2xl font-bold font-mono tracking-tight mt-0.5 leading-tight truncate px-0.5",
                "valueColor" in scheme && scheme.valueColor ? scheme.valueColor : "text-foreground",
              )}
            >
              {value}
            </p>
          )}
        </div>
      </div>

      {/* Watermark Icon Background (Bottom Right) */}
      <div className="absolute -right-3 -bottom-3 opacity-[0.05] pointer-events-none transform rotate-12 scale-125 transition-transform group-hover:scale-135">
        <Icon className={cn("h-16 w-16", scheme.iconText)} />
      </div>

      {/* Bottom Subtle Gradient Border Line */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-linear-to-r from-transparent via-primary/20 to-transparent opacity-60" />
    </div>
  );
}
