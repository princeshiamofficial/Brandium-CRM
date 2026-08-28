"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  History,
  Search,
  Download,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CalendarIcon,
  Layers,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { StatCard } from "@/components/stat-card";
import {
  invoicesQueryOptions,
  type InvoiceFilters,
  type InvoiceStatus,
  exportBillingHistoryCSV,
} from "@/lib/billing";

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

type SortField = "date" | "amount";
type SortOrder = "desc" | "asc";

export default function BillingHistoryPage() {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const [sortField] = useState<SortField>("date");
  const [sortOrder] = useState<SortOrder>("desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filters: InvoiceFilters = {
    search,
    status: statusFilter,
    from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const { data: rawInvoices = [], isLoading } = useQuery(invoicesQueryOptions(filters));
  const invoices = Array.isArray(rawInvoices) ? rawInvoices : [];

  const allBillsCount = invoices.length;
  const allBillsTotal = invoices.reduce((acc, curr) => acc + curr.total_amount, 0);

  const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
  const paidCount = paidInvoices.length;
  const paidTotal = paidInvoices.reduce((acc, curr) => acc + curr.total_amount, 0);

  const pendingInvoices = invoices.filter(
    (inv) => inv.status === "Pending" || inv.status === "Partially Paid",
  );
  const pendingCount = pendingInvoices.length;
  const pendingTotal = pendingInvoices.reduce((acc, curr) => acc + curr.due_amount, 0);

  const cancelledInvoices = invoices.filter((inv) => inv.status === "Cancelled");
  const cancelledCount = cancelledInvoices.length;
  const cancelledTotal = cancelledInvoices.reduce((acc, curr) => acc + curr.total_amount, 0);

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (sortField === "date") {
      const timeA = new Date(a.bill_date).getTime();
      const timeB = new Date(b.bill_date).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    } else {
      return sortOrder === "desc"
        ? b.total_amount - a.total_amount
        : a.total_amount - b.total_amount;
    }
  });

  const totalFilteredCount = sortedInvoices.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedInvoices = sortedInvoices.slice(startIndex, startIndex + pageSize);

  const handleExportCSV = () => {
    if (sortedInvoices.length === 0) {
      toast.error("No billing history records to export.");
      return;
    }
    exportBillingHistoryCSV(sortedInvoices);
    toast.success(`Exported ${sortedInvoices.length} billing history records to CSV!`);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateRange(undefined);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-900/60">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Paid
          </span>
        );
      case "Partially Paid":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200/80 dark:border-blue-900/60">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Partially Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-900/60">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            <span className="size-1.5 rounded-full bg-slate-400" />
            Cancelled
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#67B239]/10 text-[#67B239]">
              <History className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Billing History & Audit Trail
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Complete searchable audit ledger of all client invoices and payments.
          </p>
        </div>

        <Button
          variant="outline"
          className="gap-1.5 text-xs font-medium h-9 rounded-xl self-start sm:self-auto bg-white dark:bg-card border-slate-200 dark:border-border"
          onClick={handleExportCSV}
        >
          <Download className="size-3.5 text-[#67B239]" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="All Bills"
          value={String(allBillsCount)}
          hint={`Total: ${formatCurrency(allBillsTotal)}`}
          icon={Receipt}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Paid Bills"
          value={String(paidCount)}
          hint={`Cleared: ${formatCurrency(paidTotal)}`}
          icon={CheckCircle2}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Pending / Due"
          value={String(pendingCount)}
          hint={`Outstanding: ${formatCurrency(pendingTotal)}`}
          icon={Clock}
          colorScheme="pastelPeach"
        />
        <StatCard
          label="Cancelled Bills"
          value={String(cancelledCount)}
          hint={`Cancelled: ${formatCurrency(cancelledTotal)}`}
          icon={XCircle}
          colorScheme="pastelTeal"
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search client, business, invoice #..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-white dark:bg-card rounded-xl border-slate-200 dark:border-border"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val: string) => {
              setStatusFilter(val as InvoiceStatus | "all");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="flex-1 sm:flex-none sm:w-40 h-9 text-xs rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border">
              <Layers className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partially Paid">Partially Paid</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`flex-1 sm:flex-none h-9 px-3 text-xs font-normal rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border gap-2 ${
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
                  setCurrentPage(1);
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
                      setCurrentPage(1);
                      setCalOpen(false);
                    }}
                  >
                    Clear dates
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {(search || statusFilter !== "all" || dateRange) && (
            <Button
              variant="outline"
              size="icon"
              onClick={resetFilters}
              title="Reset Filters"
              className="h-9 w-9 rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Billing Ledger History ({totalFilteredCount})
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {totalFilteredCount > 0 ? startIndex + 1 : 0}–
              {Math.min(startIndex + pageSize, totalFilteredCount)} of {totalFilteredCount} bills
            </CardDescription>
          </div>
        </CardHeader>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Client ID</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Due Amount</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Bill Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={10} className="py-4 px-4">
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-muted-foreground">
                    <History className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-foreground">
                      No billing history records found
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Adjust your search terms or date range filters.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 max-w-44">
                      <div className="font-semibold text-foreground truncate">
                        {inv.prospect_name}
                      </div>
                      {inv.business_name && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          {inv.business_name}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                      #{inv.prospect_id}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-foreground">
                      {formatCurrency(inv.total_amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(inv.paid_amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold">
                      <span
                        className={
                          inv.due_amount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400"
                        }
                      >
                        {formatCurrency(inv.due_amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-48">
                      <p
                        className="line-clamp-1 text-muted-foreground text-xs"
                        title={inv.description}
                      >
                        {inv.description}
                      </p>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400 text-xs">
                      {inv.bill_date}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(inv.status)}</td>

                    <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground text-xs">
                      {inv.created_by_name}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-slate-400 shrink-0" />
                        <span>
                          {new Date(inv.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {paginatedInvoices.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs p-4">
              No billing history records match your filters.
            </div>
          ) : (
            paginatedInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 space-y-2.5 text-xs hover:bg-slate-50 dark:hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-foreground">{inv.invoice_number}</span>
                  {getStatusBadge(inv.status)}
                </div>
                <div className="font-semibold text-foreground text-sm">
                  {inv.prospect_name} {inv.business_name ? `(${inv.business_name})` : ""}
                </div>
                <p className="text-muted-foreground text-xs line-clamp-2">{inv.description}</p>
                <div className="grid grid-cols-3 gap-2 bg-slate-50/80 dark:bg-muted/30 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Total
                    </span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(inv.total_amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Paid
                    </span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(inv.paid_amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Due
                    </span>
                    <span className="font-bold text-rose-600">
                      {formatCurrency(inv.due_amount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <span>Bill Date: {inv.bill_date}</span>
                  <span>By: {inv.created_by_name}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800/80 gap-3 text-xs bg-slate-50/30 dark:bg-muted/10">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val: string) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-16 h-7 text-xs rounded-lg bg-white dark:bg-card border-slate-200 dark:border-border">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-muted-foreground">
              Page {validCurrentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 rounded-lg bg-white dark:bg-card border-slate-200 dark:border-border"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 rounded-lg bg-white dark:bg-card border-slate-200 dark:border-border"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
