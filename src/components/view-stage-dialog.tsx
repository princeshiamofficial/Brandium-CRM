import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { History, Trash2, TriangleAlert, ArrowRight, X } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { type Prospect } from "@/lib/prospects";
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

export function ViewStageDialog({ prospect, open, onOpenChange }: ViewStageDialogProps) {
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

  if (!prospect) return null;

  const historyEntries = historyQuery.data ?? [];

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
          className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card"
        >
          {/* Clean Dialog Header */}
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-[#0a2e5c]/10 dark:bg-emerald-950/50 text-[#0a2e5c] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <History className="size-4.5" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Stage Activity History
                </DialogTitle>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                >
                  {timelineItems.length} {timelineItems.length === 1 ? "transition" : "transitions"}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-7 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </DialogHeader>

          {/* Clean Vertical Tracking Timeline */}
          <ScrollArea className="max-h-95 sm:max-h-110 py-3 pr-2">
            <div className="py-2 pl-1 pr-1 space-y-6">
              {timelineItems.map((item, idx) => {
                const isLatest = idx === 0;
                const isLast = idx === timelineItems.length - 1;
                const isInitial = item.id.startsWith("initial-");
                const stageDisplayName = item.stageName || "Prospect";

                return (
                  <div key={item.id || idx} className="relative flex items-start group">
                    {/* 1. Left Date Column (e.g., 10-26, 09-24) */}
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

          {/* Footer Close Button */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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
