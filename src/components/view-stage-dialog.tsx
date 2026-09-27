import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { History, Trash2, TriangleAlert, ArrowRight, X, Plus, Send } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
import {
  stageHistoryQuery,
  formatStageSlugOrName,
  deleteStageHistoryEntry,
  parseNotesToArray,
  parseNotesToItems,
  addStageNote,
  deleteStageNote,
  type StageNoteItem,
} from "@/lib/stages";
import { type Prospect } from "@/lib/prospects";
import { useAuth } from "@/lib/auth";
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
  stageId?: string | null;
  fromStageName: string | null;
  noteItems: StageNoteItem[];
  actor: string;
  actorAvatar?: string | null | undefined;
};

export { parseNotesToArray, parseNotesToItems };

export function ViewStageDialog({ prospect, open, onOpenChange }: ViewStageDialogProps) {
  const { user, profile } = useAuth();
  const [newNote, setNewNote] = useState("");
  const [targetHistoryId, setTargetHistoryId] = useState<string | null>(null);
  const [deleteHistoryTarget, setDeleteHistoryTarget] = useState<{
    id: string;
    stageName: string;
  } | null>(null);

  const [deleteNoteTarget, setDeleteNoteTarget] = useState<{
    historyId: string | null;
    noteIndex: number;
    noteText: string;
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

  const addNoteMutation = useMutation({
    mutationFn: async (payload: {
      historyId: string | null;
      stageId?: string | null;
      note: string;
    }) => {
      if (!prospect) return false;
      const currentUserName =
        profile?.full_name ||
        (user?.user_metadata?.["full_name"] as string) ||
        user?.name ||
        user?.email ||
        "User";
      const currentUserAvatar =
        profile?.avatar_url || (user?.user_metadata?.["avatar_url"] as string) || null;

      return addStageNote({
        prospectId: prospect.id,
        historyId: payload.historyId,
        stageId: payload.stageId || prospect.stage_id,
        note: payload.note,
        userId: user?.id || null,
        userName: currentUserName,
        userAvatar: currentUserAvatar,
      });
    },
    onSuccess: () => {
      toast.success("Note added to stage!");
      setNewNote("");
      setTargetHistoryId(null);
      if (prospect) {
        queryClient.invalidateQueries({ queryKey: ["stage-history", prospect.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => {
      toast.error("Failed to add note.");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (payload: { historyId: string | null; noteIndex: number }) => {
      if (!prospect) return false;
      return deleteStageNote({
        prospectId: prospect.id,
        historyId: payload.historyId,
        noteIndex: payload.noteIndex,
      });
    },
    onSuccess: () => {
      toast.success("Note removed.");
      setDeleteNoteTarget(null);
      if (prospect) {
        queryClient.invalidateQueries({ queryKey: ["stage-history", prospect.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => {
      toast.error("Failed to remove note.");
    },
  });

  if (!prospect) return null;

  const historyEntries = historyQuery.data ?? [];

  // 1. Initial creation entry
  const initialAuthor = prospect.creator_name || "System";
  const initialNoteItems = parseNotesToItems(
    prospect.notes || "Lead created",
    prospect.created_at,
    initialAuthor,
    prospect.creator_avatar || null,
  );
  const initialItem: TimelineItem = {
    id: `initial-${prospect.id}`,
    date: prospect.created_at,
    stageName: "Prospect",
    stageId: "prospect",
    fromStageName: null,
    noteItems:
      initialNoteItems.length > 0
        ? initialNoteItems
        : [
            {
              text: "Lead created",
              createdAt: prospect.created_at,
              createdByName: initialAuthor,
              createdByAvatar: prospect.creator_avatar || null,
            },
          ],
    actor: initialAuthor,
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
    const actorName = h.changed_by_name || prospect.creator_name || "System";
    const actorAvatar =
      h.changed_by_avatar ||
      (h.changed_by === prospect.created_by ? prospect.creator_avatar : null);

    const parsedNoteItems = parseNotesToItems(h.note, h.changed_at, actorName, actorAvatar);

    return {
      id: h.id,
      date: h.changed_at,
      stageName: finalName,
      stageId: h.to_stage_id,
      fromStageName: fromName && fromName !== finalName ? fromName : null,
      noteItems:
        parsedNoteItems.length > 0
          ? parsedNoteItems
          : [
              {
                text: `Stage transitioned to ${finalName}`,
                createdAt: h.changed_at,
                createdByName: actorName,
                createdByAvatar: actorAvatar,
              },
            ],
      actor: actorName,
      actorAvatar,
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

  const selectedTargetItem = targetHistoryId
    ? timelineItems.find((t) => t.id === targetHistoryId) || null
    : null;

  const defaultTargetItem = timelineItems[0] || initialItem;
  const activeTargetItem = selectedTargetItem || defaultTargetItem;

  const handleAddNote = () => {
    if (!newNote.trim() || addNoteMutation.isPending) return;

    addNoteMutation.mutate({
      historyId: activeTargetItem?.id || null,
      stageId: activeTargetItem?.stageId || prospect.stage_id,
      note: newNote.trim(),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideClose
          className="sm:max-w-xl h-[85vh] max-h-[720px] p-4 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card flex flex-col overflow-hidden"
        >
          {/* 1. Fixed Dialog Header */}
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between space-y-0 shrink-0">
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
                  {timelineItems.length}{" "}
                  {timelineItems.length === 1 ? "transition" : "transitions"}
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

          {/* 2. Flexible Full-Height Vertical Tracking Timeline ScrollArea */}
          <ScrollArea className="flex-1 w-full my-2 pr-3">
            <div className="py-2 pl-1 pr-1 space-y-6">
              {timelineItems.map((item, idx) => {
                const isLatest = idx === 0;
                const isLast = idx === timelineItems.length - 1;
                const isInitial = item.id.startsWith("initial-");
                const stageDisplayName = item.stageName || "Prospect";
                const isTargeted = targetHistoryId === item.id;

                return (
                  <div
                    key={item.id || idx}
                    className={cn(
                      "relative flex items-start group rounded-xl p-1.5 -ml-1.5 transition-all",
                      isTargeted &&
                        "bg-purple-50/50 dark:bg-purple-950/20 ring-1 ring-purple-200 dark:ring-purple-800/50",
                    )}
                  >
                    {/* Left Date Column (e.g., 10-26, 09-24) */}
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

                    {/* Middle Node & Vertical Dashed Line Column */}
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

                    {/* Right Content Column (Title, Time, and Note Array) */}
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

                          {/* Quick "+ Note" trigger for this specific stage */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "size-5 text-slate-400 hover:text-purple-600 dark:text-slate-500 dark:hover:text-purple-400 rounded-full cursor-pointer transition-opacity",
                              isTargeted
                                ? "opacity-100 text-purple-600 dark:text-purple-400"
                                : "opacity-0 group-hover:opacity-100",
                            )}
                            title={`Add note to ${stageDisplayName}`}
                            onClick={() => {
                              setTargetHistoryId(targetHistoryId === item.id ? null : item.id);
                            }}
                          >
                            <Plus className="size-3" />
                          </Button>

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

                      {/* Note Array List with Date, Time, and Author Rendering */}
                      {item.noteItems.length > 0 ? (
                        <div className="mt-1 space-y-1">
                          {item.noteItems.map((noteItem, nIdx) => {
                            const noteAuthor = noteItem.createdByName || item.actor;
                            const noteTimestamp = noteItem.createdAt
                              ? format(new Date(noteItem.createdAt), "MM-dd h:mm a")
                              : null;

                            return (
                              <div
                                key={noteItem.id || nIdx}
                                className="group/note flex items-start justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 p-1.5 rounded-lg transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                                    {item.noteItems.length > 1
                                      ? `• ${noteItem.text}`
                                      : noteItem.text}
                                  </p>

                                  {/* Note Date, Time & Author attribution row */}
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400/80 dark:text-slate-500 mt-0.5 flex-wrap">
                                    {noteTimestamp && <span>{noteTimestamp}</span>}
                                    {noteTimestamp && noteAuthor && noteAuthor !== "System" && (
                                      <span>•</span>
                                    )}
                                    {noteAuthor && noteAuthor !== "System" && (
                                      <span>by {noteAuthor}</span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteNoteTarget({
                                      historyId: isInitial ? null : item.id,
                                      noteIndex: nIdx,
                                      noteText: noteItem.text,
                                      stageName: stageDisplayName,
                                    })
                                  }
                                  className="opacity-0 group-hover/note:opacity-100 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-0.5 rounded cursor-pointer transition-opacity shrink-0 mt-0.5"
                                  title="Delete this note"
                                >
                                  <X className="size-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-400/80 dark:text-slate-500 italic mt-0.5">
                          Stage updated to {stageDisplayName}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* 3. Fixed Bottom Action Footer with Note Input and Close Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {/* Note Input Box spanning the left area */}
            <div className="relative flex-1 flex items-center gap-1.5">
              {targetHistoryId && (
                <Badge
                  variant="secondary"
                  className="h-7 px-2 text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0 flex items-center gap-1 cursor-pointer"
                  onClick={() => setTargetHistoryId(null)}
                  title="Click to reset target to current stage"
                >
                  <span className="truncate max-w-20">{activeTargetItem?.stageName}</span>
                  <X className="size-2.5" />
                </Badge>
              )}

              <div className="relative flex-1">
                <Input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                  placeholder={
                    selectedTargetItem
                      ? `Add note to ${selectedTargetItem.stageName}...`
                      : `Add note to ${defaultTargetItem.stageName || "current stage"}...`
                  }
                  className="h-9 pr-14 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 focus-visible:ring-purple-600 dark:focus-visible:ring-purple-500"
                />

                <Button
                  type="button"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                  size="sm"
                  className="absolute right-1 top-1 h-7 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-medium text-xs cursor-pointer disabled:opacity-40 transition-all flex items-center gap-1 shadow-2xs"
                >
                  {addNoteMutation.isPending ? (
                    <span className="text-[10px]">Saving...</span>
                  ) : (
                    <>
                      <Send className="size-3" />
                      <span>Add</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => onOpenChange(false)}
              className="h-9 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-all shadow-2xs border-0 shrink-0"
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

      {/* Delete Individual Note Item Confirmation Modal */}
      <AlertDialog
        open={Boolean(deleteNoteTarget)}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteNoteTarget(null);
        }}
      >
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-6 w-6 text-amber-500" />
              Delete Note?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note from &quot;
              <span className="font-semibold">{deleteNoteTarget?.stageName}</span>&quot;?
              <br />
              <span className="inline-block mt-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs italic text-slate-700 dark:text-slate-300 max-w-full truncate">
                &ldquo;{deleteNoteTarget?.noteText}&rdquo;
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteNoteMutation.isPending}
              onClick={() => setDeleteNoteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              disabled={deleteNoteMutation.isPending}
              onClick={() => {
                if (deleteNoteTarget) {
                  deleteNoteMutation.mutate({
                    historyId: deleteNoteTarget.historyId,
                    noteIndex: deleteNoteTarget.noteIndex,
                  });
                }
              }}
            >
              {deleteNoteMutation.isPending ? "Deleting..." : "Yes, Delete Note"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
