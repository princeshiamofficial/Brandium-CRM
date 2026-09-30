"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  Eye,
  Search,
  TrendingUp,
  Trophy,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCrmDateTime } from "@/lib/mysql-client";
import { StatCard } from "@/components/stat-card";

import {
  agentReportsQueryOptions,
  type AgentReportPeriod,
  type AgentMetrics,
} from "@/lib/agent-reports";
import { AdminAgentDetailModal } from "@/components/admin-agent-detail-modal";

const RANK_STYLES = [
  "bg-amber-400 text-amber-950",
  "bg-slate-300 text-slate-900",
  "bg-amber-700 text-white",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AG";

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

          <Card className="shadow-xl border bg-card rounded-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-2 border-b px-6 py-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Trophy className="size-4 text-[#67B239]" />
                    Agent Leaderboard ({filteredRankedAgents.length})
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ranked by won value, conversion rate and completed follow-ups.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6 w-16 font-semibold">Rank</TableHead>
                      <TableHead className="min-w-52 font-semibold">Agent</TableHead>
                      <TableHead className="min-w-25 font-semibold">Status</TableHead>
                      <TableHead className="text-right font-semibold">Prospects</TableHead>
                      <TableHead className="text-right font-semibold">Won</TableHead>
                      <TableHead className="text-right min-w-28 font-semibold">Won Value</TableHead>
                      <TableHead className="min-w-36 font-semibold">Conversion</TableHead>
                      <TableHead className="text-right min-w-28 font-semibold">
                        Follow-ups
                      </TableHead>
                      <TableHead className="min-w-36 font-semibold">Last Activity</TableHead>
                      <TableHead className="pr-6 text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell colSpan={10} className="py-4 px-6">
                            <Skeleton className="h-12 w-full rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredRankedAgents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                          <Users className="size-8 mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-foreground">No agents found</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Try a different name or email.
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRankedAgents.map((ag, idx) => (
                        <TableRow
                          key={ag.agent_id}
                          className="hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setDetailModalState({ open: true, agent: ag })}
                        >
                          <TableCell className="pl-6">
                            <span
                              className={cn(
                                "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold",
                                RANK_STYLES[idx] ?? "bg-muted text-muted-foreground",
                              )}
                            >
                              {idx + 1}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar className="size-9 border border-border/70 shadow-2xs">
                                {ag.avatar_url && <AvatarImage src={ag.avatar_url} alt={ag.name} />}
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                  {getInitials(ag.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground text-sm truncate">
                                  {ag.name}
                                </p>
                                <p className="text-muted-foreground text-xs font-mono truncate">
                                  {ag.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {ag.status === "Active" ? (
                              <Badge
                                variant="outline"
                                className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
                              >
                                <CheckCircle2 className="size-3" /> Active
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
                              >
                                <XCircle className="size-3" /> Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {ag.prospects_count}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {ag.sales_won}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-semibold text-[#67B239]">
                            {formatCurrency(ag.won_value)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-[#67B239]"
                                  style={{ width: `${Math.min(100, ag.conversion_rate)}%` }}
                                />
                              </div>
                              <span className="font-mono text-xs text-muted-foreground">
                                {ag.conversion_rate}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap text-sm">
                            <span className="font-mono">{ag.followups_completed}</span>
                            {ag.overdue_followups > 0 && (
                              <span className="ml-1.5 text-xs text-destructive">
                                ({ag.overdue_followups} overdue)
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {ag.last_activity ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3 text-slate-400" />
                                {formatCrmDateTime(ag.last_activity)}
                              </span>
                            ) : (
                              "No activity"
                            )}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                              title="View details"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailModalState({ open: true, agent: ag });
                              }}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
