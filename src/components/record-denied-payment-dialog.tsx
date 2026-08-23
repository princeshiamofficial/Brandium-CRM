import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldAlert, DollarSign } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createDeniedPaymentRecord } from "@/lib/denied-payments";
import { useAuth } from "@/lib/auth";

export type RecordDeniedPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProspectId?: string | undefined;
  onSuccess?: () => void;
};

const DENIED_BY_OPTIONS = [
  { value: "Client", label: "Client" },
  { value: "Finance", label: "Finance / Accounts" },
  { value: "Bank", label: "Bank" },
  { value: "Management", label: "Management" },
  { value: "Other", label: "Other" },
];

export function RecordDeniedPaymentDialog({
  open,
  onOpenChange,
  defaultProspectId,
  onSuccess,
}: RecordDeniedPaymentDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [denialReason, setDenialReason] = useState("");
  const [deniedBy, setDeniedBy] = useState("Client");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setDenialReason("");
      setDeniedBy("Client");
      setAmount("");
      setNotes("");
    }
  }, [open]);

  const recordMutation = useMutation({
    mutationFn: async () => {
      if (!defaultProspectId) throw new Error("No prospect selected.");
      await createDeniedPaymentRecord({
        prospectId: defaultProspectId,
        denialReason: denialReason.trim(),
        deniedBy,
        amount: amount ? Number(amount) : undefined,
        notes: notes.trim() || undefined,
        agentId: user?.id ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["denied-payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Denied Payment recorded successfully!");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to record denied payment.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!denialReason.trim()) {
      toast.error("Please enter a denial reason.");
      return;
    }
    recordMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-2xl sm:rounded-3xl">
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
            <ShieldAlert className="size-5 text-red-500" />
            Record Denied Payment
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Log the reason and details for this denied payment. The prospect stage will be updated
            automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="denial-reason" className="text-xs font-semibold text-foreground">
              Denial Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="denial-reason"
              rows={3}
              placeholder="Why was the payment denied?"
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="resize-none text-sm rounded-xl focus-visible:ring-red-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="denied-by" className="text-xs font-semibold text-foreground">
              Denied By
            </Label>
            <Select value={deniedBy} onValueChange={setDeniedBy}>
              <SelectTrigger id="denied-by" className="h-10 text-sm rounded-xl">
                <SelectValue placeholder="Who denied the payment?" />
              </SelectTrigger>
              <SelectContent>
                {DENIED_BY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="denied-amount" className="text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="size-3" />
                Amount Denied (BDT){" "}
                <span className="text-muted-foreground font-normal">(Optional)</span>
              </span>
            </Label>
            <Input
              id="denied-amount"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10 text-sm rounded-xl focus-visible:ring-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="denied-notes" className="text-xs font-semibold text-foreground">
              Additional Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="denied-notes"
              rows={2}
              placeholder="Any additional context or next steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none text-sm rounded-xl focus-visible:ring-red-500"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 rounded-xl border-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:border-border text-slate-700 dark:text-foreground font-medium text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={recordMutation.isPending}
              className="h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm transition-all"
            >
              {recordMutation.isPending ? "Recording..." : "Record Denied Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
