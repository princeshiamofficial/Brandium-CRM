import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { stagesQuery, useChangeProspectStage } from "@/lib/stages";

export type ChangeStageTarget = {
  id: string;
  label: string;
  stageId: string | null;
  currentStageName?: string | null;
};

const DEFAULT_STAGES = [
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

function getBadgeColor(stageName?: string | null) {
  const name = (stageName || "").toLowerCase();
  if (name.includes("won") || name.includes("sales")) return "bg-[#67B239] text-white";
  if (name.includes("prospect") || name.includes("lead")) return "bg-blue-600 text-white";
  if (name.includes("follow")) return "bg-teal-600 text-white";
  if (name.includes("opportunity")) return "bg-orange-500 text-white";
  if (name.includes("dnp")) return "bg-amber-500 text-white";
  if (name.includes("switched")) return "bg-purple-600 text-white";
  if (name.includes("invalid")) return "bg-rose-600 text-white";
  if (name.includes("not_interested") || name.includes("not interested"))
    return "bg-slate-600 text-white";
  if (name.includes("denied")) return "bg-red-700 text-white";
  return "bg-indigo-600 text-white";
}

export function ChangeStageDialog({
  target,
  onOpenChange,
  onStageChange,
}: {
  target: ChangeStageTarget | null;
  onOpenChange: (open: boolean) => void;
  onStageChange?: (stageId: string, stageName: string) => void;
}) {
  const stages = useQuery(stagesQuery());
  const mutation = useChangeProspectStage();

  const availableStages = stages.data && stages.data.length > 0 ? stages.data : DEFAULT_STAGES;

  const [stageId, setStageId] = useState<string>("");
  const [note, setNote] = useState("");

  const currentStageName = target?.currentStageName || "Prospect";

  useEffect(() => {
    if (target) {
      const match = availableStages.find(
        (s) =>
          s.id === target.stageId ||
          s.name.toLowerCase() === (target.currentStageName || "").toLowerCase(),
      );
      setStageId(match ? match.id : availableStages[0]?.id || "prospect");
    } else {
      setStageId("");
    }
    setNote("");
  }, [target, availableStages]);

  const selectedStageObj = availableStages.find((s) => s.id === stageId);

  const submit = async () => {
    if (!target || !stageId) return;
    const trimmed = note.trim();
    const targetObj = availableStages.find((s) => s.id === stageId);
    await mutation.mutateAsync({
      prospectId: target.id,
      stageId,
      stageName: targetObj?.name || "Stage Update",
      ...(trimmed ? { note: trimmed } : {}),
    });
    if (onStageChange) {
      onStageChange(stageId, targetObj?.name || "");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl bg-white dark:bg-card">
        {/* Modern Icon & Header */}
        <div className="flex items-start gap-3.5">
          <div className="size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#67B239] font-bold flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
            <RefreshCw className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Update Stage
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {target ? `Move ${target.label} to a new pipeline stage.` : ""}
            </DialogDescription>
          </div>
        </div>

        {/* Current Stage Soft Banner */}
        {target && (
          <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Current Status</span>
            <div className="flex items-center gap-1.5">
              <Badge
                className={`${getBadgeColor(currentStageName)} font-bold text-xs px-2.5 py-0.5 rounded-lg border-0 shadow-2xs`}
              >
                {currentStageName}
              </Badge>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="space-y-4 pt-1">
          {/* Stage Dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="stage" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              New Stage
            </Label>
            <Select
              value={stageId}
              onValueChange={(val) => {
                setStageId(val);
                const name = availableStages.find((s) => s.id === val)?.name ?? "";
                onStageChange?.(val, name);
              }}
            >
              <SelectTrigger
                id="stage"
                className="h-10 bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold rounded-xl focus:bg-white dark:focus:bg-card transition-all"
              >
                <SelectValue placeholder="Select a stage" />
              </SelectTrigger>
              <SelectContent className="max-h-60 rounded-xl shadow-xl border-slate-200 dark:border-slate-800">
                {availableStages.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                    className="text-xs sm:text-sm font-semibold cursor-pointer rounded-lg"
                  >
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason / Note Textarea */}
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Note / Reason <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="Why is this prospect moving stage?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-xs sm:text-sm rounded-xl focus:bg-white dark:focus:bg-card transition-all resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="pt-2 gap-2 sm:gap-2.5">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
            className="font-bold text-xs sm:text-sm h-9.5 rounded-xl border-slate-200/90 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!stageId || mutation.isPending}
            className="bg-[#67B239] hover:bg-[#5AA030] text-white font-bold text-xs sm:text-sm h-9.5 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            {mutation.isPending ? "Saving..." : "Update Stage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
