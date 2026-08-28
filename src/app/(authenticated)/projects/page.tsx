"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Pencil,
  Trash2,
  User,
  Phone,
  CalendarDays,
  MapPin,
  EllipsisVertical,
  Sparkles,
  ArrowRight,
  Eye,
  AlertCircle,
  Building2,
  DraftingCompass,
  UserPlus,
  CalendarClock,
  Trophy,
  PhoneMissed,
  PowerOff,
  PhoneOff,
  CalendarCheck,
  FileText,
  ShieldAlert,
  UserX,
  Circle,
  Layers,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { crmUsersQueryOptions } from "@/lib/admin-users";
import { servicesQueryOptions } from "@/lib/services";
import { FALLBACK_STAGES, resolveStageColor, resolveStageIcon, type Stage } from "@/lib/stages";
import {
  projectsQueryOptions,
  useSaveProjectMutation,
  useUpdateProjectStatusMutation,
  useDeleteProjectMutation,
  type CrmProjectItem,
  type SaveProjectPayload,
} from "@/lib/projects";
import { useAuth } from "@/lib/auth";
import { formatCrmDate } from "@/lib/mysql-client";

const STAGE_ICON_MAP: Record<string, LucideIcon> = {
  UserPlus,
  CalendarClock,
  Sparkles,
  Trophy,
  PhoneMissed,
  PowerOff,
  PhoneOff,
  CalendarCheck,
  FileText,
  ShieldAlert,
  UserX,
  Circle,
};

function getStageLucideIcon(iconName?: string | null, stageName?: string | null): LucideIcon {
  if (iconName && STAGE_ICON_MAP[iconName]) {
    return STAGE_ICON_MAP[iconName];
  }
  const resolved = resolveStageIcon(stageName, iconName);
  return STAGE_ICON_MAP[resolved] || Circle;
}

function formatProjectCardDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "No Date";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  } catch {
    return String(dateInput);
  }
}

export default function ProjectsPage() {
  const { user, isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [artistFilter, setArtistFilter] = useState<string>("all");

  // Drag & Drop State
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

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

  const { data, isLoading } = useQuery(projectsQueryOptions(user?.id, isAdmin));

  const projects = useMemo(() => data?.projects || [], [data?.projects]);
  const stages: Stage[] = useMemo(() => {
    if (data?.stages && data.stages.length > 0) {
      return [...data.stages]
        .filter((s) => s.is_active !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    }
    return FALLBACK_STAGES;
  }, [data?.stages]);

  const { data: users = [] } = useQuery(crmUsersQueryOptions());
  const { data: services = [] } = useQuery(servicesQueryOptions());

  const saveProjectMutation = useSaveProjectMutation();
  const updateStatusMutation = useUpdateProjectStatusMutation();
  const deleteProjectMutation = useDeleteProjectMutation();

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (stageFilter !== "all" && p.stage_id !== stageFilter && p.stage_name !== stageFilter) {
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
  }, [projects, search, stageFilter, artistFilter]);

  const handleDropOnStage = (targetStage: Stage) => {
    if (!draggedProjectId) return;
    const targetProject = projects.find((p) => p.id === draggedProjectId);
    if (!targetProject) return;

    if (
      targetProject.stage_id !== targetStage.id &&
      targetProject.stage_name.toLowerCase() !== targetStage.name.toLowerCase()
    ) {
      updateStatusMutation.mutate({
        id: targetProject.id,
        stage_id: targetStage.id,
        stage_name: targetStage.name,
      });
    }

    setDraggedProjectId(null);
    setDragOverStageId(null);
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border/80 rounded-2xl p-3 shadow-2xs">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search code, title, client, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 rounded-xl"
            />
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-48 text-xs h-9 rounded-xl">
              <SelectValue placeholder="All Stages" />
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

          <Select value={artistFilter} onValueChange={setArtistFilter}>
            <SelectTrigger className="w-full sm:w-48 text-xs h-9 rounded-xl">
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

          {(search || stageFilter !== "all" || artistFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStageFilter("all");
                setArtistFilter("all");
              }}
              className="text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50">
          <Layers className="size-3.5 text-[#67B239]" />
          <span>Drag cards across columns to update CRM stage</span>
        </div>
      </div>

      {/* Main Dynamic Kanban Content Area */}
      <ScrollArea className="w-full whitespace-nowrap pb-2 select-none">
        <div className="flex gap-4 pb-3 min-w-max">
          {stages.map((stage) => {
            const stageProjects = filteredProjects.filter(
              (p) =>
                p.stage_id === stage.id ||
                p.stage_name.toLowerCase() === stage.name.toLowerCase() ||
                p.stage_id === stage.name.toLowerCase().replace(/\s+/g, "-"),
            );

            const stageColor = resolveStageColor(stage.name, stage.color);
            const StageIcon: LucideIcon = getStageLucideIcon(stage.icon, stage.name);
            const isDragOver = dragOverStageId === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverStageId !== stage.id) {
                    setDragOverStageId(stage.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dragOverStageId === stage.id) {
                    setDragOverStageId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropOnStage(stage);
                }}
                className={`w-76 flex flex-col bg-muted/20 border rounded-2xl shadow-2xs overflow-hidden transition-all duration-200 ${
                  isDragOver
                    ? "border-[#67B239] ring-2 ring-[#67B239]/50 bg-[#67B239]/5 scale-[1.01]"
                    : "border-border/60"
                }`}
              >
                {/* Dynamic Column Header */}
                <div
                  className="px-3.5 py-2.5 flex items-center justify-between text-white transition-colors shrink-0"
                  style={{ backgroundColor: stageColor }}
                >
                  <div className="flex items-center gap-2">
                    <StageIcon className="size-4" />
                    <span className="font-semibold text-xs tracking-wide">{stage.name}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-black/25 text-white font-bold text-[10px] px-2 py-0.5 rounded-full border-0"
                  >
                    {isLoading ? "..." : stageProjects.length}
                  </Badge>
                </div>

                {/* Column Body Cards */}
                <ScrollArea className="h-[calc(100vh-210px)] min-h-96">
                  <div className="p-3 flex flex-col gap-3">
                    {isDragOver && (
                      <div className="h-16 border-2 border-dashed border-[#67B239] bg-[#67B239]/10 rounded-xl flex items-center justify-center text-xs font-semibold text-[#67B239] animate-pulse">
                        Drop here to move to {stage.name}
                      </div>
                    )}

                    {isLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                      </div>
                    ) : stageProjects.length === 0 && !isDragOver ? (
                      <div className="h-32 border border-dashed border-border/70 rounded-xl flex items-center justify-center text-muted-foreground text-xs italic">
                        No prospects in {stage.name}
                      </div>
                    ) : (
                      stageProjects.map((project) => {
                        const isBeingDragged = draggedProjectId === project.id;
                        const projectNum = project.project_code.replace(/^PRJ-?/i, "");
                        const businessName =
                          project.business_name ||
                          project.client_name ||
                          project.title ||
                          "Untitled Business";
                        const contactPerson =
                          project.contact_name || project.client_name || "Contact Person";
                        const displayTitle = `${projectNum ? `${projectNum} • ` : ""}${businessName}`;

                        const artistName = project.assigned_artist_name;
                        const artistAvatar = project.assigned_artist_avatar;
                        const artistInitial = (artistName || "A").charAt(0).toUpperCase();

                        const agentName = project.assigned_agent_name;
                        const agentAvatar = project.assigned_agent_avatar;
                        const agentInitial = (agentName || "U").charAt(0).toUpperCase();

                        const hasArtist = Boolean(artistName);
                        const hasAgent = Boolean(agentName);
                        const hasBoth = hasArtist && hasAgent;

                        return (
                          <div
                            key={project.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", project.id);
                              e.dataTransfer.effectAllowed = "move";
                              setDraggedProjectId(project.id);
                            }}
                            onDragEnd={() => {
                              setDraggedProjectId(null);
                              setDragOverStageId(null);
                            }}
                            className={`bg-card border rounded-xl p-3 shadow-2xs hover:shadow-md transition-all flex flex-col gap-2.5 text-xs group relative cursor-grab active:cursor-grabbing select-none ${
                              isBeingDragged
                                ? "opacity-40 border-dashed border-[#67B239] scale-95"
                                : "border-border/80 hover:border-primary/50"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0 pr-2">
                                <h3
                                  onClick={() => setDetailModal({ open: true, project })}
                                  className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors w-full truncate cursor-pointer"
                                  title={displayTitle}
                                >
                                  {displayTitle}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium min-w-0">
                                <User className="h-3.5 w-3.5 shrink-0" />
                                <span className="flex-1 block truncate" title={contactPerson}>
                                  {contactPerson}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                  {project.client_phone || "No phone"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div className="inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold shadow-2xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                                <CalendarDays className="mr-1.5 h-3 w-3" />
                                <span>
                                  {formatProjectCardDate(project.deadline || project.created_at)}
                                </span>
                              </div>
                              <div
                                className="h-7 w-7 rounded-lg bg-muted/30 flex items-center justify-center cursor-help border border-border/40 hover:bg-muted/60 transition-colors"
                                title={project.client_address || project.client_name || "Location"}
                              >
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                              </div>
                            </div>

                            <div className="pt-2.5 border-t border-border/40 flex items-center justify-between">
                              <div
                                className="flex items-center gap-2 group/avatar cursor-pointer min-w-0"
                                onClick={() => setDetailModal({ open: true, project })}
                                title={
                                  hasBoth
                                    ? `Artist: ${artistName} • Agent: ${agentName}`
                                    : hasArtist
                                      ? `Artist: ${artistName}`
                                      : hasAgent
                                        ? `Agent: ${agentName}`
                                        : "Unassigned"
                                }
                              >
                                <div className="flex items-center -space-x-2 shrink-0">
                                  {hasArtist && (
                                    <span
                                      className="relative z-10 flex shrink-0 overflow-hidden rounded-full h-7 w-7 ring-2 ring-background border border-amber-500/30 shadow-2xs group-hover/avatar:ring-amber-500/40 transition-all"
                                      title={`Artist: ${artistName}`}
                                    >
                                      {artistAvatar ? (
                                        <img
                                          src={artistAvatar}
                                          alt={artistName || "Artist"}
                                          className="aspect-square h-full w-full object-cover"
                                        />
                                      ) : (
                                        <span className="flex h-full w-full items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                          {artistInitial}
                                        </span>
                                      )}
                                    </span>
                                  )}

                                  {hasAgent && (
                                    <span
                                      className={`relative flex shrink-0 overflow-hidden rounded-full h-7 w-7 ring-2 ring-background border border-blue-500/30 shadow-2xs group-hover/avatar:ring-blue-500/40 transition-all ${
                                        hasArtist ? "z-0" : "z-10"
                                      }`}
                                      title={`Agent: ${agentName}`}
                                    >
                                      {agentAvatar ? (
                                        <img
                                          src={agentAvatar}
                                          alt={agentName || "Agent"}
                                          className="aspect-square h-full w-full object-cover"
                                        />
                                      ) : (
                                        <span className="flex h-full w-full items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                                          {agentInitial}
                                        </span>
                                      )}
                                    </span>
                                  )}

                                  {!hasArtist && !hasAgent && (
                                    <span className="relative flex shrink-0 overflow-hidden rounded-full h-7 w-7 ring-2 ring-background border border-border/40 shadow-2xs">
                                      <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-[10px]">
                                        U
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors p-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <EllipsisVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="text-xs">
                                    <DropdownMenuItem
                                      onClick={() => setDetailModal({ open: true, project })}
                                    >
                                      <Eye className="size-3.5 mr-2" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setProjectModal({
                                          open: true,
                                          project,
                                        })
                                      }
                                    >
                                      <Pencil className="size-3.5 mr-2" /> Edit Prospect
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        const currentIndex = stages.findIndex(
                                          (s) => s.id === project.stage_id,
                                        );
                                        const nextStage =
                                          stages[(currentIndex + 1) % Math.max(1, stages.length)];
                                        if (nextStage) {
                                          updateStatusMutation.mutate({
                                            id: project.id,
                                            stage_id: nextStage.id,
                                            stage_name: nextStage.name,
                                          });
                                        }
                                      }}
                                    >
                                      <ArrowRight className="size-3.5 mr-2" /> Advance Stage
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => setDeleteModal({ open: true, project })}
                                    >
                                      <Trash2 className="size-3.5 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Edit Project Modal */}
      {projectModal.open && (
        <ProjectFormModal
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
      )}

      {/* Project Details Modal */}
      {detailModal.open && detailModal.project && (
        <ProjectDetailModal
          open={detailModal.open}
          onOpenChange={(open: boolean) => setDetailModal({ open, project: null })}
          project={detailModal.project}
          stages={stages}
          onEdit={() => {
            const p = detailModal.project;
            setDetailModal({ open: false, project: null });
            setProjectModal({ open: true, project: p });
          }}
          onStageChange={async (newStageId: string, newStageName: string) => {
            if (detailModal.project) {
              await updateStatusMutation.mutateAsync({
                id: detailModal.project.id,
                stage_id: newStageId,
                stage_name: newStageName,
              });
              setDetailModal({
                open: true,
                project: {
                  ...detailModal.project,
                  stage_id: newStageId,
                  stage_name: newStageName,
                },
              });
            }
          }}
        />
      )}

      {/* Delete Project Dialog */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(open: boolean) => setDeleteModal({ open, project: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" /> Delete Prospect Project
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Are you sure you want to delete project{" "}
              <strong className="text-foreground">
                "{deleteModal.project?.project_code} - {deleteModal.project?.title}"
              </strong>
              ? This action will deactivate this prospect record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              onClick={async () => {
                if (deleteModal.project) {
                  await deleteProjectMutation.mutateAsync(deleteModal.project.id);
                  setDeleteModal({ open: false, project: null });
                }
              }}
            >
              {deleteProjectMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CrmProjectItem | null;
  stages: Stage[];
  users: Array<{ id: string; name: string; role: string }>;
  services: Array<{ id: string; name: string }>;
  onSave: (payload: SaveProjectPayload) => Promise<void>;
  isSaving: boolean;
}

function ProjectFormModal({
  open,
  onOpenChange,
  project,
  stages,
  users,
  services,
  onSave,
  isSaving,
}: ProjectFormModalProps) {
  const [title, setTitle] = useState(project?.title || "");
  const [clientName, setClientName] = useState(project?.client_name || "");
  const [serviceId, setServiceId] = useState(project?.service_id || "none");
  const [stageId, setStageId] = useState<string>(project?.stage_id || stages[0]?.id || "prospect");
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
      setClientName(project?.client_name || "");
      setServiceId(project?.service_id || "none");
      setStageId(project?.stage_id || stages[0]?.id || "prospect");
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
    if (!title.trim() || !clientName.trim()) return;

    await onSave({
      id: project?.id || null,
      title: title.trim(),
      client_name: clientName.trim(),
      service_id: serviceId && serviceId !== "none" ? serviceId : null,
      stage_id: stageId && stageId !== "none" ? stageId : null,
      assigned_artist_id: assignedArtistId && assignedArtistId !== "none" ? assignedArtistId : null,
      assigned_agent_id: assignedAgentId && assignedAgentId !== "none" ? assignedAgentId : null,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <DraftingCompass className="size-5 text-[#67B239]" />
            {project ? `Edit Prospect Project: ${project.project_code}` : "Edit Project Details"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update project scope, assign creative artist, set milestones and budget.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="proj_title" className="text-xs font-semibold">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="proj_title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apex Footwear E-Commerce Video Shoot"
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="proj_client" className="text-xs font-semibold">
                Client / Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="proj_client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Apex Footwear Ltd."
                className="text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Service Package</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger className="text-xs">
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
                <Label className="text-xs font-semibold">CRM Stage</Label>
                <Select value={stageId} onValueChange={setStageId}>
                  <SelectTrigger className="text-xs">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Sparkles className="size-3.5 text-amber-500" />
                  Assign Artist / Designer
                </Label>
                <Select value={assignedArtistId} onValueChange={setAssignedArtistId}>
                  <SelectTrigger className="text-xs">
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
                  Account Agent
                </Label>
                <Select value={assignedAgentId} onValueChange={setAssignedAgentId}>
                  <SelectTrigger className="text-xs">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Total Budget (৳)</Label>
                <Input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Paid Amount (৳)</Label>
                <Input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="text-xs"
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
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Delivery Deadline</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Project Notes / Creative Brief</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Script notes, resolution requirements, deliverables..."
                rows={3}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/10 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="text-xs h-9 px-4 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !title.trim() || !clientName.trim()}
              className="text-xs h-9 px-5 font-semibold bg-[#67B239] hover:bg-[#5aa030] text-white rounded-xl shadow-xs"
            >
              {isSaving ? "Saving..." : "Update Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
  const currentStage = stages.find(
    (s) => s.id === project.stage_id || s.name.toLowerCase() === project.stage_name.toLowerCase(),
  );
  const stageColor = resolveStageColor(
    currentStage?.name || project.stage_name,
    currentStage?.color || project.stage_color,
  );
  const StageIcon: LucideIcon = getStageLucideIcon(
    currentStage?.icon || project.stage_icon,
    currentStage?.name || project.stage_name,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <div className="px-6 py-5 text-white" style={{ backgroundColor: stageColor }}>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/25">
              {project.project_code}
            </span>
            <Badge variant="secondary" className="bg-white text-slate-900 font-bold text-xs gap-1">
              <StageIcon className="size-3.5" /> {project.stage_name}
            </Badge>
          </div>
          <h2 className="text-lg font-bold mt-2 leading-snug">{project.title}</h2>
          <p className="text-xs opacity-90 mt-0.5 flex items-center gap-1.5">
            <Building2 className="size-3.5" /> {project.client_name}
          </p>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <ArrowRight className="size-3.5 text-[#67B239]" /> Move CRM Stage:
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {stages.map((s) => {
                const sColor = resolveStageColor(s.name, s.color);
                const isSelected =
                  s.id === project.stage_id ||
                  s.name.toLowerCase() === project.stage_name.toLowerCase();

                return (
                  <Button
                    key={s.id}
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    style={isSelected ? { backgroundColor: sColor, color: "#fff" } : {}}
                    className={`text-[11px] h-7 px-2.5 rounded-lg ${
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase">Budget</span>
              <p className="font-bold text-sm text-foreground mt-0.5">
                ৳{project.budget.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase">Paid</span>
              <p className="font-bold text-sm text-green-600 mt-0.5">
                ৳{project.paid_amount.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase">Due</span>
              <p className="font-bold text-sm text-red-500 mt-0.5">
                ৳{project.due_amount.toLocaleString()}
              </p>
            </div>
            <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5">
              <span className="text-[10px] text-muted-foreground uppercase">Progress</span>
              <p className="font-bold text-sm text-[#67B239] mt-0.5">{project.progress}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-border/60 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Assigned Artist</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-amber-500" />
                {project.assigned_artist_name || "Not assigned"}
              </p>
            </div>

            <div className="border border-border/60 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Account Agent</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-blue-500" />
                {project.assigned_agent_name || "Not assigned"}
              </p>
            </div>
          </div>

          {project.notes && (
            <div className="border border-border/60 rounded-xl p-3 space-y-1 bg-muted/10">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Creative Notes & Specifications
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
            className="text-xs font-semibold bg-[#67B239] hover:bg-[#5aa030] text-white rounded-xl"
            onClick={onEdit}
          >
            <Pencil className="size-3.5 mr-1.5" /> Edit Prospect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
