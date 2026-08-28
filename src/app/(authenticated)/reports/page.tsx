"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Users2,
  Trophy,
  CalendarClock,
  DollarSign,
  CheckCircle2,
  Receipt,
  AlertCircle,
  Wallet,
  UserCheck,
  CalendarIcon,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/placeholder-page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { reportsQueryOptions, type ReportsFilters } from "@/lib/reports";
import { agentOptionsQueryOptions } from "@/lib/won-sales";

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const filters: ReportsFilters = {
    from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    agent_id: agentFilter,
  };

  const { data: reportsData, isLoading } = useQuery(reportsQueryOptions(filters));
  const { data: agents = [] } = useQuery(agentOptionsQueryOptions());

  const kpis = reportsData?.kpis;
  const stageDist = reportsData?.stage_distribution || [];
  const stageCounts = reportsData?.stage_counts || [];

  const resetFilters = () => {
    setDateRange(undefined);
    setAgentFilter("all");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Select value={agentFilter} onValueChange={(val: string) => setAgentFilter(val)}>
            <SelectTrigger className="w-44 bg-white">
              <Users className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`bg-white gap-2 text-xs font-normal ${
                  dateRange?.from ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="size-3.5" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <span>
                      {format(dateRange.from, "MMM d")} &ndash;{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </span>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (range?.to) setCalOpen(false);
                }}
                numberOfMonths={2}
                initialFocus
              />
              {dateRange?.from && (
                <div className="border-t p-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setDateRange(undefined);
                      setCalOpen(false);
                    }}
                  >
                    Clear dates
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {(dateRange || agentFilter !== "all") && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={resetFilters}>
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Prospects"
          value={isLoading ? "..." : String(kpis?.total_prospects || 0)}
          icon={Users2}
          colorScheme="pastelPurple"
          loading={isLoading}
        />

        <StatCard
          label="Sales Won"
          value={isLoading ? "..." : String(kpis?.sales_won || 0)}
          icon={Trophy}
          colorScheme="pastelEmerald"
          loading={isLoading}
        />

        <StatCard
          label="Follow-up Deals"
          value={isLoading ? "..." : String(kpis?.followup || 0)}
          icon={CalendarClock}
          colorScheme="pastelYellow"
          loading={isLoading}
        />

        <StatCard
          label="Total Sales Value"
          value={isLoading ? "..." : formatCurrency(kpis?.total_sales || 0)}
          icon={DollarSign}
          colorScheme="pastelTeal"
          loading={isLoading}
        />

        <StatCard
          label="Paid Sales Amount"
          value={isLoading ? "..." : formatCurrency(kpis?.paid_sales || 0)}
          icon={CheckCircle2}
          colorScheme="pastelEmerald"
          loading={isLoading}
        />

        <StatCard
          label="Total Billed Revenue"
          value={isLoading ? "..." : formatCurrency(kpis?.total_billed || 0)}
          icon={Receipt}
          colorScheme="pastelTeal"
          loading={isLoading}
        />

        <StatCard
          label="Total Outstanding Due"
          value={isLoading ? "..." : formatCurrency(kpis?.total_outstanding || 0)}
          icon={AlertCircle}
          colorScheme="pastelPeach"
          loading={isLoading}
        />

        <StatCard
          label="Total Paid Collected"
          value={isLoading ? "..." : formatCurrency(kpis?.total_paid || 0)}
          icon={Wallet}
          colorScheme="pastelEmerald"
          loading={isLoading}
        />

        <StatCard
          label="Active Clients"
          value={isLoading ? "..." : String(kpis?.active_clients || 0)}
          icon={UserCheck}
          colorScheme="pastelPurple"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="size-4 text-[#67B239]" />
              Prospect Stage Distribution (Donut Chart)
            </CardTitle>
            <CardDescription className="text-xs">
              Percentage break-down of prospects across pipeline stages.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-72 w-full rounded" />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="stage"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {stageDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "#67B239"} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: number, name: string) => [
                        `${val} Prospects`,
                        `Stage: ${name}`,
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="size-4 text-blue-600" />
              Stage Prospect Counts (Bar Chart)
            </CardTitle>
            <CardDescription className="text-xs">
              Absolute volume count of prospects grouped by sales stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-72 w-full rounded" />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stageCounts}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="stage"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(val: number) => [`${val} Prospects`, "Volume"]} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {stageCounts.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color || "#3B82F6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
