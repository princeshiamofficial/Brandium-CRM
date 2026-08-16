import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRightLeft, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { changeDeniedPaymentStage, DeniedPayment } from "@/lib/denied-payments";

type DeniedPaymentChangeStageModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DeniedPayment | null;
};

const STAGE_OPTIONS = [
  { value: "Negotiation", label: "Negotiation (Re-evaluating Pricing & Terms)" },
  { value: "Follow Up", label: "Follow Up (Scheduled Call / Re-engagement)" },
  { value: "Closed Won", label: "Closed Won (Payment Recovered & Resolved)" },
  { value: "Closed Lost", label: "Closed Lost (Written Off / Deal Cancelled)" },
  { value: "Denied Payment", label: "Denied Payment (Keep Pending Attention)" },
];

export function DeniedPaymentChangeStageModal({
  open,
  onOpenChange,
  record,
}: DeniedPaymentChangeStageModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [newStage, setNewStage] = useState<string>("Negotiation");
  const [note, setNote] = useState<string>("");

  const changeMutation = useMutation({
    mutationFn: async () => {
      if (!record) return;
      return changeDeniedPaymentStage({
        deniedPaymentId: record.id,
        prospectId: record.prospect_id,
        newStage,
        note: note || `Stage updated from ${record.current_stage} to ${newStage}`,
        changedByUserId: user?.id || null,
        changedByUserName: user?.email || "Current Agent",
      });
    },
    onSuccess: () => {
      toast.success(`Stage updated to "${newStage}". Stage history recorded automatically!`);
      void queryClient.invalidateQueries({ queryKey: ["denied-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["stage-history-prospect"] });
      onOpenChange(false);
      setNote("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update stage history.");
    },
  });

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ArrowRightLeft className="size-5 text-[#67B239]" />
            Change Stage & Log History
          </DialogTitle>
          <DialogDescription>
            Updating stage for <strong className="text-foreground">{record.prospect_name}</strong> (
            {record.business_name || record.service}). Changing out of Denied Payment will
            automatically record a permanent stage history entry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current Stage Indicator */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 text-xs flex items-center justify-between">
            <span className="text-amber-800 dark:text-amber-300 font-medium">Current Stage:</span>
            <span className="font-semibold text-amber-900 dark:text-amber-200">
              {record.current_stage}
            </span>
          </div>

          {/* New Stage Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="new_stage" className="text-xs font-semibold">
              Select New Stage
            </Label>
            <Select value={newStage} onValueChange={setNewStage}>
              <SelectTrigger id="new_stage" className="w-full text-xs">
                <SelectValue placeholder="Select target stage..." />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transition Note */}
          <div className="space-y-1.5">
            <Label htmlFor="transition_note" className="text-xs font-semibold">
              Stage History Note (Mandatory Reason)
            </Label>
            <Textarea
              id="transition_note"
              placeholder="Detail the agreement, resolution terms, or discount offered to move out of Denied Payment..."
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
            disabled={changeMutation.isPending}
            onClick={() => changeMutation.mutate()}
          >
            <CheckCircle2 className="size-4" />
            {changeMutation.isPending ? "Recording Stage..." : "Save Stage & History"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
