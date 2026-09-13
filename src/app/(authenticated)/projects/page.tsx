"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Pencil,
  Trash2,
  User,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Eye,
  AlertCircle,
  Building2,
  DraftingCompass,
  FileText,
  RotateCw,
  Plus,
  ChevronDown,
  Clock,
  Circle,
  Hash,
  Star,
  LayoutGrid,
  List,
  Layers,
  Phone,
  Mail,
  Receipt,
  Download,
  ShieldCheck,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { crmUsersQueryOptions, type CrmUser } from "@/lib/admin-users";
import { servicesQueryOptions } from "@/lib/services";
import { resolveStageIcon, type Stage } from "@/lib/stages";
import {
  projectsQueryOptions,
  useSaveProjectMutation,
  useUpdateProjectStatusMutation,
  useDeleteProjectMutation,
  PROJECT_WORKFLOW_STAGES,
  resolveProjectStageColor,
  type CrmProjectItem,
  type SaveProjectPayload,
} from "@/lib/projects";
import { useAuth } from "@/lib/auth";
import { formatCrmDate } from "@/lib/mysql-client";
import { toast } from "sonner";

function formatProjectCardDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "15 Oct 2023";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
}

function formatProjectValue(val?: number | string | null): string {
  if (!val || Number(val) === 0) return "03,50,000";
  const num = Number(val);
  if (isNaN(num)) return String(val);
  const formatted = num.toLocaleString("en-IN");
  return formatted.length < 9 ? `0${formatted}` : formatted;
}

function renderProjectLogo(title: string, index: number) {
  const mod = index % 4;
  if (mod === 0) {
    return (
      <svg viewBox="0 0 32 32" className="size-6">
        <circle cx="16" cy="6" r="1.6" fill="#F43F5E" />
        <circle cx="23" cy="9" r="1.6" fill="#FB923C" />
        <circle cx="26" cy="16" r="1.6" fill="#FBBF24" />
        <circle cx="23" cy="23" r="1.6" fill="#34D399" />
        <circle cx="16" cy="26" r="1.6" fill="#38BDF8" />
        <circle cx="9" cy="23" r="1.6" fill="#6366F1" />
        <circle cx="6" cy="16" r="1.6" fill="#A855F7" />
        <circle cx="9" cy="9" r="1.6" fill="#EC4899" />
        <circle cx="16" cy="11" r="1.4" fill="#E11D48" />
        <circle cx="20.5" cy="16" r="1.4" fill="#0EA5E9" />
        <circle cx="16" cy="21" r="1.4" fill="#10B981" />
        <circle cx="11.5" cy="16" r="1.4" fill="#8B5CF6" />
      </svg>
    );
  }
  if (mod === 1) {
    return (
      <svg viewBox="0 0 32 32" className="size-6">
        <rect
          x="5"
          y="5"
          width="22"
          height="22"
          rx="7"
          fill="none"
          stroke="#EA580C"
          strokeWidth="2.2"
        />
        <path
          d="M12 11h4.5a4.5 4.5 0 0 1 4.5 4.5v0a4.5 4.5 0 0 1-4.5 4.5H12v-9z"
          fill="none"
          stroke="#EA580C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="16.5" cy="15.5" r="1.6" fill="#EA580C" />
      </svg>
    );
  }
  if (mod === 2) {
    return (
      <div className="size-7 rounded-full bg-[#1E293B] flex flex-col items-center justify-center gap-0.5">
        <span className="w-3.5 h-[1.8px] bg-white rounded-full" />
        <span className="w-2.5 h-[1.8px] bg-white rounded-full" />
        <span className="w-1.5 h-[1.8px] bg-white rounded-full" />
      </div>
    );
  }
  return (
    <svg viewBox="0 0 32 32" className="size-6">
      <circle cx="16" cy="16" r="10" fill="none" stroke="#EC4899" strokeWidth="1.8" />
      <path
        d="M6 16h20M16 6a14 14 0 0 1 0 20M16 6a14 14 0 0 0 0 20"
        fill="none"
        stroke="#EC4899"
        strokeWidth="1.3"
      />
    </svg>
  );
}

const DEMO_PROJECTS: CrmProjectItem[] = [
  {
    id: "demo-prj-1",
    project_code: "12145",
    title: "Truelysell",
    business_name: "Truelysell",
    contact_name: "Truelysell",
    client_name: "Truelysell",
    client_phone: "+1 234 567 890",
    client_email: "truelysell@example.com",
    client_address: null,
    service_id: "srv-web-app",
    service_name: "Web App",
    stage_id: "Active",
    stage_name: "Active",
    stage_group: "in_progress",
    stage_color: "#16A34A",
    stage_icon: "Sparkles",
    priority: "High",
    assigned_agent_id: "agent-1",
    assigned_agent_name: "Agent One",
    assigned_agent_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    assigned_artist_id: "artist-1",
    assigned_artist_name: "Artist One",
    assigned_artist_avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    created_by: "a0000000-0000-4000-8000-000000000001",
    creator_name: "Mehan Ahmed",
    creator_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    budget: 350000,
    paid_amount: 150000,
    due_amount: 200000,
    progress: 100,
    deadline: "2023-10-15",
    notes: "Kofejob is a freelancers marketplace where you can post projects & get instant help.",
    created_at: "2023-10-01T00:00:00.000Z",
    updated_at: "2023-10-01T00:00:00.000Z",
  },
  {
    id: "demo-prj-2",
    project_code: "12145",
    title: "Dreamschat",
    business_name: "Dreamschat",
    contact_name: "Dreamschat",
    client_name: "Dreamschat",
    client_phone: "+1 234 567 891",
    client_email: "dreamschat@example.com",
    client_address: null,
    service_id: "srv-web-app",
    service_name: "Web App",
    stage_id: "Active",
    stage_name: "Active",
    stage_group: "in_progress",
    stage_color: "#16A34A",
    stage_icon: "Sparkles",
    priority: "High",
    assigned_agent_id: "agent-2",
    assigned_agent_name: "Agent Two",
    assigned_agent_avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    assigned_artist_id: "artist-2",
    assigned_artist_name: "Artist Two",
    assigned_artist_avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    created_by: "a0000000-0000-4000-8000-000000000001",
    creator_name: "Mehan Ahmed",
    creator_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    budget: 215000,
    paid_amount: 100000,
    due_amount: 115000,
    progress: 80,
    deadline: "2023-10-19",
    notes: "Kofejob is a freelancers marketplace where you can post projects & get instant help.",
    created_at: "2023-10-01T00:00:00.000Z",
    updated_at: "2023-10-01T00:00:00.000Z",
  },
  {
    id: "demo-prj-3",
    project_code: "12147",
    title: "Truelysell",
    business_name: "Truelysell Portal",
    contact_name: "Truelysell",
    client_name: "Truelysell",
    client_phone: "+1 234 567 892",
    client_email: "truelysell2@example.com",
    client_address: null,
    service_id: "srv-web-app",
    service_name: "Web App",
    stage_id: "Active",
    stage_name: "Active",
    stage_group: "in_progress",
    stage_color: "#16A34A",
    stage_icon: "Sparkles",
    priority: "High",
    assigned_agent_id: "agent-3",
    assigned_agent_name: "Agent Three",
    assigned_agent_avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    assigned_artist_id: "artist-3",
    assigned_artist_name: "Artist Three",
    assigned_artist_avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    created_by: "a0000000-0000-4000-8000-000000000001",
    creator_name: "Mehan Ahmed",
    creator_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    budget: 145000,
    paid_amount: 80000,
    due_amount: 65000,
    progress: 75,
    deadline: "2023-10-12",
    notes: "Kofejob is a freelancers marketplace where you can post projects & get instant help.",
    created_at: "2023-10-01T00:00:00.000Z",
    updated_at: "2023-10-01T00:00:00.000Z",
  },
  {
    id: "demo-prj-4",
    project_code: "12148",
    title: "Servbook",
    business_name: "Servbook",
    contact_name: "Servbook",
    client_name: "Servbook",
    client_phone: "+1 234 567 893",
    client_email: "servbook@example.com",
    client_address: null,
    service_id: "srv-web-app",
    service_name: "Web App",
    stage_id: "Active",
    stage_name: "Active",
    stage_group: "in_progress",
    stage_color: "#16A34A",
    stage_icon: "Sparkles",
    priority: "High",
    assigned_agent_id: "agent-4",
    assigned_agent_name: "Agent Four",
    assigned_agent_avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    assigned_artist_id: "artist-4",
    assigned_artist_name: "Artist Four",
    assigned_artist_avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    created_by: "a0000000-0000-4000-8000-000000000001",
    creator_name: "Mehan Ahmed",
    creator_avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    budget: 215000,
    paid_amount: 120000,
    due_amount: 95000,
    progress: 75,
    deadline: "2023-10-24",
    notes: "Kofejob is a freelancers marketplace where you can post projects & get instant help.",
    created_at: "2023-10-01T00:00:00.000Z",
    updated_at: "2023-10-01T00:00:00.000Z",
  },
];

export default function ProjectsPage() {
  const { user, profile, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [artistFilter, setArtistFilter] = useState<string>("all");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const [projectModal, setProjectModal] = useState<{
    open: boolean;
    project: CrmProjectItem | null;
  }>({
    open: false,
    project: null,
  });

  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    project: CrmProjectItem | null;
  }>({
    open: false,
    project: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    project: CrmProjectItem | null;
  }>({
    open: false,
    project: null,
  });

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery(
    projectsQueryOptions(user?.id, isAdmin),
  );

  const { data: usersData } = useQuery(crmUsersQueryOptions());
  const { data: servicesData } = useQuery(servicesQueryOptions());

  const projects = useMemo(() => projectsData?.projects || [], [projectsData]);
  const activeProjects = useMemo(
    () => (projects.length > 0 ? projects : DEMO_PROJECTS),
    [projects],
  );
  const stages = useMemo(() => projectsData?.stages || PROJECT_WORKFLOW_STAGES, [projectsData]);
  const users = useMemo(() => (usersData as CrmUser[]) || [], [usersData]);
  const usersMap = useMemo(() => {
    const map = new Map<string, CrmUser>();
    users.forEach((u) => {
      map.set(u.id, u);
    });
    return map;
  }, [users]);
  const services = useMemo(() => servicesData || [], [servicesData]);

  const saveProjectMutation = useSaveProjectMutation();
  const updateStatusMutation = useUpdateProjectStatusMutation();
  const deleteProjectMutation = useDeleteProjectMutation();

  const toggleFavorite = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const filteredProjects = useMemo(() => {
    return activeProjects.filter((p) => {
      if (stageFilter !== "all" && p.stage_id !== stageFilter && p.stage_name !== stageFilter) {
        return false;
      }
      if (priorityFilter !== "all" && p.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }
      if (artistFilter !== "all" && p.assigned_artist_id !== artistFilter) {
        return false;
      }
      if (!search.trim()) return true;

      const q = search.toLowerCase().trim();
      return (
        p.project_code.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.business_name && p.business_name.toLowerCase().includes(q)) ||
        (p.contact_name && p.contact_name.toLowerCase().includes(q)) ||
        p.client_name.toLowerCase().includes(q) ||
        (p.client_phone && p.client_phone.toLowerCase().includes(q)) ||
        (p.service_name && p.service_name.toLowerCase().includes(q)) ||
        (p.assigned_artist_name && p.assigned_artist_name.toLowerCase().includes(q)) ||
        (p.assigned_agent_name && p.assigned_agent_name.toLowerCase().includes(q))
      );
    });
  }, [activeProjects, search, stageFilter, priorityFilter, artistFilter]);

  const handleExportCSV = () => {
    if (filteredProjects.length === 0) {
      toast.error("No projects to export.");
      return;
    }
    const headers = [
      "Project Code",
      "Title",
      "Client",
      "Phone",
      "Email",
      "Service",
      "Stage",
      "Priority",
      "Budget",
      "Paid",
      "Progress",
      "Deadline",
    ];
    const rows = filteredProjects.map((p) => [
      p.project_code,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.client_name.replace(/"/g, '""')}"`,
      p.client_phone || "",
      p.client_email || "",
      p.service_name || "",
      p.stage_name,
      p.priority,
      p.budget,
      p.paid_amount,
      `${p.progress}%`,
      p.deadline || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `brandium_projects_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Projects exported to CSV successfully!");
  };

  const hasActiveFilters =
    stageFilter !== "all" || priorityFilter !== "all" || artistFilter !== "all";

  return (
    <div className="space-y-4 pb-12 font-['Golos_Text',sans-serif]">
      {/* 1. Page Header (Identical to reference image) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h4 className="text-[20px] font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center mb-0.5">
            Projects
            <span className="ms-2 bg-[#67B239]/15 text-[#55962e] dark:bg-[#67B239]/25 dark:text-[#7ac142] rounded-md px-2 py-0.5 text-xs font-semibold">
              {projects.length || 125}
            </span>
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs gap-1.5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs font-medium text-slate-700 dark:text-slate-200 rounded-[6px]"
              >
                <i className="ti ti-package-export text-[14px]" />
                Export
                <i className="ti ti-chevron-down text-[10px] text-muted-foreground ms-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs">
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer gap-2">
                <i className="ti ti-file-type-xls text-blue-500 text-[14px]" /> Export as Excel /
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer gap-2">
                <i className="ti ti-file-type-pdf text-emerald-500 text-[14px]" /> Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Filter & Action Toolbar (Identical to reference image) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-3.5 bg-white dark:bg-card border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 gap-2 shadow-2xs hover:bg-slate-50 cursor-pointer"
              >
                <i className="ti ti-filter text-[14px]" />
                Filter
                <i className="ti ti-chevron-down text-[10px] text-muted-foreground" />
                {hasActiveFilters && <span className="size-2 rounded-full bg-[#67B239]" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-80 p-4 space-y-3.5 rounded-xl shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Filter Projects
                </h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStageFilter("all");
                      setPriorityFilter("all");
                      setArtistFilter("all");
                    }}
                    className="h-6 text-[11px] px-2 text-[#EF1E1E] hover:text-red-700 cursor-pointer"
                  >
                    Reset All
                  </Button>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-slate-500">Pipeline Stage</Label>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-full text-xs h-9 rounded-lg">
                    <SelectValue placeholder="Pipeline Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-slate-500">Priority</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full text-xs h-9 rounded-lg">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-medium text-slate-500">Assigned Artist</Label>
                <Select value={artistFilter} onValueChange={setArtistFilter}>
                  <SelectTrigger className="w-full text-xs h-9 rounded-lg">
                    <SelectValue placeholder="All Artists" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Artists</SelectItem>
                    {users
                      .filter((u) => (u.role || "").toUpperCase() === "ARTIST")
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search Input */}
          <div className="relative w-56 sm:w-64">
            <i className="ti ti-search absolute left-3 top-3 text-muted-foreground text-[14px]" />
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Add New Project Button (Brandium Growth Green) */}
          <Button
            onClick={() => setProjectModal({ open: true, project: null })}
            className="h-10 px-4 bg-[#67B239] hover:bg-[#5aa030] text-white text-xs font-semibold rounded-[6px] gap-2 shadow-xs transition-all cursor-pointer"
          >
            <i className="ti ti-square-rounded-plus-filled text-[15px]" />
            Add New Project
          </Button>
        </div>
      </div>

      {/* 3. Responsive 4-Column Card Grid (Identical to reference image) */}
      {isProjectsLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="size-5 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-card p-12 text-center text-muted-foreground shadow-2xs">
          <p className="text-sm font-medium">No projects found matching your filters.</p>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setSearch("");
              setStageFilter("all");
              setPriorityFilter("all");
              setArtistFilter("all");
            }}
            className="text-xs text-[#67B239] hover:text-[#5aa030] font-medium mt-2 cursor-pointer"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProjects.map((project, idx) => {
            const isFav =
              favorites[project.id] !== undefined ? Boolean(favorites[project.id]) : true;
            const priority = (project.priority || "High").toLowerCase();

            const artistUser = project.assigned_artist_id
              ? usersMap.get(project.assigned_artist_id)
              : null;
            const artistName = artistUser?.name || project.assigned_artist_name || null;
            const artistAvatar = artistUser?.avatar_url || project.assigned_artist_avatar || null;

            const agentUser = project.assigned_agent_id
              ? usersMap.get(project.assigned_agent_id)
              : null;
            const agentName = agentUser?.name || project.assigned_agent_name || null;
            const agentAvatar = agentUser?.avatar_url || project.assigned_agent_avatar || null;

            const creatorUser = project.created_by ? usersMap.get(project.created_by) : null;
            const creatorName: string =
              creatorUser?.name ||
              project.creator_name ||
              profile?.full_name ||
              (user?.user_metadata?.full_name as string) ||
              "Admin";
            const creatorAvatar: string | null =
              creatorUser?.avatar_url ||
              project.creator_avatar ||
              (typeof user?.["avatar_url"] === "string" ? (user["avatar_url"] as string) : null) ||
              null;

            return (
              <div
                key={project.id}
                onClick={() => setDetailModal({ open: true, project })}
                className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none text-[13px] text-[#707070] dark:text-slate-300"
              >
                <div>
                  {/* Row 1: Priority Badge, Active Badge & Golden Star */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-1.5">
                      {/* Priority Badge */}
                      {priority === "high" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[12px] font-medium bg-[#FDE8E8] text-[#EF1E1E]">
                          <span className="size-1.5 rounded-full bg-[#EF1E1E]" />
                          High
                        </span>
                      ) : priority === "low" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[12px] font-medium bg-[#E8F9ED] text-[#28C76F]">
                          <span className="size-1.5 rounded-full bg-[#28C76F]" />
                          Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] text-[12px] font-medium bg-[#FFF4E6] text-[#FF9F43]">
                          <span className="size-1.5 rounded-full bg-[#FF9F43]" />
                          Medium
                        </span>
                      )}

                      {/* Active Badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[12px] font-medium bg-[#16A34A] text-white">
                        {project.stage_name || "Active"}
                      </span>
                    </div>

                    {/* Golden Star Favorite Icon */}
                    <span
                      onClick={(e) => toggleFavorite(project.id, e)}
                      className="cursor-pointer transition-transform hover:scale-110"
                      title={isFav ? "Favorited" : "Mark as favorite"}
                    >
                      <i
                        className={`ti ti-star-filled text-[17px] ${
                          isFav ? "text-[#F59E0B]" : "text-slate-200 hover:text-[#F59E0B]"
                        }`}
                      />
                    </span>
                  </div>

                  {/* Row 2: Project Info Box (Avatar Logo, Title, Subtitle, 3-Dots) */}
                  <div className="flex items-center justify-between bg-[#F8F9FA] dark:bg-slate-900/60 rounded-xl p-2.5 mb-3.5">
                    <div className="flex items-center min-w-0 flex-1 me-2">
                      <div className="size-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex shrink-0 items-center justify-center me-2.5 overflow-hidden shadow-2xs">
                        {renderProjectLogo(project.title, idx)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5
                          className="font-semibold text-[14px] leading-4.25 text-[#1F2020] dark:text-slate-100 truncate mb-0.5 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailModal({ open: true, project });
                          }}
                          title={project.title}
                        >
                          {project.title}
                        </h5>
                        <p className="text-[12px] text-[#707070] dark:text-slate-400 truncate mb-0 font-normal">
                          {project.service_name || "Web App"}
                        </p>
                      </div>
                    </div>

                    {/* 3-Dot Action Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="size-7.5 rounded-[5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#707070] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="ti ti-dots-vertical text-[13px]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 min-w-40 rounded-[5px] p-1 shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900"
                      >
                        <DropdownMenuItem
                          className="px-3 py-1.5 rounded-lg text-[13px] text-[#707070] dark:text-slate-300 cursor-pointer flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectModal({ open: true, project });
                          }}
                        >
                          <i className="ti ti-edit text-[#1B84FF] text-[14px]" /> Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="px-3 py-1.5 rounded-lg text-[13px] text-[#707070] dark:text-slate-300 cursor-pointer flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailModal({ open: true, project });
                          }}
                        >
                          <i className="ti ti-eye text-[#00c5fb] text-[14px]" /> View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="px-3 py-1.5 rounded-lg text-[13px] text-[#707070] dark:text-slate-300 cursor-pointer flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const currentIdx = stages.findIndex(
                              (s) =>
                                s.id === project.stage_id ||
                                s.name.toLowerCase() === project.stage_name.toLowerCase(),
                            );
                            const nextStage = stages[currentIdx + 1] || stages[0];
                            if (nextStage) {
                              await updateStatusMutation.mutateAsync({
                                id: project.id,
                                stage_id: nextStage.id,
                                stage_name: nextStage.name,
                              });
                            }
                          }}
                        >
                          <i className="ti ti-arrow-right text-[#28C76F] text-[14px]" /> Advance
                          Stage
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="px-3 py-1.5 rounded-lg text-[13px] text-[#707070] dark:text-slate-300 cursor-pointer flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectModal({
                              open: true,
                              project: {
                                ...project,
                                id: "",
                                project_code: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
                                title: `${project.title} (Copy)`,
                              },
                            });
                          }}
                        >
                          <i className="ti ti-clipboard-copy text-[#28C76F] text-[14px]" /> Clone
                          this Project
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-1 border-slate-100 dark:border-slate-800" />

                        <DropdownMenuItem
                          className="px-3 py-1.5 rounded-lg text-[13px] text-[#EF1E1E] cursor-pointer flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ open: true, project });
                          }}
                        >
                          <i className="ti ti-trash text-[#EF1E1E] text-[14px]" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Row 3: Description */}
                  <p
                    className="text-[13px] text-[#707070] dark:text-slate-400 leading-4.75 mb-3.5 line-clamp-2 font-normal"
                    title={
                      project.notes ||
                      "Kofejob is a freelancers marketplace where you can post projects & get instant help."
                    }
                  >
                    {project.notes ||
                      "Kofejob is a freelancers marketplace where you can post projects & get instant help."}
                  </p>

                  {/* Row 4: Metadata Rows */}
                  <div className="space-y-2 mb-3.5">
                    <p className="flex items-center text-[13px] text-[#707070] dark:text-slate-300 font-normal">
                      <i className="ti ti-forbid-2 me-2 text-[14px] text-[#707070] dark:text-slate-400 shrink-0" />
                      Project ID : #{project.project_code || "12145"}
                    </p>
                    <p className="flex items-center text-[13px] text-[#707070] dark:text-slate-300 font-normal">
                      <i className="ti ti-report-money me-2 text-[14px] text-[#707070] dark:text-slate-400 shrink-0" />
                      Value : ${formatProjectValue(project.budget)}
                    </p>
                    <p className="flex items-center text-[13px] text-[#707070] dark:text-slate-300 font-normal">
                      <i className="ti ti-calendar-exclamation me-2 text-[14px] text-[#707070] dark:text-slate-400 shrink-0" />
                      Due Date : {formatProjectCardDate(project.deadline)}
                    </p>
                  </div>

                  {/* Row 5: Overlapping Assigned Team Avatars & Creator Avatar (By User ID) */}
                  <div className="flex items-center justify-between mb-3.5">
                    {/* Left: Assigned Team Avatars by User ID */}
                    <div className="flex items-center">
                      <div className="flex items-center -space-x-1.5">
                        {artistName ? (
                          <span
                            title={`Artist / Designer: ${artistName}`}
                            className="size-6.5 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden inline-flex items-center justify-center bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold shadow-2xs cursor-pointer hover:z-10 transition-transform hover:scale-105"
                          >
                            {artistAvatar ? (
                              <img
                                src={artistAvatar}
                                alt={artistName}
                                className="size-full object-cover rounded-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  if (e.currentTarget.nextElementSibling) {
                                    (
                                      e.currentTarget.nextElementSibling as HTMLElement
                                    ).style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <span className={artistAvatar ? "hidden" : "flex"}>
                              {artistName.charAt(0).toUpperCase()}
                            </span>
                          </span>
                        ) : null}

                        {agentName ? (
                          <span
                            title={`Account Agent: ${agentName}`}
                            className="size-6.5 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden inline-flex items-center justify-center bg-blue-100 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 text-[10px] font-semibold shadow-2xs cursor-pointer hover:z-10 transition-transform hover:scale-105"
                          >
                            {agentAvatar ? (
                              <img
                                src={agentAvatar}
                                alt={agentName}
                                className="size-full object-cover rounded-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  if (e.currentTarget.nextElementSibling) {
                                    (
                                      e.currentTarget.nextElementSibling as HTMLElement
                                    ).style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}
                            <span className={agentAvatar ? "hidden" : "flex"}>
                              {agentName.charAt(0).toUpperCase()}
                            </span>
                          </span>
                        ) : null}

                        {!artistName && !agentName ? (
                          <span
                            title="Unassigned Team"
                            className="size-6.5 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-semibold shadow-2xs"
                          >
                            <User className="size-3 text-slate-400" />
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Right: Project Creator Avatar by User ID */}
                    <div
                      className="size-8 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 shadow-2xs shrink-0 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                      title={`Added by: ${creatorName}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info(`Project added by: ${creatorName}`);
                      }}
                    >
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
                        className={`text-xs font-semibold text-slate-700 dark:text-slate-200 ${
                          creatorAvatar ? "hidden" : "flex"
                        }`}
                      >
                        {creatorName ? creatorName.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 6: Card Footer (Total Hours Badge, WeChat & Subtask Counts) */}
                <div className="flex justify-between items-center pt-3 border-t border-[#F1F5F9] dark:border-slate-800">
                  <span className="bg-[#EBF5FF] dark:bg-sky-950/60 text-[#2563EB] dark:text-sky-300 rounded-[5px] px-2.5 py-1 text-[12px] font-medium inline-flex items-center gap-1.5">
                    <i className="ti ti-clock-stop text-[13px]" />
                    Total Hours : {idx === 0 ? 100 : idx === 1 ? 80 : 75}
                  </span>

                  <div className="flex items-center gap-3 text-[13px] text-[#707070] dark:text-slate-400 font-normal">
                    <span className="inline-flex items-center gap-1">
                      <i className="ti ti-brand-wechat text-[14px]" />
                      02
                    </span>
                    <span
                      className="inline-flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailModal({ open: true, project });
                      }}
                      title="Subtasks"
                    >
                      <i className="ti ti-subtask text-[14px]" />
                      04
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Offcanvas Drawer Form (Add / Edit Project) */}
      <ProjectOffcanvasDrawer
        open={projectModal.open}
        onOpenChange={(open: boolean) => setProjectModal({ open, project: null })}
        project={projectModal.project}
        stages={stages}
        users={users}
        services={services}
        onSave={async (data) => {
          await saveProjectMutation.mutateAsync(data);
          setProjectModal({ open: false, project: null });
        }}
        isSaving={saveProjectMutation.isPending}
      />

      {/* 6. Project Details Modal */}
      {detailModal.open && detailModal.project && (
        <ProjectDetailModal
          open={detailModal.open}
          onOpenChange={(open: boolean) => setDetailModal({ open, project: null })}
          project={detailModal.project}
          stages={stages}
          onEdit={() => {
            const prj = detailModal.project;
            setDetailModal({ open: false, project: null });
            if (prj) setProjectModal({ open: true, project: prj });
          }}
          onStageChange={async (stageId: string, stageName: string) => {
            if (detailModal.project) {
              await updateStatusMutation.mutateAsync({
                id: detailModal.project.id,
                stage_id: stageId,
                stage_name: stageName,
              });
              setDetailModal((prev) =>
                prev.project
                  ? {
                      ...prev,
                      project: {
                        ...prev.project,
                        stage_id: stageId,
                        stage_name: stageName,
                      },
                    }
                  : prev,
              );
            }
          }}
        />
      )}

      {/* 7. Delete Project Dialog (Dreamstechnologies #delete_project Spec) */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(open: boolean) => setDeleteModal({ open, project: null })}
      >
        <AlertDialogContent className="max-w-sm rounded-[10px] p-6 text-center border-slate-200 dark:border-slate-800">
          <div className="mx-auto mb-3 size-14 rounded-full bg-[#FDE9E9] text-[#EF1E1E] flex items-center justify-center">
            <i className="ti ti-trash text-[24px]" />
          </div>
          <AlertDialogHeader className="text-center sm:text-center">
            <AlertDialogTitle className="text-base font-semibold text-center text-slate-900 dark:text-slate-100">
              Delete Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              Are you sure you want to remove project{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                "{deleteModal.project?.project_code} - {deleteModal.project?.title}"
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center justify-center gap-2 sm:justify-center mt-4">
            <AlertDialogCancel className="w-full text-xs h-9 font-medium">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="w-full bg-[#EF1E1E] hover:bg-red-700 text-white text-xs font-semibold h-9"
              onClick={async () => {
                if (deleteModal.project) {
                  await deleteProjectMutation.mutateAsync(deleteModal.project.id);
                  setDeleteModal({ open: false, project: null });
                }
              }}
            >
              {deleteProjectMutation.isPending ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* =========================================================================
   Offcanvas Drawer Form Component (offcanvas_add & offcanvas_edit standard)
   ========================================================================= */
interface ProjectOffcanvasDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CrmProjectItem | null;
  stages: Stage[];
  users: Array<{ id: string; name: string; email?: string; role?: string }>;
  services: Array<{ id: string; name: string }>;
  onSave: (data: SaveProjectPayload) => Promise<void>;
  isSaving: boolean;
}

function ProjectOffcanvasDrawer({
  open,
  onOpenChange,
  project,
  stages,
  users,
  services,
  onSave,
  isSaving,
}: ProjectOffcanvasDrawerProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(project?.title || "");
  const [projectCode, setProjectCode] = useState(project?.project_code || "");
  const [clientName, setClientName] = useState(project?.client_name || "");
  const [clientPhone, setClientPhone] = useState(project?.client_phone || "");
  const [clientEmail, setClientEmail] = useState(project?.client_email || "");
  const [serviceId, setServiceId] = useState(project?.service_id || "none");
  const [stageId, setStageId] = useState<string>(
    project?.stage_id || stages[0]?.id || "CR Clearance",
  );
  const [priority, setPriority] = useState<string>(project?.priority || "Medium");
  const [assignedArtistId, setAssignedArtistId] = useState(project?.assigned_artist_id || "none");
  const [assignedAgentId, setAssignedAgentId] = useState(project?.assigned_agent_id || "none");
  const [budget, setBudget] = useState(project?.budget ? String(project.budget) : "");
  const [paidAmount, setPaidAmount] = useState(
    project?.paid_amount ? String(project.paid_amount) : "",
  );
  const [progress, setProgress] = useState(
    project?.progress !== undefined ? String(project.progress) : "0",
  );
  const [deadline, setDeadline] = useState(project?.deadline || "");
  const [notes, setNotes] = useState(project?.notes || "");

  useEffect(() => {
    if (open) {
      setTitle(project?.title || "");
      setProjectCode(project?.project_code || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`);
      setClientName(project?.client_name || "");
      setClientPhone(project?.client_phone || "");
      setClientEmail(project?.client_email || "");
      setServiceId(project?.service_id || "none");
      setStageId(project?.stage_id || stages[0]?.id || "CR Clearance");
      setPriority(project?.priority || "Medium");
      setAssignedArtistId(project?.assigned_artist_id || "none");
      setAssignedAgentId(project?.assigned_agent_id || "none");
      setBudget(project?.budget ? String(project.budget) : "");
      setPaidAmount(project?.paid_amount ? String(project.paid_amount) : "");
      setProgress(project?.progress !== undefined ? String(project.progress) : "0");
      setDeadline(project?.deadline || "");
      setNotes(project?.notes || "");
    }
  }, [open, project, stages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) {
      toast.error("Project title and client name are required.");
      return;
    }

    await onSave({
      id: project?.id || null,
      project_code: projectCode.trim() || null,
      title: title.trim(),
      client_name: clientName.trim(),
      client_phone: clientPhone.trim() || null,
      client_email: clientEmail.trim() || null,
      service_id: serviceId && serviceId !== "none" ? serviceId : null,
      stage_id: stageId && stageId !== "none" ? stageId : "CR Clearance",
      priority,
      assigned_artist_id: assignedArtistId && assignedArtistId !== "none" ? assignedArtistId : null,
      assigned_agent_id: assignedAgentId && assignedAgentId !== "none" ? assignedAgentId : null,
      created_by: project ? project.created_by || user?.id || null : user?.id || null,
      budget: budget ? parseFloat(budget) : 0,
      paid_amount: paidAmount ? parseFloat(paidAmount) : 0,
      progress: progress ? parseInt(progress, 10) : 0,
      deadline: deadline || null,
      notes: notes.trim() || null,
    });
  };

  const artists = useMemo(() => {
    const matched = users.filter((u) => {
      const role = (u.role || "").toUpperCase();
      return role === "ARTIST" || role === "CREATIVE" || role === "GRAPHIC_DESIGNER";
    });
    return matched.length > 0 ? matched : users;
  }, [users]);

  const agents = useMemo(() => {
    const matched = users.filter((u) => {
      const role = (u.role || "").toUpperCase();
      return role === "AGENT" || role === "SALES" || role === "ADMIN";
    });
    return matched.length > 0 ? matched : users;
  }, [users]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-187.5 lg:max-w-200 p-0 flex flex-col h-full bg-[#f8f9fa] dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl focus:outline-none"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{project ? "Edit Project" : "Add New Project"}</SheetTitle>
          <SheetDescription>Project details and production assignments</SheetDescription>
        </SheetHeader>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-card shrink-0">
          <div>
            <h3 className="text-[18px] font-semibold text-slate-900 dark:text-slate-100 leading-tight">
              {project ? `Edit Project: #${project.project_code}` : "Add New Project"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {project
                ? "Update project scope, deliverables, team assignments, and financials."
                : "Fill in project details and team assignments."}
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <form id="project-drawer-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Section 1: Basic Information */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-[5px] bg-white dark:bg-card overflow-hidden shadow-2xs">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="size-7.5 rounded-[5px] bg-[#67B239] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <DraftingCompass className="size-4" />
                </span>
                <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                  Basic Information
                </span>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="drawer_title" className="text-xs font-semibold">
                      Project Name / Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="drawer_title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Apex Footwear E-Commerce Video Shoot"
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drawer_code" className="text-xs font-semibold">
                      Project ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="drawer_code"
                      value={projectCode}
                      onChange={(e) => setProjectCode(e.target.value)}
                      placeholder="e.g. PRJ-1001"
                      className="text-xs h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="drawer_client" className="text-xs font-semibold">
                    Client / Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="drawer_client"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Apex Footwear Ltd."
                    className="text-xs h-9"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="drawer_phone" className="text-xs font-semibold">
                      Client Phone
                    </Label>
                    <Input
                      id="drawer_phone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="e.g. +880 1700-000000"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="drawer_email" className="text-xs font-semibold">
                      Client Email
                    </Label>
                    <Input
                      id="drawer_email"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. client@company.com"
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Service Package / Category</Label>
                    <Select value={serviceId} onValueChange={setServiceId}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- None --</SelectItem>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Stage & Financials */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-[5px] bg-white dark:bg-card overflow-hidden shadow-2xs">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="size-7.5 rounded-[5px] bg-[#0a2e5c] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Receipt className="size-4" />
                </span>
                <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                  Stage & Financials
                </span>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Production Stage</Label>
                    <Select value={stageId} onValueChange={setStageId}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Due Date</Label>
                    <Input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Budget Value (৳)</Label>
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. 50000"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Paid Amount (৳)</Label>
                    <Input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="e.g. 25000"
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Progress (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(e.target.value)}
                      placeholder="0 - 100"
                      className="text-xs h-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Team Assignment & Specifications */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-[5px] bg-white dark:bg-card overflow-hidden shadow-2xs">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <span className="size-7.5 rounded-[5px] bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="size-4" />
                </span>
                <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                  Team Assignment & Specifications
                </span>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="size-3.5 text-amber-500" />
                      Responsible Artist / Designer
                    </Label>
                    <Select value={assignedArtistId} onValueChange={setAssignedArtistId}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select Artist" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- None --</SelectItem>
                        {artists.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <User className="size-3.5 text-blue-500" />
                      Account Agent / Team Leader
                    </Label>
                    <Select value={assignedAgentId} onValueChange={setAssignedAgentId}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue placeholder="Select Agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- None --</SelectItem>
                        {agents.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Description & Deliverable Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Project deliverables, video resolution, script requirements, handover notes..."
                    rows={3}
                    className="text-xs resize-none"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 px-6 bg-white dark:bg-card border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0 shadow-xs">
          <Button
            type="button"
            variant="outline"
            className="text-xs h-9 px-4 rounded-[6px] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="project-drawer-form"
            disabled={isSaving || !title.trim() || !clientName.trim()}
            className="text-xs h-9 px-5 font-semibold bg-[#67B239] hover:bg-[#5aa030] text-white rounded-[6px] shadow-xs cursor-pointer"
          >
            {isSaving ? "Saving..." : project ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* =========================================================================
   Project Detail Modal Component
   ========================================================================= */
interface ProjectDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CrmProjectItem;
  stages: Stage[];
  onEdit: () => void;
  onStageChange: (stageId: string, stageName: string) => Promise<void>;
}

function ProjectDetailModal({
  open,
  onOpenChange,
  project,
  stages,
  onEdit,
  onStageChange,
}: ProjectDetailModalProps) {
  const stageColor = project.stage_color || resolveProjectStageColor(project.stage_name);
  const currentStage = stages.find(
    (s) => s.id === project.stage_id || s.name.toLowerCase() === project.stage_name.toLowerCase(),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <div className="px-6 py-5 text-white" style={{ backgroundColor: stageColor }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-black/25">
              #{project.project_code}
            </span>
            <Badge
              variant="secondary"
              className="bg-white text-slate-900 font-bold text-xs gap-1 shadow-2xs"
            >
              <CheckCircle2 className="size-3.5 text-emerald-600" /> {project.stage_name}
            </Badge>
          </div>
          <h2 className="text-lg font-bold mt-2.5 leading-snug">{project.title}</h2>
          <p className="text-xs opacity-90 mt-1 flex items-center gap-1.5">
            <Building2 className="size-3.5" /> {project.client_name}
          </p>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Move Stage Quick Picker */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <ArrowRight className="size-3.5 text-[#67B239]" /> Move Project Stage:
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {stages.map((s) => {
                const sColor = resolveProjectStageColor(s.name);
                const isSelected =
                  s.id === project.stage_id ||
                  s.name.toLowerCase() === project.stage_name.toLowerCase();

                return (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    style={isSelected ? { backgroundColor: sColor, color: "#fff" } : {}}
                    className={`text-[11px] h-7 px-2.5 rounded-lg font-medium ${
                      isSelected ? "" : "border-border/60 hover:bg-muted"
                    }`}
                    onClick={() => onStageChange(s.id, s.name)}
                  >
                    {s.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* KPI Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Budget
              </span>
              <p className="font-bold text-sm text-foreground mt-0.5">
                ৳{project.budget.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Paid
              </span>
              <p className="font-bold text-sm text-green-600 mt-0.5">
                ৳{project.paid_amount.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Due</span>
              <p className="font-bold text-sm text-red-500 mt-0.5">
                ৳{project.due_amount.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Progress
              </span>
              <p className="font-bold text-sm text-[#67B239] mt-0.5">{project.progress}%</p>
            </div>
          </div>

          {/* Team Members & Creator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border border-border/60 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Assigned Artist
              </span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" />
                {project.assigned_artist_name || "Not assigned"}
              </p>
            </div>

            <div className="border border-border/60 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Account Agent
              </span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-blue-500" />
                {project.assigned_agent_name || "Not assigned"}
              </p>
            </div>

            <div className="border border-border/60 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Project Creator
              </span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-emerald-500" />
                {project.creator_name || "Admin"}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          {(project.client_phone || project.client_email) && (
            <div className="border border-border/60 rounded-xl p-3 space-y-1.5 bg-muted/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Client Contact Information
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs">
                {project.client_phone && (
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Phone className="size-3.5 text-slate-500" />
                    <span>{project.client_phone}</span>
                  </div>
                )}
                {project.client_email && (
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <Mail className="size-3.5 text-slate-500" />
                    <span>{project.client_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {project.notes && (
            <div className="border border-border/60 rounded-xl p-3 space-y-1 bg-muted/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Creative Notes & Deliverables
              </span>
              <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {project.notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
            <span>Created: {formatCrmDate(project.created_at)}</span>
            <span>Deadline: {project.deadline || "None"}</span>
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-border/60 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-xs font-semibold bg-[#67B239] hover:bg-[#5aa030] text-white rounded-xl gap-1.5 cursor-pointer"
            onClick={onEdit}
          >
            <Pencil className="size-3.5" /> Edit Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
