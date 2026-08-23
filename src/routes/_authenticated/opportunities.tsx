import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Layers,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  User,
  Users,
  XCircle,
  X,
  CalendarIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const getStageBadgeStyle = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("won") || s.includes("closed")) {
    return "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/70";
  }
  if (s.includes("lost")) {
    return "bg-rose-100/90 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/70";
  }
  if (s.includes("dnp") || s.includes("pursue")) {
    return "bg-slate-200/90 text-slate-800 dark:bg-slate-800/90 dark:text-slate-200 border border-slate-300/70";
  }
  if (s.includes("negotiat")) {
    return "bg-orange-100/90 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200/70";
  }
  if (s.includes("proposal") || s.includes("quote")) {
    return "bg-amber-100/90 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/70";
  }
  if (s.includes("follow") || s.includes("contact") || s.includes("meet")) {
    return "bg-cyan-100/90 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200/70";
  }
  if (s.includes("created") || s.includes("opportunity")) {
    return "bg-indigo-100/90 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/70";
  }
  return "bg-purple-100/90 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/70";
};

import { PageHeader } from "@/components/placeholder-page";
import { OpportunityDialog } from "@/components/opportunity-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { agentsQuery } from "@/lib/follow-ups";
import {
  getStatusVariant,
  getStatusBadgeClass,
  opportunitiesQuery,
  opportunityFiltersSchema,
  opportunitySummaryQuery,
  PIPELINE_STAGES,
  REJECTED_STAGES,
  useSoftDeleteOpportunity,
  useUpdateOpportunityStatus,
  type Opportunity,
  type OpportunityFilters,
  type OpportunityStatus,
} from "@/lib/opportunities";

export const Route = createFileRoute("/_authenticated/opportunities")({
  validateSearch: opportunityFiltersSchema,
  head: () => ({
    meta: [
      { title: "Opportunities | Brandium Telesales CRM" },
      {
        name: "description",
        content: "Track and convert active sales opportunities through your pipeline.",
      },
      { property: "og:title", content: "Opportunities | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Track and convert active sales opportunities through your pipeline.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

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
  value: string | number;
  icon: typeof Target;
  loading: boolean;
  active?: boolean;
  onClick?: () => void;
  variant?:
    "purple" | "teal" | "green" | "coral" | "yellow" | "default" | "active" | "won" | "rejected";
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
    // Map legacy variants gracefully for full compatibility
    default: {
      bg: "bg-[#F3E8FF] dark:bg-purple-950/40",
      iconText: "text-purple-600 dark:text-purple-300",
      watermark: "text-purple-600/12 dark:text-purple-400/12",
    },
    active: {
      bg: "bg-[#E6F7F5] dark:bg-teal-950/40",
      iconText: "text-teal-600 dark:text-teal-300",
      watermark: "text-teal-600/12 dark:text-teal-400/12",
    },
    won: {
      bg: "bg-[#EBF7E7] dark:bg-emerald-950/40",
      iconText: "text-emerald-600 dark:text-emerald-300",
      watermark: "text-emerald-600/12 dark:text-emerald-400/12",
    },
    rejected: {
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
      {/* Left White Circular Icon Badge */}
      <div className="size-11 rounded-full bg-white dark:bg-slate-900 shadow-xs flex items-center justify-center shrink-0 z-10">
        <Icon className={`size-5 ${current.iconText}`} />
      </div>

      {/* Label and Value */}
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

      {/* Large Watermark Icon Background */}
      <Icon
        className={`absolute -right-3 -bottom-3 size-24 ${current.watermark} pointer-events-none select-none z-0 transform rotate-6`}
      />
    </div>
  );
}

function OpportunitiesPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { user, isAdmin } = useAuth();
  const userId = user?.id ?? "";

  const [searchInput, setSearchInput] = useState(searchParams.search ?? "");
  const [debouncedSearch] = useDebounce(searchInput, 300);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    searchParams.from
      ? {
          from: new Date(searchParams.from),
          to: searchParams.to ? new Date(searchParams.to) : undefined,
        }
      : undefined,
  );
  const [calOpen, setCalOpen] = useState(false);

  // Edit notes state
  const [editingNotesRow, setEditingNotesRow] = useState<Opportunity | null>(null);
  const [noteContent, setNoteContent] = useState("");

  const statusMutation = useUpdateOpportunityStatus();
  const softDeleteMutation = useSoftDeleteOpportunity();

  useEffect(() => {
    const next = debouncedSearch.trim() || undefined;
    if (next === (searchParams.search ?? undefined)) return;
    void navigate({
      search: (prev: OpportunityFilters) => ({ ...prev, search: next, page: 1 }),
      replace: true,
    });
  }, [debouncedSearch, navigate, searchParams.search]);

  const updateFilter = (key: keyof typeof searchParams, value: string | undefined) => {
    void navigate({ search: (prev: OpportunityFilters) => ({ ...prev, [key]: value, page: 1 }) });
  };

  const list = useQuery({
    ...opportunitiesQuery(searchParams, userId, isAdmin),
    enabled: !!userId,
  });
  const summary = useQuery({
    ...opportunitySummaryQuery(userId, isAdmin),
    enabled: !!userId,
  });
  const agents = useQuery({ ...agentsQuery() });

  const handleUpdateStatus = (
    row: Opportunity,
    status: OpportunityStatus,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation();
    statusMutation.mutate(
      {
        id: row.id,
        status,
        prospectId: row.prospect_id,
        prospectName: row.prospect_name,
        estimatedValue: row.estimated_value,
        notes: row.notes || undefined,
      },
      {
        onSuccess: () => {
          if (status === "Sales Won") {
            toast.success(
              `🎉 Opportunity for ${row.prospect_name || "Prospect"} converted to Sales Won! Stage & activities updated.`,
            );
          } else {
            toast.success(`Opportunity status updated to ${status}`);
          }
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleSoftDelete = (row: Opportunity, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Are you sure you want to remove opportunity for ${row.prospect_name}?`)) return;

    softDeleteMutation.mutate(row.id, {
      onSuccess: () => toast.success("Opportunity soft deleted"),
      onError: (error) => toast.error(error.message),
    });
  };

  const rows = list.data?.data ?? [];
  const page = searchParams.page ?? 1;
  const pageCount = list.data?.pageCount ?? 1;

  const hasActiveFilters =
    Boolean(searchParams.search) ||
    Boolean(searchParams.status) ||
    Boolean(searchParams.agent) ||
    Boolean(searchParams.from);

  const clearFilters = () => {
    setSearchInput("");
    setDateRange(undefined);
    void navigate({ search: () => ({ page: 1 }), replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Opportunities"
          description="Manage sales pipeline deals, convert won prospects, and track estimated revenue."
        />
        <Button onClick={() => setDialogOpen(true)} className="shadow-sm">
          <Plus className="mr-2 size-4" />
          Create Opportunity
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Deals"
          value={summary.data?.total ?? 0}
          icon={Target}
          loading={summary.isLoading}
          variant="purple"
          active={searchParams.status === undefined}
          onClick={() => updateFilter("status", undefined)}
        />
        <StatCard
          label="Total Pipeline Value"
          value={`৳ ${(summary.data?.totalValue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          loading={summary.isLoading}
          variant="teal"
        />
        <StatCard
          label="Active Deals"
          value={summary.data?.active ?? 0}
          icon={TrendingUp}
          loading={summary.isLoading}
          variant="green"
          active={searchParams.status === "Negotiation"}
          onClick={() => updateFilter("status", "Negotiation")}
        />
        <StatCard
          label="Sales Won"
          value={summary.data?.won ?? 0}
          icon={BadgeCheck}
          loading={summary.isLoading}
          variant="coral"
          active={searchParams.status === "Sales Won"}
          onClick={() => updateFilter("status", "Sales Won")}
        />
        <StatCard
          label="Rejected / Lost"
          value={summary.data?.rejected ?? 0}
          icon={XCircle}
          loading={summary.isLoading}
          variant="yellow"
          active={searchParams.status === "Sales Lost"}
          onClick={() => updateFilter("status", "Sales Lost")}
        />
      </div>

      {/* Filter & Search Bar */}
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

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by prospect name, business, phone..."
              className="pl-9 bg-white"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
              <X className="mr-1 size-3.5" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={searchParams.status ?? "all"}
            onValueChange={(v: string) => updateFilter("status", v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="All Stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Sales Won">Sales Won</SelectItem>
              <SelectItem value="Sales Lost">Sales Lost</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`bg-white justify-start text-left font-normal ${
                  dateRange?.from ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <CalendarIcon className="mr-2 size-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, yyyy")
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

      {/* Opportunities Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-medium text-muted-foreground">
            {list.isLoading
              ? "Loading opportunities..."
              : `Showing ${rows.length} opportunity deal(s)`}
          </p>
        </div>

        {list.isLoading ? (
          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <Target className="size-6" />
              </div>
              <div>
                <p className="font-semibold text-base">No opportunities found</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {hasActiveFilters
                    ? "No opportunities match your filter criteria."
                    : "Create your first sales opportunity to start tracking pipeline value."}
                </p>
              </div>
              {hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Reset Filters
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Create Opportunity
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-slate-50/80 dark:bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-4">Title & Prospect</th>
                    <th className="py-3 px-4">Estimated Value</th>
                    <th className="py-3 px-4">Stage / Status</th>
                    <th className="py-3 px-4">Assigned Agent</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4 min-w-44">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors"
                    >
                      {/* Title & Prospect */}
                      <td className="py-3.5 px-4 max-w-64">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotesRow(row);
                            setNoteContent(row.notes || "");
                          }}
                          className="font-semibold text-foreground hover:text-[#67B239] transition-colors truncate block text-left cursor-pointer"
                        >
                          {row.prospect_business || row.prospect_name || "Untitled Opportunity"}
                        </button>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                          <span>{row.prospect_name || "Direct Client"}</span>
                          {row.prospect_phone && (
                            <span className="font-mono text-slate-500">· {row.prospect_phone}</span>
                          )}
                        </p>
                      </td>

                      {/* Estimated Value */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          ৳{(row.estimated_value || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Stage / Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs",
                            getStageBadgeStyle(row.status),
                          )}
                        >
                          <span className="size-1 rounded-full bg-current shrink-0" />
                          {row.status}
                        </span>
                      </td>

                      {/* Assigned Agent */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <User className="size-3 text-slate-400 shrink-0" />
                          <span>{row.agent_name || "Unassigned"}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <div className="font-medium text-foreground">
                          {format(new Date(row.created_at), "yyyy-MM-dd")}
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(row.created_at), "hh:mm a")}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-56 text-xs">
                        <div className="flex items-center justify-between gap-1 group">
                          <div className="sawtooth-cut bg-amber-100/90 dark:bg-amber-950/70 px-2 py-1 text-[10px] text-amber-950 dark:text-amber-100 font-medium line-clamp-1 truncate max-w-44">
                            {row.notes?.trim() || "No notes"}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNotesRow(row);
                              setNoteContent(row.notes || "");
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Edit note"
                          >
                            <Pencil className="size-3" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="View Details"
                            onClick={() => {
                              setEditingNotesRow(row);
                              setNoteContent(row.notes || "");
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl p-1.5 shadow-xl"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingNotesRow(row);
                                  setNoteContent(row.notes || "");
                                }}
                                className="text-xs font-semibold rounded-md px-2 py-1.5 cursor-pointer"
                              >
                                <Eye className="mr-2 size-3.5 text-slate-500" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingNotesRow(row);
                                  setNoteContent(row.notes || "");
                                }}
                                className="text-xs font-semibold rounded-md px-2 py-1.5 cursor-pointer"
                              >
                                <FileText className="mr-2 size-3.5 text-slate-500" />
                                Edit Notes
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="my-1" />

                              <DropdownMenuLabel className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-0.5">
                                Change Status
                              </DropdownMenuLabel>
                              {PIPELINE_STAGES.map((st) => (
                                <DropdownMenuItem
                                  key={st}
                                  onClick={(e) => handleUpdateStatus(row, st, e)}
                                  className="text-xs font-semibold rounded-md px-2 py-1 cursor-pointer"
                                >
                                  <BadgeCheck className="mr-2 size-3.5 text-emerald-600" />
                                  {st}
                                </DropdownMenuItem>
                              ))}
                              {REJECTED_STAGES.map((st) => (
                                <DropdownMenuItem
                                  key={st}
                                  onClick={(e) => handleUpdateStatus(row, st, e)}
                                  className="text-xs font-semibold text-rose-600 rounded-md px-2 py-1 cursor-pointer"
                                >
                                  <CircleSlash className="mr-2 size-3.5 text-rose-500" />
                                  {st}
                                </DropdownMenuItem>
                              ))}

                              <DropdownMenuSeparator className="my-1" />

                              <DropdownMenuItem
                                onClick={(e) => handleSoftDelete(row, e)}
                                className="text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-md px-2 py-1.5 cursor-pointer focus:bg-rose-50 dark:focus:bg-rose-950/50"
                              >
                                <Trash2 className="mr-2 size-3.5 text-rose-600" />
                                Delete Opportunity
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Page {page} of {pageCount}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() =>
                  void navigate({
                    search: (prev: OpportunityFilters) => ({ ...prev, page: page - 1 }),
                  })
                }
              >
                <ChevronLeft className="size-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() =>
                  void navigate({
                    search: (prev: OpportunityFilters) => ({ ...prev, page: page + 1 }),
                  })
                }
              >
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Notes Dialog */}
      <Dialog open={!!editingNotesRow} onOpenChange={(open) => !open && setEditingNotesRow(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <FileText className="size-5 text-[#16a34a]" />
              Edit Opportunity Notes
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update notes for{" "}
              <strong className="text-slate-900 dark:text-slate-100 font-bold">
                {editingNotesRow?.prospect_name || editingNotesRow?.prospect_business}
              </strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter notes..."
              className="min-h-28 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setEditingNotesRow(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold"
              onClick={() => {
                if (!editingNotesRow) return;
                statusMutation.mutate(
                  {
                    id: editingNotesRow.id,
                    status: editingNotesRow.status,
                    prospectId: editingNotesRow.prospect_id,
                    prospectName: editingNotesRow.prospect_name,
                    estimatedValue: editingNotesRow.estimated_value,
                    notes: noteContent,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Notes updated successfully");
                      setEditingNotesRow(null);
                    },
                    onError: (err) => toast.error(err.message),
                  },
                );
              }}
            >
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OpportunityDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
