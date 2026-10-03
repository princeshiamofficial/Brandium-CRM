"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Columns3,
  Loader2,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useDeleteFollowUpStage,
  useReorderFollowUpStages,
  useSaveFollowUpStage,
  type FollowUpStage,
} from "@/lib/follow-ups";
import { cn } from "@/lib/utils";

const errorText = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong.");

/** Admin editor for the follow-up board columns (ERPAPP `ManageFollowUpStatusesDialog`). */
export function ManageFollowUpStagesDialog({
  open,
  onOpenChange,
  stages,
  itemIdsByStage,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: FollowUpStage[];
  /** Card ids currently in each column, keyed by stage id. */
  itemIdsByStage: Record<string, string[]>;
  userId: string | undefined;
}) {
  const saveMutation = useSaveFollowUpStage();
  const deleteMutation = useDeleteFollowUpStage();
  const reorderMutation = useReorderFollowUpStages();
  const [drafts, setDrafts] = useState<Record<string, { name: string; color: string }>>({});
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [deleteTarget, setDeleteTarget] = useState<FollowUpStage | null>(null);
  const isBusy = saveMutation.isPending || deleteMutation.isPending || reorderMutation.isPending;

  const draftFor = (stage: FollowUpStage) => drafts[stage.id] || stage;
  const setDraft = (stage: FollowUpStage, patch: Partial<{ name: string; color: string }>) =>
    setDrafts((prev) => ({ ...prev, [stage.id]: { ...draftFor(stage), ...patch } }));
  const isDirty = (stage: FollowUpStage) => {
    const d = draftFor(stage);
    return d.name.trim() !== stage.name || d.color.toLowerCase() !== stage.color.toLowerCase();
  };

  const handleSave = async (stage: FollowUpStage, index: number) => {
    const d = draftFor(stage);
    try {
      await saveMutation.mutateAsync({
        id: stage.id,
        name: d.name,
        color: d.color,
        position: index,
        itemIds: itemIdsByStage[stage.id] || [],
      });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[stage.id];
        return next;
      });
      toast.success("Column updated");
    } catch (err) {
      toast.error("Update failed", { description: errorText(err) });
    }
  };

  const handleAdd = async () => {
    try {
      await saveMutation.mutateAsync({
        name: newName,
        color: newColor,
        position: stages.length,
        itemIds: [],
        userId,
      });
      setNewName("");
      toast.success("Column added");
    } catch (err) {
      toast.error("Could not add column", { description: errorText(err) });
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const ids = stages.map((s) => s.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target] as string, ids[index] as string];
    try {
      await reorderMutation.mutateAsync(ids);
    } catch (err) {
      toast.error("Could not reorder columns", { description: errorText(err) });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Column deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Delete failed", { description: errorText(err) });
    }
  };

  const requestDelete = (stage: FollowUpStage) => {
    const count = itemIdsByStage[stage.id]?.length || 0;
    if (stages.length <= 1) {
      toast.error("The board needs at least one column.");
      return;
    }
    if (count > 0) {
      toast.error("Column is not empty", {
        description: `Move its ${count} follow-up${count === 1 ? "" : "s"} to another column first.`,
      });
      return;
    }
    setDeleteTarget(stage);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Columns3 className="h-5 w-5 text-[#67B239]" />
              Manage Follow-up Columns
            </DialogTitle>
            <DialogDescription>
              Add, rename, recolour, reorder or delete the columns of the follow-up board.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-3">
            {stages.map((stage, index) => {
              const d = draftFor(stage);
              const count = itemIdsByStage[stage.id]?.length || 0;
              return (
                <div
                  key={stage.id}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-card p-2.5"
                >
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Move ${stage.name} up`}
                      disabled={isBusy || index === 0}
                      onClick={() => handleMove(index, -1)}
                      className="h-5 w-6 cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Move ${stage.name} down`}
                      disabled={isBusy || index === stages.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="h-5 w-6 cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <input
                    type="color"
                    aria-label={`${stage.name} colour`}
                    value={d.color}
                    onChange={(e) => setDraft(stage, { color: e.target.value })}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
                  />
                  <Input
                    aria-label="Column name"
                    value={d.name}
                    maxLength={100}
                    onChange={(e) => setDraft(stage, { name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isDirty(stage)) void handleSave(stage, index);
                    }}
                    className="h-9 flex-1 font-medium"
                  />
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0"
                    title="Follow-ups in this column"
                  >
                    {count}
                  </span>
                  <Button
                    size="icon"
                    aria-label={`Save ${stage.name}`}
                    disabled={isBusy || !isDirty(stage) || !d.name.trim()}
                    onClick={() => handleSave(stage, index)}
                    className={cn(
                      "h-9 w-9 shrink-0 cursor-pointer bg-[#67B239] hover:bg-[#5aa030] text-white",
                      !isDirty(stage) && "invisible",
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${stage.name}`}
                    disabled={isBusy}
                    onClick={() => requestDelete(stage)}
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border p-2.5">
              <input
                type="color"
                aria-label="New column colour"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
              />
              <Input
                placeholder="New column name"
                value={newName}
                maxLength={100}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newName.trim()) void handleAdd();
                }}
                className="h-9 flex-1"
              />
              <Button
                onClick={handleAdd}
                disabled={isBusy || !newName.trim()}
                className="h-9 shrink-0 gap-1.5 bg-[#67B239] hover:bg-[#5aa030] text-white cursor-pointer"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Column
              </Button>
            </div>
          </div>

          <DialogFooter className="p-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleteMutation.isPending && setDeleteTarget(null)}
      >
        <DialogContent className="w-full max-w-lg bg-[#EEEFF2] dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-800 rounded-2xl p-6 shadow-lg gap-4 text-slate-900 dark:text-slate-100">
          <DialogHeader className="flex flex-col space-y-2 text-left sm:text-left">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-[#0f1729] dark:text-slate-100">
              <TriangleAlert className="h-6 w-6 text-[#dc2626] shrink-0 stroke-2" />
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#94a3b8] dark:text-slate-400 text-left mt-2 leading-5">
              This will permanently delete the column &quot;
              <span className="font-semibold text-[#94a3b8] dark:text-slate-300">
                {deleteTarget?.name}
              </span>
              &quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
              className="h-10 px-4 py-2 bg-[#EEEFF2] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700 text-[#0f1729] dark:text-slate-200 hover:bg-[#E1E7EF]/80 dark:hover:bg-slate-700 rounded-[10px] text-sm font-medium shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-10 px-4 py-2 bg-[#dc2626] hover:bg-[#dc2626]/90 text-[#fafafa] rounded-[10px] text-sm font-medium shadow-none cursor-pointer border-0"
            >
              {deleteMutation.isPending ? "Deleting..." : "Yes, delete column"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
