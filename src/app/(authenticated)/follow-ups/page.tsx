"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ListChecks,
  Phone,
  Plus,
  Search,
  TriangleAlert,
  User,
  X,
  CalendarIcon,
  Users,
  ListFilter,
  FileText,
} from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

import { PageHeader } from "@/components/placeholder-page";
import { FollowUpDialog } from "@/components/follow-up-dialog";
import { FollowUpDetailModal } from "@/components/follow-up-detail-modal";
import { ChangeStageDialog, type ChangeStageTarget } from "@/components/change-stage-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { useAuth } from "@/lib/auth";
import {
  agentsQuery,
  followUpSummaryQuery,
  followUpsQuery,
  prospectTimelineQuery,
  useSetFollowUpStatus,
  type FollowUp,
  type FollowUpFilters,
} from "@/lib/follow-ups";
import { useAppFilters } from "@/lib/use-app-router";

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  active,
  onClick,
  variant = "purple",
}: {
  label: string;
  value: number;
  icon: typeof ListChecks;
  loading: boolean;
  active?: boolean;
  onClick?: () => void;
  variant?:
    | "purple"
    | "teal"
    | "green"
    | "coral"
    | "yellow"
    | "default"
    | "pending"
    | "completed"
    | "overdue";
}) {
  const variantStyles = {
    purple: {
      bg: "bg-[#F3E8FF] dark:bg-purple-950/40",
      iconText: "text-purple-600 dark:text-purple-300",
      watermark: "text-purple-600/12 dark:text-purple-400/12",
    },
    teal: {
      bg: "bg-[#E6F7F5] dark:bg-teal-950/40",
      iconText: "text-teal-600 dark:text-teal-300",
      watermark: "text-teal-600/12 dark:text-teal-400/12",
    },
    green: {
      bg: "bg-[#EBF7E7] dark:bg-emerald-950/40",
      iconText: "text-emerald-600 dark:text-emerald-300",
      watermark: "text-emerald-600/12 dark:text-emerald-400/12",
    },
    coral: {
      bg: "bg-[#FFF0E6] dark:bg-orange-950/40",
      iconText: "text-orange-600 dark:text-orange-300",
      watermark: "text-orange-600/12 dark:text-orange-400/12",
    },
    yellow: {
      bg: "bg-[#FFF9E5] dark:bg-amber-950/40",
      iconText: "text-amber-600 dark:text-amber-300",
      watermark: "text-amber-600/12 dark:text-amber-400/12",
    },
    default: {
      bg: "bg-[#F3E8FF] dark:bg-purple-950/40",
      iconText: "text-purple-600 dark:text-purple-300",
      watermark: "text-purple-600/12 dark:text-purple-400/12",
    },
    pending: {
      bg: "bg-[#E6F7F5] dark:bg-teal-950/40",
      iconText: "text-teal-600 dark:text-teal-300",
      watermark: "text-teal-600/12 dark:text-teal-400/12",
    },
    completed: {
      bg: "bg-[#EBF7E7] dark:bg-emerald-950/40",
      iconText: "text-emerald-600 dark:text-emerald-300",
      watermark: "text-emerald-600/12 dark:text-emerald-400/12",
    },
    overdue: {
      bg: "bg-[#FFF0E6] dark:bg-orange-950/40",
      iconText: "text-orange-600 dark:text-orange-300",
      watermark: "text-orange-600/12 dark:text-orange-400/12",
    },
  };

  const current = variantStyles[variant] || variantStyles.purple;

  const activeStyles = active
    ? "shadow-md scale-[1.01]"
    : "shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-200";

  const cursorStyle = onClick ? "cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4.5 flex items-center gap-3.5 select-none shadow-md ${current.bg} ${activeStyles} ${cursorStyle}`}
    >
      <div className="size-11 rounded-full bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center shrink-0 z-10">
        <Icon className={`size-5 ${current.iconText}`} />
      </div>

      <div className="z-10 min-w-0 flex-1">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight truncate">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-1.5 h-7 w-16 rounded-md" />
        ) : (
          <p className="mt-0.5 text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
            {value}
          </p>
        )}
      </div>

      <Icon
        className={`absolute -right-3 -bottom-3 size-24 ${current.watermark} pointer-events-none select-none z-0 transform rotate-6`}
      />
    </div>
  );
}

function getStageBadgeColor(stageName?: string | null) {
  const name = (stageName || "").toLowerCase();
  if (name.includes("won") || name.includes("sales")) return "bg-[#67B239] text-white";
  if (name.includes("prospect") || name.includes("lead")) return "bg-blue-600 text-white";
  if (name.includes("follow")) return "bg-teal-600 text-white";
  if (name.includes("opportunity")) return "bg-orange-500 text-white";
  if (name.includes("dnp")) return "bg-amber-500 text-white";
  if (name.includes("switched")) return "bg-purple-600 text-white";
  if (name.includes("invalid")) return "bg-rose-600 text-white";
  if (name.includes("not_interested") || name.includes("not interested"))
    return "bg-slate-600 text-white";
  if (name.includes("denied")) return "bg-red-700 text-white";
  return "bg-indigo-600 text-white";
}

function FollowUpTimelineList({
  prospectId,
  currentFollowUp,
}: {
  prospectId: string;
  currentFollowUp: FollowUp;
}) {
  const { data: timelineItems = [], isLoading } = useQuery({
    ...prospectTimelineQuery(prospectId),
    enabled: !!prospectId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-2 px-1">
        <Skeleton className="h-24 w-44 rounded-xl" />
        <Skeleton className="h-24 w-44 rounded-xl" />
      </div>
    );
  }

  const items =
    timelineItems.length > 0
      ? timelineItems
      : [
          {
            id: currentFollowUp.id,
            date: currentFollowUp.due_at
              ? format(new Date(currentFollowUp.due_at), "MMM d, yyyy")
              : "N/A",
            time: currentFollowUp.due_at
              ? format(new Date(currentFollowUp.due_at), "hh:mm a")
              : "N/A",
            note: currentFollowUp.note || "No note specified",
            agent: currentFollowUp.agent_name || "Agent",
            status: currentFollowUp.effective_status,
          },
        ];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex items-center gap-0 py-1 px-1 min-w-max pb-2">
        {items.map((item, idx) => {
          const isCurrent = item.id === currentFollowUp.id || idx === 0;
          const isLast = idx === items.length - 1;

          return (
            <div key={item.id || idx} className="flex items-center shrink-0">
              <div className="flex flex-col items-start w-44 space-y-2 whitespace-normal">
                <div
                  className={`w-full px-2.5 py-0.5 rounded-full text-[10px] font-bold text-center tracking-tight shadow-2xs ${
                    isCurrent
                      ? "bg-emerald-600 text-white font-semibold"
                      : "bg-slate-700 dark:bg-slate-600 text-white font-medium"
                  }`}
                >
                  {item.date}, {item.time}
                </div>

                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl p-2.5 shadow-2xs min-h-24 space-y-1 overflow-hidden flex flex-col justify-start">
                  <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                    Agent:{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {item.agent}
                    </span>
                  </div>
                  <div className="sawtooth-cut bg-amber-100 dark:bg-amber-950/80 p-2 text-[10px] text-amber-950 dark:text-amber-100 font-medium leading-snug h-11 line-clamp-2 overflow-hidden">
                    {item.note?.trim() || "No notes entered."}
                  </div>
                </div>
              </div>

              {!isLast && (
                <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-700 shrink-0 self-start mt-2.5" />
              )}
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function FollowUpsContent() {
  const { user, isAdmin } = useAuth();
  const userId = user?.id ?? "";

  const [searchParams, setSearchParams] = useAppFilters<FollowUpFilters>({
    page: 1,
  });

  const [searchInput, setSearchInput] = useState(searchParams.search ?? "");
  const [debouncedSearch] = useDebounce(searchInput, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<{ id: string; label: string } | null>(null);
  const [changeStageTarget, setChangeStageTarget] = useState<ChangeStageTarget | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    searchParams.from
      ? {
          from: new Date(searchParams.from),
          to: searchParams.to ? new Date(searchParams.to) : undefined,
        }
      : undefined,
  );
  const [calOpen, setCalOpen] = useState(false);

  const statusMutation = useSetFollowUpStatus();

  useEffect(() => {
    const next = debouncedSearch.trim() || undefined;
    if (next === (searchParams.search ?? undefined)) return;
    setSearchParams({ search: next, page: 1 });
  }, [debouncedSearch, searchParams.search, setSearchParams]);

  const updateFilter = (key: keyof typeof searchParams, value: string | undefined) => {
    setSearchParams({ [key]: value, page: 1 });
  };

  const list = useQuery({ ...followUpsQuery(searchParams, userId, isAdmin), enabled: !!userId });
  const summary = useQuery({ ...followUpSummaryQuery(userId, isAdmin), enabled: !!userId });
  const agents = useQuery({ ...agentsQuery() });

  const handleCompleteTask = (row: FollowUp, e?: React.MouseEvent) => {
    e?.stopPropagation();
    statusMutation.mutate(
      {
        id: row.id,
        status: "completed",
        prospectId: row.prospect_id,
        prospectName: row.prospect_name,
        note: row.note || undefined,
      },
      {
        onSuccess: () =>
          toast.success(`Completed follow-up for ${row.prospect_name || "prospect"}`),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const rows = list.data?.data ?? [];
  const page = searchParams.page ?? 1;
  const pageCount = list.data?.pageCount ?? 1;

  const hasActiveFilters =
    Boolean(searchParams.search) ||
    Boolean(searchParams.status) ||
    Boolean(searchParams.agent) ||
    Boolean(searchParams.from) ||
    Boolean(searchParams.to);

  const clearAllFilters = () => {
    setSearchInput("");
    setDateRange(undefined);
    setSearchParams({ page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Follow Ups"
          description="Manage scheduled follow-up calls, view chronological timeline, and update task statuses."
        />
        <Button
          onClick={() => {
            setDialogTarget(null);
            setDialogOpen(true);
          }}
          className="shadow-sm"
        >
          <Plus className="mr-2 size-4" />
          Schedule Follow-up
        </Button>
      </div>

      <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Total Tasks"
          value={summary.data?.total ?? 0}
          icon={ListChecks}
          loading={summary.isLoading}
          variant="purple"
          active={searchParams.status === undefined}
          onClick={() => {
            updateFilter("status", undefined);
          }}
        />
        <StatCard
          label="Pending"
          value={summary.data?.pending ?? 0}
          icon={CalendarClock}
          loading={summary.isLoading}
          variant="teal"
          active={searchParams.status === "pending"}
          onClick={() => {
            updateFilter("status", searchParams.status === "pending" ? undefined : "pending");
          }}
        />
        <StatCard
          label="Completed"
          value={summary.data?.completed ?? 0}
          icon={CheckCircle2}
          loading={summary.isLoading}
          variant="green"
          active={searchParams.status === "completed"}
          onClick={() => {
            updateFilter("status", searchParams.status === "completed" ? undefined : "completed");
          }}
        />
        <StatCard
          label="Overdue"
          value={summary.data?.overdue ?? 0}
          icon={TriangleAlert}
          loading={summary.isLoading}
          variant="coral"
          active={searchParams.status === "overdue"}
          onClick={() => {
            updateFilter("status", searchParams.status === "overdue" ? undefined : "overdue");
          }}
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {isAdmin && (
            <Select
              value={searchParams.agent ?? "all"}
              onValueChange={(v: string) => updateFilter("agent", v === "all" ? undefined : v)}
            >
              <SelectTrigger className="w-42.5 bg-white">
                <Users className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {((agents.data as { id: string; name: string }[]) ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-8 bg-white"
              placeholder="Search name, business, phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={searchParams.status ?? "all"}
            onValueChange={(v: string) => updateFilter("status", v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-42.5 bg-white">
              <ListFilter className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

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
                  if (range?.from) {
                    updateFilter("from", format(range.from, "yyyy-MM-dd"));
                  }
                  if (range?.to) {
                    updateFilter("to", format(range.to, "yyyy-MM-dd"));
                    setCalOpen(false);
                  }
                  if (!range?.from) {
                    updateFilter("from", undefined);
                    updateFilter("to", undefined);
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
                      updateFilter("from", undefined);
                      updateFilter("to", undefined);
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

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-medium text-muted-foreground">
            {list.isLoading ? "Loading follow-ups..." : `Showing ${rows.length} follow-up task(s)`}
          </p>
        </div>

        {list.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <CalendarClock className="size-6" />
              </div>
              <div>
                <p className="font-semibold text-base">No follow-ups found</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {hasActiveFilters
                    ? "No follow-up calls match your current search and filter criteria. Try resetting filters."
                    : "Schedule your first follow-up to keep track of telesales prospects."}
                </p>
              </div>
              {hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Reset Filters
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogTarget(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Schedule Follow-up
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div
                key={row.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col xl:flex-row items-stretch justify-between gap-3.5 overflow-hidden"
              >
                <div className="w-full xl:w-[26%] shrink-0 flex flex-col justify-between space-y-2.5 pr-1">
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2.5">
                      <div className="size-8.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Badge
                          className={`${getStageBadgeColor(row.stage_name)} text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 border-0 shadow-2xs`}
                        >
                          {row.stage_name || "Follow-up"}
                        </Badge>
                        <h3
                          className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight"
                          title={row.prospect_name}
                        >
                          {row.prospect_name || "Contact Name"}
                        </h3>
                        {row.prospect_business && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                            {row.prospect_business}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-[11px] font-bold text-slate-500 dark:text-slate-400 px-0.5">
                        <span className="flex items-center gap-1">
                          <FileText className="size-3 text-slate-400" /> Notes
                        </span>
                      </div>
                      <div className="sawtooth-cut bg-amber-100 dark:bg-amber-950/80 p-2.5 text-[11px] text-amber-950 dark:text-amber-100 font-medium leading-snug h-12 line-clamp-2 overflow-hidden">
                        {row.note?.trim() || "No notes entered yet."}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                        <User className="size-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Agent:{" "}
                          <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                            {row.agent_name || "Assigned Agent"}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                        <CalendarIcon className="size-3 text-slate-400 shrink-0" />
                        <span>
                          {row.due_at ? format(new Date(row.due_at), "MMM d, yyyy") : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                        <Clock className="size-3 text-slate-400 shrink-0" />
                        <span>{row.due_at ? format(new Date(row.due_at), "hh:mm a") : "N/A"}</span>
                      </div>
                    </div>

                    <a
                      href={row.prospect_phone ? `tel:${row.prospect_phone}` : "#"}
                      onClick={(e) => {
                        if (!row.prospect_phone) {
                          e.preventDefault();
                          toast.info("No phone number recorded for this prospect.");
                        }
                      }}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <Phone className="size-3.5 fill-current" />
                      Call
                    </a>
                  </div>
                </div>

                <div className="w-full xl:w-[55%] flex-1 bg-[#EEF7F7] dark:bg-slate-950/60 border border-[#DCEEEE] dark:border-slate-800/70 rounded-xl p-3 flex items-center overflow-x-auto min-h-36 custom-scrollbar">
                  <FollowUpTimelineList prospectId={row.prospect_id} currentFollowUp={row} />
                </div>

                <div className="w-full xl:w-[19%] shrink-0 flex xl:flex-col items-center justify-center gap-2 pt-2 xl:pt-0 border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800/80 xl:pl-3">
                  <Button
                    onClick={() => {
                      setSelectedFollowUp(row);
                      setDetailModalOpen(true);
                    }}
                    className="flex-1 xl:flex-none w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs h-9 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    View
                  </Button>

                  <Button
                    onClick={() => {
                      setChangeStageTarget({
                        id: row.prospect_id,
                        label: row.prospect_name || row.prospect_business || "Prospect",
                        stageId: null,
                        currentStageName: row.stage_name || "Follow-up",
                      });
                    }}
                    className="flex-1 xl:flex-none w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-9 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    Update Status
                  </Button>

                  <Button
                    onClick={(e) => handleCompleteTask(row, e)}
                    disabled={statusMutation.isPending || row.effective_status === "completed"}
                    className="flex-1 xl:flex-none w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs h-9 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    Complete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-between pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Showing page {page} of {pageCount}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setSearchParams({ page: page - 1 })}
              >
                <ChevronLeft className="size-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => setSearchParams({ page: page + 1 })}
              >
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <FollowUpDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        followUp={selectedFollowUp}
        onScheduleNext={(pId, pLabel) => {
          setDialogTarget({ id: pId, label: pLabel });
          setDialogOpen(true);
        }}
      />

      <FollowUpDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        {...(dialogTarget
          ? { prospectId: dialogTarget.id, prospectLabel: dialogTarget.label }
          : {})}
      />

      <ChangeStageDialog
        target={changeStageTarget}
        onOpenChange={(open) => {
          if (!open) setChangeStageTarget(null);
        }}
        onStageChange={(_stageId, stageName) => {
          const normalised = stageName.toLowerCase().trim();
          if (normalised.includes("follow")) {
            const target = changeStageTarget;
            setChangeStageTarget(null);
            if (target) {
              setDialogTarget({ id: target.id, label: target.label });
              setDialogOpen(true);
            }
          }
        }}
      />
    </div>
  );
}

export default function FollowUpsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[400px] place-items-center">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
        </div>
      }
    >
      <FollowUpsContent />
    </Suspense>
  );
}
