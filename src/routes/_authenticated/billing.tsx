import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Ban,
  CreditCard,
  RotateCcw,
  Calendar as CalendarIcon,
  Layers,
  X,
  FileText,
  Printer,
  Trash2,
  User,
  MoreVertical,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { StatCard } from "@/components/stat-card";
import {
  invoicesQueryOptions,
  InvoiceFilters,
  InvoiceStatus,
  Invoice,
  cancelInvoice,
  deleteInvoice,
} from "@/lib/billing";
import { useAuth } from "@/lib/auth";
import { BillingRecordPaymentModal } from "@/components/billing-record-payment-modal";
import { AddInvoiceDialog } from "@/components/add-invoice-dialog";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({
    meta: [
      { title: "Billing | Brandium Telesales CRM" },
      {
        name: "description",
        content: "Manage client invoices, payments, and financial due calculations.",
      },
      { property: "og:title", content: "Billing | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Manage client invoices, payments, and financial due calculations.",
      },
    ],
  }),
  component: BillingPage,
});

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function BillingPage() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);

  const [payModalState, setPayModalState] = useState<{
    open: boolean;
    invoice: Invoice | null;
  }>({ open: false, invoice: null });

  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [editInvoiceState, setEditInvoiceState] = useState<Invoice | null>(null);

  const filters: InvoiceFilters = {
    search,
    status: statusFilter,
    from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const { data: rawInvoices = [], isLoading } = useQuery(
    invoicesQueryOptions(filters, user?.id, isAdmin),
  );
  const invoices = Array.isArray(rawInvoices) ? rawInvoices : [];

  const totalInvoiceCount = invoices.length;
  const totalBilledRevenue = invoices.reduce((acc, curr) => acc + curr.total_amount, 0);
  const totalPaidRevenue = invoices.reduce((acc, curr) => acc + curr.paid_amount, 0);
  const totalDueRevenue = invoices.reduce((acc, curr) => acc + curr.due_amount, 0);

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice marked as cancelled.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to cancel invoice.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity-summary"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["denied-payments"] });
      queryClient.invalidateQueries({ queryKey: ["won-sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Invoice deleted successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete invoice.");
    },
  });

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateRange(undefined);
  };

  const printInvoice = (inv: Invoice) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${inv.invoice_number}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; }
            .brand { font-size: 18px; font-weight: bold; color: #67B239; }
            .section { margin-top: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
            .box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
            .val { font-size: 16px; font-weight: bold; margin-top: 4px; color: #0f172a; }
            .amount-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; }
            .due { color: #e11d48; font-size: 18px; font-weight: 900; }
            .paid { color: #16a34a; font-weight: bold; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">Brandium Telesales CRM</div>
              <div class="title">INVOICE: ${inv.invoice_number}</div>
            </div>
            <div style="text-align: right;">
              <div><strong>Status:</strong> ${inv.status}</div>
              <div><strong>Bill Date:</strong> ${inv.bill_date}</div>
              <div><strong>Due Date:</strong> ${inv.due_date}</div>
            </div>
          </div>
          <div class="section grid">
            <div class="box">
              <div class="label">Billed To</div>
              <div class="val">${inv.prospect_name}</div>
              <div>${inv.business_name || ""}</div>
              <div>${inv.client_phone || ""}</div>
              <div>${inv.client_email || ""}</div>
            </div>
            <div class="box">
              <div class="label">Service Description</div>
              <div class="val">${inv.description}</div>
              <div style="margin-top: 8px; font-size: 13px; color: #64748b;">Created by: ${inv.created_by_name || "TSE Agent"}</div>
            </div>
          </div>
          <div class="section box" style="margin-top: 24px;">
            <div class="amount-row"><span>Total Amount:</span><strong>${formatCurrency(inv.total_amount)}</strong></div>
            <div class="amount-row"><span class="paid">Paid Amount:</span><strong class="paid">${formatCurrency(inv.paid_amount)}</strong></div>
            <div class="amount-row" style="border-bottom: none; font-size: 18px;"><span class="due">Due Balance:</span><strong class="due">${formatCurrency(inv.due_amount)}</strong></div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportSingleInvoicePDF = (inv: Invoice) => {
    printInvoice(inv);
    toast.success(`Generated printable PDF for ${inv.invoice_number}`);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
            Paid
          </Badge>
        );
      case "Partially Paid":
        return (
          <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
            Partially Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-md">
            Pending
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-md"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#67B239]/10 text-[#67B239]">
              <Receipt className="size-6 sm:size-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Billing & Invoices
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Client billing, invoice creation, payment recording, and financial due calculations.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            setEditInvoiceState(null);
            setIsAddInvoiceOpen(true);
          }}
          className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 w-full sm:w-auto h-10 px-4 rounded-xl font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="size-4" />
          Add Bill / Create Invoice
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          label="Total Invoices"
          value={String(totalInvoiceCount)}
          icon={Receipt}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Total Billed"
          value={formatCurrency(totalBilledRevenue)}
          icon={DollarSign}
          colorScheme="pastelTeal"
        />
        <StatCard
          label="Total Collected (Paid)"
          value={formatCurrency(totalPaidRevenue)}
          icon={CheckCircle2}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Outstanding Due Balance"
          value={formatCurrency(totalDueRevenue)}
          icon={AlertCircle}
          colorScheme="pastelPeach"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-xs lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search client, business, invoice #..."
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

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(val: string) => setStatusFilter(val as InvoiceStatus | "all")}
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

      {/* Modern 4-Column Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-card border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 space-y-4 shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
              <div className="space-y-2 py-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
              </div>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 shadow-xs p-12 text-center rounded-2xl">
          <Receipt className="size-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="font-bold text-foreground text-base">
            No billing records match your search filters
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Create a new invoice or adjust the filter parameters above.
          </p>
          <Button
            onClick={() => {
              setEditInvoiceState(null);
              setIsAddInvoiceOpen(true);
            }}
            className="mt-4 bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 text-xs rounded-xl cursor-pointer"
          >
            <Plus className="size-3.5" />
            Create First Invoice
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white dark:bg-card border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
            >
              {/* Card Header & Content */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate"
                      title={inv.business_name || inv.prospect_name}
                    >
                      {inv.business_name || inv.prospect_name || "Client Business"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono font-medium mt-0.5">
                      ID: {inv.invoice_number.replace(/^INV-/, "") || inv.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {getStatusBadge(inv.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted"
                          title="More actions"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditInvoiceState(inv);
                            setIsAddInvoiceOpen(true);
                          }}
                          className="cursor-pointer gap-2 text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          <Edit className="size-3.5 text-blue-600" />
                          Edit Bill
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={inv.status === "Paid" || inv.status === "Cancelled"}
                          onClick={() => setPayModalState({ open: true, invoice: inv })}
                          className="cursor-pointer gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                        >
                          <CreditCard className="size-3.5 text-emerald-600" />
                          Mark Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={inv.status === "Cancelled" || inv.status === "Paid"}
                          onClick={() => {
                            if (
                              confirm(`Are you sure you want to cancel Bill ${inv.invoice_number}?`)
                            ) {
                              cancelMutation.mutate(inv.id);
                            }
                          }}
                          className="cursor-pointer gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                        >
                          <Ban className="size-3.5 text-amber-600" />
                          Cancel Bill
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete Bill ID ${inv.invoice_number}?`,
                              )
                            ) {
                              deleteMutation.mutate(inv.id);
                            }
                          }}
                          className="cursor-pointer gap-2 text-xs font-medium text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50"
                        >
                          <Trash2 className="size-3.5 text-rose-600" />
                          Delete Bill
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-1.5 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Total Amount:</span>
                    <span className="font-bold text-slate-950 dark:text-slate-50 font-mono text-sm">
                      {formatCurrency(inv.total_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Paid Amount:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatCurrency(inv.paid_amount)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200/80 dark:border-slate-800 my-1.5" />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Due Amount:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">
                      {formatCurrency(inv.due_amount)}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-2.5 border-t border-slate-100 dark:border-slate-800 mt-2 gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-slate-500 shrink-0" />
                    <span>Bill Date: {inv.bill_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-slate-500 shrink-0" />
                    <span>Due Date: {inv.due_date}</span>
                  </div>
                </div>

                {/* Created By & Service Description */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="size-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">
                      Created By:{" "}
                      <strong className="text-foreground font-semibold">
                        {inv.created_by_name || "TSE Agent"}
                      </strong>
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 text-muted-foreground truncate"
                    title={inv.description}
                  >
                    <FileText className="size-3.5 text-slate-500 shrink-0" />
                    <span className="text-foreground font-medium truncate">
                      {inv.description || "Sales Won - Service"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Container */}
              <div className="bg-[#f0f5fc] dark:bg-muted/40 p-2 sm:p-2.5 rounded-xl mt-2">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#fdf6e9] hover:bg-[#faebd0] text-amber-900 border-[#f2deba] font-bold text-[11px] h-8 px-1 rounded-lg gap-1 cursor-pointer"
                    asChild
                  >
                    <Link to="/billing-history">
                      View <Eye className="size-3" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#e1effe] hover:bg-[#d0e5fc] text-blue-900 border-[#c3ddfd] font-bold text-[11px] h-8 px-1 rounded-lg gap-1 cursor-pointer"
                    onClick={() => exportSingleInvoicePDF(inv)}
                  >
                    PDF <FileText className="size-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-slate-100 text-slate-800 border-slate-200 font-bold text-[11px] h-8 px-1 rounded-lg gap-1 cursor-pointer"
                    onClick={() => printInvoice(inv)}
                  >
                    Print <Printer className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      <BillingRecordPaymentModal
        open={payModalState.open}
        onOpenChange={(open) => setPayModalState((prev) => ({ ...prev, open }))}
        invoice={payModalState.invoice}
      />

      {/* Add / Edit Invoice Dialog */}
      <AddInvoiceDialog
        open={isAddInvoiceOpen}
        onOpenChange={setIsAddInvoiceOpen}
        invoiceToEdit={editInvoiceState}
      />
    </div>
  );
}
