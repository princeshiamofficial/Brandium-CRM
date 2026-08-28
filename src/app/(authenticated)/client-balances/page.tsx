"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet,
  Search,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  Mail,
  Calendar,
  UserCheck,
  RotateCcw,
  CalendarIcon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { StatCard } from "@/components/stat-card";

import { clientBalancesQueryOptions, type ClientBalanceFilters } from "@/lib/client-balances";

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ClientBalancesPage() {
  const [search, setSearch] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);

  const filters: ClientBalanceFilters = {
    search,
    from_date: dateRange?.from?.toISOString(),
    to_date: dateRange?.to?.toISOString(),
  };

  const { data: balances = [], isLoading } = useQuery(clientBalancesQueryOptions(filters));

  const totalOutstanding = balances.reduce((acc, c) => acc + c.current_balance, 0);
  const totalBilled = balances.reduce((acc, c) => acc + c.total_billed, 0);
  const totalPaid = balances.reduce((acc, c) => acc + c.total_paid, 0);
  const activeClientsCount = balances.filter(
    (c) => c.total_billed > 0 || c.current_balance > 0,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#67B239]/10 text-[#67B239]">
              <Wallet className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Balances</h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time client financial ledger and outstanding balance tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={AlertCircle}
          colorScheme="pastelPeach"
        />
        <StatCard
          label="Total Billed"
          value={formatCurrency(totalBilled)}
          icon={DollarSign}
          colorScheme="pastelTeal"
        />
        <StatCard
          label="Total Paid"
          value={formatCurrency(totalPaid)}
          icon={CheckCircle2}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Active Clients"
          value={String(activeClientsCount)}
          icon={UserCheck}
          colorScheme="pastelPurple"
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, business, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 px-3 text-xs font-normal rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border gap-2 ${
                  dateRange?.from ? "text-foreground font-medium" : "text-muted-foreground"
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

          {(search || dateRange) && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearch("");
                setDateRange(undefined);
              }}
              title="Reset Filters"
              className="h-9 w-9 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Card
              key={idx}
              className="p-4 sm:p-5 bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="size-11 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-44 rounded" />
                    <Skeleton className="h-3.5 w-32 rounded" />
                    <Skeleton className="h-3 w-56 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Skeleton className="h-12 w-24 rounded-xl" />
                  <Skeleton className="h-12 w-24 rounded-xl" />
                  <Skeleton className="h-12 w-24 rounded-xl" />
                  <Skeleton className="h-12 w-24 rounded-xl" />
                </div>
              </div>
            </Card>
          ))
        ) : balances.length === 0 ? (
          <Card className="py-12 text-center bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <Wallet className="size-8 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-foreground">No client balances match your filters</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Try resetting date range or search queries.
            </p>
          </Card>
        ) : (
          balances.map((client) => (
            <Card
              key={client.client_id}
              className="bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="size-11 rounded-xl bg-[#67B239]/10 text-[#67B239] font-bold flex items-center justify-center text-sm shrink-0 border border-[#67B239]/20">
                    {getInitials(client.name)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {client.name}
                      </h3>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        #{client.client_id}
                      </span>
                      {client.current_balance === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-900/60">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-900/60">
                          <span className="size-1.5 rounded-full bg-rose-500" />
                          Due
                        </span>
                      )}
                    </div>

                    {client.business_name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {client.business_name}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-muted-foreground">
                      {client.phone && (
                        <a
                          href={`tel:${client.phone}`}
                          className="font-mono text-slate-600 dark:text-slate-400 hover:text-[#67B239] flex items-center gap-1 transition-colors"
                        >
                          <PhoneCall className="size-3 text-[#67B239] shrink-0" />
                          <span>{client.phone}</span>
                        </a>
                      )}
                      {client.email && (
                        <a
                          href={`mailto:${client.email}`}
                          className="text-slate-500 hover:text-foreground flex items-center gap-1 transition-colors truncate max-w-xs"
                        >
                          <Mail className="size-3 text-blue-500 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 bg-slate-50/80 dark:bg-muted/30 p-3 sm:p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shrink-0">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Current Due
                    </span>
                    <span
                      className={`font-mono font-bold text-sm block ${
                        client.current_balance > 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {formatCurrency(client.current_balance)}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Total Billed
                    </span>
                    <span className="font-mono font-bold text-sm text-foreground block">
                      {formatCurrency(client.total_billed)}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Total Paid
                    </span>
                    <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 block">
                      {formatCurrency(client.total_paid)}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Last Updated
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                      <Calendar className="size-3 text-slate-400 shrink-0" />
                      <span>
                        {new Date(client.last_updated).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
