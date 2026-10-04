"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
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
import { getContrastTextColor, resolveOrderStatus, type CrmOrder } from "@/lib/orders";

interface StatusReasonDialogProps {
  order: CrmOrder;
  /** Stage the order is moving into (Canceled / On Hold). */
  statusId: string;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

/** Asks for a required reason before an order moves to Canceled or On Hold. */
export function StatusReasonDialog({
  order,
  statusId,
  isSaving,
  onCancel,
  onConfirm,
}: StatusReasonDialogProps) {
  const [reason, setReason] = useState("");
  const from = resolveOrderStatus(order.status);
  const to = resolveOrderStatus(statusId);
  const canSubmit = reason.trim().length > 0 && !isSaving;

  return (
    <Dialog open onOpenChange={(open) => !open && !isSaving && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reason for {to.name}</DialogTitle>
          <DialogDescription>
            Explain why{" "}
            <span className="font-semibold text-foreground">
              {order.company_name || order.order_number}
            </span>{" "}
            is moving to <span className="font-semibold text-foreground">{to.name}</span>. This is
            saved in the order&apos;s status history.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 text-sm">
            <span className="text-muted-foreground">{from.name}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
            <span
              className="rounded-md px-2 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: to.color, color: getContrastTextColor(to.color) }}
            >
              {to.name}
            </span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-status-reason" className="text-sm font-medium">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="order-status-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Why is this order ${to.name.toLowerCase()}?`}
              className="resize-none min-h-28 rounded-xl p-4 text-sm"
              autoFocus
              required
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason.trim())}
            disabled={!canSubmit}
            className="bg-[#67B239] hover:bg-[#5aa030] text-white cursor-pointer"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Move to {to.name}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
