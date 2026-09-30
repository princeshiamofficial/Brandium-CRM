"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  DateRangePicker3,
  getDateRangeForPredefined,
} from "@/components/dashboard/date-range-picker3";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  Users,
  FileText,
  Plus,
  Receipt,
  ReceiptText,
  Repeat,
  ShoppingCart,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { RevenueExpenseChart } from "@/components/dashboard/revenue-expense-chart";
import { PerformanceGauge } from "@/components/dashboard/performance-gauge";
import { ActiveDealsTable, DealItem } from "@/components/dashboard/active-deals-table";
import { PendingTasksList, PendingTaskItem } from "@/components/dashboard/pending-tasks-list";
import { AddProspectDialog } from "@/components/add-prospect-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { crmUsersQueryOptions } from "@/lib/admin-users";
import { useAuth } from "@/lib/auth";
import { dashboardMetricsQuery, type DashboardDateRange } from "@/lib/dashboard";
import {
  computeFinanceSummary,
  computeOrderStatusSteps,
  dashboardExpenseQuery,
  prospectStageStepsQuery,
} from "@/lib/dashboard-finance";
import { StatusOverviewCard } from "@/components/dashboard/status-timeline";
import { ordersQueryOptions } from "@/lib/orders";
import { FinanceSummaryCard } from "@/components/dashboard/finance-summary-card";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const userId = user?.id ?? "";

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    getDateRangeForPredefined("thisMonth"),
  );
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const { data: crmUsers = [] } = useQuery({ ...crmUsersQueryOptions(), enabled: isAdmin });
  const userOptions = crmUsers.filter((u) => u.status === "Active" && !u.is_deleted);
  const [isNewPitchOpen, setIsNewPitchOpen] = useState(false);

  const range: DashboardDateRange = {
    from: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    to: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };
  const filterUserId = isAdmin && selectedUser !== "all" ? selectedUser : undefined;

  const metrics = useQuery({
    ...dashboardMetricsQuery(userId, isAdmin, filterUserId, range),
    enabled: Boolean(userId),
  });

  const ordersQuery = useQuery({
    ...ordersQueryOptions(userId, isAdmin),
    enabled: Boolean(userId),
  });
  const expenseQuery = useQuery({
    ...dashboardExpenseQuery(range, isAdmin ? filterUserId : userId),
    enabled: Boolean(userId),
  });
  const finance = computeFinanceSummary(ordersQuery.data ?? [], range, filterUserId);
  const financeLoading = ordersQuery.isLoading;
  const projectSteps = computeOrderStatusSteps(ordersQuery.data ?? [], range, filterUserId);
  const pipelineQuery = useQuery({
    ...prospectStageStepsQuery(range, isAdmin ? filterUserId : userId),
    enabled: Boolean(userId),
  });
  const m = metrics.data;

  const revenueFormatted = `৳${(m?.total_sales ?? 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;

  const expenseFormatted = m?.paid_sales
    ? `$${(m.total_sales - m.paid_sales > 0 ? m.total_sales - m.paid_sales : 2523).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "$2523,00";

  // Active Deals List
  const activeDeals: DealItem[] = [
    {
      id: "1",
      clientName: "Lena Harper",
      clientEmail: "lena.harper@influxmedia.co",
      clientAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      task: "Summer Collab with Glossi..",
      dueDate: "May 21",
      dueDateRaw: "2025-05-21",
      revenue: 125,
      status: "In progress",
    },
    {
      id: "2",
      clientName: "Sophie Kim",
      clientEmail: "sophie.kim@creatorhive.com",
      clientAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      task: "Back-to-School with Notio..",
      dueDate: "May 11",
      dueDateRaw: "2025-05-11",
      revenue: 320,
      status: "Pending",
    },
    {
      id: "3",
      clientName: "Noah Bennett",
      clientEmail: "noah.b@bennettstudio.com",
      clientAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      task: "YouTube Integration for Sq..",
      dueDate: "May 19",
      dueDateRaw: "2025-05-19",
      revenue: 450,
      status: "Completed",
    },
  ];

  // Pending Tasks List
  const pendingTasks: PendingTaskItem[] = [
    {
      id: "1",
      title: "Invoice for Notion collab",
      dueDate: "May 4, 2025",
      priority: "High",
      platform: "notion",
    },
    {
      id: "2",
      title: "Tik Tok reels for Nical..",
      dueDate: "May 7, 2025",
      priority: "Medium",
      platform: "tiktok",
    },
    {
      id: "3",
      title: "Follow up with Gymshark",
      dueDate: "May 13, 2025",
      priority: "Low",
      platform: "instagram",
    },
  ];

  return (
    <div className="w-full space-y-6 pb-8">
      {/* 1. Header Bar: Title + Timeframe Selector + New Pitch Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {isAdmin && (
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="h-10 px-4 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors w-48 gap-2">
                <UserRound className="size-4 text-slate-400 shrink-0" />
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                <SelectItem value="all">All users</SelectItem>
                {userOptions.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    <span className="flex items-center gap-2">
                      <Avatar className="size-5">
                        {u.avatar_url && <AvatarImage src={u.avatar_url} alt={u.name} />}
                        <AvatarFallback className="bg-[#67B239]/15 text-[#67B239] text-[10px] font-semibold">
                          {u.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {u.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <DateRangePicker3
            initialRange={dateRange}
            onDateRangeChange={(range) => setDateRange(range)}
            align="end"
            className="h-10 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"
          />

          {/* New Pitch CTA Button */}
          <button
            onClick={() => setIsNewPitchOpen(true)}
            className="h-10 px-5 rounded-full bg-[#fce3a2] hover:bg-[#fad886] text-slate-900 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>New Pitch</span>
          </button>
        </div>
      </div>

      {/* Sales summary cards (ERPAPP definitions, driven by orders, payments and expenses) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <FinanceSummaryCard
          label="Total Sales"
          amount={finance.totalSales}
          count={finance.salesCount}
          countLabel="orders"
          icon={ShoppingCart}
          circleClass="bg-sky-100 dark:bg-sky-500/20"
          iconClass="text-sky-600 dark:text-sky-400"
          loading={financeLoading}
        />
        <FinanceSummaryCard
          label="Invoice Due"
          amount={finance.invoiceDue}
          count={finance.dueCount}
          countLabel="orders with due"
          icon={FileText}
          circleClass="bg-amber-100 dark:bg-amber-500/20"
          iconClass="text-amber-600 dark:text-amber-400"
          loading={financeLoading}
        />
        <FinanceSummaryCard
          label="Advance Paid"
          amount={finance.advancePaid}
          count={finance.advancePaidCount}
          countLabel="payments"
          icon={Receipt}
          circleClass="bg-teal-100 dark:bg-teal-500/20"
          iconClass="text-teal-600 dark:text-teal-400"
          loading={financeLoading}
        />
        <FinanceSummaryCard
          label="Cash Collection"
          amount={finance.cashCollection}
          count={finance.cashCollectionCount}
          countLabel="payments"
          icon={Wallet}
          circleClass="bg-indigo-100 dark:bg-indigo-500/20"
          iconClass="text-indigo-600 dark:text-indigo-400"
          loading={financeLoading}
        />
        <FinanceSummaryCard
          label="Expense"
          amount={expenseQuery.data?.total ?? 0}
          count={expenseQuery.data?.count ?? 0}
          countLabel="expenses"
          icon={ReceiptText}
          circleClass="bg-rose-100 dark:bg-rose-500/20"
          iconClass="text-rose-600 dark:text-rose-400"
          loading={expenseQuery.isLoading}
        />
        <FinanceSummaryCard
          label="Repeat Sales"
          amount={finance.repeatSales}
          count={finance.repeatSalesCount}
          countLabel="repeat orders"
          icon={Repeat}
          circleClass="bg-emerald-100 dark:bg-emerald-500/20"
          iconClass="text-emerald-600 dark:text-emerald-400"
          loading={financeLoading}
        />
      </div>

      {/* 3. Middle Section: Revenues and Expenses (Left) & Your Performance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Revenues and expenses (8 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[22px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Revenues and expenses
            </h2>
            <Link
              href="/expenses"
              className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <RevenueExpenseChart
            revenueTotal={revenueFormatted}
            revenueChange="+5.2%"
            expenseTotal={expenseFormatted}
            expenseChange="-1.7%"
          />
        </motion.div>

        {/* Right: Your Performance (4 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[22px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Your Performance
            </h2>
            <Link
              href="/reports"
              className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <PerformanceGauge percentage={88} successLabel="Success" />
        </motion.div>
      </div>

      {/* 4. Bottom Section: Active deals (Left) & Pending tasks (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Active deals (8 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
          className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[22px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Active deals
            </h2>
            <Link
              href="/prospects"
              className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <ActiveDealsTable deals={activeDeals} />
        </motion.div>

        {/* Right: Pending tasks (4 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[22px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Pending tasks
            </h2>
            <Link
              href="/meetings"
              className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <PendingTasksList tasks={pendingTasks} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 print:hidden">
        <StatusOverviewCard
          title="Project Overview"
          description="Project distribution by status for the selected period."
          icon={Briefcase}
          steps={projectSteps}
          isLoading={financeLoading}
        />
        <StatusOverviewCard
          title="Prospect Overview"
          description="Prospect distribution by stage for the selected period."
          icon={Users}
          steps={pipelineQuery.data ?? []}
          isLoading={pipelineQuery.isLoading}
        />
      </div>

      {/* Add Prospect / New Pitch Modal */}
      <AddProspectDialog
        open={isNewPitchOpen}
        onOpenChange={setIsNewPitchOpen}
        onSuccess={() => {
          metrics.refetch();
        }}
      />
    </div>
  );
}
