import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Search,
  DollarSign,
  Receipt,
  Target,
  CalendarIcon,
  Users,
  X,
  Check,
  CheckCircle2,
  User,
  Phone,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { wonSalesQueryOptions, agentOptionsQueryOptions, WonSaleFilters } from "@/lib/won-sales";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/won-sales")({
  head: () => ({
    meta: [
      { title: "Won Sales | Brandium Telesales CRM" },
      { name: "description", content: "Closed-won deals and their detailed relational records." },
      { property: "og:title", content: "Won Sales | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Closed-won deals and their detailed relational records.",
      },
    ],
  }),
  component: WonSalesPage,
});

function StatCard({
  label,
  value,
  icon: Icon,
  colorScheme,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme: "pastelPurple" | "pastelTeal" | "pastelEmerald" | "pastelPeach" | "pastelYellow";
}) {
  const styles = {
    pastelPurple: {
      cardBg: "bg-[#F1E8FF] dark:bg-purple-950/40",
      iconText: "text-[#8B5CF6] dark:text-purple-400",
    },
    pastelTeal: {
      cardBg: "bg-[#E1F1F0] dark:bg-teal-950/40",
      iconText: "text-[#0D9488] dark:text-teal-400",
    },
    pastelEmerald: {
      cardBg: "bg-[#E3F2E1] dark:bg-emerald-950/40",
      iconText: "text-[#059669] dark:text-emerald-400",
    },
    pastelPeach: {
      cardBg: "bg-[#FCE8E2] dark:bg-rose-950/40",
      iconText: "text-[#EA580C] dark:text-orange-400",
    },
    pastelYellow: {
      cardBg: "bg-[#FBF3D5] dark:bg-amber-950/40",
      iconText: "text-[#D97706] dark:text-amber-400",
    },
  }[colorScheme];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-4 sm:p-4.5 shadow-md hover:shadow-lg transition-all duration-200 select-none ${styles.cardBg}`}
    >
      <div className="relative z-10 flex items-center gap-3.5">
        {/* Left Circular White Badge */}
        <div className="size-10 sm:size-11 rounded-full bg-white dark:bg-card shadow-2xs flex items-center justify-center shrink-0">
          <Icon className={`size-5 sm:size-5.5 ${styles.iconText}`} />
        </div>

        {/* Right Label & Value */}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight mt-0.5 tracking-tight truncate">
            {value}
          </p>
        </div>
      </div>

      {/* Faint Watermark Icon Background */}
      <div className="absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transform rotate-12 scale-125 transition-transform group-hover:scale-135">
        <Icon className={`size-16 ${styles.iconText}`} />
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function WonSalesPage() {
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState<string>("");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);

  const filters: WonSaleFilters = {
    search,
    agent_id: agentFilter,
    from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const { data: rawWonSales = [], isLoading } = useQuery(
    wonSalesQueryOptions(filters, user?.id, isAdmin),
  );
  const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());

  const wonSales = Array.isArray(rawWonSales) ? rawWonSales : [];
  const agents = Array.isArray(rawAgents) ? rawAgents : [];

  const totalWonCount = wonSales.length;
  const totalRevenueWon = wonSales.reduce((acc, curr) => acc + curr.sale_amount, 0);

  const resetFilters = () => {
    setSearch("");
    setDateRange(undefined);
    setAgentFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section with Mandatory Counter Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-7 text-[#67B239]" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Total {totalWonCount} sales won
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive relational view of all successfully closed-won client deals, billing
            invoices, and agent performance.
          </p>
        </div>

        <Badge className="bg-[#67B239] hover:bg-[#5aa030] text-white px-3 py-1.5 text-xs font-semibold self-start sm:self-auto gap-1.5 shadow-xs">
          <CheckCircle2 className="size-4" />
          {formatCurrency(totalRevenueWon)} Revenue Realized
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Sales Won"
          value={String(totalWonCount)}
          icon={Trophy}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Total Revenue Generated"
          value={formatCurrency(totalRevenueWon)}
          icon={DollarSign}
          colorScheme="pastelTeal"
        />
        <StatCard
          label="Active Invoices Linked"
          value={String(totalWonCount)}
          icon={Receipt}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Average Deal Size"
          value={formatCurrency(totalWonCount > 0 ? totalRevenueWon / totalWonCount : 0)}
          icon={Target}
          colorScheme="pastelYellow"
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Select value={agentFilter} onValueChange={(val: string) => setAgentFilter(val)}>
            <SelectTrigger className="w-42.5 bg-white">
              <div className="flex items-center gap-2 truncate">
                <Users className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Agents" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((ag) => (
                <SelectItem key={ag.id} value={ag.id}>
                  {ag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-50 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search client, business, phone, invoice..."
              className="pl-8.5 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {(search || agentFilter !== "all" || dateRange) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-9 justify-start text-left font-normal bg-white gap-2 text-xs ${
                  !dateRange ? "text-muted-foreground" : "text-foreground font-semibold"
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
              <CalendarPicker
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (range?.to) {
                    setCalOpen(false);
                  }
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
        </div>
      </div>

      {/* Relational Card Grid View of Won Sales */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-4 shadow-2xs space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="size-7 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : wonSales.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-12 text-center text-muted-foreground shadow-2xs">
          <Trophy className="size-10 mx-auto text-slate-300 mb-2.5" />
          <p className="font-bold text-foreground text-base">No won sales match your filters</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing agent selection, or resetting date filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wonSales.map((sale) => (
            <div
              key={sale.id}
              className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between select-none"
            >
              <div>
                {/* Top Section: Title, Amount, Green Checkmark & Contact Details */}
                <div className="p-4 pb-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate group-hover:text-[#67B239] transition-colors">
                        {sale.business_name || sale.client_name}
                      </h3>
                      <p className="text-sm font-bold text-[#67B239] mt-0.5 font-mono">
                        ৳{Number(sale.sale_amount).toLocaleString()}
                      </p>
                    </div>

                    {/* Top-right Solid Green Circle with White Checkmark */}
                    <div className="size-6 sm:size-7 rounded-full bg-[#67B239] flex items-center justify-center shrink-0 text-white shadow-2xs">
                      <Check className="size-4 stroke-3" />
                    </div>
                  </div>

                  {/* Owner / Designation & Phone */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <User className="size-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {sale.client_designation || sale.client_name || "Owner"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="size-4 text-slate-400 shrink-0" />
                      <a
                        href={`tel:${sale.phone}`}
                        className="font-mono text-slate-800 dark:text-slate-200 hover:text-[#67B239] transition-colors"
                      >
                        {sale.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Soft Mint/Teal Container with Assigned, Created by & Updated */}
                <div className="bg-[#DCEEEF] dark:bg-teal-950/40 px-4 py-3 text-xs space-y-2 border-y border-[#cbe5e7] dark:border-teal-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <User className="size-4 text-slate-600 dark:text-slate-400" />
                      <span>Assigned:</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-36">
                      {sale.assigned_agent_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CalendarIcon className="size-4 text-slate-600 dark:text-slate-400" />
                      <span>Created by:</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-36">
                      {sale.created_by_name || sale.assigned_agent_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CalendarIcon className="size-4 text-slate-600 dark:text-slate-400" />
                      <span>Updated:</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {format(new Date(sale.updated_at || sale.won_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                {/* Bottom Section: Notes Header & Box */}
                <div className="p-4 pt-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <FileText className="size-3.5 text-slate-400" />
                    <span>Notes</span>
                  </div>

                  <div className="bg-[#ECEEF0] dark:bg-slate-800/70 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 min-h-16 flex items-start">
                    <p className="line-clamp-3 leading-relaxed">
                      {sale.notes || "Professional Platinum package"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
