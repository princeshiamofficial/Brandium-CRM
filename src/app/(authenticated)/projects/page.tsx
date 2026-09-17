"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Printer,
  AlertCircle,
  TriangleAlert,
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
  X,
  FolderKanban,
  Check,
  ChevronsUpDown,
  Loader2,
  PlusCircle,
  UserPlus,
  Users,
  Percent,
  Gift,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
  useUpdateProjectAssigneesMutation,
  PROJECT_WORKFLOW_STAGES,
  resolveProjectStageColor,
  type CrmProjectItem,
  type SaveProjectPayload,
  type AdvancePaymentRecord,
} from "@/lib/projects";
import { Separator } from "@/components/ui/separator";
import { prospectsQuery, getProspectCleanNotes, type Prospect } from "@/lib/prospects";
import { useAuth } from "@/lib/auth";
import { formatCrmDate, generateUUID } from "@/lib/mysql-client";
import { toast } from "sonner";

function formatProjectCardDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "Not set";
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
  const num = Number(val) || 0;
  return num.toLocaleString();
}

function getProjectCleanNotesAndItems(
  rawNotes?: string | null,
  fallbackNotes?: string | null,
): {
  cleanNotes: string;
  itemsSummary: string;
  itemCount: number;
} {
  let clean = rawNotes || "";
  let itemsSummary = "";
  let itemCount = 0;

  if (clean.includes("[Items:")) {
    try {
      const match = clean.match(/\[Items:\s*(\[.*?\])\s*\]/s);
      if (match && match[1]) {
        const items = JSON.parse(match[1]);
        if (Array.isArray(items) && items.length > 0) {
          itemCount = items.length;
          itemsSummary = items
            .map((it: { model?: string; quantity?: string | number }) => {
              const qty = it.quantity && String(it.quantity) !== "1" ? ` (${it.quantity}x)` : "";
              return `${it.model || "Item"}${qty}`;
            })
            .filter(Boolean)
            .join(", ");
        }
      }
      clean = clean.replace(/\[Items:\s*\[.*?\]\s*\]/s, "").trim();
    } catch {
      // ignore parsing errors
    }
  }

  clean = clean
    .replace(/\[Artist:\s*[^\]]+\]/gi, "")
    .replace(/\[Agent:\s*[^\]]+\]/gi, "")
    .trim();

  if (!clean && fallbackNotes) {
    clean = fallbackNotes
      .replace(/\[Artist:\s*[^\]]+\]/gi, "")
      .replace(/\[Agent:\s*[^\]]+\]/gi, "")
      .replace(/\[Items:\s*\[.*?\]\s*\]/gis, "")
      .trim();
  }

  return { cleanNotes: clean, itemsSummary, itemCount };
}

function getProjectStageBadgeStyle(stageName?: string | null): string {
  const s = (stageName || "").toLowerCase();
  if (s.includes("delivered") || s.includes("completed") || s.includes("done")) {
    return "bg-[#E8F9ED] text-[#28C76F] dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50";
  }
  if (s.includes("hold") || s.includes("denied") || s.includes("cancelled")) {
    return "bg-[#FDE8E8] text-[#EF1E1E] dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50";
  }
  if (s.includes("design") || s.includes("creative")) {
    return "bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/50";
  }
  if (s.includes("co clearance")) {
    return "bg-[#FFF7ED] text-[#EA580C] dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50";
  }
  if (s.includes("cr clearance") || s.includes("review")) {
    return "bg-[#EEF2FF] text-[#6366F1] dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50";
  }
  if (s.includes("logistics") || s.includes("print")) {
    return "bg-[#F3E8FF] text-[#9333EA] dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50";
  }
  return "bg-[#EBF5FF] text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50";
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
    order_date: "2023-10-01",
    deadline: "2023-10-15",
    assignees: [
      {
        id: "artist-1",
        name: "Artist One",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        role: "artist",
      },
      {
        id: "agent-1",
        name: "Agent One",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        role: "agent",
      },
    ],
    assigned_user_ids: ["artist-1", "agent-1"],
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
    order_date: "2023-10-01",
    deadline: "2023-10-19",
    assignees: [
      {
        id: "artist-2",
        name: "Artist Two",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        role: "artist",
      },
    ],
    assigned_user_ids: ["artist-2"],
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
    order_date: "2023-10-01",
    deadline: "2023-10-12",
    assignees: [],
    assigned_user_ids: [],
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
    order_date: "2023-10-01",
    deadline: "2023-10-24",
    assignees: [],
    assigned_user_ids: [],
    notes: "Kofejob is a freelancers marketplace where you can post projects & get instant help.",
    created_at: "2023-10-01T00:00:00.000Z",
    updated_at: "2023-10-01T00:00:00.000Z",
  },
];

export default function ProjectsPage() {
  const router = useRouter();
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

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    project: CrmProjectItem | null;
  }>({
    open: false,
    project: null,
  });

  const [assignModal, setAssignModal] = useState<{
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
  const { data: prospectsData } = useQuery(
    prospectsQuery({ page: 1, pageSize: 500 }, user?.id || "", isAdmin),
  );

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
  const prospects = useMemo(() => prospectsData?.data || [], [prospectsData]);

  const saveProjectMutation = useSaveProjectMutation();
  const updateStatusMutation = useUpdateProjectStatusMutation();
  const deleteProjectMutation = useDeleteProjectMutation();
  const updateAssigneesMutation = useUpdateProjectAssigneesMutation();

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
            const { cleanNotes } = getProjectCleanNotesAndItems(
              project.notes,
              project.prospect_notes,
            );
            const stageBadgeStyle = getProjectStageBadgeStyle(project.stage_name);

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
                onClick={() => {
                  router.push(`/projects/${project.project_code || project.id}`);
                }}
                className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card p-5 shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] dark:shadow-none hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none text-[13px] text-[#707070] dark:text-slate-300"
              >
                <div>
                  {/* Row 1: Priority Badge, Active / Stage Badge & Golden Star */}
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

                      {/* Dynamic Stage Badge */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[5px] text-[12px] font-medium ${stageBadgeStyle}`}
                      >
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
                        {project.prospect_logo_url ? (
                          <img
                            src={project.prospect_logo_url}
                            alt={project.client_name}
                            className="size-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          renderProjectLogo(project.title, idx)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5
                          className="font-semibold text-[14px] leading-4.25 text-[#1F2020] dark:text-slate-100 truncate mb-0.5 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${project.project_code || project.id}`);
                          }}
                          title={project.title}
                        >
                          {project.title}
                        </h5>
                        <p className="text-[12px] text-[#707070] dark:text-slate-400 truncate mb-0 font-normal">
                          {project.client_name && project.client_name !== project.title
                            ? `${project.client_name} • `
                            : ""}
                          {project.service_name || "Creative Branding"}
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
                            router.push(`/projects/${project.project_code || project.id}`);
                          }}
                        >
                          <i className="ti ti-eye text-[#00c5fb] text-[14px]" /> View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="px-3 py-1.5 rounded-lg text-[13px] text-[#707070] dark:text-slate-300 cursor-pointer flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${project.project_code || project.id}`);
                          }}
                        >
                          <i className="ti ti-file-invoice text-indigo-500 text-[14px]" /> View
                          Invoice
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

                  {/* Row 3: Project Notes */}
                  <p
                    className="text-[13px] text-[#707070] dark:text-slate-400 leading-4.75 mb-3.5 line-clamp-2 font-normal"
                    title={cleanNotes || "No project notes provided."}
                  >
                    {cleanNotes || (
                      <span className="italic text-slate-400 dark:text-slate-500">
                        No project notes provided.
                      </span>
                    )}
                  </p>

                  {/* Row 4: Metadata Rows */}
                  <div className="space-y-2 mb-3.5">
                    <p className="flex items-center text-[13px] text-[#707070] dark:text-slate-300 font-normal">
                      <i className="ti ti-forbid-2 me-2 text-[14px] text-[#707070] dark:text-slate-400 shrink-0" />
                      Project ID : #{project.project_code || "12145"}
                    </p>
                    <p className="flex items-center text-[13px] text-[#707070] dark:text-slate-300 font-normal">
                      <i className="ti ti-report-money me-2 text-[14px] text-emerald-600 dark:text-emerald-400 shrink-0" />
                      Value : ৳{formatProjectValue(project.budget)}
                    </p>
                    <p className="flex items-center text-[13px] text-[#707070] dark:text-slate-300 font-normal">
                      <i className="ti ti-calendar-event me-2 text-[14px] text-[#707070] dark:text-slate-400 shrink-0" />
                      Order Date : {formatProjectCardDate(project.order_date)}
                    </p>
                    <p className="flex items-center text-[13px] text-[#707070] dark:text-slate-300 font-normal">
                      <i className="ti ti-calendar-exclamation me-2 text-[14px] text-[#707070] dark:text-slate-400 shrink-0" />
                      Due Date : {formatProjectCardDate(project.deadline)}
                    </p>
                  </div>

                  {/* Row 5: Assigned Team Members (Multi-User) & Project Creator */}
                  <div className="flex items-center justify-between">
                    {/* Left: Multiple Assigned Team Members */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {project.assignees && project.assignees.length > 0 ? (
                        <div className="flex items-center">
                          <div className="flex items-center -space-x-1.5">
                            {project.assignees.slice(0, 3).map((assignee) => (
                              <span
                                key={assignee.id}
                                title={`${assignee.name}${assignee.role ? ` (${assignee.role})` : ""}`}
                                className="size-6.5 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-semibold shadow-2xs cursor-pointer hover:z-10 transition-transform hover:scale-105"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAssignModal({ open: true, project });
                                }}
                              >
                                {assignee.avatar ? (
                                  <img
                                    src={assignee.avatar}
                                    alt={assignee.name}
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
                                <span className={assignee.avatar ? "hidden" : "flex"}>
                                  {assignee.name.charAt(0).toUpperCase()}
                                </span>
                              </span>
                            ))}

                            {project.assignees.length > 3 && (
                              <span
                                title={`+${project.assignees.length - 3} more assigned members`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAssignModal({ open: true, project });
                                }}
                                className="size-6.5 rounded-full border-2 border-white dark:border-slate-800 bg-[#E8F9ED] text-[#28C76F] dark:bg-emerald-950/60 dark:text-emerald-400 text-[9px] font-bold inline-flex items-center justify-center shadow-2xs cursor-pointer hover:z-10"
                              >
                                +{project.assignees.length - 3}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignModal({ open: true, project });
                            }}
                            className="size-6.5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-[#67B239] hover:border-[#67B239] flex items-center justify-center cursor-pointer transition-colors shadow-2xs ms-1.5"
                            title="Manage / Add Team Assignees"
                          >
                            <UserPlus className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssignModal({ open: true, project });
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-[#67B239] hover:text-[#67B239] transition-all cursor-pointer shadow-2xs"
                          title="Assign multiple users to this project"
                        >
                          <UserPlus className="size-3 text-[#67B239]" />
                          <span>Assign Team</span>
                        </button>
                      )}
                    </div>

                    {/* Right: Project Creator Avatar by User ID */}
                    <div
                      className="size-8 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 shadow-2xs shrink-0 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                      title={`Added by Agent: ${creatorName}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.info(`Project added by Agent: ${creatorName}`);
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
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Add / Edit Project Dialog (ERPAPP standard) */}
      <ProjectFormDialog
        key={
          projectModal.open
            ? `proj-modal-${projectModal.project?.id || "new"}-${projectModal.project?.paid_amount ?? ""}-${projectModal.project?.updated_at ?? ""}`
            : "proj-modal-closed"
        }
        open={projectModal.open}
        onOpenChange={(open: boolean) => setProjectModal({ open, project: null })}
        project={projectModal.project}
        stages={stages}
        users={users}
        services={services}
        prospects={prospects}
        onSave={async (data) => {
          await saveProjectMutation.mutateAsync(data);
          setProjectModal({ open: false, project: null });
        }}
        isSaving={saveProjectMutation.isPending}
      />

      {/* 7. Delete Project Dialog (Exact Match to User Snippet) */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(open: boolean) => {
          if (!deleteProjectMutation.isPending) {
            setDeleteModal({ open, project: null });
          }
        }}
      >
        <AlertDialogContent className="w-full max-w-lg bg-[#EEEFF2] dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-800 rounded-2xl p-6 shadow-lg gap-4 text-slate-900 dark:text-slate-100">
          <AlertDialogHeader className="flex flex-col space-y-2 text-left sm:text-left">
            <AlertDialogTitle className="text-lg font-semibold flex items-center gap-2 text-[#0f1729] dark:text-slate-100">
              <TriangleAlert className="h-6 w-6 text-[#dc2626] shrink-0 stroke-2" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#94a3b8] dark:text-slate-400 text-left mt-2 leading-5">
              This action cannot be undone. This will permanently delete the project for &quot;
              <span className="font-semibold text-[#94a3b8] dark:text-slate-300">
                {deleteModal.project?.title || deleteModal.project?.project_code || "this project"}
              </span>
              &quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-0">
            <AlertDialogCancel
              disabled={deleteProjectMutation.isPending}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors h-10 px-4 py-2 mt-2 sm:mt-0 bg-[#EEEFF2] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700 text-[#0f1729] dark:text-slate-200 hover:bg-[#E1E7EF]/80 dark:hover:bg-slate-700 rounded-[10px] shadow-none cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteProjectMutation.isPending}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors h-10 px-4 py-2 bg-[#dc2626] hover:bg-[#dc2626]/90 text-[#fafafa] rounded-[10px] shadow-none cursor-pointer border-0"
              onClick={async (e) => {
                e.preventDefault();
                if (deleteModal.project) {
                  await deleteProjectMutation.mutateAsync(deleteModal.project.id);
                  setDeleteModal({ open: false, project: null });
                }
              }}
            >
              {deleteProjectMutation.isPending ? "Deleting..." : "Yes, delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 8. Assign Team Members Dialog (Card Multi-User Assignment) */}
      {assignModal.open && assignModal.project && (
        <ProjectAssigneesDialog
          open={assignModal.open}
          onOpenChange={(open: boolean) => setAssignModal({ open, project: null })}
          project={assignModal.project}
          users={users}
          onSave={async (userIds) => {
            if (assignModal.project) {
              await updateAssigneesMutation.mutateAsync({
                projectId: assignModal.project.id,
                userIds,
              });
              setAssignModal({ open: false, project: null });
            }
          }}
          isSaving={updateAssigneesMutation.isPending}
        />
      )}
    </div>
  );
}

/* =========================================================================
   Project Assignees Dialog Component (Assign Multiple Users from Card)
   ========================================================================= */
interface ProjectAssigneesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CrmProjectItem | null;
  users: CrmUser[];
  onSave: (userIds: string[]) => Promise<void>;
  isSaving: boolean;
}

function ProjectAssigneesDialog({
  open,
  onOpenChange,
  project,
  users,
  onSave,
  isSaving,
}: ProjectAssigneesDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    if (open && project) {
      const initIds = project.assignees ? project.assignees.map((a) => a.id) : [];
      setSelectedIds(initIds);
      setSearchQuery("");
      setRoleFilter("all");
    }
  }, [open, project]);

  const toggleUser = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all") {
        const r = (u.role || "").toLowerCase();
        if (roleFilter === "artist" && r !== "artist") return false;
        if (roleFilter === "agent" && r !== "agent") return false;
        if (roleFilter === "admin" && r !== "admin") return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        u.name.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
      );
    });
  }, [users, searchQuery, roleFilter]);

  const handleSave = async () => {
    await onSave(selectedIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Users className="size-4.5 text-[#67B239]" /> Assign Team Members
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground truncate">
            {project?.project_code ? `#${project.project_code} • ` : ""}
            {project?.title || "Project"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search team member by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-1.5 pb-1">
            {["all", "artist", "agent", "admin"].map((r) => (
              <Button
                key={r}
                type="button"
                variant={roleFilter === r ? "default" : "outline"}
                size="sm"
                className={`h-6 text-[11px] px-2.5 rounded-full capitalize cursor-pointer ${
                  roleFilter === r
                    ? "bg-[#67B239] hover:bg-[#5aa030] text-white"
                    : "text-muted-foreground"
                }`}
                onClick={() => setRoleFilter(r)}
              >
                {r === "all" ? "All Roles" : r}
              </Button>
            ))}
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No users found.</p>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = selectedIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleUser(u.id)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border text-xs",
                      isSelected
                        ? "bg-[#67B239]/10 border-[#67B239]/40 dark:bg-emerald-950/30"
                        : "border-transparent hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-7 rounded-full shrink-0">
                        <AvatarImage src={u.avatar_url || undefined} alt={u.name} />
                        <AvatarFallback className="text-[10px] font-semibold">
                          {u.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate leading-tight">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {u.email || u.role || "User"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {u.role && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] uppercase px-1.5 py-0 font-semibold"
                        >
                          {u.role}
                        </Badge>
                      )}
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleUser(u.id)}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t bg-muted/20 flex flex-row items-center justify-between sm:justify-between">
          <span className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{selectedIds.length}</span> assigned
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#67B239] hover:bg-[#5aa030] text-white text-xs h-8 cursor-pointer gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Assignees"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================================
   Project Form Dialog (1000% Same to Same ERPAPP Create & Edit Order Dialog)
   ========================================================================= */
interface DialogOrderItem {
  id: string;
  model: string;
  quantity: string;
  lamination?: string | undefined;
  variation?: string | undefined;
  unit?: string | undefined;
  unitPrice: number | null;
  lineItemTotalPrice: number | null;
  isGift?: boolean | undefined;
}

const formatCurrencyBdt = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(value);
};

const DEFAULT_SERVICE_MODELS = [
  { id: "srv-6", name: "TVC", sellingPrice: 1000 },
  { id: "srv-2", name: "Graphics Design", sellingPrice: 1000 },
  { id: "srv-12", name: "Logo Design", sellingPrice: 1000 },
  { id: "srv-1", name: "Product Photography", sellingPrice: 1000 },
  { id: "srv-11", name: "Motion Video Ads", sellingPrice: 1000 },
  { id: "srv-5", name: "Celebrity Video Ads", sellingPrice: 1000 },
  { id: "srv-7", name: "OVC", sellingPrice: 1000 },
  { id: "srv-8", name: "Voice-Over Video Ads", sellingPrice: 1000 },
  { id: "srv-9", name: "Corporate AV", sellingPrice: 1000 },
  { id: "srv-10", name: "Influencer Video Ads", sellingPrice: 1000 },
  { id: "srv-4", name: "Website Development", sellingPrice: 1000 },
  { id: "srv-3", name: "Monthly Plan", sellingPrice: 1000 },
];

const DEFAULT_LAMINATIONS = [
  { id: "lam-1", name: "Standard" },
  { id: "lam-2", name: "Matt" },
  { id: "lam-3", name: "Glossy" },
  { id: "lam-4", name: "Velvet" },
];

const DEFAULT_PAYMENT_METHODS = [
  { id: "pm-1", name: "bKash" },
  { id: "pm-2", name: "Nagad" },
  { id: "pm-3", name: "Rocket" },
  { id: "pm-4", name: "Bank Transfer" },
  { id: "pm-5", name: "Cash" },
  { id: "pm-6", name: "Card" },
  { id: "pm-7", name: "Other" },
];

const initialOrderItemState: DialogOrderItem = {
  id: "item-init",
  model: "TVC",
  quantity: "1",
  lamination: "Standard",
  unitPrice: 1000,
  lineItemTotalPrice: 1000,
  isGift: false,
};

function parseProjectPayments(
  notes: string | null | undefined,
  paidAmount: number,
  projectDate?: string | null,
  advancePayments?: AdvancePaymentRecord[] | string | null,
): AdvancePaymentRecord[] {
  // 1a. Array of advance_payments
  if (advancePayments && Array.isArray(advancePayments) && advancePayments.length > 0) {
    return advancePayments.map((p, idx) => ({
      id: p.id || `payment-${idx + 1}`,
      amount: Number(p.amount) || 0,
      date:
        p.date ||
        (projectDate
          ? format(new Date(projectDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd")),
      paymentMethod: p.paymentMethod || "Cash",
      notes: p.notes || "",
      recordedByUserId: p.recordedByUserId || null,
      recordedByUserName: p.recordedByUserName || null,
      status: p.status || "Approved",
    }));
  }

  // 1b. JSON string of advance_payments
  if (typeof advancePayments === "string" && advancePayments.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(advancePayments);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: any, idx: number) => ({
          id: p.id || `payment-${idx + 1}`,
          amount: Number(p.amount) || 0,
          date:
            p.date ||
            (projectDate
              ? format(new Date(projectDate), "yyyy-MM-dd")
              : format(new Date(), "yyyy-MM-dd")),
          paymentMethod: p.paymentMethod || p.method || "Cash",
          notes: p.notes || p.ref || "",
          recordedByUserId: p.recordedByUserId || null,
          recordedByUserName: p.recordedByUserName || null,
          status: p.status || "Approved",
        }));
      }
    } catch {
      // ignore invalid json string
    }
  }

  if (notes) {
    const match = notes.match(/\[Payments:\s*(\[[\s\S]*?\])\]/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any, idx: number) => ({
            id: p.id || `payment-${idx + 1}`,
            amount: Number(p.amount) || 0,
            date:
              p.date ||
              (projectDate
                ? format(new Date(projectDate), "yyyy-MM-dd")
                : format(new Date(), "yyyy-MM-dd")),
            paymentMethod: p.paymentMethod || p.method || "Cash",
            notes: p.notes || p.ref || "",
            recordedByUserId: p.recordedByUserId || null,
            recordedByUserName: p.recordedByUserName || null,
            status: p.status || "Approved",
          }));
        }
      } catch (e) {
        console.error("Failed to parse [Payments] tag", e);
      }
    }
  }

  if (notes) {
    const paymentRegex = /\[Payment:\s*([^,\]]+)(?:,\s*Ref:\s*([^\]]+))?\]/g;
    const allMatches = Array.from(notes.matchAll(paymentRegex));
    if (allMatches.length > 0) {
      const totalPaid = Number(paidAmount) || 0;
      const count = allMatches.length;
      const splitAmount = totalPaid > 0 ? Math.round((totalPaid / count) * 100) / 100 : 0;
      return allMatches.map((m, idx) => ({
        id: `legacy-payment-${idx + 1}`,
        amount:
          idx === count - 1 && totalPaid > 0
            ? Number((totalPaid - splitAmount * (count - 1)).toFixed(2))
            : splitAmount,
        date: projectDate
          ? format(new Date(projectDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        paymentMethod: m[1]?.trim() || "Nagad",
        notes: m[2]?.trim() || "",
        status: "Approved" as const,
      }));
    }
  }

  if (paidAmount && paidAmount > 0) {
    return [
      {
        id: "legacy-advance-001",
        amount: Number(paidAmount),
        date: projectDate
          ? format(new Date(projectDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        paymentMethod: "bKash",
        notes: "Initial advance payment",
        status: "Approved",
      },
    ];
  }

  return [];
}

function cleanProjectNotes(rawNotes: string | null | undefined): string {
  if (!rawNotes) return "";
  return rawNotes
    .replace(/\[Payments?:\s*\[[\s\S]*?\]\]/gis, "")
    .replace(/\[Payments?:\s*[^\]]+\]/gis, "")
    .replace(/\[Discount:\s*[^\]]+\]/gis, "")
    .replace(/\[Shipping:\s*[^\]]+\]/gis, "")
    .replace(/\[Items:\s*\[[\s\S]*?\]\]/gis, "")
    .replace(/\[Artist:\s*[^\]]+\]/gis, "")
    .replace(/\[Agent:\s*[^\]]+\]/gis, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const formatDateForDialogInput = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return isNaN(date.getTime()) ? String(dateString) : format(date, "PPP");
  } catch {
    return "Invalid Date";
  }
};

function formatDateForHistory(dateVal?: string | Date | null): string {
  if (!dateVal) return "N/A";
  try {
    const d = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    return isNaN(d.getTime()) ? String(dateVal) : format(d, "MMM d, yyyy");
  } catch {
    return String(dateVal);
  }
}

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CrmProjectItem | null;
  stages: Stage[];
  users: CrmUser[];
  services: Array<{ id: string; name: string }>;
  prospects: Prospect[];
  onSave: (data: SaveProjectPayload) => Promise<void>;
  isSaving: boolean;
}

function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  stages,
  users,
  services,
  prospects,
  onSave,
  isSaving,
}: ProjectFormDialogProps) {
  const { user } = useAuth();

  const [jobId, setJobId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [initialStatusId, setInitialStatusId] = useState<string>("");
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState<string>("");
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState<string>("");
  const [showCustomPaymentInput, setShowCustomPaymentInput] = useState(false);
  const [customPaymentMethodText, setCustomPaymentMethodText] = useState("");
  const [isStarred, setIsStarred] = useState<number>(0);
  const [isOrderDatePopoverOpen, setIsOrderDatePopoverOpen] = useState(false);
  const [isDeliveryDatePopoverOpen, setIsDeliveryDatePopoverOpen] = useState(false);
  const [isPaymentMethodPopoverOpen, setIsPaymentMethodPopoverOpen] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [newAdvancePaymentNotes, setNewAdvancePaymentNotes] = useState("");

  const [agentId, setAgentId] = useState<string>(() => {
    return project?.created_by || project?.assigned_agent_id || user?.id || "";
  });

  const [existingAdvancePayments, setExistingAdvancePayments] = useState<AdvancePaymentRecord[]>(
    () => {
      if (!project) return [];
      return parseProjectPayments(
        project.notes,
        Number(project.paid_amount || 0),
        project.order_date || project.created_at,
        project.advance_payments,
      );
    },
  );
  const [totalExistingAdvancePaid, setTotalExistingAdvancePaid] = useState<number>(() => {
    if (!project) return 0;
    const initialPayments = parseProjectPayments(
      project.notes,
      Number(project.paid_amount || 0),
      project.order_date || project.created_at,
      project.advance_payments,
    );
    return initialPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  });
  const [paymentToDelete, setPaymentToDelete] = useState<AdvancePaymentRecord | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>("");
  const [editingMethod, setEditingMethod] = useState<string>("");
  const [editingNotes, setEditingNotes] = useState<string>("");
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [specialClientDiscount, setSpecialClientDiscount] = useState<string>(() => {
    if (!project?.notes) return "";
    const m = project.notes.match(/\[Discount:\s*([^\]]+)\]/);
    return m && m[1] ? m[1].trim() : "";
  });
  const [shippingCharge, setShippingCharge] = useState<string>(() => {
    if (!project?.notes) return "";
    const m = project.notes.match(/\[Shipping:\s*([^\]]+)\]/);
    return m && m[1] ? m[1].trim() : "";
  });
  const [orderNotes, setOrderNotes] = useState<string>(() => {
    return project ? cleanProjectNotes(project.notes) : "";
  });

  const [orderItems, setOrderItems] = useState<DialogOrderItem[]>([
    { ...initialOrderItemState, id: generateUUID() },
  ]);
  const [orderItemsTotal, setOrderItemsTotal] = useState<number>(0);
  const [calculatedDiscountAmount, setCalculatedDiscountAmount] = useState<number>(0);
  const [netPayable, setNetPayable] = useState<number>(0);
  const [amountDue, setAmountDue] = useState<number>(0);

  const jobIdInputRef = useRef<HTMLInputElement>(null);
  const [popoverOpenStates, setPopoverOpenStates] = useState<Record<string, boolean>>({});
  const [isProspectPopoverOpen, setIsProspectPopoverOpen] = useState(false);
  const [currentOrderDate, setCurrentOrderDate] = useState<Date | undefined>(new Date());
  const [acceptedDeliveryDate, setAcceptedDeliveryDate] = useState<Date | undefined>(undefined);

  // Priority: system services that we already have in CRM
  const modelOptions = useMemo(() => {
    if (services && services.length > 0) {
      return services.map((srv) => ({
        id: srv.id,
        name: srv.name,
        sellingPrice:
          "price" in srv && Number((srv as Record<string, unknown>)["price"]) > 0
            ? Number((srv as Record<string, unknown>)["price"])
            : 1000,
      }));
    }
    return DEFAULT_SERVICE_MODELS;
  }, [services]);

  const laminationOptions = DEFAULT_LAMINATIONS;
  const paymentMethodOptions = DEFAULT_PAYMENT_METHODS;

  const agentOptions = useMemo(() => {
    const filtered = users.filter((u) => {
      const r = (u.role || "").toLowerCase();
      return r === "agent" || r === "admin";
    });
    return filtered.length > 0 ? filtered : users;
  }, [users]);

  // Reset or Populate form
  useEffect(() => {
    if (open) {
      if (project) {
        setJobId(project.project_code || "");
        setCompanyName(project.client_name || project.title || "");
        setAddress(project.client_address || "Dhaka, Bangladesh");
        setPhoneNumber(project.client_phone || "");
        setInitialStatusId(project.stage_id || stages[0]?.id || "CR Clearance");

        const payments = parseProjectPayments(
          project.notes,
          Number(project.paid_amount || 0),
          project.order_date || project.created_at,
          project.advance_payments,
        );
        setExistingAdvancePayments(payments);
        setTotalExistingAdvancePaid(payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
        setAdvancePaymentAmount("");
        setAdvancePaymentMethod("");
        setNewAdvancePaymentNotes("");
        setShowCustomPaymentInput(false);
        setCustomPaymentMethodText("");
        setOrderNotes(cleanProjectNotes(project.notes));
        setEditingPaymentId(null);

        const discountMatch = project.notes?.match(/\[Discount:\s*([^\]]+)\]/);
        if (discountMatch && discountMatch[1]) {
          setSpecialClientDiscount(discountMatch[1].trim());
        } else {
          setSpecialClientDiscount("");
        }

        const shippingMatch = project.notes?.match(/\[Shipping:\s*([^\]]+)\]/);
        if (shippingMatch && shippingMatch[1]) {
          setShippingCharge(shippingMatch[1].trim());
        } else {
          setShippingCharge("");
        }

        setIsStarred(project.priority === "Urgent" ? 5 : project.priority === "High" ? 3 : 1);
        setCurrentOrderDate(project.order_date ? new Date(project.order_date) : new Date());
        setAcceptedDeliveryDate(project.deadline ? new Date(project.deadline) : undefined);
        setAgentId(project.created_by || project.assigned_agent_id || user?.id || "");
        setIsAutoFilled(false);

        // Resolve the true CRM service that already exists
        const linkedProspect = prospects.find(
          (p) =>
            p.id === project.prospect_id ||
            (project.client_name &&
              (p.business_name?.toLowerCase() === project.client_name.toLowerCase() ||
                p.contact_name?.toLowerCase() === project.client_name.toLowerCase())),
        );
        const prospectServiceName =
          linkedProspect?.service_name ||
          services.find((s) => s.id === linkedProspect?.service_id)?.name;

        const currentProjectService =
          (project.service_name && project.service_name !== "Design Charge"
            ? project.service_name
            : null) ||
          services.find(
            (s) =>
              (s.id === project.service_id ||
                s.name.toLowerCase() === project.service_id?.toLowerCase()) &&
              s.name !== "Design Charge",
          )?.name ||
          prospectServiceName ||
          services.find((s) => s.id === project.service_id)?.name ||
          project.service_name ||
          services[0]?.name ||
          "TVC";

        const itemsMatch = project.notes?.match(/\[Items:\s*(\[[\s\S]*?\])\]/);
        let itemsLoaded = false;
        if (itemsMatch && itemsMatch[1]) {
          try {
            const parsedItems = JSON.parse(itemsMatch[1]);
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
              const sanitizedItems = parsedItems.map((it: DialogOrderItem) => {
                const isDummy =
                  !it.model ||
                  it.model === "Design Charge" ||
                  it.model === "Menu Book" ||
                  it.model === "Pizza Box" ||
                  it.model === "Business Card" ||
                  it.model === "Visiting Card";
                return {
                  ...it,
                  model: isDummy && currentProjectService ? currentProjectService : it.model,
                };
              });
              setOrderItems(sanitizedItems);
              itemsLoaded = true;
            }
          } catch {
            // fallback below
          }
        }

        if (!itemsLoaded) {
          const itemBudget = project.budget || 1000;
          setOrderItems([
            {
              id: generateUUID(),
              model: currentProjectService,
              quantity: "1",
              lamination: "Standard",
              unitPrice: itemBudget,
              lineItemTotalPrice: itemBudget,
              isGift: false,
            },
          ]);
        }
      } else {
        setJobId(`JOB-${Math.floor(10000 + Math.random() * 90000)}`);
        setCompanyName("");
        setAddress("");
        setPhoneNumber("");
        setInitialStatusId(stages[0]?.id || "CR Clearance");
        setExistingAdvancePayments([]);
        setAdvancePaymentAmount("");
        setAdvancePaymentMethod("");
        setSpecialClientDiscount("");
        setShippingCharge("");
        setShowCustomPaymentInput(false);
        setCustomPaymentMethodText("");
        setOrderNotes("");
        setNewAdvancePaymentNotes("");
        setEditingPaymentId(null);
        setIsStarred(0);
        setCurrentOrderDate(new Date());
        setAcceptedDeliveryDate(undefined);
        setAgentId(user?.id || (agentOptions[0]?.id ?? ""));
        setIsAutoFilled(false);
        const defaultService = services[0]?.name || modelOptions[0]?.name || "TVC";
        setOrderItems([
          {
            id: generateUUID(),
            model: defaultService,
            quantity: "1",
            lamination: "Standard",
            unitPrice: 1000,
            lineItemTotalPrice: 1000,
            isGift: false,
          },
        ]);
      }
      setTimeout(() => {
        jobIdInputRef.current?.focus();
      }, 100);
    }
  }, [open, project, stages, modelOptions, agentOptions, user, services, prospects]);

  // Pricing calculations identical to erpapp
  useEffect(() => {
    const currentItemsTotal = orderItems.reduce(
      (sum, item) => sum + (item.isGift ? 0 : item.lineItemTotalPrice || 0),
      0,
    );
    setOrderItemsTotal(currentItemsTotal);

    let discountNum = 0;
    const discountStr = specialClientDiscount.trim();
    if (discountStr.endsWith("%")) {
      const percentage = parseFloat(discountStr.substring(0, discountStr.length - 1));
      if (!isNaN(percentage) && percentage >= 0) {
        discountNum = (percentage / 100) * currentItemsTotal;
      }
    } else {
      const fixedAmount = parseFloat(discountStr);
      if (!isNaN(fixedAmount) && fixedAmount >= 0) {
        discountNum = fixedAmount;
      }
    }
    discountNum = Math.min(discountNum, currentItemsTotal);
    setCalculatedDiscountAmount(discountNum);

    const currentNetPayable = Math.max(0, currentItemsTotal - discountNum);
    setNetPayable(currentNetPayable);

    const totalExistingAdvance = existingAdvancePayments.reduce(
      (sum, record) => sum + (Number(record.amount) || 0),
      0,
    );
    setTotalExistingAdvancePaid(totalExistingAdvance);

    const shippingNum = parseFloat(shippingCharge) || 0;
    const newAdvanceNum = parseFloat(advancePaymentAmount) || 0;
    const totalPaid = totalExistingAdvance + newAdvanceNum;
    setAmountDue(Math.max(0, currentNetPayable + shippingNum - totalPaid));
  }, [
    orderItems,
    specialClientDiscount,
    shippingCharge,
    advancePaymentAmount,
    existingAdvancePayments,
  ]);

  const handleAddItem = () => {
    const defaultModel = modelOptions[0];
    const newItem: DialogOrderItem = {
      id: generateUUID(),
      model: defaultModel ? defaultModel.name : "",
      quantity: "1",
      lamination: laminationOptions[0]?.name || "Matt",
      unitPrice: defaultModel ? defaultModel.sellingPrice : 0,
      lineItemTotalPrice: defaultModel ? defaultModel.sellingPrice : 0,
      isGift: false,
    };
    setOrderItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (orderItems.length <= 1) return;
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleToggleGift = (itemId: string) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isGift: !item.isGift } : item)),
    );
  };

  const togglePopover = (itemId: string, openVal: boolean) => {
    setPopoverOpenStates((prev) => ({ ...prev, [itemId]: openVal }));
  };

  const handleItemChange = (
    itemId: string,
    field: keyof DialogOrderItem | "modelName",
    value: string | number | null,
  ) => {
    setOrderItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item };
          if (field === "modelName") {
            const selectedModel = modelOptions.find((opt) => opt.name === value);
            updatedItem.model = selectedModel ? selectedModel.name : (value as string);
            updatedItem.unitPrice = selectedModel ? selectedModel.sellingPrice : 500;
          } else if (field === "quantity") {
            updatedItem.quantity = value as string;
          } else if (field === "lamination") {
            updatedItem.lamination = value as string;
          }
          const q = parseInt(updatedItem.quantity, 10);
          const p = updatedItem.unitPrice || 0;
          updatedItem.lineItemTotalPrice = !isNaN(q) && q > 0 ? q * p : p;
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const handleDiscountChange = (val: string) => {
    setSpecialClientDiscount(val);
    let discountVal = 0;
    const discountStr = val.trim();
    if (discountStr.endsWith("%")) {
      const percentage = parseFloat(discountStr.substring(0, discountStr.length - 1));
      if (!isNaN(percentage) && percentage >= 0) {
        discountVal = (percentage / 100) * orderItemsTotal;
      }
    } else {
      const fixedAmount = parseFloat(discountStr);
      if (!isNaN(fixedAmount) && fixedAmount >= 0) {
        discountVal = fixedAmount;
      }
    }
    if (discountVal > orderItemsTotal && orderItemsTotal > 0) {
      toast.error(
        `Special Client Discount (${formatCurrencyBdt(discountVal)}) cannot exceed total items price of ${formatCurrencyBdt(orderItemsTotal)}.`,
      );
    }
  };

  const handleSelectProspect = (p: Prospect) => {
    const company = p.business_name || p.contact_name || "";
    setCompanyName(company);
    setPhoneNumber(p.phone || "");
    setAddress(p.address || "Dhaka, Bangladesh");
    if (p.notes) {
      setOrderNotes(cleanProjectNotes(p.notes));
    }
    if (p.service_name || p.service_id) {
      const srvName = p.service_name || services.find((s) => s.id === p.service_id)?.name;
      if (srvName) {
        setOrderItems([
          {
            id: generateUUID(),
            model: srvName,
            quantity: "1",
            lamination: "Matt",
            unitPrice: 1000,
            lineItemTotalPrice: 1000,
            isGift: false,
          },
        ]);
      }
    }
    setIsAutoFilled(true);
    setIsProspectPopoverOpen(false);
  };

  const giftTotal = orderItems.reduce(
    (sum, item) => sum + (item.isGift ? item.lineItemTotalPrice || 0 : 0),
    0,
  );

  const isAdvancePaymentEntered =
    !isNaN(parseFloat(advancePaymentAmount)) && parseFloat(advancePaymentAmount) > 0;

  const grandTotal = useMemo(() => {
    const shippingNum = parseFloat(shippingCharge) || 0;
    return netPayable + shippingNum;
  }, [netPayable, shippingCharge]);

  const totalAdvanceAfterNew = useMemo(() => {
    return totalExistingAdvancePaid + (parseFloat(advancePaymentAmount) || 0);
  }, [totalExistingAdvancePaid, advancePaymentAmount]);

  const isAdvPaymentOver = useMemo(() => {
    return grandTotal > 0 && totalAdvanceAfterNew > grandTotal;
  }, [grandTotal, totalAdvanceAfterNew]);

  const isAdvPaymentValid = useMemo(() => {
    return grandTotal === 0 || totalAdvanceAfterNew <= grandTotal;
  }, [grandTotal, totalAdvanceAfterNew]);

  useEffect(() => {
    if (!open) {
      toast.dismiss("advance-over-amount");
      return;
    }
    if (isAdvPaymentOver) {
      const overAmount = totalAdvanceAfterNew - grandTotal;
      toast.error("Advance Payment Limit Exceeded", {
        id: "advance-over-amount",
        description: `Total payment (${formatCurrencyBdt(totalAdvanceAfterNew)}) exceeds Grand Total of ${formatCurrencyBdt(grandTotal)} by ${formatCurrencyBdt(overAmount)}. Please adjust the amount.`,
        duration: 4000,
      });
    } else {
      toast.dismiss("advance-over-amount");
    }
  }, [open, isAdvPaymentOver, totalAdvanceAfterNew, grandTotal]);

  const isDiscountValid = useMemo(() => {
    return orderItemsTotal === 0 || calculatedDiscountAmount <= orderItemsTotal;
  }, [orderItemsTotal, calculatedDiscountAmount]);

  const canSubmit = useMemo(() => {
    if (
      isSaving ||
      companyName.trim().length === 0 ||
      phoneNumber.trim().length === 0 ||
      orderItems.length === 0
    ) {
      return false;
    }
    return true;
  }, [isSaving, companyName, phoneNumber, orderItems]);

  const handleStartEditPayment = (payment: AdvancePaymentRecord) => {
    setEditingPaymentId(payment.id);
    setEditingAmount(payment.amount.toString());
    setEditingMethod(payment.paymentMethod || "bKash");
    setEditingNotes(payment.notes || "");
    setTimeout(() => {
      amountInputRef.current?.focus();
      amountInputRef.current?.select();
    }, 50);
  };

  const handleSavePaymentEdit = (paymentId: string) => {
    const newAmount = parseFloat(editingAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Please enter a valid positive number for the payment.");
      return;
    }
    const updatedPayments = existingAdvancePayments.map((p) =>
      p.id === paymentId ? { ...p, amount: newAmount } : p,
    );
    const totalUpdated = updatedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const shippingNum = parseFloat(shippingCharge) || 0;
    const currentGrandTotal = netPayable + shippingNum;
    if (totalUpdated > currentGrandTotal && currentGrandTotal > 0) {
      toast.error("Advance Payment Limit Exceeded", {
        id: "advance-over-amount",
        description: `Total payment (${formatCurrencyBdt(totalUpdated)}) exceeds Grand Total of ${formatCurrencyBdt(currentGrandTotal)} by ${formatCurrencyBdt(totalUpdated - currentGrandTotal)}.`,
        duration: 5000,
      });
      return;
    }
    setExistingAdvancePayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              amount: newAmount,
              paymentMethod: editingMethod,
              notes: editingNotes.trim(),
            }
          : p,
      ),
    );
    setEditingPaymentId(null);
    toast.success("Payment record updated.");
  };

  const handleCancelPaymentEdit = () => {
    setEditingPaymentId(null);
  };

  const confirmDeletePayment = () => {
    if (!paymentToDelete) return;
    setExistingAdvancePayments((prev) => prev.filter((p) => p.id !== paymentToDelete.id));
    toast.success(`Deleted payment of ${formatCurrencyBdt(paymentToDelete.amount)}`);
    setPaymentToDelete(null);
  };

  const handleAdvancePaymentAmountChange = (value: string) => {
    setAdvancePaymentAmount(value);
    const numericValue = parseFloat(value);
    const shippingNum = parseFloat(shippingCharge) || 0;
    const currentGrandTotal = netPayable + shippingNum;
    const currentTotalAfter = totalExistingAdvancePaid + (numericValue || 0);

    if (!isNaN(numericValue) && currentGrandTotal > 0 && currentTotalAfter > currentGrandTotal) {
      const overAmount = currentTotalAfter - currentGrandTotal;
      toast.error("Advance Payment Limit Exceeded", {
        id: "advance-over-amount",
        description: `Total payment (${formatCurrencyBdt(currentTotalAfter)}) exceeds Grand Total of ${formatCurrencyBdt(currentGrandTotal)} by ${formatCurrencyBdt(overAmount)}.`,
        duration: 4000,
      });
    } else {
      toast.dismiss("advance-over-amount");
    }

    if (!value || parseFloat(value) <= 0) {
      setAdvancePaymentMethod("");
      setNewAdvancePaymentNotes("");
      setShowCustomPaymentInput(false);
      setCustomPaymentMethodText("");
    }
  };

  const handleAdvancePaymentBlur = () => {
    const numericValue = parseFloat(advancePaymentAmount);
    const shippingNum = parseFloat(shippingCharge) || 0;
    const currentGrandTotal = netPayable + shippingNum;
    const currentTotalAfter = totalExistingAdvancePaid + (numericValue || 0);

    if (!isNaN(numericValue) && currentGrandTotal > 0 && currentTotalAfter > currentGrandTotal) {
      const overAmount = currentTotalAfter - currentGrandTotal;
      toast.error("Advance Payment Limit Exceeded", {
        id: "advance-over-amount",
        description: `Total payment (${formatCurrencyBdt(currentTotalAfter)}) exceeds Grand Total of ${formatCurrencyBdt(currentGrandTotal)} by ${formatCurrencyBdt(overAmount)}. Please reduce the amount.`,
        duration: 5000,
      });
    }
  };

  const handleAdvancePaymentMethodChange = (value: string) => {
    setAdvancePaymentMethod(value);
    if (value.toLowerCase() === "other") {
      setShowCustomPaymentInput(true);
    } else {
      setShowCustomPaymentInput(false);
      setCustomPaymentMethodText("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdvPaymentOver) {
      const overAmount = totalAdvanceAfterNew - grandTotal;
      toast.error("Advance Payment Limit Exceeded", {
        id: "advance-over-amount",
        description: `Total payment (${formatCurrencyBdt(totalAdvanceAfterNew)}) exceeds Grand Total of ${formatCurrencyBdt(grandTotal)} by ${formatCurrencyBdt(overAmount)}. Please adjust the amount before saving.`,
        duration: 5000,
      });
      return;
    }
    if (!isDiscountValid) {
      toast.error("Special Client Discount Limit Exceeded", {
        description: `Special Client Discount cannot exceed total items price of ${formatCurrencyBdt(orderItemsTotal)}.`,
      });
      return;
    }
    if (isAdvancePaymentEntered) {
      if (!advancePaymentMethod.trim()) {
        toast.error("Payment Method Required", {
          description: "Please select a payment method for the advance payment.",
        });
        return;
      }
      if (advancePaymentMethod.toLowerCase() === "other" && !customPaymentMethodText.trim()) {
        toast.error("Custom Method Required", {
          description: "Please specify the custom payment method.",
        });
        return;
      }
      if (newAdvancePaymentNotes.trim().length < 4) {
        toast.error("Payment Reference Required", {
          description: "Payment reference/notes must be at least 4 characters.",
        });
        return;
      }
    }
    if (!canSubmit) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    const priorityLabel = isStarred >= 4 ? "Urgent" : isStarred >= 2 ? "High" : "Medium";

    const newAdvanceNum = parseFloat(advancePaymentAmount) || 0;
    const finalPayments = [...existingAdvancePayments];

    if (newAdvanceNum > 0 && advancePaymentMethod) {
      finalPayments.push({
        id: generateUUID(),
        amount: newAdvanceNum,
        date: format(new Date(), "yyyy-MM-dd"),
        paymentMethod:
          advancePaymentMethod === "Other" && customPaymentMethodText
            ? customPaymentMethodText
            : advancePaymentMethod,
        notes: newAdvancePaymentNotes.trim() || undefined,
        recordedByUserId: user?.id || null,
        recordedByUserName: user
          ? typeof user["name"] === "string"
            ? (user["name"] as string)
            : (user.email ?? null)
          : null,
        status: "Approved",
      });
    }

    const totalPaidAmount = finalPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const shippingNum = parseFloat(shippingCharge) || 0;
    const totalBudget = netPayable > 0 ? netPayable + shippingNum : orderItemsTotal;

    const cleanedNotes = cleanProjectNotes(orderNotes);

    const notesPayload = [
      cleanedNotes,
      specialClientDiscount ? `[Discount: ${specialClientDiscount}]` : null,
      shippingNum > 0 ? `[Shipping: ${shippingCharge.trim()}]` : null,
      orderItems.length > 0 ? `[Items: ${JSON.stringify(orderItems)}]` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await onSave({
      id: project?.id || null,
      project_code: jobId.trim() || project?.project_code || null,
      prospect_id: project?.prospect_id || null,
      title: companyName.trim(),
      client_name: companyName.trim(),
      client_phone: phoneNumber.trim() || null,
      client_email: project?.client_email || null,
      service_id: orderItems[0]?.model || null,
      stage_id: initialStatusId || "CR Clearance",
      priority: priorityLabel,
      assigned_artist_id: null, // rule: "default assign thakbe nah"
      assigned_agent_id: agentId || null,
      created_by: agentId || user?.id || null, // rule: "need to select agent coz je add korbe tar id db te add hobe"
      budget: totalBudget,
      paid_amount: totalPaidAmount,
      progress: project?.progress || 0,
      order_date: currentOrderDate
        ? format(currentOrderDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      deadline: acceptedDeliveryDate ? format(acceptedDeliveryDate, "yyyy-MM-dd") : null,
      notes: notesPayload || null,
      advance_payments: finalPayments,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] sm:max-h-[90vh] p-3.5 sm:p-6 overflow-hidden flex flex-col">
          <DialogHeader className="pb-1 sm:pb-2 pr-8 sm:pr-0">
            <DialogTitle className="text-base sm:text-lg">
              {project ? (
                <>
                  Edit Order:{" "}
                  <span className="font-normal">{project.client_name || project.title}</span>
                </>
              ) : (
                "Create New Order"
              )}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {project ? (
                <>
                  Modify details for order ID:{" "}
                  <span className="font-mono">{project.project_code || project.id}</span>.
                </>
              ) : (
                "Enter company details and add order items. Required fields are marked with *."
              )}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden w-full max-w-full min-w-0"
          >
            <div className="grid gap-3 sm:gap-4 py-2 sm:py-4 max-h-[68vh] sm:max-h-[70vh] overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0 pr-1 sm:pr-2 custom-scrollbar">
              {/* Row 1: Job ID & Company Name */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <Label htmlFor="jobId" className="text-xs sm:text-sm truncate block">
                    Job ID
                  </Label>
                  <Input
                    id="jobId"
                    ref={jobIdInputRef}
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    placeholder="Leave blank"
                    className="w-full text-xs sm:text-sm h-9"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="companyName" className="text-xs sm:text-sm truncate block">
                      Company Name *
                    </Label>
                    {prospects.length > 0 && !project && (
                      <Popover open={isProspectPopoverOpen} onOpenChange={setIsProspectPopoverOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="text-[11px] text-[#67B239] hover:underline font-medium cursor-pointer"
                          >
                            {isAutoFilled ? "✓ Change Lead" : "Select Lead"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-0 z-60" align="end">
                          <Command>
                            <CommandInput placeholder="Search lead..." className="h-8 text-xs" />
                            <CommandList className="max-h-56 overflow-y-auto">
                              <CommandEmpty>No lead found.</CommandEmpty>
                              <CommandGroup>
                                {prospects.map((p) => (
                                  <CommandItem
                                    key={p.id}
                                    value={p.business_name || p.contact_name}
                                    onSelect={() => handleSelectProspect(p)}
                                    className="cursor-pointer text-xs"
                                  >
                                    <Check
                                      className={cn(
                                        "size-3.5 mr-1.5",
                                        companyName === (p.business_name || p.contact_name)
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <span className="truncate">
                                      {p.business_name || p.contact_name}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setIsAutoFilled(false);
                    }}
                    required
                    placeholder="e.g., Color Hut"
                    className={cn("w-full text-xs sm:text-sm h-9", isAutoFilled && "bg-muted/50")}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Row 2: Address */}
              <div className="space-y-1 min-w-0">
                <Label htmlFor="address" className="text-xs sm:text-sm">
                  Address *
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setIsAutoFilled(false);
                  }}
                  required
                  placeholder="Client address or location..."
                  className={cn(
                    "w-full text-xs sm:text-sm min-h-[60px]",
                    isAutoFilled && "bg-muted/50",
                  )}
                  disabled={isSaving}
                />
              </div>

              {/* Row 3: Phone Number, Order Date, Delivery Date, Priority Star */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full min-w-0">
                <div className="space-y-1 min-w-0">
                  <Label
                    htmlFor="phoneNumber"
                    className="text-xs sm:text-sm h-5 flex items-center truncate"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, "");
                      if (numericValue.length <= 11) {
                        setPhoneNumber(numericValue);
                        setIsAutoFilled(false);
                      }
                    }}
                    required
                    pattern="0\d{10}"
                    maxLength={11}
                    title="Phone number must be an 11-digit number starting with 0."
                    placeholder="01xxxxxxxxx"
                    className={cn("w-full text-xs sm:text-sm h-9", isAutoFilled && "bg-muted/50")}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1 min-w-0">
                  <Label
                    htmlFor="orderDate"
                    className="text-xs sm:text-sm h-5 flex items-center truncate"
                  >
                    Order Date *
                  </Label>
                  <Popover open={isOrderDatePopoverOpen} onOpenChange={setIsOrderDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal min-w-0 text-xs sm:text-sm h-9 px-2.5",
                          !currentOrderDate && "text-muted-foreground",
                        )}
                        disabled={isSaving}
                      >
                        <CalendarDays className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {currentOrderDate ? format(currentOrderDate, "PP") : "Pick a date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={currentOrderDate}
                        onSelect={(date) => {
                          setCurrentOrderDate(date);
                          setIsOrderDatePopoverOpen(false);
                        }}
                        initialFocus
                        disabled={isSaving}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1 min-w-0">
                  <Label
                    htmlFor="acceptedDeliveryDate"
                    className="text-xs sm:text-sm h-5 flex items-center truncate"
                  >
                    Delivery Date
                  </Label>
                  <Popover
                    open={isDeliveryDatePopoverOpen}
                    onOpenChange={setIsDeliveryDatePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal min-w-0 text-xs sm:text-sm h-9 px-2.5",
                          !acceptedDeliveryDate && "text-muted-foreground",
                        )}
                        disabled={isSaving}
                      >
                        <CalendarDays className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          {acceptedDeliveryDate
                            ? format(acceptedDeliveryDate, "PP")
                            : "Pick a date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={acceptedDeliveryDate}
                        onSelect={(date) => {
                          setAcceptedDeliveryDate(date);
                          setIsDeliveryDatePopoverOpen(false);
                        }}
                        initialFocus
                        disabled={isSaving}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1 min-w-0">
                  <Label className="flex items-center gap-1.5 h-5 cursor-pointer text-xs sm:text-sm truncate">
                    <Star
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-all",
                        isStarred > 0
                          ? "fill-amber-500 text-amber-500 scale-110"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="truncate">Priority Star</span>
                  </Label>
                  <div className="flex items-center justify-between h-9 px-2 sm:px-3 border rounded-md bg-background">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starIndex) => {
                        const isFull = isStarred >= starIndex;
                        const isHalf = !isFull && isStarred >= starIndex - 0.5;

                        return (
                          <button
                            key={starIndex}
                            type="button"
                            onClick={() => {
                              if (isStarred === starIndex) {
                                setIsStarred(0);
                              } else if (isStarred === starIndex - 0.5) {
                                setIsStarred(starIndex);
                              } else {
                                setIsStarred(starIndex - 0.5);
                              }
                            }}
                            className="relative cursor-pointer transition-transform hover:scale-110 active:scale-95 shrink-0 outline-none"
                          >
                            {isFull ? (
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ) : isHalf ? (
                              <div className="relative">
                                <Star className="h-4 w-4 text-muted-foreground/30 dark:text-muted-foreground/20" />
                                <div className="absolute top-0 left-0 overflow-hidden w-[50%] h-full">
                                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                </div>
                              </div>
                            ) : (
                              <Star className="h-4 w-4 text-muted-foreground/30 dark:text-muted-foreground/20 hover:text-amber-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Order Notes */}
              <div className="space-y-1">
                <Label htmlFor="orderNotes" className="text-xs sm:text-sm">
                  Order Notes (Optional)
                </Label>
                <Textarea
                  id="orderNotes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add any specific instructions or notes for this order..."
                  rows={3}
                  className="w-full text-xs sm:text-sm min-h-[60px]"
                  disabled={isSaving}
                />
              </div>

              {/* Row 5: Order Items * (100% ERPAPP Table) */}
              <div className="space-y-3 mt-4 border-t border-border pt-4 w-full min-w-0">
                <Label className="text-base sm:text-lg font-semibold">Order Items *</Label>
                <div className="w-full max-w-full overflow-x-auto rounded-md border bg-background custom-scrollbar">
                  <Table className="w-full min-w-[620px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[55%]">Service *</TableHead>
                        <TableHead className="w-[20%]">Quantity *</TableHead>
                        <TableHead className="w-[20%] text-right pr-4">Total Price</TableHead>
                        <TableHead className="w-[5%] text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30">
                          <TableCell className="p-2 align-middle">
                            <div className="flex items-center gap-1.5">
                              <Popover
                                open={popoverOpenStates[item.id] || false}
                                onOpenChange={(openVal) => togglePopover(item.id, openVal)}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={popoverOpenStates[item.id] || false}
                                    className="flex-1 min-w-0 justify-between bg-background text-xs sm:text-sm h-9"
                                    disabled={isSaving}
                                  >
                                    <span className="truncate">
                                      {item.model || "Select service..."}
                                    </span>
                                    <ChevronsUpDown className="ml-1.5 h-3 w-3 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="min-w-[var(--radix-popover-trigger-width)] w-max max-w-lg p-0 z-[60]"
                                  align="start"
                                >
                                  <Command className="max-h-96 overflow-hidden flex flex-col">
                                    <CommandInput
                                      placeholder="Search service..."
                                      className="h-8 text-xs"
                                    />
                                    <CommandList className="max-h-80 overflow-y-auto">
                                      <CommandEmpty>No service found.</CommandEmpty>
                                      <CommandGroup>
                                        {modelOptions.map((option) => (
                                          <CommandItem
                                            key={option.id}
                                            value={option.name}
                                            onSelect={() => {
                                              handleItemChange(item.id, "modelName", option.name);
                                              togglePopover(item.id, false);
                                            }}
                                            className="flex items-center gap-2 cursor-pointer text-xs"
                                          >
                                            <Check
                                              className={cn(
                                                "h-4 w-4 shrink-0",
                                                item.model === option.name
                                                  ? "opacity-100"
                                                  : "opacity-0",
                                              )}
                                            />
                                            <span className="flex-1 truncate">{option.name}</span>
                                            {option.sellingPrice && (
                                              <span className="ml-auto text-xs text-muted-foreground">
                                                (৳{option.sellingPrice})
                                              </span>
                                            )}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </TableCell>
                          <TableCell className="p-2 align-middle">
                            <Input
                              id={`quantity-${item.id}`}
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(item.id, "quantity", e.target.value)
                              }
                              placeholder="e.g., 100"
                              min="1"
                              required
                              className="bg-background text-xs sm:text-sm h-9"
                              disabled={isSaving}
                            />
                          </TableCell>
                          <TableCell
                            className="p-2 align-middle text-right pr-4 font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer select-none"
                            onDoubleClick={() => handleToggleGift(item.id)}
                            title="Double-click to toggle Gift"
                          >
                            <span
                              style={
                                item.isGift
                                  ? {
                                      textDecoration: "line-through",
                                      textDecorationColor: "#ef4444",
                                      color: "#6b7280",
                                    }
                                  : undefined
                              }
                            >
                              {formatCurrencyBdt(item.lineItemTotalPrice)}
                            </span>
                            {item.isGift && " (Gift)"}
                          </TableCell>
                          <TableCell className="p-2 align-middle text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isSaving || orderItems.length <= 1}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive-foreground cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  className="mt-2 text-xs h-8 cursor-pointer"
                  disabled={isSaving}
                >
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add Another Item
                </Button>
              </div>

              <Separator className="my-4" />

              {/* Row 6: Special Client Discount & Shipping Charge (100% ERPAPP) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <div className="space-y-1">
                  <Label htmlFor="specialClientDiscount">Special Client Discount</Label>
                  <div className="relative">
                    <Input
                      id="specialClientDiscount"
                      type="text"
                      value={specialClientDiscount}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      placeholder="e.g., 100 or 10%"
                      disabled={isSaving}
                      className="pl-7"
                    />
                    <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="shippingCharge">Shipping Charge</Label>
                  <Input
                    id="shippingCharge"
                    type="number"
                    value={shippingCharge}
                    onChange={(e) => setShippingCharge(e.target.value)}
                    placeholder="0"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Payment History Table (100% ERPAPP edit-order-dialog.tsx match) */}
              <div className="mt-4 space-y-2 w-full min-w-0">
                <div className="flex items-center justify-between">
                  <Label className="text-md font-semibold flex items-center">
                    <ReceiptText className="mr-2 h-5 w-5 text-primary/80" />
                    Payment History{" "}
                    {existingAdvancePayments.length > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground font-normal">
                        ({existingAdvancePayments.length})
                      </span>
                    )}
                  </Label>
                  {existingAdvancePayments.length > 0 && (
                    <span className="text-[11px] text-muted-foreground font-normal hidden sm:inline">
                      Double-click row to edit
                    </span>
                  )}
                </div>

                {existingAdvancePayments.length > 0 ? (
                  <div className="w-full max-w-full max-h-48 overflow-y-auto overflow-x-auto rounded-md border bg-muted/20 p-2 custom-scrollbar">
                    <Table className="w-full min-w-[450px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8 text-xs">Date</TableHead>
                          <TableHead className="h-8 text-xs">Amount</TableHead>
                          <TableHead className="h-8 text-xs">Method</TableHead>
                          <TableHead className="h-8 text-xs">Reference/Notes</TableHead>
                          <TableHead className="h-8 text-right text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {existingAdvancePayments.map((record) => (
                          <TableRow
                            key={record.id}
                            className="group hover:bg-muted/40 transition-colors"
                            onDoubleClick={() => {
                              if (!editingPaymentId) handleStartEditPayment(record);
                            }}
                          >
                            <TableCell className="text-xs py-1.5 whitespace-nowrap">
                              {formatDateForDialogInput(record.date)}
                            </TableCell>
                            <TableCell className="text-xs py-1.5 font-medium whitespace-nowrap">
                              {editingPaymentId === record.id ? (
                                <Input
                                  ref={amountInputRef}
                                  type="number"
                                  value={editingAmount}
                                  onChange={(e) => setEditingAmount(e.target.value)}
                                  className="h-7 text-xs w-28"
                                />
                              ) : (
                                formatCurrencyBdt(record.amount)
                              )}
                            </TableCell>
                            <TableCell className="text-xs py-1.5">
                              {editingPaymentId === record.id ? (
                                <Select
                                  value={editingMethod}
                                  onValueChange={(value) => setEditingMethod(value)}
                                >
                                  <SelectTrigger className="h-7 text-xs w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {paymentMethodOptions.map((pm) => (
                                      <SelectItem key={pm.id} value={pm.name}>
                                        {pm.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                record.paymentMethod || "N/A"
                              )}
                            </TableCell>
                            <TableCell
                              className="text-xs text-muted-foreground py-1.5 max-w-[150px] truncate"
                              title={record.notes || undefined}
                            >
                              {editingPaymentId === record.id ? (
                                <Input
                                  value={editingNotes}
                                  onChange={(e) => setEditingNotes(e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Notes/Ref"
                                />
                              ) : (
                                record.notes || "N/A"
                              )}
                            </TableCell>
                            <TableCell className="text-right py-1.5">
                              {editingPaymentId === record.id ? (
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-green-600 hover:bg-green-100 cursor-pointer"
                                    onClick={() => handleSavePaymentEdit(record.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:bg-muted cursor-pointer"
                                    onClick={handleCancelPaymentEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPaymentToDelete(record);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border/80 p-3 text-center bg-muted/10">
                    <p className="text-xs text-muted-foreground">
                      No payment history recorded yet. Add an advance payment below.
                    </p>
                  </div>
                )}
              </div>

              {/* Adjustment / Advance Payment Input Row (100% ERPAPP) */}
              <div className="mt-4 border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <div className="space-y-1">
                  <Label htmlFor="newAdvanceAmount">
                    {existingAdvancePayments.length > 0 ? "Adjustment Payment" : "Advance Payment"}
                  </Label>
                  <Input
                    id="newAdvanceAmount"
                    type="number"
                    value={advancePaymentAmount}
                    onChange={(e) => handleAdvancePaymentAmountChange(e.target.value)}
                    onBlur={handleAdvancePaymentBlur}
                    placeholder="Amount (BDT)"
                    min="0"
                    step="0.01"
                    disabled={isSaving}
                  />
                </div>
                {isAdvancePaymentEntered && (
                  <div className="space-y-1">
                    <Label htmlFor="newAdvancePaymentMethod">Payment Method *</Label>
                    <Popover
                      open={isPaymentMethodPopoverOpen}
                      onOpenChange={setIsPaymentMethodPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between bg-background"
                          disabled={isSaving}
                        >
                          <span className="flex-1 text-left whitespace-nowrap">
                            {advancePaymentMethod
                              ? paymentMethodOptions.find(
                                  (opt) => opt.name === advancePaymentMethod,
                                )?.name || advancePaymentMethod
                              : "Select method..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] w-max max-w-md p-0">
                        <Command>
                          <CommandInput placeholder="Search method..." />
                          <CommandList>
                            <CommandEmpty>No method found.</CommandEmpty>
                            <CommandGroup>
                              {paymentMethodOptions.map((opt) => (
                                <CommandItem
                                  key={opt.id}
                                  value={opt.name}
                                  onSelect={(val) => {
                                    handleAdvancePaymentMethodChange(
                                      paymentMethodOptions.find(
                                        (o) => o.name.toLowerCase() === val.toLowerCase(),
                                      )?.name || val,
                                    );
                                    setIsPaymentMethodPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      advancePaymentMethod === opt.name
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  <span className="whitespace-nowrap">{opt.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {showCustomPaymentInput && (
                      <div className="mt-2 space-y-1">
                        <Label htmlFor="customPaymentMethodText">Specify Other Method *</Label>
                        <Input
                          id="customPaymentMethodText"
                          value={customPaymentMethodText}
                          onChange={(e) => setCustomPaymentMethodText(e.target.value)}
                          required={advancePaymentMethod.toLowerCase() === "other"}
                          disabled={isSaving}
                        />
                      </div>
                    )}
                  </div>
                )}
                {isAdvancePaymentEntered && (
                  <div className="space-y-1">
                    <Label htmlFor="newAdvancePaymentNotes">Reference/Notes *</Label>
                    <Input
                      id="newAdvancePaymentNotes"
                      value={newAdvancePaymentNotes}
                      onChange={(e) => setNewAdvancePaymentNotes(e.target.value)}
                      placeholder="Reference or Transaction ID"
                      required={isAdvancePaymentEntered}
                      minLength={4}
                    />
                  </div>
                )}
              </div>

              {/* Order Summary Box (100% ERPAPP Styling) */}
              <div className="mt-4 p-4 border rounded-md bg-muted/30 space-y-2">
                <h4 className="text-md font-semibold text-foreground mb-2">Order Summary</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Items Total:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrencyBdt(orderItemsTotal)}
                  </span>
                </div>
                {giftTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Gift className="h-4 w-4 mr-1 text-yellow-500" />
                      Gift Value:
                    </span>
                    <span className="font-medium text-yellow-500">
                      {formatCurrencyBdt(giftTotal)}
                    </span>
                  </div>
                )}
                {(calculatedDiscountAmount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium text-red-600">
                      - {formatCurrencyBdt(calculatedDiscountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net Payable:</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrencyBdt(netPayable)}
                  </span>
                </div>
                {(parseFloat(shippingCharge) || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping Charge:</span>
                    <span className="font-medium text-foreground">
                      + {formatCurrencyBdt(parseFloat(shippingCharge))}
                    </span>
                  </div>
                )}
                {totalExistingAdvancePaid + (parseFloat(advancePaymentAmount) || 0) > 0 && (
                  <div className="flex justify-between text-sm mt-1 pt-1 border-t border-dashed border-border">
                    <span className="text-muted-foreground">Total Paid:</span>
                    <span className="font-medium text-green-600">
                      -{" "}
                      {formatCurrencyBdt(
                        totalExistingAdvancePaid + (parseFloat(advancePaymentAmount) || 0),
                      )}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold mt-1 pt-1 border-t border-border">
                  <span className="text-primary">Amount Due:</span>
                  <span className="text-primary">{formatCurrencyBdt(amountDue)}</span>
                </div>
              </div>
            </div>

            {/* Dialog Footer (Exact to ERPAPP) */}
            <DialogFooter className="pt-3 sm:pt-4 border-t flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || isSaving}
                className="bg-[#67B239] hover:bg-[#5aa030] text-white text-xs sm:text-sm cursor-pointer gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {project ? "Updating..." : "Creating..."}
                  </>
                ) : project ? (
                  "Save Changes"
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Deletion Confirmation Alert Dialog (Exact to ERPAPP) */}
      {paymentToDelete && (
        <AlertDialog
          open={!!paymentToDelete}
          onOpenChange={(open) => !open && setPaymentToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the payment of{" "}
                {formatCurrencyBdt(paymentToDelete.amount)} made on{" "}
                {formatDateForDialogInput(paymentToDelete.date)}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPaymentToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeletePayment}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

const ProjectOffcanvasDrawer = ProjectFormDialog;
