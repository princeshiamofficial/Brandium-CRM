"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  RotateCcw,
  LayoutGrid,
  List,
  MoreVertical,
  Eye,
  Phone,
  Building2,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CalendarIcon,
  Check,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FollowUpDialog } from "@/components/follow-up-dialog";
import { FollowUpDetailModal } from "@/components/follow-up-detail-modal";
import {
  followUpsQuery,
  followUpSummaryQuery,
  useSetFollowUpStatus,
  statusBadgeVariant,
  agentsQuery,
  type FollowUp,
  type FollowUpStatus,
  type FollowUpFilters,
} from "@/lib/follow-ups";
import { formatCrmDateTime } from "@/lib/mysql-client";

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
        <div className="size-10 sm:size-11 rounded-full bg-white dark:bg-card shadow-2xs flex items-center justify-center shrink-0">
          <Icon className={`size-5 sm:size-5.5 ${styles.iconText}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight mt-0.5 tracking-tight truncate">
            {value}
          </p>
        </div>
      </div>

      <div className="absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transform rotate-12 scale-125 transition-transform group-hover:scale-135">
        <Icon className="size-24 text-current" />
      </div>
    </div>
  );
}

function FollowUpStatusBadge({ status }: { status: FollowUpStatus }) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5"
        >
          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Completed
        </Badge>
      );
    case "overdue":
      return (
        <Badge
          variant="destructive"
          className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5"
        >
          <AlertCircle className="size-3.5 text-rose-600 dark:text-rose-400" /> Overdue
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5"
        >
          <XCircle className="size-3.5 text-slate-500 dark:text-slate-400" /> Cancelled
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5"
        >
          <Clock3 className="size-3.5 text-amber-600 dark:text-amber-400" /> Pending
        </Badge>
      );
  }
}

export default function FollowUpsPage() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<"all" | "phone" | "business" | "note">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>(undefined);
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);

  // Dialog & Modal states
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleProspectId, setScheduleProspectId] = useState<string | undefined>(undefined);
  const [scheduleProspectLabel, setScheduleProspectLabel] = useState<string | undefined>(undefined);

  const [detailFollowUp, setDetailFollowUp] = useState<FollowUp | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Quick Status update mutation
  const statusMutation = useSetFollowUpStatus();

  const handleQuickStatus = (item: FollowUp, newStatus: "completed" | "cancelled" | "pending") => {
    statusMutation.mutate(
      {
        id: item.id,
        status: newStatus,
        prospectId: item.prospect_id,
        prospectName: item.prospect_name,
        note: item.note || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Follow-up marked as ${newStatus}`);
          queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
          queryClient.invalidateQueries({ queryKey: ["follow-up-summary"] });
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update status");
        },
      },
    );
  };

  const filters: FollowUpFilters = useMemo(
    () => ({
      page,
      search: search.trim() || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      agent: agentFilter !== "all" ? agentFilter : undefined,
      from: dateFromFilter ? format(dateFromFilter, "yyyy-MM-dd") : undefined,
      to: dateToFilter ? format(dateToFilter, "yyyy-MM-dd") : undefined,
    }),
    [page, search, statusFilter, agentFilter, dateFromFilter, dateToFilter],
  );

  const followUpsResult = useQuery(followUpsQuery(filters, user?.id ?? "", Boolean(isAdmin)));
  const summaryResult = useQuery(followUpSummaryQuery(user?.id ?? "", Boolean(isAdmin)));
  const agentsResult = useQuery(agentsQuery());

  const followUpItems = followUpsResult.data?.data ?? [];
  const totalCount = followUpsResult.data?.count ?? 0;
  const pageCount = followUpsResult.data?.pageCount ?? 1;

  const summary = summaryResult.data ?? {
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
  };

  const agentsList = useMemo(
    () =>
      (Array.isArray(agentsResult.data) ? agentsResult.data : []) as { id: string; name: string }[],
    [agentsResult.data],
  );

  const resetFilters = () => {
    setSearch("");
    setSearchField("all");
    setStatusFilter("all");
    setAgentFilter("all");
    setDateFromFilter(undefined);
    setDateToFilter(undefined);
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    agentFilter !== "all" ||
    dateFromFilter !== undefined ||
    dateToFilter !== undefined;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-['Golos_Text',sans-serif]">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Follow-up Tasks
            </h1>
            <span className="bg-[#FEE2E2] text-[#EF1E1E] rounded-md px-2 py-0.5 text-xs font-semibold">
              {totalCount}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track, manage, and schedule client follow-up calls and stage activity timeline.
          </p>
        </div>

        <Button
          onClick={() => {
            setScheduleProspectId(undefined);
            setScheduleProspectLabel(undefined);
            setScheduleOpen(true);
          }}
          className="bg-[#67B239] hover:bg-[#5aa030] text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all shrink-0 cursor-pointer h-10 px-4 flex items-center gap-1.5 text-sm"
        >
          <Plus className="size-4" />
          <span>Schedule Follow-up</span>
        </Button>
      </div>

      {/* 2. KPI Summary Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Total Tasks"
          value={summary.total}
          icon={CalendarClock}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Pending Calls"
          value={summary.pending}
          icon={Clock3}
          colorScheme="pastelTeal"
        />
        <StatCard
          label="Completed"
          value={summary.completed}
          icon={CheckCircle2}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Overdue"
          value={summary.overdue}
          icon={AlertCircle}
          colorScheme="pastelPeach"
        />
        <StatCard
          label="Cancelled"
          value={summary.cancelled}
          icon={XCircle}
          colorScheme="pastelYellow"
        />
      </div>

      {/* 3. Search, Filter & View Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-card p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {/* Left: Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={
                searchField === "phone"
                  ? "Search by phone..."
                  : searchField === "business"
                    ? "Search by business..."
                    : searchField === "note"
                      ? "Search by note..."
                      : "Search follow-ups..."
              }
              className="pl-9 h-9.5 text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900"
            />
          </div>

          {/* Search Field Selector */}
          <Select
            value={searchField}
            onValueChange={(val: any) => {
              setSearchField(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[120px] h-9.5 text-xs font-medium rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
              <SelectItem value="all">All Fields</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="note">Note</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Select */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-9.5 text-xs font-medium rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Agent Filter (Admin / Shared) */}
          {isAdmin && (
            <Select
              value={agentFilter}
              onValueChange={(val) => {
                setAgentFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-9.5 text-xs font-medium rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                <SelectItem value="all">All Agents</SelectItem>
                {agentsList.map((ag) => (
                  <SelectItem key={ag.id} value={ag.id}>
                    {ag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date Range Picker Popovers */}
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-9.5 px-3 text-xs font-medium rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 ${
                    dateFromFilter ? "text-blue-600 dark:text-blue-400 border-blue-200" : ""
                  }`}
                >
                  <CalendarIcon className="size-3.5" />
                  <span>{dateFromFilter ? format(dateFromFilter, "dd MMM") : "From"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 rounded-2xl border-slate-200 dark:border-slate-800"
                align="start"
              >
                <CalendarPicker
                  mode="single"
                  selected={dateFromFilter}
                  onSelect={(d) => {
                    setDateFromFilter(d);
                    setPage(1);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-xs text-slate-400">—</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-9.5 px-3 text-xs font-medium rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 ${
                    dateToFilter ? "text-blue-600 dark:text-blue-400 border-blue-200" : ""
                  }`}
                >
                  <CalendarIcon className="size-3.5" />
                  <span>{dateToFilter ? format(dateToFilter, "dd MMM") : "To"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 rounded-2xl border-slate-200 dark:border-slate-800"
                align="start"
              >
                <CalendarPicker
                  mode="single"
                  selected={dateToFilter}
                  onSelect={(d) => {
                    setDateToFilter(d);
                    setPage(1);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9.5 px-2.5 text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 gap-1 rounded-lg"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Right: Layout View Switcher */}
        <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 p-1 rounded-lg bg-slate-50 dark:bg-slate-900 shrink-0 self-end md:self-auto">
          <Button
            type="button"
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={`h-7.5 px-2.5 text-xs rounded-md font-medium cursor-pointer transition-colors ${
              viewMode === "grid"
                ? "bg-[#0a2e5c] text-white hover:bg-[#082244]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <LayoutGrid className="size-3.5 mr-1" />
            <span>Cards</span>
          </Button>
          <Button
            type="button"
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className={`h-7.5 px-2.5 text-xs rounded-md font-medium cursor-pointer transition-colors ${
              viewMode === "table"
                ? "bg-[#0a2e5c] text-white hover:bg-[#082244]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <List className="size-3.5 mr-1" />
            <span>Table</span>
          </Button>
        </div>
      </div>

      {/* 4. Content Area: Grid View vs Table View */}
      {followUpsResult.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 animate-pulse p-5"
            />
          ))}
        </div>
      ) : followUpItems.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4">
            <CalendarClock className="size-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No follow-up tasks found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5">
            {hasActiveFilters
              ? "No follow-up records match the active search filters. Try adjusting your query or resetting filters."
              : "You do not have any pending follow-up calls or tasks scheduled. Click below to add one."}
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="rounded-lg text-xs"
              >
                Reset Filters
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => {
                setScheduleProspectId(undefined);
                setScheduleProspectLabel(undefined);
                setScheduleOpen(true);
              }}
              className="bg-[#67B239] hover:bg-[#5aa030] text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="size-3.5 mr-1" />
              Schedule Follow-up
            </Button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Grid View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {followUpItems.map((item) => {
            const isDueOverdue = item.effective_status === "overdue";
            const isCompleted = item.effective_status === "completed";

            return (
              <div
                key={item.id}
                onClick={() => {
                  setDetailFollowUp(item);
                  setDetailModalOpen(true);
                }}
                className={`group relative rounded-xl border bg-white dark:bg-card p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer select-none ${
                  isDueOverdue
                    ? "border-rose-200/90 dark:border-rose-950/70 hover:border-rose-300"
                    : isCompleted
                      ? "border-emerald-200/90 dark:border-emerald-950/70 hover:border-emerald-300"
                      : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Top: Avatar + Name / Business + 3-Dot Action Button */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-10 rounded-full shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center border border-slate-200/80 dark:border-slate-700 overflow-hidden">
                        <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                          {item.prospect_name ? item.prospect_name.slice(0, 2).toUpperCase() : "FU"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h6 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate group-hover:text-blue-600 transition-colors">
                          {item.prospect_name || "Client"}
                        </h6>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate mb-0">
                          {item.prospect_business || "Lead Contact"}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="size-7.5 rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-xs flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="size-3.5" />
                          <span className="sr-only">Actions</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={4}
                        className="w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-1.5 shadow-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg py-2"
                          onClick={() => {
                            setDetailFollowUp(item);
                            setDetailModalOpen(true);
                          }}
                        >
                          <Eye className="size-3.5 text-blue-600" />
                          <span>View Details & Timeline</span>
                        </DropdownMenuItem>

                        {item.effective_status !== "completed" && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer text-xs font-medium text-emerald-700 dark:text-emerald-400 rounded-lg py-2"
                            onClick={() => handleQuickStatus(item, "completed")}
                          >
                            <Check className="size-3.5 text-emerald-600" />
                            <span>Mark Completed</span>
                          </DropdownMenuItem>
                        )}

                        {item.effective_status !== "cancelled" && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer text-xs font-medium text-rose-600 dark:text-rose-400 rounded-lg py-2"
                            onClick={() => handleQuickStatus(item, "cancelled")}
                          >
                            <XCircle className="size-3.5 text-rose-500" />
                            <span>Cancel Task</span>
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 rounded-lg py-2"
                          onClick={() => {
                            setScheduleProspectId(item.prospect_id);
                            setScheduleProspectLabel(
                              item.prospect_name || item.prospect_business || "Prospect",
                            );
                            setScheduleOpen(true);
                          }}
                        >
                          <Plus className="size-3.5 text-[#67B239]" />
                          <span>Schedule Next Call</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Middle: Details (Phone, Due Date, Stage) */}
                  <div className="space-y-2 text-[12.5px] text-slate-500 dark:text-slate-400 font-normal">
                    {/* Phone Row */}
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="size-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                      <a
                        href={item.prospect_phone ? `tel:${item.prospect_phone}` : undefined}
                        onClick={(e) => e.stopPropagation()}
                        className={`truncate ${
                          item.prospect_phone
                            ? "hover:text-blue-600 hover:underline"
                            : "text-slate-400"
                        }`}
                      >
                        {item.prospect_phone || "No phone"}
                      </a>
                    </div>

                    {/* Due Date & Time */}
                    <div className="flex items-center gap-2 truncate">
                      <CalendarClock className="size-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                      <span
                        className={`truncate font-medium ${isDueOverdue ? "text-rose-600 dark:text-rose-400" : ""}`}
                      >
                        {formatCrmDateTime(item.due_at)}
                      </span>
                    </div>

                    {/* Note: Torn Paper ("Chira Kagoj") */}
                    <div
                      className="relative my-1 min-h-8.5 flex items-center px-3.5 py-1 filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.01]"
                      title={item.note || "No note recorded"}
                    >
                      <svg
                        viewBox="0 0 500 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 size-full pointer-events-none"
                      >
                        <path
                          d="M12,12 L28,16 L38,11 L52,10 L66,13 L78,9 L90,11 L104,12 L116,8 L130,10 L142,7 L156,6 L168,8 L180,12 L194,10 L208,11 L222,10 L234,12 L248,11 L262,9 L276,11 L288,13 L302,8 L314,10 L328,11 L340,8 L354,10 L368,12 L380,8 L394,14 L408,16 L422,15 L436,18 L448,19 L462,18 L478,24 L462,38 L483,33 L483,84 L472,82 L460,80 L448,84 L436,83 L424,80 L412,82 L400,85 L388,81 L376,84 L364,89 L352,84 L340,81 L328,82 L315,76 L302,83 L288,77 L276,86 L265,97 L250,85 L238,88 L226,85 L214,87 L202,84 L190,85 L178,83 L166,81 L154,82 L142,81 L130,80 L118,81 L106,79 L94,80 L82,77 L70,81 L58,76 L44,82 L32,77 L20,83 L14,75 Z"
                          className="fill-[#FEFCE8] dark:fill-[#1e1a0e] stroke-[#FDE68A]/60 dark:stroke-[#4a3f1d]"
                          strokeWidth="0.8"
                        />
                      </svg>

                      <div className="relative z-1 flex items-center gap-1.5 truncate w-full text-[11.5px] px-0.5">
                        <div className="flex items-center gap-1 shrink-0 text-amber-800 dark:text-yellow-300 font-bold text-[11px]">
                          <FileText className="size-3 text-amber-700 dark:text-yellow-400" />
                          <span>Note:</span>
                        </div>
                        <span
                          className={`truncate ${
                            item.note
                              ? "text-amber-950 dark:text-amber-100 font-medium"
                              : "text-amber-700/60 dark:text-amber-400/50 italic"
                          }`}
                        >
                          {item.note || "No note"}
                        </span>
                      </div>
                    </div>

                    {/* Status & Stage Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <FollowUpStatusBadge status={item.effective_status} />
                      {item.stage_name && (
                        <Badge
                          variant="outline"
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        >
                          {item.stage_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer: Assigned Agent & Quick Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="size-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {item.agent_name ? item.agent_name.slice(0, 1).toUpperCase() : "A"}
                    </div>
                    <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300 truncate">
                      {item.agent_name || "Unassigned"}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.prospect_phone && (
                      <a
                        href={`tel:${item.prospect_phone}`}
                        className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-colors shadow-2xs"
                        title="Call Prospect"
                      >
                        <Phone className="size-3.5" />
                      </a>
                    )}
                    {item.effective_status !== "completed" && (
                      <button
                        type="button"
                        onClick={() => handleQuickStatus(item, "completed")}
                        className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                        title="Complete Follow-up"
                      >
                        <Check className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table View ── */
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 shadow-sm">
                <TableRow className="hover:bg-transparent border-b border-slate-50 dark:border-white/5">
                  <TableHead className="w-[50px] md:w-[60px] pl-4 md:pl-8 py-4 md:py-5 text-[10px] md:text-[11px] font-semibold text-slate-400">
                    SL
                  </TableHead>
                  <TableHead className="py-4 md:py-5 text-[10px] md:text-[11px] font-semibold text-slate-400">
                    Prospect / Business
                  </TableHead>
                  <TableHead className="py-4 md:py-5 text-[10px] md:text-[11px] font-semibold text-slate-400">
                    Contact
                  </TableHead>
                  <TableHead className="py-4 md:py-5 text-[10px] md:text-[11px] font-semibold text-slate-400">
                    Due Date & Time
                  </TableHead>
                  <TableHead className="py-4 md:py-5 text-center text-[10px] md:text-[11px] font-semibold text-slate-400">
                    Status
                  </TableHead>
                  <TableHead className="py-4 md:py-5 text-[10px] md:text-[11px] font-semibold text-slate-400">
                    Stage
                  </TableHead>
                  <TableHead className="py-4 md:py-5 text-[10px] md:text-[11px] font-semibold text-slate-400">
                    Agent
                  </TableHead>
                  <TableHead className="pr-4 md:pr-8 py-4 md:py-5 text-right text-[10px] md:text-[11px] font-semibold text-slate-400">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followUpItems.map((item, index) => {
                  const sl = (page - 1) * 10 + index + 1;
                  return (
                  <TableRow
                    key={item.id}
                    onClick={() => {
                      setDetailFollowUp(item);
                      setDetailModalOpen(true);
                    }}
                    className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all border-b border-slate-50 dark:border-white/5"
                  >
                    <TableCell className="pl-4 md:pl-8 py-3 md:py-4 font-semibold text-[10px] text-slate-300 dark:text-slate-600">
                      {sl < 10 ? `0${sl}` : sl}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-primary transition-colors line-clamp-1">
                            {item.prospect_business ? (item.prospect_business.length > 26 ? `${item.prospect_business.substring(0, 26)}...` : item.prospect_business) : "Lead"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                          <User className="h-3 w-3" />
                          {item.prospect_name ? (item.prospect_name.length > 26 ? `${item.prospect_name.substring(0, 26)}...` : item.prospect_name) : "N/A"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block w-fit">
                          {item.prospect_phone || "N/A"}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                          <Phone className="h-3 w-3" />
                          {item.prospect_phone ? (
                            <a
                              href={`tel:${item.prospect_phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-blue-600 hover:underline"
                            >
                              Call
                            </a>
                          ) : (
                            "No phone"
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 md:py-4">
                      <span
                        className={`text-xs font-semibold ${
                          item.effective_status === "overdue" ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {formatCrmDateTime(item.due_at)}
                      </span>
                    </TableCell>

                    <TableCell className="py-4 text-center">
                      <FollowUpStatusBadge status={item.effective_status} />
                    </TableCell>

                    <TableCell className="py-4">
                      {item.stage_name ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        >
                          {item.stage_name.length > 20 ? `${item.stage_name.substring(0, 20)}...` : item.stage_name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <div className="size-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold shrink-0">
                          {item.agent_name ? item.agent_name.slice(0, 1).toUpperCase() : "A"}
                        </div>
                        <span className="hidden sm:inline truncate">{item.agent_name || "Unassigned"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="pr-4 md:pr-8 py-3 md:py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailFollowUp(item);
                          setDetailModalOpen(true);
                        }}
                        className="rounded-xl text-[10px] md:text-[11px] font-semibold h-8 md:h-9 px-3 md:px-4 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">DETAILS</span>
                        <span className="sm:hidden">VIEW</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* 5. Pagination Bar */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalCount)} of {totalCount} tasks
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 px-2.5 text-xs rounded-lg gap-1"
            >
              <ChevronLeft className="size-3.5" />
              <span>Previous</span>
            </Button>
            <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
              Page {page} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
              className="h-8 px-2.5 text-xs rounded-lg gap-1"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* 6. Modals */}
      <FollowUpDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        prospectId={scheduleProspectId}
        prospectLabel={scheduleProspectLabel}
      />

      <FollowUpDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        followUp={detailFollowUp}
        onScheduleNext={(pId, pLabel) => {
          setDetailModalOpen(false);
          setScheduleProspectId(pId);
          setScheduleProspectLabel(pLabel);
          setScheduleOpen(true);
        }}
      />
    </div>
  );
}
