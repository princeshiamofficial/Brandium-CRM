"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Eye,
  Pencil,
  Phone,
  Clock,
  User,
  UserPlus,
  PhoneMissed,
  Briefcase,
  Users2,
  Trophy,
  Repeat,
  UserCheck,
  CalendarIcon,
  RefreshCw,
  Mail,
  MapPin,
  FileText,
  PhoneCall,
  MessageSquare,
  Globe,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  Star,
  SearchX,
  Download,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useRef, Suspense } from "react";
import { useDebounce } from "use-debounce";

import { PageHeader } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/lib/auth";
import { formatCrmDate, formatCrmTime, formatCrmDateTime } from "@/lib/mysql-client";
import { agentsQuery } from "@/lib/follow-ups";
import { servicesQueryOptions } from "@/lib/services";
import {
  prospectsQuery,
  prospectsStatsQuery,
  deleteProspect,
  toggleProspectQualified,
  getProspectArtistName,
  getProspectAgentName,
  getProspectCreatorName,
  getProspectCreatorAvatar,
  getProspectCleanNotes,
  type Prospect,
  type ProspectFilters,
} from "@/lib/prospects";
import {
  stagesQuery,
  FALLBACK_STAGES,
  formatStageSlugOrName,
  resolveStageColor,
  resolveStageIcon,
} from "@/lib/stages";
import { ChangeStageDialog, type ChangeStageTarget } from "@/components/change-stage-dialog";
import { ScheduleMeetingDialog } from "@/components/schedule-meeting-dialog";
import { FollowUpDialog } from "@/components/follow-up-dialog";
import { RecordDeniedPaymentDialog } from "@/components/record-denied-payment-dialog";
import { AddInvoiceDialog } from "@/components/add-invoice-dialog";
import { AddProspectDialog } from "@/components/add-prospect-dialog";
import { EditProspectDialog } from "@/components/edit-prospect-dialog";
import { ViewStageDialog } from "@/components/view-stage-dialog";
import { DeleteProspectDialog } from "@/components/delete-prospect-dialog";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useAppFilters } from "@/lib/use-app-router";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  colorScheme,
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string | undefined;
  icon: LucideIcon;
  colorScheme:
    | "pastelPurple"
    | "pastelTeal"
    | "pastelEmerald"
    | "pastelPeach"
    | "pastelYellow"
    | "pastelBlue"
    | "pastelIndigo"
    | "pastelRose";
  onClick?: (() => void) | undefined;
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
    pastelBlue: {
      cardBg: "bg-[#E0F2FE] dark:bg-sky-950/40",
      iconText: "text-[#0284C7] dark:text-sky-400",
    },
    pastelIndigo: {
      cardBg: "bg-[#E0E7FF] dark:bg-indigo-950/40",
      iconText: "text-[#4F46E5] dark:text-indigo-400",
    },
    pastelRose: {
      cardBg: "bg-[#FFE4E6] dark:bg-rose-950/40",
      iconText: "text-[#E11D48] dark:text-rose-400",
    },
  }[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-3 sm:p-3.5 xl:p-4 shadow-md hover:shadow-lg transition-all duration-200 select-none ${styles.cardBg} ${
        onClick ? "cursor-pointer hover:scale-[1.02]" : ""
      }`}
    >
      <div className="relative z-10 flex items-center gap-2.5 sm:gap-3 xl:gap-3.5">
        <div className="size-9 sm:size-10 xl:size-11 rounded-full bg-white dark:bg-card shadow-2xs flex items-center justify-center shrink-0">
          <Icon className={`size-4.5 sm:size-5 xl:size-5.5 ${styles.iconText}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate">
            {label}
          </p>
          <p className="text-lg sm:text-xl xl:text-2xl font-black text-slate-950 dark:text-white leading-tight mt-0.5 tracking-tight truncate">
            {value}
          </p>
          {hint && (
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate mt-0.5">
              {hint}
            </p>
          )}
        </div>
      </div>

      <div className="absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transform rotate-12 scale-125 transition-transform group-hover:scale-135">
        <Icon className={`size-16 ${styles.iconText}`} />
      </div>
    </div>
  );
}

function ProspectsPageContent() {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useAppFilters<ProspectFilters>({
    page: 1,
    pageSize: 12,
  });

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
  const [editProspect, setEditProspect] = useState<Prospect | null>(null);
  const [editProspectId, setEditProspectId] = useState<string | null>(null);
  const [editProspectOpen, setEditProspectOpen] = useState(false);
  const [viewStageProspect, setViewStageProspect] = useState<Prospect | null>(null);
  const [viewStageOpen, setViewStageOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [scheduleMeetingProspectId, setScheduleMeetingProspectId] = useState<string | undefined>(
    undefined,
  );
  const [deniedPaymentOpen, setDeniedPaymentOpen] = useState(false);
  const [deniedPaymentProspectId, setDeniedPaymentProspectId] = useState<string | undefined>(
    undefined,
  );
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false);
  const [addInvoiceProspectId, setAddInvoiceProspectId] = useState<string | undefined>(undefined);
  const [scheduleFollowUpOpen, setScheduleFollowUpOpen] = useState(false);
  const [scheduleFollowUpProspectId, setScheduleFollowUpProspectId] = useState<string | undefined>(
    undefined,
  );
  const [scheduleFollowUpProspectLabel, setScheduleFollowUpProspectLabel] = useState<
    string | undefined
  >(undefined);

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

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const toggleQualifiedMutation = useMutation({
    mutationFn: async ({ id, isQualified }: { id: string; isQualified: boolean }) => {
      return toggleProspectQualified(id, isQualified);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["qualified-leads"] });
      toast.success(
        variables.isQualified ? "Prospect marked as Qualified!" : "Prospect qualification removed.",
      );
    },
    onError: () => {
      toast.error("Failed to update prospect qualification.");
    },
  });

  const handleExportCSV = () => {
    const list = prospects.data?.data ?? [];
    if (list.length === 0) {
      toast.info("No prospects to export.");
      return;
    }
    const headers = [
      "Contact Name",
      "Business Name",
      "Designation",
      "Phone",
      "Alternative Phone",
      "Email",
      "Service",
      "Stage",
      "Qualified",
      "Assigned Agent",
      "Assigned Artist",
      "Created By",
      "Created At",
      "Notes",
    ];
    const csvRows = list.map((p) => [
      `"${(p.contact_name || "").replace(/"/g, '""')}"`,
      `"${(p.business_name || "").replace(/"/g, '""')}"`,
      `"${(p.designation || "").replace(/"/g, '""')}"`,
      `"${(p.phone || "").replace(/"/g, '""')}"`,
      `"${(p.alternative_phone || "").replace(/"/g, '""')}"`,
      `"${(p.email || "").replace(/"/g, '""')}"`,
      `"${(p.service_name || p.service_id || "").replace(/"/g, '""')}"`,
      `"${(p.stage_name || p.stage_id || "").replace(/"/g, '""')}"`,
      p.is_qualified ? "Yes" : "No",
      `"${(p.assigned_agent_name || "").replace(/"/g, '""')}"`,
      `"${(p.assigned_artist_name || "").replace(/"/g, '""')}"`,
      `"${(p.creator_name || "").replace(/"/g, '""')}"`,
      `"${p.created_at || ""}"`,
      `"${(getProspectCleanNotes(p.notes) || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brandium-prospects-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${list.length} prospects to CSV!`);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDateRange(undefined);
    setSearchParams({ page: 1 });
    toast.info("All filters have been reset.");
  };

  const stats = useQuery(prospectsStatsQuery(user?.id || "", isAdmin));
  const prospects = useQuery(prospectsQuery(searchParams, user?.id || "", isAdmin));
  const stages = useQuery(stagesQuery());
  const agents = useQuery(agentsQuery());
  const services = useQuery(servicesQueryOptions());

  const currentPageSize = Number(searchParams.pageSize) || 12;
  const currentPage = Number(searchParams.page) || 1;
  const totalCount = prospects.data?.count ?? 0;
  const pageCount = prospects.data?.pageCount ?? 1;
  const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;
  const endIndex = Math.min(currentPage * currentPageSize, totalCount);

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
    if (next !== (searchParams.search ?? "")) {
      setSearchParams({ search: next || undefined, page: 1 });
    }
  }, [debouncedSearch, searchParams.search, setSearchParams]);

  const updateFilter = (key: string, value: string | undefined) => {
    setSearchParams({ [key]: value, page: 1 });
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Prospects"
        description="Manage sales pipeline prospects, follow-up stages, and lead assignments."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm shadow-2xs"
          >
            <Download className="mr-1.5 size-3.5 sm:size-4 text-slate-500" />
            Export CSV
          </Button>
          <Button
            onClick={() => setAddProspectOpen(true)}
            className="bg-[#67B239] hover:bg-[#5aa030] text-white text-xs sm:text-sm font-semibold shadow-xs"
          >
            <Plus className="mr-1.5 size-4" />
            Add Prospect
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard
          label="All"
          value={stats.data?.totalProspects ?? 0}
          hint="All pipeline leads"
          icon={Users2}
          colorScheme="pastelPurple"
          onClick={() => {
            updateFilter("stage", undefined);
            setSearchTerm("");
          }}
        />
        <StatCard
          label="Prospect"
          value={stats.data?.prospectCount ?? 0}
          hint="New leads"
          icon={UserPlus}
          colorScheme="pastelBlue"
          onClick={() => {
            const pStage = displayStages.find(
              (s) =>
                s.name.toLowerCase().includes("prospect") && !s.name.toLowerCase().includes("all"),
            );
            updateFilter("stage", pStage?.id || "prospect");
            setSearchTerm("");
          }}
        />
        <StatCard
          label="Qualified"
          value={stats.data?.qualifiedLeads ?? 0}
          hint="Ready for sales"
          icon={UserCheck}
          colorScheme="pastelTeal"
          onClick={() => {
            const qStage = displayStages.find(
              (s) =>
                s.name.toLowerCase().includes("qualif") ||
                s.name.toLowerCase().includes("opportunity") ||
                s.name.toLowerCase().includes("proposal"),
            );
            updateFilter("stage", qStage?.id || "qualified");
            setSearchTerm("");
          }}
        />
        <StatCard
          label="Follow-Up"
          value={stats.data?.followUps ?? 0}
          hint="Active outreach"
          icon={Repeat}
          colorScheme="pastelYellow"
          onClick={() => {
            const fStage = displayStages.find((s) => s.name.toLowerCase().includes("follow"));
            updateFilter("stage", fStage?.id || "follow-up");
            setSearchTerm("");
          }}
        />
        <StatCard
          label="Meeting"
          value={stats.data?.meetingCount ?? 0}
          hint="Scheduled calls"
          icon={CalendarIcon}
          colorScheme="pastelIndigo"
          onClick={() => {
            const mStage = displayStages.find((s) => s.name.toLowerCase().includes("meeting"));
            updateFilter("stage", mStage?.id || "meeting-scheduled");
            setSearchTerm("");
          }}
        />
        <StatCard
          label="Won"
          value={stats.data?.salesWon ?? 0}
          hint={stats.data?.successRate ? `Rate: ${stats.data.successRate}` : "Closed deals"}
          icon={Trophy}
          colorScheme="pastelEmerald"
          onClick={() => {
            const wStage = displayStages.find(
              (s) => s.name.toLowerCase().includes("won") || s.name.toLowerCase().includes("sales"),
            );
            updateFilter("stage", wStage?.id || "sales_won");
            setSearchTerm("");
          }}
        />
        <StatCard
          label="Lost/DNP"
          value={stats.data?.lostDnpCount ?? 0}
          hint="Unreached / Lost"
          icon={PhoneMissed}
          colorScheme="pastelPeach"
          onClick={() => {
            const lStage = displayStages.find(
              (s) =>
                s.name.toLowerCase().includes("dnp") ||
                s.name.toLowerCase().includes("lost") ||
                s.name.toLowerCase().includes("switch") ||
                s.name.toLowerCase().includes("invalid"),
            );
            updateFilter("stage", lStage?.id || "dnp");
            setSearchTerm("");
          }}
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 min-w-60 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Search name, phone, email, business, service..."
            className="pl-9 pr-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs [&::-webkit-search-cancel-button]:hidden"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Filter */}
          <Select
            value={searchParams.stage ?? "all"}
            onValueChange={(v: string) => updateFilter("stage", v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-37 sm:w-42 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
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

          {/* Service Filter */}
          <Select
            value={searchParams.service ?? "all"}
            onValueChange={(v: string) => updateFilter("service", v === "all" ? undefined : v)}
          >
            <SelectTrigger className="w-37 sm:w-42 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {(services.data ?? []).map((srv) => (
                <SelectItem key={srv.id} value={srv.id}>
                  {srv.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Agent Filter (Admin only) */}
          {isAdmin && (
            <Select
              value={searchParams.agent ?? "all"}
              onValueChange={(v: string) => updateFilter("agent", v === "all" ? undefined : v)}
            >
              <SelectTrigger className="w-34 sm:w-38 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {(agents.data ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date Range Picker */}
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-1.5 text-xs font-normal shadow-2xs ${
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
        </div>
      </div>

      {/* Search Results & View Switcher Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Search Results
          </h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
            {prospects.data?.data?.length ?? 0} shown
          </span>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden sm:inline text-xs font-medium text-slate-500 dark:text-slate-400">
            Total:{" "}
            <span className="font-bold text-slate-900 dark:text-slate-200">
              {prospects.data?.count ?? 0}
            </span>{" "}
            prospects
          </p>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Table View"
            >
              <List className="size-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
        </div>
      </div>
      {/* Content Area: Loading, Empty, Table, or Grid */}
      {prospects.isPending ? (
        viewMode === "table" ? (
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card p-4 space-y-3 shadow-xs">
            <Skeleton className="h-9 w-full rounded-md" />
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="size-8 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3.5 w-1/2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <Skeleton className="h-6 w-28 rounded-md" />
                  <Skeleton className="size-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : !prospects.data?.data || prospects.data.data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card p-10 sm:p-14 text-center shadow-xs">
          <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 mb-4 shadow-2xs">
            <SearchX className="size-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5">
            No prospects found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            We couldn&apos;t find any prospects matching your current search criteria or active
            filters. Try clearing your filters or creating a new lead.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="border-slate-200 dark:border-slate-800 text-xs shadow-2xs"
            >
              Reset All Filters
            </Button>
            <Button
              size="sm"
              onClick={() => setAddProspectOpen(true)}
              className="bg-[#67B239] hover:bg-[#5aa030] text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="mr-1.5 size-3.5" />
              Add Prospect
            </Button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* High-Density Modern Table View */
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
                <TableRow className="border-none text-[12px] font-bold text-slate-600 dark:text-slate-300">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="min-w-48">Lead / Contact</TableHead>
                  <TableHead className="min-w-36">Business</TableHead>
                  <TableHead className="min-w-40">Contact Info</TableHead>
                  <TableHead className="min-w-32">Service</TableHead>
                  <TableHead className="min-w-32">Stage</TableHead>
                  <TableHead className="min-w-28 text-center">Status</TableHead>
                  <TableHead className="min-w-36">Creator</TableHead>
                  <TableHead className="min-w-28">Created</TableHead>
                  <TableHead className="w-16 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(prospects.data?.data ?? []).map((p, idx) => {
                  const stageName =
                    p.stage_name ||
                    ((p as Record<string, unknown>)["stage_name"] as string) ||
                    (p.stage_id ? formatStageSlugOrName(p.stage_id) : "Prospect");
                  const pRecord = p as unknown as Record<string, unknown>;
                  const stageColor = resolveStageColor(
                    stageName,
                    (pRecord["stage_color"] as string) || null,
                  );

                  const resolvedServiceName =
                    (p.service_name && p.service_name.trim() !== "" && p.service_name !== "N/A"
                      ? p.service_name
                      : (services.data ?? []).find(
                          (s) => s.id === p.service_id || s.name === p.service_id,
                        )?.name) ||
                    p.service_id ||
                    "Graphics Design";

                  const creatorName = getProspectCreatorName(p);
                  const creatorAvatar = getProspectCreatorAvatar(p);
                  const isQual = Boolean(p.is_qualified);

                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => {
                        setViewStageProspect(p);
                        setViewStageOpen(true);
                      }}
                      className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/80"
                    >
                      <TableCell className="text-center text-xs font-medium text-slate-400">
                        {startIndex + idx}
                      </TableCell>

                      {/* Contact Column */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="size-9 rounded-full shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center border border-slate-200/80 dark:border-slate-700 overflow-hidden text-xs">
                            {p.logo_url ? (
                              <img
                                src={p.logo_url}
                                alt={p.contact_name}
                                className="size-full object-cover rounded-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span>
                                {p.contact_name ? p.contact_name.slice(0, 2).toUpperCase() : "PR"}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate hover:text-blue-600 transition-colors">
                              {p.contact_name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {p.designation || "Lead / Prospect"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Business */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium truncate max-w-40">
                          <Building2 className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate">{p.business_name || "—"}</span>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          {p.phone ? (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <Phone className="size-3 text-slate-400 shrink-0" />
                              <a
                                href={`tel:${p.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-blue-600 truncate"
                              >
                                {p.phone}
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No phone</span>
                          )}
                          {p.email && (
                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                              <Mail className="size-3 text-slate-400 shrink-0" />
                              <a
                                href={`mailto:${p.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-blue-600 truncate max-w-36"
                              >
                                {p.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Service Tag */}
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-xs font-medium bg-[#FEF8E6] text-[#B78103] dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 truncate max-w-32">
                          {resolvedServiceName}
                        </span>
                      </TableCell>

                      {/* Stage Badge */}
                      <TableCell>
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-xs font-medium border"
                          style={{
                            backgroundColor: `${stageColor}15`,
                            color: stageColor,
                            borderColor: `${stageColor}30`,
                          }}
                        >
                          <span
                            className="size-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: stageColor }}
                          />
                          <span className="truncate max-w-28">{stageName}</span>
                        </span>
                      </TableCell>

                      {/* Qualified Status Button */}
                      <TableCell className="text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleQualifiedMutation.mutate({
                              id: p.id,
                              isQualified: !isQual,
                            });
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            isQual
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/70"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 hover:bg-slate-200"
                          }`}
                          title={
                            isQual ? "Click to unmark qualified" : "Click to mark as Qualified"
                          }
                        >
                          <Star
                            className={`size-3 ${isQual ? "text-emerald-600 fill-emerald-500" : "text-slate-400"}`}
                          />
                          <span>{isQual ? "Qualified" : "Regular"}</span>
                        </button>
                      </TableCell>

                      {/* Creator */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <div className="size-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden text-[9px] font-semibold shrink-0">
                            {creatorAvatar ? (
                              <img
                                src={creatorAvatar}
                                alt={creatorName}
                                className="size-full object-cover rounded-full"
                              />
                            ) : (
                              <span>{creatorName ? creatorName.charAt(0).toUpperCase() : "U"}</span>
                            )}
                          </div>
                          <span className="truncate max-w-24 text-[12px]">{creatorName}</span>
                        </div>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatCrmDate(p.created_at)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="size-7 rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 flex items-center justify-center shrink-0 transition-colors cursor-pointer ml-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="size-3.5" />
                              <span className="sr-only">Actions</span>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            sideOffset={4}
                            className="w-44 min-w-44 rounded-[5px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-1 shadow-md"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer w-full text-[13px] font-normal px-3 py-1.5 rounded-[5px]"
                              onClick={() => {
                                setEditProspect(p);
                                setEditProspectId(p.id);
                                setEditProspectOpen(true);
                              }}
                            >
                              <Pencil className="size-3.5 text-[#1B84FF] shrink-0" />
                              <span>Edit</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer w-full text-[13px] font-normal px-3 py-1.5 rounded-[5px] text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                              onClick={() => {
                                setDeleteTarget({ id: p.id, name: p.contact_name });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="size-3.5 text-[#707070] dark:text-slate-400 shrink-0" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        /* Responsive Prospect Cards Grid */
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(prospects.data?.data ?? []).map((p) => {
            const stageName =
              p.stage_name ||
              ((p as Record<string, unknown>)["stage_name"] as string) ||
              (p.stage_id ? formatStageSlugOrName(p.stage_id) : "Prospect");
            const pRecord = p as unknown as Record<string, unknown>;
            const stageColor = resolveStageColor(
              stageName,
              (pRecord["stage_color"] as string) || null,
            );

            const resolvedServiceName =
              (p.service_name && p.service_name.trim() !== "" && p.service_name !== "N/A"
                ? p.service_name
                : (services.data ?? []).find(
                    (s) => s.id === p.service_id || s.name === p.service_id,
                  )?.name) ||
              p.service_id ||
              "Graphics Design";

            const creatorName = getProspectCreatorName(p);
            const creatorAvatar = getProspectCreatorAvatar(p);
            const agentName = getProspectAgentName(p);
            const artistName = getProspectArtistName(p);
            const cleanNote = getProspectCleanNotes(p.notes);
            const prospectLocation =
              p.address ||
              (pRecord["country"] as string) ||
              (pRecord["location"] as string) ||
              (pRecord["city"] as string) ||
              "Location not set";
            const isQual = Boolean(p.is_qualified);

            return (
              <div
                key={p.id}
                onClick={() => {
                  setViewStageProspect(p as unknown as Prospect);
                  setViewStageOpen(true);
                }}
                className="group relative rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none"
              >
                <div>
                  {/* Top: Avatar + Name / Designation + 3-Dot Action Button */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-10 rounded-full shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center border border-slate-200/80 dark:border-slate-700 overflow-hidden">
                        {p.logo_url ? (
                          <img
                            src={p.logo_url}
                            alt={p.contact_name}
                            className="size-full object-cover rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                            {p.contact_name ? p.contact_name.slice(0, 2).toUpperCase() : "PR"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h6 className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate group-hover:text-blue-600 transition-colors">
                          {p.contact_name}
                        </h6>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400 truncate mb-0">
                          {p.designation || "Lead / Prospect"}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="size-7.75 rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="size-3.5" />
                          <span className="sr-only">Actions</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={4}
                        className="w-44 min-w-44 rounded-[5px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-1 shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer w-full text-[14px] font-normal leading-5.25 text-[#707070] dark:text-slate-400 focus:text-slate-900 dark:focus:text-slate-100 focus:bg-slate-50 dark:focus:bg-slate-800 rounded-[6px] px-3.75 py-[6.4px] transition-colors"
                          onClick={() => {
                            setEditProspect(p);
                            setEditProspectId(p.id);
                            setEditProspectOpen(true);
                          }}
                        >
                          <Pencil className="size-3.5 text-[#1B84FF] shrink-0" />
                          <span>Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer w-full text-[14px] font-normal leading-5.25 text-[#707070] dark:text-slate-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40 rounded-[6px] px-3.75 py-[6.4px] transition-colors"
                          onClick={() => {
                            setDeleteTarget({ id: p.id, name: p.contact_name });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="size-3.5 text-[#707070] dark:text-slate-400 shrink-0" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Middle: Details (Business Name, Email, Phone, Location) & Soft Badges */}
                  <div className="space-y-2.5 text-[13px] text-slate-500 dark:text-slate-400 font-normal">
                    {/* Business Name */}
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="size-3.5 text-slate-800 dark:text-slate-200 shrink-0" />
                      <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {p.business_name || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <Mail className="size-3.5 text-slate-800 dark:text-slate-200 shrink-0" />
                      <a
                        href={p.email ? `mailto:${p.email}` : undefined}
                        onClick={(e) => e.stopPropagation()}
                        className={`truncate ${p.email ? "hover:text-blue-600 hover:underline" : "text-slate-400 dark:text-slate-500"}`}
                      >
                        {p.email || "No email"}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="size-3.5 text-slate-800 dark:text-slate-200 shrink-0" />
                      <a
                        href={p.phone ? `tel:${p.phone}` : undefined}
                        onClick={(e) => e.stopPropagation()}
                        className={`truncate ${p.phone ? "hover:text-blue-600 hover:underline" : "text-slate-400 dark:text-slate-500"}`}
                      >
                        {p.phone || "No phone"}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="size-3.5 text-slate-800 dark:text-slate-200 shrink-0" />
                      <span className="truncate">{prospectLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <CalendarIcon className="size-3.5 text-slate-800 dark:text-slate-200 shrink-0" />
                      <span className="truncate">{formatCrmDateTime(p.created_at)}</span>
                    </div>

                    {/* Note / Requirements: Torn Paper ("Chira Kagoj") via SVG */}
                    <div
                      className="relative my-0.5 min-h-9 flex items-center px-4 py-1.5 filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.01]"
                      title={cleanNote || "No note"}
                    >
                      {/* Exact Torn Paper Background SVG matching user design */}
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

                      {/* Content inside the torn paper */}
                      <div className="relative z-1 flex items-center gap-1.5 truncate w-full text-[12px] px-1">
                        <div className="flex items-center gap-1 shrink-0 text-amber-800 dark:text-yellow-300 font-bold text-[11px]">
                          <FileText className="size-3.5 text-amber-700 dark:text-yellow-400" />
                          <span>Note:</span>
                        </div>
                        <span
                          className={`truncate ${cleanNote ? "text-amber-950 dark:text-amber-100 font-medium" : "text-amber-700/60 dark:text-amber-400/50 italic"}`}
                        >
                          {cleanNote || "No note"}
                        </span>
                      </div>
                    </div>

                    {/* Soft Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      {/* Dynamic Soft Stage Badge */}
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-xs font-medium border"
                        style={{
                          backgroundColor: `${stageColor}15`,
                          color: stageColor,
                          borderColor: `${stageColor}30`,
                        }}
                      >
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: stageColor }}
                        />
                        <span className="truncate max-w-30">{stageName}</span>
                      </span>

                      {/* Soft Service Tag (matches badge-soft-warning) */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-xs font-medium bg-[#FEF8E6] text-[#B78103] dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 truncate max-w-32.5">
                        {resolvedServiceName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer: Quick Social Links & Assigned Agent / Creator Avatar */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1">
                    {/* Mail Link */}
                    <a
                      href={p.email ? `mailto:${p.email}` : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!p.email) toast.info("No email provided");
                      }}
                      title={p.email ? `Send Email (${p.email})` : "No email"}
                      className="size-6 rounded-full text-slate-800 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Mail className="size-3.5" />
                    </a>

                    {/* Phone Call Link */}
                    <a
                      href={p.phone ? `tel:${p.phone}` : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!p.phone) toast.info("No phone number provided");
                      }}
                      title={p.phone ? `Call (${p.phone})` : "No phone"}
                      className="size-6 rounded-full text-slate-800 dark:text-slate-300 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <PhoneCall className="size-3.5" />
                    </a>

                    {/* WhatsApp / Message Link */}
                    <a
                      href={p.phone ? `https://wa.me/${p.phone.replace(/[^0-9]/g, "")}` : undefined}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!p.phone) toast.info("No phone for WhatsApp message");
                      }}
                      title={p.phone ? "Message on WhatsApp" : "No WhatsApp"}
                      className="size-6 rounded-full text-slate-800 dark:text-slate-300 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <MessageSquare className="size-3.5" />
                    </a>

                    {/* Website / Globe Link */}
                    <a
                      href={
                        p.website_url
                          ? p.website_url.startsWith("http")
                            ? p.website_url
                            : `https://${p.website_url}`
                          : undefined
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!p.website_url) toast.info("No website URL");
                      }}
                      title={p.website_url ? `Open ${p.website_url}` : "No website"}
                      className="size-6 rounded-full text-slate-800 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Globe className="size-3.5" />
                    </a>
                  </div>

                  {/* Creator Info: Avatar + Name (by user id) */}
                  <div
                    title={`Added by: ${creatorName}`}
                    className="flex items-center gap-1.5 cursor-pointer shrink-0 max-w-[55%] min-w-0 group/creator"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info(`Added by: ${creatorName}`);
                    }}
                  >
                    <div className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden text-[10px] font-semibold text-slate-700 dark:text-slate-200 shadow-2xs shrink-0">
                      {creatorAvatar ? (
                        <img
                          src={creatorAvatar}
                          alt={creatorName}
                          className="size-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display =
                                "flex";
                            }
                          }}
                        />
                      ) : null}
                      <span
                        className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 uppercase"
                        style={{ display: creatorAvatar ? "none" : "flex" }}
                      >
                        {creatorName ? (
                          creatorName.charAt(0).toUpperCase()
                        ) : (
                          <User className="size-3 text-slate-400" />
                        )}
                      </span>
                    </div>
                    <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 truncate group-hover/creator:text-blue-600 transition-colors">
                      {creatorName}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {prospects.data && totalCount > 0 ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 pb-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p>
              Showing{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{startIndex}</span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{endIndex}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{totalCount}</span>{" "}
              prospects
            </p>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Show:</span>
              <Select
                value={String(currentPageSize)}
                onValueChange={(val: string) => {
                  setSearchParams({ pageSize: Number(val), page: 1 });
                }}
              >
                <SelectTrigger className="w-18 h-7 text-xs rounded-[6px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
                  <SelectValue placeholder="12" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-slate-500 dark:text-slate-400">per page</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setSearchParams({ page: currentPage - 1 })}
              className="h-8 px-3 text-xs font-medium rounded-[6px] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5 mr-1" />
              Previous
            </Button>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2 min-w-20 text-center">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pageCount}
              onClick={() => setSearchParams({ page: currentPage + 1 })}
              className="h-8 px-3 text-xs font-medium rounded-[6px] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              Next
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      ) : null}

      <ChangeStageDialog
        target={stageTarget}
        onOpenChange={(open) => {
          if (!open) setStageTarget(null);
        }}
        onStageChange={(_stageId, stageName) => {
          const normalised = stageName.toLowerCase().trim();
          if (normalised === "meeting scheduled") {
            const pid = stageTarget?.id;
            setStageTarget(null);
            setScheduleMeetingProspectId(pid);
            setScheduleMeetingOpen(true);
          } else if (normalised.includes("denied")) {
            const pid = stageTarget?.id;
            setStageTarget(null);
            setDeniedPaymentProspectId(pid);
            setDeniedPaymentOpen(true);
          } else if (normalised.includes("opportunity")) {
            const pid = stageTarget?.id;
            setStageTarget(null);
            setAddInvoiceProspectId(pid);
            setAddInvoiceOpen(true);
          } else if (normalised.includes("follow")) {
            const pid = stageTarget?.id;
            const plabel = stageTarget?.label;
            setStageTarget(null);
            setScheduleFollowUpProspectId(pid);
            setScheduleFollowUpProspectLabel(plabel);
            setScheduleFollowUpOpen(true);
          }
        }}
      />

      <FollowUpDialog
        open={scheduleFollowUpOpen}
        onOpenChange={setScheduleFollowUpOpen}
        prospectId={scheduleFollowUpProspectId}
        prospectLabel={scheduleFollowUpProspectLabel}
      />

      <ScheduleMeetingDialog
        open={scheduleMeetingOpen}
        onOpenChange={setScheduleMeetingOpen}
        defaultProspectId={scheduleMeetingProspectId}
      />

      <RecordDeniedPaymentDialog
        open={deniedPaymentOpen}
        onOpenChange={setDeniedPaymentOpen}
        defaultProspectId={deniedPaymentProspectId}
      />

      <AddInvoiceDialog
        open={addInvoiceOpen}
        onOpenChange={setAddInvoiceOpen}
        defaultProspectId={addInvoiceProspectId}
      />

      <AddProspectDialog open={addProspectOpen} onOpenChange={setAddProspectOpen} />

      <EditProspectDialog
        key={editProspect?.id || editProspectId || "none"}
        prospect={editProspect}
        prospectId={editProspectId}
        open={editProspectOpen}
        onOpenChange={(open) => {
          setEditProspectOpen(open);
          if (!open) {
            setEditProspectId(null);
            setEditProspect(null);
          }
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
          setEditProspect(p);
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

export default function ProspectsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-100 place-items-center">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
        </div>
      }
    >
      <ProspectsPageContent />
    </Suspense>
  );
}
