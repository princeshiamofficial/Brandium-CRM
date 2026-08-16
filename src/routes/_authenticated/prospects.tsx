import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  Eye,
  Edit,
  Edit3,
  Pencil,
  Phone,
  Clock,
  User,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Users,
  Users2,
  ListChecks,
  Trophy,
  CalendarClock,
  Repeat,
  Zap,
  CalendarIcon,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";

import { PageHeader } from "@/components/placeholder-page";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/lib/auth";
import {
  prospectsQuery,
  prospectsStatsQuery,
  prospectFiltersSchema,
  deleteProspect,
  getProspectArtistName,
  getProspectAgentName,
  type Prospect,
} from "@/lib/prospects";
import {
  stagesQuery,
  stageBadgeVariant,
  stageBadgeClass,
  FALLBACK_STAGES,
  formatStageSlugOrName,
} from "@/lib/stages";
import { ChangeStageDialog, type ChangeStageTarget } from "@/components/change-stage-dialog";
import { AddProspectDialog } from "@/components/add-prospect-dialog";
import { EditProspectDialog } from "@/components/edit-prospect-dialog";
import { ViewStageDialog } from "@/components/view-stage-dialog";
import { DeleteProspectDialog } from "@/components/delete-prospect-dialog";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

export const Route = createFileRoute("/_authenticated/prospects")({
  validateSearch: prospectFiltersSchema,
  head: () => ({
    meta: [
      { title: "Prospects | Brandium Telesales CRM" },
      { name: "description", content: "Manage and qualify your sales leads." },
      { property: "og:title", content: "Prospects | Brandium Telesales CRM" },
      { property: "og:description", content: "Manage and qualify your sales leads." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProspectsPage,
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

function ProspectsPage() {
  const { user, isAdmin } = useAuth();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [searchTerm, setSearchTerm] = useState(searchParams.search || "");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [stageTarget, setStageTarget] = useState<ChangeStageTarget | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    searchParams.from
      ? {
          from: new Date(searchParams.from),
          to: searchParams.to ? new Date(searchParams.to) : undefined,
        }
      : undefined,
  );
  const [calOpen, setCalOpen] = useState(false);
  const [addProspectOpen, setAddProspectOpen] = useState(false);
  const [editProspectId, setEditProspectId] = useState<string | null>(null);
  const [editProspectOpen, setEditProspectOpen] = useState(false);
  const [viewStageProspect, setViewStageProspect] = useState<Prospect | null>(null);
  const [viewStageOpen, setViewStageOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (prospectId: string) => deleteProspect(prospectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.resetQueries({ queryKey: ["prospects"] });
      queryClient.resetQueries({ queryKey: ["prospects-stats"] });
      toast.success("Prospect deleted successfully!");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete prospect.");
    },
  });

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const stats = useQuery(prospectsStatsQuery(user?.id || "", isAdmin));
  const prospects = useQuery(prospectsQuery(searchParams, user?.id || "", isAdmin));
  const stages = useQuery(stagesQuery());

  const displayStages =
    stages.data && stages.data.length > 0
      ? stages.data
      : [
          { id: "prospect", name: "Prospect" },
          { id: "dnp", name: "DNP" },
          { id: "switched_off", name: "Switched Off" },
          { id: "invalid_number", name: "Invalid Number" },
          { id: "not_interested", name: "Not Interested" },
          { id: "follow_up", name: "Follow-up" },
          { id: "opportunity_created", name: "Opportunity Created" },
          { id: "sales_won", name: "Sales Won" },
          { id: "denied_payment", name: "Denied Payment" },
        ];

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const next = debouncedSearch.trim();
    // normalize so "" and undefined are treated as the same state (avoids a navigate loop)
    if (next !== (searchParams.search ?? "")) {
      navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          search: next || undefined,
          page: 1,
        }),
        replace: true,
      });
    }
  }, [debouncedSearch, navigate, searchParams.search]);

  const updateFilter = (key: string, value: string | undefined) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, [key]: value, page: 1 }),
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev: Record<string, unknown>) => ({ ...prev, page: newPage }),
    });
  };

  const currentStageFilterId = searchParams.stage;
  const matchedStageObj = displayStages.find(
    (s) => s.id === currentStageFilterId || s.name === currentStageFilterId,
  );
  const currentStageName =
    matchedStageObj?.name ||
    (currentStageFilterId && currentStageFilterId !== "all" ? currentStageFilterId : "Follow-up");

  const currentStageCount =
    stats.data?.stageCounts?.[currentStageName] ??
    stats.data?.stageCounts?.[currentStageName.toLowerCase()] ??
    (currentStageName.toLowerCase().includes("follow")
      ? (stats.data?.followUps ?? 0)
      : (prospects.data?.data ?? []).filter((p) => {
          const sName = (
            ((p as Record<string, unknown>)["stage_name"] as string) ||
            p.stage_id ||
            ""
          ).toLowerCase();
          return sName.includes(currentStageName.toLowerCase());
        }).length);

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Prospects"
        description="Manage sales pipeline prospects, follow-up stages, and lead assignments."
      >
        <Button
          onClick={() => setAddProspectOpen(true)}
          className="bg-[#67B239] hover:bg-[#5aa030] text-white"
        >
          <Plus className="mr-2 size-4" />
          Add Prospect
        </Button>
      </PageHeader>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total Prospects"
          value={stats.data?.totalProspects ?? 0}
          icon={Users2}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Active Prospects"
          value={stats.data?.activeProspects ?? 0}
          icon={ListChecks}
          colorScheme="pastelTeal"
        />
        <StatCard
          label="Won Sales"
          value={stats.data?.salesWon ?? 0}
          icon={Trophy}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Pending Tasks"
          value={stats.data?.pendingTasks ?? 0}
          icon={CalendarClock}
          colorScheme="pastelPeach"
        />
        <StatCard
          label={`${currentStageName} Stage`}
          value={currentStageCount}
          icon={Repeat}
          colorScheme="pastelYellow"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Search name, business, phone..."
            className="pl-9 bg-white [&::-webkit-search-cancel-button]:hidden"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={searchParams.stage ?? "all"}
            onValueChange={(v: string) => updateFilter("stage", v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-45 bg-white">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {(stages.data && stages.data.length > 0 ? stages.data : FALLBACK_STAGES).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
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
                      {format(dateRange.from, "MMM d")} – {format(dateRange.to, "MMM d, yyyy")}
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

          <Button
            variant="outline"
            size="icon"
            className="bg-accent"
            onClick={() => {
              setSearchTerm("");
              setDateRange(undefined);
              navigate({ search: { page: 1 } });
            }}
          >
            <Filter className="size-4" />
          </Button>
        </div>
      </div>

      {/* Search Results Header matching Reference Image */}
      <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 pb-2">
        <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Search Results
        </h2>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Showing:{" "}
          <span className="font-bold text-slate-900 dark:text-slate-200">
            {prospects.data?.data.length ?? 0}
          </span>{" "}
          of{" "}
          <span className="font-bold text-slate-900 dark:text-slate-200">
            {prospects.data?.count ?? 0}
          </span>{" "}
          prospects
        </p>
      </div>

      {/* 5-Column Prospect Cards Grid matching Reference Image */}
      {prospects.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-4 shadow-2xs space-y-3"
            >
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : !prospects.data?.data || prospects.data.data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-12 text-center text-muted-foreground shadow-2xs">
          <p className="text-sm font-medium">No prospects found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {(prospects.data?.data ?? []).map((p) => (
            <div
              key={p.id}
              className="group relative rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-4 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Top Prospect Info */}
              <div>
                {/* Header: Avatar, Name, Designation & Edit Icon */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="size-9 rounded-full bg-orange-100/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0 border border-orange-200/60 shadow-2xs mt-0.5">
                      <User className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight truncate group-hover:text-[#0A2E5C] transition-colors">
                        {p.contact_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate mt-0.5">
                        {p.designation || p.business_name || "Prospect Lead"}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-accent shrink-0 -mr-1 transition-colors cursor-pointer"
                      >
                        <MoreVertical className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-36 rounded-xl shadow-lg border-slate-200 dark:border-slate-800"
                    >
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer font-semibold text-xs py-2"
                        onClick={() => {
                          setEditProspectId(p.id);
                          setEditProspectOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5 text-slate-500" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer font-semibold text-xs py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                        onClick={() => {
                          setDeleteTarget({ id: p.id, name: p.contact_name });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="size-3.5 text-rose-500" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Quick Details: Phone & Service */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                      {p.phone || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="size-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                      {p.service_name || p.business_name || "General Service"}
                    </span>
                  </div>
                </div>

                {/* Middle Clean Gray Metadata Box */}
                <div className="mt-3 bg-[#F4F6F8] dark:bg-slate-800/50 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 font-semibold space-y-1.5 border border-slate-100/80 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 truncate">
                    <Pencil className="size-3.5 text-slate-400 shrink-0" />
                    <span>
                      Agent :{" "}
                      <strong className="font-bold text-slate-900 dark:text-slate-100">
                        {getProspectAgentName(p)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="size-3.5 text-[#67B239] shrink-0" />
                    <span>
                      Artist :{" "}
                      <strong className="font-bold text-slate-900 dark:text-slate-100">
                        {getProspectArtistName(p)}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="size-3.5 text-slate-400 shrink-0" />
                      <span>Created : {format(new Date(p.created_at), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-3.5 text-slate-400 shrink-0" />
                      <span>{format(new Date(p.created_at), "h:mm a")}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="size-3.5 text-slate-400 shrink-0" />
                      <span>
                        Updated : {format(new Date(p.updated_at || p.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-3.5 text-slate-400 shrink-0" />
                      <span>{format(new Date(p.updated_at || p.created_at), "h:mm a")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Pill Buttons */}
              <div className="mt-3.5 space-y-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 rounded-xl bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
                  onClick={() =>
                    setStageTarget({
                      id: p.id,
                      label: p.business_name || p.contact_name,
                      stageId: p.stage_id,
                      currentStageName:
                        p.stage_name ||
                        ((p as Record<string, unknown>)["stage_name"] as string) ||
                        (p.stage_id ? formatStageSlugOrName(p.stage_id) : "Prospect"),
                    })
                  }
                >
                  Update Status
                </Button>
                <Button
                  size="sm"
                  className="w-full h-9 rounded-xl bg-[#67B239] hover:bg-[#5AA030] text-white font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
                  onClick={() => {
                    setViewStageProspect(p as unknown as Prospect);
                    setViewStageOpen(true);
                  }}
                >
                  View Stage
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ChangeStageDialog
        target={stageTarget}
        onOpenChange={(open) => {
          if (!open) setStageTarget(null);
        }}
      />

      <AddProspectDialog open={addProspectOpen} onOpenChange={setAddProspectOpen} />

      <EditProspectDialog
        prospectId={editProspectId}
        open={editProspectOpen}
        onOpenChange={(open) => {
          setEditProspectOpen(open);
          if (!open) setEditProspectId(null);
        }}
      />

      <ViewStageDialog
        prospect={viewStageProspect}
        open={viewStageOpen}
        onOpenChange={(open) => {
          setViewStageOpen(open);
          if (!open) setViewStageProspect(null);
        }}
        onEdit={(p) => {
          setEditProspectId(p.id);
          setEditProspectOpen(true);
        }}
      />

      <DeleteProspectDialog
        prospect={deleteTarget}
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
