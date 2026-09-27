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
  Trash2,
  Globe,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

export type ViewStageDialogProps = {
  prospect: Prospect | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (prospect: Prospect) => void;
};

export type TimelineItem = {
  id: string;
  date: string;
  stageName: string;
  fromStageName: string | null;
  noteArray: string[];
  actor: string;
  actorAvatar?: string | null | undefined;
};

/**
 * Parses raw notes into a clean array of string items.
 * Handles single lines, multi-line strings, bullet points, and JSON stringified arrays.
 */
export function parseNotesToArray(notes?: string | null): string[] {
  if (!notes || typeof notes !== "string") return [];

  const cleaned = notes
    .replace(/\[Artist:\s*[^\]]+\]/gi, "")
    .replace(/\[Agent:\s*[^\]]+\]/gi, "")
    .trim();

  if (!cleaned) return [];

  // If JSON array string e.g. ["item 1", "item 2"]
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        const arr = parsed.map((item) => String(item).trim()).filter(Boolean);
        if (arr.length > 0) return arr;
      }
    } catch {
      // Fallback to text parsing
    }
  }

  // Split by newlines or semicolon / bullet lists
  const lines = cleaned
    .split(/\r?\n+/)
    .map((line) => line.replace(/^[\s*•\-–—\d.)]+/, "").trim())
    .filter(Boolean);

  if (lines.length > 0) {
    return lines;
  }

  return [cleaned];
}

export function ViewStageDialog({ prospect, open, onOpenChange, onEdit }: ViewStageDialogProps) {
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

  // 1. Initial creation entry
  const initialNoteArray = parseNotesToArray(prospect.notes || "Lead created");
  const initialItem: TimelineItem = {
    id: `initial-${prospect.id}`,
    date: prospect.created_at,
    stageName: "Prospect",
    fromStageName: null,
    noteArray: initialNoteArray.length > 0 ? initialNoteArray : ["Lead created"],
    actor: prospect.creator_name || "System",
    actorAvatar: prospect.creator_avatar || null,
  };

  // 2. Map history entries
  const historyItems: TimelineItem[] = historyEntries.map((h) => {
    let rawName = h.to_stage_name;
    if (!rawName || rawName === "Stage Update") {
      rawName = formatStageSlugOrName(h.to_stage_id);
    }
    if (!rawName) {
      rawName = "Follow-up";
    }
    const finalName = rawName === "New Lead" || rawName === "new_lead" ? "Prospect" : rawName;
    const fromName = h.from_stage_name ? formatStageSlugOrName(h.from_stage_name) : null;
    const parsedNotes = parseNotesToArray(h.note);

    return {
      id: h.id,
      date: h.changed_at,
      stageName: finalName,
      fromStageName: fromName && fromName !== finalName ? fromName : null,
      noteArray: parsedNotes.length > 0 ? parsedNotes : [`Stage transitioned to ${finalName}`],
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

  const rawCombined = hasDuplicateInitial ? historyItems : [initialItem, ...historyItems];

  // Sort descending: newest / active item at index 0 (Top), oldest at the bottom
  const timelineItems = [...rawCombined].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideClose
          className="sm:max-w-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card"
        >
          {/* Header Section */}
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

          {/* Minimal Contact Info Bar */}
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

          {/* Activity Section Header */}
          <div className="space-y-2.5 my-2">
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

            {/* Redesigned Clean Vertical Tracking Timeline (Image 2 Match) */}
            <ScrollArea className="max-h-95 sm:max-h-105 pr-2.5">
              <div className="py-2 pl-1 pr-1 space-y-6">
                {timelineItems.map((item, idx) => {
                  const isLatest = idx === 0;
                  const isLast = idx === timelineItems.length - 1;
                  const isInitial = item.id.startsWith("initial-");
                  const stageDisplayName = item.stageName || "Prospect";

                  return (
                    <div key={item.id || idx} className="relative flex items-start group">
                      {/* 1. Left Date Column (e.g., 10-26) */}
                      <div className="w-14 sm:w-16 text-right shrink-0 pr-3 sm:pr-4 pt-0.5">
                        <span
                          className={cn(
                            "text-xs sm:text-sm font-medium tracking-tight",
                            isLatest
                              ? "text-purple-600 dark:text-purple-400 font-semibold"
                              : "text-slate-400 dark:text-slate-500",
                          )}
                        >
                          {format(new Date(item.date), "MM-dd")}
                        </span>
                      </div>

                      {/* 2. Middle Node & Vertical Dashed Line Column */}
                      <div className="relative flex flex-col items-center shrink-0 w-5">
                        {/* Connecting dashed vertical line */}
                        {!isLast && (
                          <div className="absolute top-3.5 bottom-0 w-0 border-l-2 border-dashed border-slate-200 dark:border-slate-800 -mb-6" />
                        )}

                        {/* Node Dot (Top active has purple outer ring/halo, previous are solid neutral) */}
                        {isLatest ? (
                          <div className="relative z-10 size-4 rounded-full bg-purple-600 dark:bg-purple-500 ring-4 ring-purple-100 dark:ring-purple-950/70 shrink-0 mt-0.5 shadow-xs" />
                        ) : (
                          <div className="relative z-10 size-3 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 mt-1" />
                        )}
                      </div>

                      {/* 3. Right Content Column (Title, Time, and Note Array) */}
                      <div className="flex-1 min-w-0 pl-3 sm:pl-4">
                        {/* Stage Title and Time Row */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <h4
                              className={cn(
                                "text-sm sm:text-base tracking-tight leading-snug",
                                isLatest
                                  ? "text-purple-700 dark:text-purple-300 font-semibold"
                                  : "text-slate-800 dark:text-slate-200 font-medium",
                              )}
                            >
                              {stageDisplayName}
                            </h4>
                            {item.fromStageName && item.fromStageName !== stageDisplayName && (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-normal">
                                <ArrowRight className="size-2.5" />
                                from {item.fromStageName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-normal">
                              {format(new Date(item.date), "h:mm a")}
                            </span>

                            {!isInitial && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 text-slate-300 hover:text-red-600 dark:text-slate-600 dark:hover:text-red-400 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete stage entry"
                                onClick={() =>
                                  setDeleteHistoryTarget({
                                    id: item.id,
                                    stageName: stageDisplayName,
                                  })
                                }
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Note Array Description List */}
                        {item.noteArray.length > 0 ? (
                          <div className="mt-0.5 space-y-0.5">
                            {item.noteArray.map((noteText, nIdx) => (
                              <p
                                key={nIdx}
                                className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 leading-relaxed font-normal"
                              >
                                {item.noteArray.length > 1 ? `• ${noteText}` : noteText}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-400/80 dark:text-slate-500 italic mt-0.5">
                            Stage updated to {stageDisplayName}
                          </p>
                        )}

                        {/* Subtle Actor Attribution */}
                        {item.actor && item.actor !== "System" && (
                          <span className="text-[11px] text-slate-400/70 dark:text-slate-500/70 mt-0.5 block font-normal">
                            by {item.actor}
                          </span>
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

          {/* Footer Close Button */}
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

      {/* Delete Stage History Entry Confirmation Modal */}
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
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
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
