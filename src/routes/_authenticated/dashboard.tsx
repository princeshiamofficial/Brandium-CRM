import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Banknote,
  CalendarClock,
  CircleDollarSign,
  ListChecks,
  Repeat,
  Trophy,
  Users2,
  Wallet,
} from "lucide-react";

import { DashboardGreetingBanner } from "@/components/dashboard-greeting-banner";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import {
  dashboardMetricsQuery,
  formatCurrency,
  recentProspectsQuery,
  getProspectBucket,
  type RecentProspect,
} from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Brandium Telesales CRM" },
      { name: "description", content: "Performance overview for your telesales team." },
      { property: "og:title", content: "Dashboard | Brandium Telesales CRM" },
      { property: "og:description", content: "Performance overview for your telesales team." },
    ],
  }),
  component: Dashboard,
});

const stageBadgeVariant = (group: string) =>
  group === "won"
    ? "default"
    : group === "lost"
      ? "destructive"
      : group === "new"
        ? "outline"
        : "secondary";

function Dashboard() {
  const { user, isAdmin } = useAuth();
  const userId = user?.id ?? "";
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);
  const [selectedDateRange, setSelectedDateRange] = useState<string>("This Month");

  const metrics = useQuery({
    ...dashboardMetricsQuery(userId, isAdmin, selectedAgent, selectedDateRange),
    enabled: Boolean(userId),
  });
  const prospects = useQuery({
    ...recentProspectsQuery(userId, isAdmin, selectedAgent, selectedDateRange),
    enabled: Boolean(userId),
  });

  const m = metrics.data;
  const loading = metrics.isPending || !userId;

  const categoryLists = [
    {
      key: "total_prospects",
      label: "Total Prospects",
      cardBg:
        "bg-[#F1E8FF] border-[#E3D5FF] dark:bg-purple-950/40 dark:border-purple-800/60 shadow-xs",
      headerBorder: "border-purple-200/80 dark:border-purple-800/60",
      labelColor: "text-slate-900 dark:text-purple-200 font-bold",
      badgeBg: "bg-purple-600 text-white font-bold shadow-xs",
      items: prospects.data ?? [],
    },
    {
      key: "active_prospects",
      label: "Active Prospects",
      cardBg: "bg-[#E1F1F0] border-[#C8E7E4] dark:bg-teal-950/40 dark:border-teal-800/60 shadow-xs",
      headerBorder: "border-teal-200/80 dark:border-teal-800/60",
      labelColor: "text-slate-900 dark:text-teal-200 font-bold",
      badgeBg: "bg-[#67B239] text-white font-bold shadow-xs",
      items: (prospects.data ?? []).filter(
        (p: RecentProspect) => getProspectBucket(p) === "new_prospects",
      ),
    },
    {
      key: "won_sales",
      label: "Won Sales",
      cardBg:
        "bg-[#E3F2E1] border-[#CDE9C9] dark:bg-emerald-950/40 dark:border-emerald-800/60 shadow-xs",
      headerBorder: "border-emerald-200/80 dark:border-emerald-800/60",
      labelColor: "text-slate-900 dark:text-emerald-200 font-bold",
      badgeBg: "bg-emerald-600 text-white font-bold shadow-xs",
      items: (prospects.data ?? []).filter(
        (p: RecentProspect) => getProspectBucket(p) === "won_sales",
      ),
    },
    {
      key: "pending_tasks",
      label: "Pending Task",
      cardBg: "bg-[#FCE8E2] border-[#F8D4C8] dark:bg-rose-950/40 dark:border-rose-800/60 shadow-xs",
      headerBorder: "border-orange-200/80 dark:border-orange-800/60",
      labelColor: "text-slate-900 dark:text-rose-200 font-bold",
      badgeBg: "bg-orange-500 text-white font-bold shadow-xs",
      items: (prospects.data ?? []).filter(
        (p: RecentProspect) => getProspectBucket(p) === "pending_tasks",
      ),
    },
    {
      key: "follow_up_stage",
      label: "Follow-up Stage",
      cardBg:
        "bg-[#FBF3D5] border-[#F5E6B5] dark:bg-amber-950/40 dark:border-amber-800/60 shadow-xs",
      headerBorder: "border-amber-200/80 dark:border-amber-800/60",
      labelColor: "text-slate-900 dark:text-amber-200 font-bold",
      badgeBg: "bg-amber-500 text-white font-bold shadow-xs",
      items: (prospects.data ?? []).filter(
        (p: RecentProspect) => getProspectBucket(p) === "follow_up_stage",
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      <DashboardGreetingBanner
        selectedAgent={selectedAgent}
        onAgentChange={setSelectedAgent}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
      />

      {/* Row 1: Primary Activity Metrics (5 Column Grid - Matching Pastel Fills) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          label="Total Prospects"
          value={String(m?.total_prospects ?? 0)}
          icon={Users2}
          loading={loading}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Active Prospects"
          value={String(m?.active_prospects ?? 0)}
          icon={ListChecks}
          loading={loading}
          colorScheme="pastelTeal"
        />
        <StatCard
          label="Won Sales"
          value={String(m?.won_sales ?? 0)}
          icon={Trophy}
          loading={loading}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Pending Tasks"
          value={String(m?.pending_tasks ?? 0)}
          icon={CalendarClock}
          loading={loading}
          colorScheme="pastelPeach"
        />
        <StatCard
          label="Follow-up Stage"
          value={String(m?.follow_up_stage ?? 0)}
          icon={Repeat}
          loading={loading}
          colorScheme="pastelYellow"
        />
      </div>

      <section className="mt-4">
        {prospects.isPending ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border bg-card text-card-foreground p-5 shadow-xs">
                <Skeleton className="h-4 w-24" />
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categoryLists.map((cat) => (
              <div
                key={cat.key}
                className={cn(
                  "rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md",
                  cat.cardBg,
                )}
              >
                <div>
                  <div
                    className={cn(
                      "flex items-center justify-between border-b pb-3 mb-1",
                      cat.headerBorder,
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100",
                        cat.labelColor,
                      )}
                    >
                      {cat.label}
                    </p>
                    <Badge
                      className={cn(
                        "text-[11px] size-6 rounded-full p-0 flex items-center justify-center font-bold border-0",
                        cat.badgeBg,
                      )}
                    >
                      {cat.items.length}
                    </Badge>
                  </div>

                  {cat.items.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-slate-500 font-medium">
                        No prospects in this list
                      </p>
                    </div>
                  ) : (
                    <ul className="mt-1 divide-y divide-slate-200/50 dark:divide-slate-800/50">
                      {cat.items.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-2 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                              {p.business_name || p.contact_name}
                            </p>
                            <p className="truncate text-[11px] font-medium text-slate-700 dark:text-slate-300">
                              {p.business_name ? `${p.contact_name} · ` : ""}
                              {p.service_name ?? "No service"}
                            </p>
                          </div>
                          <Badge
                            variant={stageBadgeVariant(p.stage_group)}
                            className="shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5"
                          >
                            {p.stage_name ?? "Unassigned"}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Centered Divider with View All Prospects Button */}
      <div className="relative flex items-center justify-center my-4 py-2">
        <div className="w-full border-t border-slate-400/60 dark:border-slate-700" />
        <div className="absolute bg-[#EEEFF2] dark:bg-background px-4">
          <Link
            to="/prospects"
            className="h-10 px-8 rounded-xl bg-[#3F3F3F] hover:bg-[#262626] text-white text-xs font-bold tracking-wide flex items-center justify-center shadow-md shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>View All Prospects</span>
          </Link>
        </div>
      </div>

      {/* Row 2: Financial Metrics (3 Column Grid - Moved to Bottom) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        <StatCard
          label="Total Sales"
          value={formatCurrency(m?.total_sales ?? 0)}
          icon={CircleDollarSign}
          loading={loading}
          colorScheme="emerald"
        />
        <StatCard
          label="Paid Sales"
          value={formatCurrency(m?.paid_sales ?? 0)}
          icon={Wallet}
          loading={loading}
          colorScheme="teal"
        />
        <StatCard
          label="Outstanding Amount"
          value={formatCurrency(m?.outstanding_amount ?? 0)}
          icon={Banknote}
          loading={loading}
          colorScheme="indigo"
        />
      </div>
    </div>
  );
}
