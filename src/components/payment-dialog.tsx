import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DollarSign,
  CreditCard,
  Hash,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Invoice, PaymentMethod } from "@/lib/billing";
import { processInvoicePayment, restoreCancelledInvoice } from "@/lib/payments";
import { useAuth } from "@/lib/auth";

type PaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
};

const PAYMENT_METHODS: PaymentMethod[] = ["Bank Transfer", "bKash", "Nagad", "Cash", "Card"];

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function PaymentDialog({ open, onOpenChange, invoice, onSuccess }: PaymentDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [amountStr, setAmountStr] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("Bank Transfer");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const currentDue = invoice?.due_amount || 0;
  const payAmount = Number(amountStr) || 0;
  const isCancelled = invoice?.status === "Cancelled";

  // Restoration Mutation
  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!invoice) return;
      return restoreCancelledInvoice(invoice.id);
    },
    onSuccess: () => {
      toast.success(
        `Invoice ${invoice?.invoice_number} restored successfully! Payments can now be accepted.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to restore invoice.");
    },
  });

  // 7-Step Transaction Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!invoice) throw new Error("No invoice selected.");
      if (isCancelled) {
        throw new Error(
          "Cannot record payment for a cancelled invoice unless explicitly restored.",
        );
      }
      if (payAmount <= 0) {
        throw new Error("Invalid payment amount. Amount must be greater than zero.");
      }

      return processInvoicePayment(
        {
          invoice_id: invoice.id,
          amount: payAmount,
          method,
          reference: reference.trim() || null,
          notes: notes.trim() || null,
        },
        user,
      );
    },
    onSuccess: (res) => {
      toast.success(
        `Payment of ${formatCurrency(payAmount)} recorded! Updated Status: ${res.status}.`,
      );
      setAmountStr("");
      setReference("");
      setNotes("");
      onOpenChange(false);
      if (onSuccess) onSuccess();
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Payment processing failed.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="size-5 text-[#67B239]" />
            Record Invoice Payment ({invoice?.invoice_number})
          </DialogTitle>
          <DialogDescription className="text-xs">
            Client: <strong>{invoice?.prospect_name}</strong> · Current Due:{" "}
            <span className="font-bold text-amber-600 font-mono">{formatCurrency(currentDue)}</span>
          </DialogDescription>
        </DialogHeader>

        {isCancelled ? (
          <div className="py-4 space-y-3 text-xs">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-red-900 dark:text-red-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="size-4 text-red-600 shrink-0" />
                Invoice Cancelled
              </div>
              <p>
                Payments are prohibited on cancelled invoices. You must explicitly restore this
                invoice before accepting new payments.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
              disabled={restoreMutation.isPending}
              onClick={() => restoreMutation.mutate()}
            >
              <RotateCcw className="size-3.5" />
              {restoreMutation.isPending ? "Restoring Invoice..." : "Explicitly Restore Invoice"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2 text-xs">
            {/* Amount Input */}
            <div className="space-y-1.5">
              <Label htmlFor="pay_dialog_amount" className="text-xs font-semibold">
                Payment Amount (৳) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">
                  ৳
                </span>
                <Input
                  id="pay_dialog_amount"
                  type="number"
                  placeholder={`Enter amount (> 0)`}
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="pl-7 font-mono text-sm font-semibold"
                />
              </div>
              {payAmount <= 0 && amountStr !== "" && (
                <p className="text-[11px] text-red-500 font-medium">
                  Payment amount must be greater than zero. Negative amounts are prohibited.
                </p>
              )}
              <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-0.5">
                <button
                  type="button"
                  className="text-[#67B239] hover:underline font-medium"
                  onClick={() => setAmountStr(String(currentDue))}
                >
                  Fill Full Due ({formatCurrency(currentDue)})
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label
                htmlFor="pay_dialog_method"
                className="text-xs font-semibold flex items-center gap-1"
              >
                <CreditCard className="size-3.5 text-blue-600" />
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={method}
                onValueChange={(val: string) => setMethod(val as PaymentMethod)}
              >
                <SelectTrigger id="pay_dialog_method" className="text-xs">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference */}
            <div className="space-y-1.5">
              <Label
                htmlFor="pay_dialog_ref"
                className="text-xs font-semibold flex items-center gap-1"
              >
                <Hash className="size-3.5 text-slate-500" />
                Payment Reference / TrxID (Optional)
              </Label>
              <Input
                id="pay_dialog_ref"
                placeholder="e.g. TRX-EBL-992011"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label
                htmlFor="pay_dialog_notes"
                className="text-xs font-semibold flex items-center gap-1"
              >
                <FileText className="size-3.5 text-slate-500" />
                Notes & Remarks (Optional)
              </Label>
              <Textarea
                id="pay_dialog_notes"
                placeholder="Add payment remarks or receipt details..."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Rule Verification Pill */}
            <div className="rounded bg-slate-50 dark:bg-muted/40 p-2 border text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Financial Rule Status Preview:</span>
              <Badge variant="outline" className="font-mono text-[10px]">
                {payAmount >= currentDue && currentDue > 0
                  ? "Status → Paid"
                  : payAmount > 0
                    ? "Status → Partially Paid"
                    : "Status → Pending"}
              </Badge>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={paymentMutation.isPending}
          >
            Cancel
          </Button>
          {!isCancelled && (
            <Button
              size="sm"
              className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
              onClick={() => paymentMutation.mutate()}
              disabled={paymentMutation.isPending || payAmount <= 0}
            >
              <CheckCircle2 className="size-3.5" />
              {paymentMutation.isPending ? "Executing Transaction..." : "Process Payment"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
