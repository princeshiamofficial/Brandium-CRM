"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Eye,
  RotateCcw,
  Layers,
  X,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { useAuth } from "@/lib/auth";
import { runMySQLQuery } from "@/lib/mysql-api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface BillingRecord {
  id: string;
  order_number: string;
  company_name: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  created_at: string;
}

interface BillingMetrics {
  total_revenue: number;
  total_paid: number;
  pending_amount: number;
  invoice_count: number;
}

const ORDER_STATUSES = [
  "Order Submitted",
  "Script Writer",
  "Content Planner",
  "Videographer",
  "Video Graphy Complete",
  "Video Editor",
  "Marketer",
  "Developer",
  "Delivered",
];

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "dd MMM yyyy");
  } catch {
    return dateStr;
  }
}

function getStatusBadge(status: string) {
  const statusLower = (status || "").toLowerCase();

  if (statusLower.includes("delivered")) {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
        Delivered
      </Badge>
    );
  }

  if (statusLower.includes("editor") || statusLower.includes("marketer")) {
    return (
      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200">
        In Progress
      </Badge>
    );
  }

  if (statusLower.includes("submitted")) {
    return (
      <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200">
        Pending
      </Badge>
    );
  }

  return (
    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 border border-slate-200">
      {status || "N/A"}
    </Badge>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Fetch metrics
  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["billing-metrics"],
    queryFn: async () => {
      const result = await runMySQLQuery<
        Array<{ total_revenue: number; total_paid: number; count: number }>
      >(
        `SELECT
          SUM(CAST(total_amount AS DECIMAL(12,2))) AS total_revenue,
          SUM(CAST(paid_amount AS DECIMAL(12,2))) AS total_paid,
          COUNT(*) AS count
        FROM orders
        WHERE is_deleted = 0`,
        [],
      );

      if (!result.success || !result.data || result.data.length === 0) {
        return {
          total_revenue: 0,
          total_paid: 0,
          pending_amount: 0,
          invoice_count: 0,
        };
      }

      const row = result.data[0];
      if (!row) {
        return {
          total_revenue: 0,
          total_paid: 0,
          pending_amount: 0,
          invoice_count: 0,
        };
      }

      const total_revenue = Number(row.total_revenue) || 0;
      const total_paid = Number(row.total_paid) || 0;
      const pending_amount = total_revenue - total_paid;
      const invoice_count = Number(row.count) || 0;

      return {
        total_revenue,
        total_paid,
        pending_amount,
        invoice_count,
      };
    },
  });

  // Fetch billing records
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["billing-orders", search, statusFilter],
    queryFn: async () => {
      let sql = `SELECT
        id,
        order_number,
        company_name,
        status,
        total_amount,
        paid_amount,
        created_at
      FROM orders
      WHERE is_deleted = 0`;

      const params: unknown[] = [];

      // Apply search filter
      if (search.trim()) {
        sql += ` AND (order_number LIKE ? OR company_name LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }

      // Apply status filter
      if (statusFilter !== "all") {
        sql += ` AND status LIKE ?`;
        params.push(`%${statusFilter}%`);
      }

      sql += ` ORDER BY created_at DESC`;

      const result = await runMySQLQuery<BillingRecord[]>(sql, params);

      if (!result.success || !result.data) {
        return [];
      }

      return result.data as BillingRecord[];
    },
  });

  const orders = useMemo(() => (Array.isArray(ordersData) ? ordersData : []), [ordersData]);

  // Pagination
  const totalPages = Math.ceil(orders.length / pageSize);
  const paginatedOrders = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return orders.slice(startIdx, startIdx + pageSize);
  }, [orders, currentPage]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const isLoading = metricsLoading || ordersLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
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
                Track orders, payments, and financial analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((idx) => (
              <Card key={idx} className="border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs text-muted-foreground font-medium">
                    <Skeleton className="h-3 w-20 rounded" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32 rounded mb-2" />
                  <Skeleton className="h-2 w-24 rounded" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              label="Total Revenue"
              value={formatCurrency(metricsData?.total_revenue || 0)}
              icon={DollarSign}
              colorScheme="pastelTeal"
            />
            <StatCard
              label="Pending Amount"
              value={formatCurrency(metricsData?.pending_amount || 0)}
              icon={AlertCircle}
              colorScheme="pastelPeach"
            />
            <StatCard
              label="Total Paid"
              value={formatCurrency(metricsData?.total_paid || 0)}
              icon={CheckCircle2}
              colorScheme="pastelEmerald"
            />
            <StatCard
              label="Invoice Count"
              value={String(metricsData?.invoice_count || 0)}
              icon={CreditCard}
              colorScheme="pastelPurple"
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-xs lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search order# or company..."
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

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="flex-1 sm:flex-none sm:w-44 h-9 text-xs rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border">
              <Layers className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(search || statusFilter !== "all") && (
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

      {/* Table */}
      {isLoading ? (
        <Card className="border-slate-200/80 dark:border-slate-800 rounded-xl">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((idx) => (
                <Skeleton key={idx} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="border-slate-200/80 dark:border-slate-800 rounded-xl">
          <CardContent className="p-12 text-center">
            <Receipt className="size-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="font-bold text-foreground text-base">No billing records found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Adjust your filters or create new orders to see them here.
            </p>
            <Button
              onClick={resetFilters}
              variant="outline"
              size="sm"
              className="mt-4 text-xs gap-1.5"
            >
              <RotateCcw className="size-3" />
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 py-3 px-4">
                    Order #
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 py-3 px-4">
                    Company
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 py-3 px-4">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 py-3 px-4 text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 py-3 px-4 text-right">
                    Paid
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 py-3 px-4 text-right">
                    Due
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 py-3 px-4">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 dark:text-slate-300 py-3 px-4 text-center">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => {
                  const due = order.total_amount - order.paid_amount;
                  return (
                    <TableRow
                      key={order.id}
                      className="border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <TableCell className="text-xs font-semibold text-slate-900 dark:text-slate-100 py-3 px-4 font-mono">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300 py-3 px-4">
                        <span title={order.company_name} className="line-clamp-1">
                          {order.company_name || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs py-3 px-4">
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 py-3 px-4 text-right">
                        {formatCurrency(order.total_amount)}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 py-3 px-4 text-right">
                        {formatCurrency(order.paid_amount)}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400 py-3 px-4 text-right">
                        {formatCurrency(due)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400 py-3 px-4">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-xs py-3 px-4 text-center">
                        <Link href={`/track/${order.order_number}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-600 dark:text-slate-400 hover:text-[#67B239] hover:dark:text-[#67B239] hover:bg-[#67B239]/10"
                            title="View Order"
                          >
                            <Eye className="size-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && orders.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, orders.length)} of {orders.length} orders
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-xs h-8"
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 p-0 text-xs ${
                    currentPage === page
                      ? "bg-[#67B239] hover:bg-[#5aa030] text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-xs h-8"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
