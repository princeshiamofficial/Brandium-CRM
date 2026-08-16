import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DollarSign, CreditCard, Hash, FileText } from "lucide-react";

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

import { Invoice, PaymentMethod, recordInvoicePayment } from "@/lib/billing";
import { useAuth } from "@/lib/auth";

type BillingRecordPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
};

const PAYMENT_METHODS: PaymentMethod[] = ["Bank Transfer", "bKash", "Nagad", "Cash", "Card"];

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function BillingRecordPaymentModal({
  open,
  onOpenChange,
  invoice,
}: BillingRecordPaymentModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [amountStr, setAmountStr] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("Bank Transfer");
  const [trxRef, setTrxRef] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const currentDue = invoice?.due_amount || 0;
  const payAmount = Number(amountStr) || 0;
  const projectedDue = Math.max(0, currentDue - payAmount);

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!invoice) throw new Error("Invoice not found.");
      if (payAmount <= 0) throw new Error("Payment amount must be greater than 0.");
      if (payAmount > currentDue) {
        toast.info(
          "Payment amount exceeds current due balance. Excess will clear invoice completely.",
        );
      }

      return recordInvoicePayment(
        {
          invoice_id: invoice.id,
          amount: payAmount,
          payment_method: method,
          transaction_reference: trxRef || null,
          notes: notes || null,
        },
        user,
      );
    },
    onSuccess: (res) => {
      toast.success(`Payment of ${formatCurrency(payAmount)} recorded! New status: ${res.status}.`);
      setAmountStr("");
      setTrxRef("");
      setNotes("");
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to record payment.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="size-5 text-[#67B239]" />
            Record Payment for {invoice?.invoice_number}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Client: <strong>{invoice?.prospect_name}</strong> · Total:{" "}
            {formatCurrency(invoice?.total_amount || 0)} · Current Due:{" "}
            <span className="text-amber-600 font-semibold">{formatCurrency(currentDue)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Payment Amount Input */}
          <div className="space-y-1.5">
            <Label htmlFor="pay_amount" className="text-xs font-semibold">
              Payment Amount (৳)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">
                ৳
              </span>
              <Input
                id="pay_amount"
                type="number"
                placeholder={`Max due: ${currentDue}`}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="pl-7 font-mono text-sm font-semibold"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-0.5">
              <button
                type="button"
                className="text-[#67B239] hover:underline font-medium"
                onClick={() => setAmountStr(String(currentDue))}
              >
                Pay Full Due ({formatCurrency(currentDue)})
              </button>
              <span>Projected Due: {formatCurrency(projectedDue)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="pay_method" className="text-xs font-semibold flex items-center gap-1">
              <CreditCard className="size-3.5 text-blue-600" />
              Payment Method
            </Label>
            <Select value={method} onValueChange={(val: string) => setMethod(val as PaymentMethod)}>
              <SelectTrigger id="pay_method" className="text-xs">
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

          {/* Transaction Reference / TrxID */}
          <div className="space-y-1.5">
            <Label htmlFor="trx_ref" className="text-xs font-semibold flex items-center gap-1">
              <Hash className="size-3.5 text-slate-500" />
              Transaction Reference / TrxID (Optional)
            </Label>
            <Input
              id="trx_ref"
              placeholder="e.g. TRX-EBL-992011 / BKSH-9928172X"
              value={trxRef}
              onChange={(e) => setTrxRef(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="pay_notes" className="text-xs font-semibold flex items-center gap-1">
              <FileText className="size-3.5 text-slate-500" />
              Payment Notes (Optional)
            </Label>
            <Textarea
              id="pay_notes"
              placeholder="Add bank deposit slip notes or payment remarks..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={paymentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
            onClick={() => paymentMutation.mutate()}
            disabled={paymentMutation.isPending || payAmount <= 0}
          >
            <DollarSign className="size-3.5" />
            {paymentMutation.isPending ? "Recording Payment..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
