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
  CalendarCheck,
  FileSpreadsheet,
  PackageCheck,
  Briefcase,
  Users,
  FileText,
  Plus,
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
import { ScheduledFollowUpsTable } from "@/components/dashboard/scheduled-follow-ups-table";
import { ProjectAssignmentsList } from "@/components/dashboard/project-assignments-list";
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
  computeDeliveredCount,
  computeFinanceSummary,
  dashboardActivityCountsQuery,
  computeOrderStatusSteps,
  dashboardExpenseQuery,
  dashboardExpenseSeriesQuery,
  computeSalesExpenseSeries,
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
  const deliveredCount = computeDeliveredCount(ordersQuery.data ?? [], range, filterUserId);
  const activityCounts = useQuery({
    ...dashboardActivityCountsQuery(range, isAdmin ? filterUserId : userId),
    enabled: Boolean(userId),
  });
  const projectSteps = computeOrderStatusSteps(ordersQuery.data ?? [], range, filterUserId);
  const pipelineQuery = useQuery({
    ...prospectStageStepsQuery(range, isAdmin ? filterUserId : userId),
    enabled: Boolean(userId),
  });
  const m = metrics.data;

  // Your Performance: share of prospects (created in the range, user-filtered) that reached Sales Won
  const totalLeads = m?.total_prospects ?? 0;
  const conversionRate = totalLeads > 0 ? Math.round(((m?.won_sales ?? 0) / totalLeads) * 100) : 0;

  const expenseSeriesQuery = useQuery({
    ...dashboardExpenseSeriesQuery(range, isAdmin ? filterUserId : userId),
    enabled: Boolean(userId),
  });
  const salesExpenseSeries = computeSalesExpenseSeries(
    ordersQuery.data ?? [],
    expenseSeriesQuery.data ?? {},
    range,
    filterUserId,
  );

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
        <FinanceSummaryCard
          label="Meeting Scheduled"
          amount={activityCounts.data?.meetings ?? 0}
          isCount
          count={activityCounts.data?.meetings ?? 0}
          countLabel="meetings"
          icon={CalendarCheck}
          circleClass="bg-violet-100 dark:bg-violet-500/20"
          iconClass="text-violet-600 dark:text-violet-400"
          loading={activityCounts.isLoading}
        />
        <FinanceSummaryCard
          label="Total Quotation"
          amount={activityCounts.data?.quotations ?? 0}
          isCount
          count={activityCounts.data?.quotations ?? 0}
          countLabel="quotations"
          icon={FileSpreadsheet}
          circleClass="bg-cyan-100 dark:bg-cyan-500/20"
          iconClass="text-cyan-600 dark:text-cyan-400"
          loading={activityCounts.isLoading}
        />
        <FinanceSummaryCard
          label="Total Delivered"
          amount={deliveredCount}
          isCount
          count={deliveredCount}
          countLabel="orders delivered"
          icon={PackageCheck}
          circleClass="bg-green-100 dark:bg-green-500/20"
          iconClass="text-green-600 dark:text-green-400"
          loading={financeLoading}
        />
      </div>

      {/* 3. Middle Section: Revenues and Expenses (Left) & Your Performance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Sales and expenses (8 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[22px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Sales and expenses
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
            salesTotal={finance.totalSales}
            salesCount={finance.salesCount}
            expenseTotal={expenseQuery.data?.total ?? 0}
            expenseCount={expenseQuery.data?.count ?? 0}
            series={salesExpenseSeries}
            isLoading={financeLoading || expenseQuery.isLoading || expenseSeriesQuery.isLoading}
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

          <PerformanceGauge
            percentage={conversionRate}
            successLabel="Lead conversion"
            tasks={[
              {
                id: "qualified",
                label: "Qualified leads",
                progressText: `(${m?.qualified_leads ?? 0}/${totalLeads})`,
                completed: (m?.qualified_leads ?? 0) > 0,
                color: "yellow",
              },
              {
                id: "meetings",
                label: "Meetings scheduled",
                progressText: `(${activityCounts.data?.meetings ?? 0})`,
                completed: (activityCounts.data?.meetings ?? 0) > 0,
                color: "blue",
              },
              {
                id: "won",
                label: "Sales won",
                progressText: `(${m?.won_sales ?? 0}/${totalLeads})`,
                completed: (m?.won_sales ?? 0) > 0,
                color: "green",
              },
            ]}
          />
        </motion.div>
      </div>

      {/* 4. Bottom Section: Scheduled follow-ups (Left) & Project assignments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Scheduled follow-ups (8 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
          className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[22px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Scheduled follow-ups
            </h2>
            <Link
              href="/follow-ups"
              className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <ScheduledFollowUpsTable
            userId={userId}
            isAdmin={isAdmin}
            filterUserId={filterUserId}
            range={range}
          />
        </motion.div>

        {/* Right: Project assignments (4 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[22px] p-6 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Project assignments
            </h2>
            <Link
              href="/projects"
              className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1 group"
            >
              <span>View all</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <ProjectAssignmentsList
            orders={ordersQuery.data ?? []}
            isLoading={ordersQuery.isLoading}
            range={range}
            filterUserId={filterUserId}
          />
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
