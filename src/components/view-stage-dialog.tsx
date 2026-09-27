import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  User,
  Phone,
  Briefcase,
  Edit3,
  CalendarIcon,
  Clock,
  Pencil,
  Star,
  TriangleAlert,
  Trash2,
  Globe,
  FileText,
  ArrowRight,
} from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { stageHistoryQuery, formatStageSlugOrName, deleteStageHistoryEntry } from "@/lib/stages";
import { servicesQueryOptions } from "@/lib/services";
import { getProspectArtistName, type Prospect } from "@/lib/prospects";

export type ViewStageDialogProps = {
  prospect: Prospect | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (prospect: Prospect) => void;
};

// Stage color helper with unique distinct colors for each stage
function getStageColorStyle(stageName?: string | null) {
  const name = (stageName || "").toLowerCase();
  if (name.includes("prospect") || name.includes("lead")) {
    return {
      dot: "border-[3px] border-blue-600 text-blue-600 bg-white dark:bg-card",
      line: "bg-blue-500 dark:bg-blue-600",
      pill: "bg-blue-600 text-white shadow-2xs",
      icon: null,
    };
  }
  if (name.includes("follow")) {
    return {
      dot: "border-[3px] border-teal-600 text-teal-600 bg-white dark:bg-card",
      line: "bg-teal-500 dark:bg-teal-600",
      pill: "bg-teal-600 text-white shadow-2xs",
      icon: null,
    };
  }
  if (name.includes("opportunity")) {
    return {
      dot: "border-[3px] border-orange-500 text-orange-500 bg-white dark:bg-card",
      line: "bg-orange-400 dark:bg-orange-600",
      pill: "bg-orange-500 text-white shadow-2xs",
      icon: null,
    };
  }
  if (name.includes("won") || name.includes("sales")) {
    return {
      dot: "bg-[#67B239] text-white border-0",
      line: "bg-[#67B239]",
      pill: "bg-[#67B239] text-white shadow-2xs",
      icon: Star,
    };
  }
  if (name.includes("dnp")) {
    return {
      dot: "border-[3px] border-amber-500 text-amber-500 bg-white dark:bg-card",
      line: "bg-amber-400 dark:bg-amber-600",
      pill: "bg-amber-500 text-white shadow-2xs",
      icon: null,
    };
  }
  if (name.includes("switched")) {
    return {
      dot: "border-[3px] border-purple-600 text-purple-600 bg-white dark:bg-card",
      line: "bg-purple-500 dark:bg-purple-600",
      pill: "bg-purple-600 text-white shadow-2xs",
      icon: null,
    };
  }
  if (name.includes("invalid")) {
    return {
      dot: "border-[3px] border-rose-600 text-rose-600 bg-white dark:bg-card",
      line: "bg-rose-500 dark:bg-rose-600",
      pill: "bg-rose-600 text-white shadow-2xs",
      icon: null,
    };
  }
  if (name.includes("not_interested") || name.includes("not interested")) {
    return {
      dot: "border-[3px] border-slate-600 text-slate-600 bg-white dark:bg-card",
      line: "bg-slate-500 dark:bg-slate-600",
      pill: "bg-slate-600 text-white shadow-2xs",
      icon: null,
    };
  }
  if (name.includes("denied")) {
    return {
      dot: "border-[3px] border-red-700 text-red-700 bg-white dark:bg-card",
      line: "bg-red-600 dark:bg-red-700",
      pill: "bg-red-700 text-white shadow-2xs",
      icon: null,
    };
  }
  return {
    dot: "border-[3px] border-indigo-500 text-indigo-500 bg-white dark:bg-card",
    line: "bg-indigo-400 dark:bg-indigo-600",
    pill: "bg-indigo-600 text-white shadow-2xs",
    icon: null,
  };
}

export function ViewStageDialog({ prospect, open, onOpenChange, onEdit }: ViewStageDialogProps) {
  const [selectedNoteTarget, setSelectedNoteTarget] = useState<{
    stageName: string;
    note: string;
    date: string;
  } | null>(null);
  const [deleteHistoryTarget, setDeleteHistoryTarget] = useState<{
    id: string;
    stageName: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    ...stageHistoryQuery(prospect?.id || ""),
    enabled: Boolean(prospect?.id && open),
  });

  const deleteHistoryMutation = useMutation({
    mutationFn: async (target: { id: string; stageName: string }) => {
      if (!prospect) return false;
      return deleteStageHistoryEntry(target.id, prospect.id);
    },
    onSuccess: () => {
      toast.success("Stage history entry deleted!");
      if (prospect) {
        queryClient.invalidateQueries({ queryKey: ["stage-history", prospect.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteHistoryTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete stage history entry.");
    },
  });

  const servicesQuery = useQuery({
    ...servicesQueryOptions(),
    enabled: Boolean(open),
  });

  if (!prospect) return null;

  const historyEntries = historyQuery.data ?? [];
  const rawServicesList = Array.isArray(servicesQuery.data) ? servicesQuery.data : [];

  const resolvedServiceName = (() => {
    if (prospect.service_name && prospect.service_name.trim() && prospect.service_name !== "N/A") {
      return prospect.service_name.trim();
    }
    if (prospect.service_id && rawServicesList.length > 0) {
      const found = rawServicesList.find((s) => s.id === prospect.service_id);
      if (found?.name) return found.name;
    }
    return "Graphics Design";
  })();

  // Build full chronological timeline items
  const initialItem = {
    id: `initial-${prospect.id}`,
    date: prospect.created_at,
    stageName: "Prospect",
    fromStageName: null as string | null,
    note: prospect.notes || "Lead created",
    actor: prospect.creator_name || "System",
    actorAvatar: prospect.creator_avatar || null,
  };

  const sortedHistory = [...historyEntries].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime(),
  );

  const historyItems = sortedHistory.map((h) => {
    let rawName = h.to_stage_name;
    if (!rawName || rawName === "Stage Update") {
      rawName = formatStageSlugOrName(h.to_stage_id);
    }
    if (!rawName) {
      rawName = "Follow-up";
    }
    const finalName = rawName === "New Lead" || rawName === "new_lead" ? "Prospect" : rawName;
    const fromName = h.from_stage_name ? formatStageSlugOrName(h.from_stage_name) : null;

    return {
      id: h.id,
      date: h.changed_at,
      stageName: finalName,
      fromStageName: fromName && fromName !== finalName ? fromName : null,
      note: h.note || null,
      actor: h.changed_by_name || prospect.creator_name || "System",
      actorAvatar:
        h.changed_by_avatar ||
        (h.changed_by === prospect.created_by ? prospect.creator_avatar : null),
    };
  });

  // Check if history already contains an entry at the exact same timestamp as creation
  const hasDuplicateInitial = historyItems.some(
    (item) =>
      Math.abs(new Date(item.date).getTime() - new Date(prospect.created_at).getTime()) < 1000,
  );

  // Render all multi-stage history items even if same stage repeats
  const timelineItems = hasDuplicateInitial ? historyItems : [initialItem, ...historyItems];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideClose
          className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card"
        >
          {/* Modern Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="size-11 rounded-full bg-slate-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center shrink-0 border border-slate-200/90 dark:border-slate-700 shadow-2xs mt-0.5 overflow-hidden">
                {prospect.logo_url ? (
                  <img
                    src={prospect.logo_url}
                    alt={prospect.business_name || prospect.contact_name}
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="size-full bg-orange-100/90 dark:bg-orange-950/50 flex items-center justify-center">
                    <User className="size-5" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  {prospect.contact_name || "N/A"}
                </h2>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {prospect.designation ? `${prospect.designation} • ` : ""}
                  {prospect.business_name || "Prospect Lead"}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-7.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer transition-colors"
              onClick={() => {
                onOpenChange(false);
                if (onEdit) onEdit(prospect);
              }}
            >
              <Edit3 className="size-3.5" />
            </Button>
          </div>

          {/* Minimal Meta Card: Phone, Service, Artist, Website */}
          <div className="mt-2.5 bg-slate-50/80 dark:bg-slate-900/50 rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate">
                {prospect.phone || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <Briefcase className="size-3.5 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                Service: {resolvedServiceName}
              </span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <User className="size-3.5 text-[#67B239] shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                Artist: {getProspectArtistName(prospect)}
              </span>
            </div>
            {prospect.website_url ? (
              <div className="flex items-center gap-2 truncate">
                <Globe className="size-3.5 text-blue-500 shrink-0" />
                <a
                  href={
                    prospect.website_url.startsWith("http://") ||
                    prospect.website_url.startsWith("https://")
                      ? prospect.website_url
                      : `https://${prospect.website_url}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {prospect.website_url.replace(/^https?:\/\//, "")}
                </a>
              </div>
            ) : null}
          </div>

          <div className="my-2.5 border-t border-slate-200/80 dark:border-slate-800" />

          {/* List or Chat Style Stage History Activity Feed */}
          <div className="space-y-2.5 my-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Stage Activity History
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                >
                  {timelineItems.length} {timelineItems.length === 1 ? "transition" : "transitions"}
                </Badge>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                Activity Feed & Notes
              </span>
            </div>

            <ScrollArea className="max-h-95 sm:max-h-105 pr-2.5">
              <div className="relative pl-6 space-y-4 py-2">
                {/* Continuous Vertical Timeline Thread Connector */}
                <div className="absolute left-4.25 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800" />

                {timelineItems.map((item, idx) => {
                  const rawStageName = item.stageName;
                  const stageDisplayName =
                    !rawStageName ||
                    rawStageName.toLowerCase() === "new lead" ||
                    rawStageName.toLowerCase() === "new_lead"
                      ? "Prospect"
                      : rawStageName;

                  const style = getStageColorStyle(stageDisplayName);
                  const IconComp = style.icon;
                  const initials = (item.actor || "U")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const isInitial = item.id.startsWith("initial-");

                  return (
                    <div key={item.id || idx} className="relative flex items-start gap-3 group">
                      {/* Left User Avatar Node on Timeline */}
                      <div className="relative z-10 shrink-0 -ml-6">
                        <Avatar className="size-9 rounded-full ring-2 ring-white dark:ring-card shadow-xs border border-slate-200/90 dark:border-slate-700">
                          {item.actorAvatar ? (
                            <AvatarImage
                              src={item.actorAvatar}
                              alt={item.actor}
                              className="size-full object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="font-bold text-[11px] bg-[#0a2e5c]/10 text-[#0a2e5c] dark:bg-emerald-950/60 dark:text-emerald-300">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Right Chat / Message Card */}
                      <div className="flex-1 min-w-0 bg-slate-50/90 dark:bg-slate-900/60 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow space-y-2">
                        {/* Header Row: User Name, Stage Badge, Date & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                              {item.actor}
                            </span>

                            {/* Stage Transition Badge */}
                            <div className="flex items-center gap-1.5">
                              {item.fromStageName && item.fromStageName !== stageDisplayName ? (
                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  {item.fromStageName}
                                  <ArrowRight className="size-3 text-slate-400" />
                                </span>
                              ) : null}
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs flex items-center gap-1 ${style.pill}`}
                              >
                                {IconComp ? <IconComp className="size-2.5 fill-current" /> : null}
                                {stageDisplayName}
                              </span>
                            </div>
                          </div>

                          {/* Date, Time & Delete Action */}
                          <div className="flex items-center gap-1.5 ml-auto text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 shrink-0">
                              <CalendarIcon className="size-3 text-slate-400" />
                              {format(new Date(item.date), "MMM d, yyyy")}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock className="size-3 text-slate-400" />
                              {format(new Date(item.date), "h:mm a")}
                            </span>

                            {!isInitial && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 text-slate-400 hover:text-red-600 rounded-full cursor-pointer ml-0.5 transition-colors"
                                title="Delete stage entry"
                                onClick={() =>
                                  setDeleteHistoryTarget({
                                    id: item.id,
                                    stageName: stageDisplayName,
                                  })
                                }
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Note / Message Body */}
                        {item.note && item.note.trim() ? (
                          <div className="bg-white dark:bg-card rounded-xl p-2.5 border border-slate-200/70 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 shadow-2xs font-normal">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <FileText className="size-3 text-amber-500" /> Notes / Details
                              </span>
                              {item.note.length > 120 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedNoteTarget({
                                      stageName: item.stageName,
                                      note: item.note || "",
                                      date: item.date,
                                    })
                                  }
                                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                >
                                  View Full
                                </button>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed text-xs">
                              {item.note}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                            Stage transitioned to {stageDisplayName}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Minimal Inset Metadata Box */}
          <div className="mt-3 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 space-y-1.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Pencil className="size-3.5 text-slate-400 shrink-0" />
              <span>
                Created by :{" "}
                <strong className="font-bold text-slate-900 dark:text-slate-100">
                  {prospect.creator_name || "System"}
                </strong>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-3.5 text-slate-400 shrink-0" />
                <span>Created : {format(new Date(prospect.created_at), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-slate-400 shrink-0" />
                <span>{format(new Date(prospect.created_at), "h:mm a")}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-3.5 text-slate-400 shrink-0" />
                <span>
                  Updated :{" "}
                  {format(new Date(prospect.updated_at || prospect.created_at), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-slate-400 shrink-0" />
                <span>
                  {format(new Date(prospect.updated_at || prospect.created_at), "h:mm a")}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-3 flex justify-end">
            <Button
              onClick={() => onOpenChange(false)}
              className="h-8.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-all shadow-2xs border-0"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Note View Dialog Modal */}
      <Dialog
        open={Boolean(selectedNoteTarget)}
        onOpenChange={(open) => {
          if (!open) setSelectedNoteTarget(null);
        }}
      >
        <DialogContent
          hideClose
          className="sm:max-w-md p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card"
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-2.5 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="size-8.5 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 shadow-2xs">
                <Pencil className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {!selectedNoteTarget?.stageName ||
                  selectedNoteTarget.stageName.toLowerCase() === "new lead" ||
                  selectedNoteTarget.stageName.toLowerCase() === "new_lead"
                    ? "Prospect"
                    : selectedNoteTarget.stageName}
                </DialogTitle>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedNoteTarget?.date
                    ? format(new Date(selectedNoteTarget.date), "MMMM d, yyyy (h:mm a)")
                    : "Full Note Details"}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="my-3 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 max-h-[50vh] overflow-y-auto">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1.5">Notes:</p>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
              {selectedNoteTarget?.note}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              onClick={() => setSelectedNoteTarget(null)}
              className="h-8.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-2xs"
            >
              Close Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Stage History Entry Confirmation Modal (Double-Click Triggered) */}
      <AlertDialog
        open={Boolean(deleteHistoryTarget)}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteHistoryTarget(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-6 w-6 text-amber-500" />
              Delete Stage Entry?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the stage history entry for &quot;
              <span className="font-semibold">{deleteHistoryTarget?.stageName}</span>&quot;? This
              action will permanently remove this entry from the timeline history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteHistoryMutation.isPending}
              onClick={() => setDeleteHistoryTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteHistoryMutation.isPending}
              onClick={() => {
                if (deleteHistoryTarget) {
                  deleteHistoryMutation.mutate(deleteHistoryTarget);
                }
              }}
            >
              {deleteHistoryMutation.isPending ? "Deleting..." : "Yes, Delete Stage"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
