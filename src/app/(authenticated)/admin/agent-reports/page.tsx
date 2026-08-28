"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Trophy, TrendingUp, XCircle, Zap, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";

import {
  agentReportsQueryOptions,
  type AgentReportPeriod,
  type AgentMetrics,
} from "@/lib/agent-reports";
import { AdminAgentDetailModal } from "@/components/admin-agent-detail-modal";

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export default function AdminAgentReportsPage() {
  const [period, setPeriod] = useState<AgentReportPeriod>("overview");
  const [search, setSearch] = useState<string>("");
  const [detailModalState, setDetailModalState] = useState<{
    open: boolean;
    agent: AgentMetrics | null;
  }>({ open: false, agent: null });

  const { data: reportsData, isLoading } = useQuery(agentReportsQueryOptions(period));

  const overall = reportsData?.overall;
  const rawAgents = reportsData?.agents || [];
  const agents = Array.isArray(rawAgents) ? rawAgents : [];

  const rankedAgents = [...agents].sort((a, b) => {
    const scoreA = a.won_value + a.conversion_rate * 10000 + a.followups_completed * 5000;
    const scoreB = b.won_value + b.conversion_rate * 10000 + b.followups_completed * 5000;
    return scoreB - scoreA;
  });

  const filteredRankedAgents = rankedAgents.filter((agent) => {
    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      return (
        agent.name.toLowerCase().includes(q) ||
        (agent.email && agent.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-7 text-[#67B239]" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Agent Activity Reports & Analytics
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Holistic agent performance metrics (Won Value, Conversion Rate, Follow-ups). Agent
            performance is never ranked solely by stage changes.
          </p>
        </div>

        <Badge
          variant="outline"
          className="bg-[#67B239]/10 text-[#67B239] border-[#67B239]/30 text-xs px-3 py-1.5 font-semibold gap-1.5 self-start sm:self-auto"
        >
          <Zap className="size-4" />
          Holistic Multi-Metric Ranking Active
        </Badge>
      </div>

      <Tabs
        value={period}
        onValueChange={(val: string) => setPeriod(val as AgentReportPeriod)}
        className="w-full"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search name, business, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <TabsList className="grid grid-cols-3 w-full md:w-80">
            <TabsTrigger value="overview" className="text-xs">
              Overview
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">
              Monthly
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={period} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Overall Won Value"
              value={isLoading ? "..." : formatCurrency(overall?.won_value || 0)}
              icon={Trophy}
              colorScheme="pastelEmerald"
              loading={isLoading}
            />
            <StatCard
              label="Pipeline / Follow-up Value"
              value={isLoading ? "..." : formatCurrency(overall?.pipeline_value || 0)}
              icon={TrendingUp}
              colorScheme="pastelTeal"
              loading={isLoading}
            />
            <StatCard
              label="Lost Deal Value"
              value={isLoading ? "..." : formatCurrency(overall?.lost_value || 0)}
              icon={XCircle}
              colorScheme="pastelPeach"
              loading={isLoading}
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-card p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Zap className="size-4 text-[#67B239]" />
                  Tele-sales Agent Performance Matrix ({filteredRankedAgents.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ranked holistically by Won Revenue Value, Conversion Rate &amp; Completed
                  Follow-ups.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="rounded-2xl border bg-white p-4 space-y-4 shadow-2xs">
                    <Skeleton className="h-6 w-1/2 rounded" />
                    <Skeleton className="h-28 w-full rounded-xl" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredRankedAgents.length === 0 ? (
              <div className="rounded-2xl border bg-white p-12 text-center text-muted-foreground shadow-2xs">
                <p className="text-sm font-medium">
                  No agent activity metrics found matching your search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredRankedAgents.map((ag, idx) => (
                  <div
                    key={ag.agent_id}
                    className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <Avatar className="size-9 border border-slate-200 dark:border-slate-800 shadow-2xs">
                              {ag.avatar_url && <AvatarImage src={ag.avatar_url} alt={ag.name} />}
                              <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                                {ag.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase() || "AG"}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute -bottom-1 -right-1 size-4 rounded-full flex items-center justify-center font-mono font-bold text-[9px] border border-white dark:border-slate-900 ${
                                idx === 0
                                  ? "bg-amber-400 text-amber-950"
                                  : idx === 1
                                    ? "bg-slate-300 text-slate-900"
                                    : idx === 2
                                      ? "bg-amber-700 text-white"
                                      : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              #{idx + 1}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate leading-tight">
                              {ag.name}
                            </h4>
                            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {ag.email}
                            </p>
                          </div>
                        </div>

                        {ag.status === "Active" ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] px-2.5 py-0.5 font-medium rounded-full shrink-0">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 text-[11px] px-2.5 py-0.5 font-medium rounded-full shrink-0">
                            <span className="size-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-3.5 bg-slate-50/70 dark:bg-slate-900/40 rounded-xl p-3.5 space-y-2 text-xs border border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Prospects
                          </span>
                          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                            {ag.prospects_count}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Stage Changes
                          </span>
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            {ag.stage_changes}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Status Changes
                          </span>
                          <span className="font-mono font-semibold text-rose-500 dark:text-rose-400">
                            {ag.status_changes}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                            Last Activity
                          </span>
                          <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                            {ag.last_activity
                              ? new Date(ag.last_activity).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "No Activity"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        className="w-full bg-[#67B239] hover:bg-[#5aa130] text-white font-medium rounded-xl h-9 text-xs shadow-2xs transition-all"
                        onClick={() => setDetailModalState({ open: true, agent: ag })}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AdminAgentDetailModal
        open={detailModalState.open}
        onOpenChange={(open) => setDetailModalState((prev) => ({ ...prev, open }))}
        agent={detailModalState.agent}
      />
    </div>
  );
}
