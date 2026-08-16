import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Receipt, DollarSign, Calendar, FileText, CheckCircle2, Edit } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createInvoice, updateInvoice, Invoice } from "@/lib/billing";
import { prospectsOptionsQuery } from "@/lib/meetings";
import { useAuth } from "@/lib/auth";

export type AddInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceToEdit?: Invoice | null;
};

export function AddInvoiceDialog({ open, onOpenChange, invoiceToEdit }: AddInvoiceDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [prospectId, setProspectId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [totalAmountStr, setTotalAmountStr] = useState<string>("");
  const [billDate, setBillDate] = useState<string>(new Date().toISOString().split("T")[0]!);
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0]!,
  );
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (invoiceToEdit) {
        setProspectId(invoiceToEdit.prospect_id || "");
        setDescription(invoiceToEdit.description || "");
        setTotalAmountStr(String(invoiceToEdit.total_amount || ""));
        setBillDate(invoiceToEdit.bill_date || new Date().toISOString().split("T")[0]!);
        setDueDate(invoiceToEdit.due_date || new Date().toISOString().split("T")[0]!);
        setNotes(invoiceToEdit.notes || "");
      } else {
        setProspectId("");
        setDescription("");
        setTotalAmountStr("");
        setBillDate(new Date().toISOString().split("T")[0]!);
        setDueDate(new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0]!);
        setNotes("");
      }
    }
  }, [open, invoiceToEdit]);

  const { data: prospectOptions = [] } = useQuery({
    ...prospectsOptionsQuery(),
    enabled: open,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!prospectId) throw new Error("Please select a client prospect.");
      if (!description || !description.trim())
        throw new Error("Please enter a service description.");
      const amount = Number(totalAmountStr);
      if (!amount || amount <= 0) throw new Error("Please enter a valid invoice total amount.");

      if (invoiceToEdit) {
        return updateInvoice(invoiceToEdit.id, {
          prospect_id: prospectId,
          description: description.trim(),
          total_amount: amount,
          bill_date: billDate,
          due_date: dueDate,
          notes: notes.trim() || null,
        });
      }

      return createInvoice(
        {
          prospect_id: prospectId,
          description: description.trim(),
          total_amount: amount,
          bill_date: billDate,
          due_date: dueDate,
          notes: notes.trim() || null,
        },
        user,
      );
    },
    onSuccess: (inv) => {
      toast.success(
        invoiceToEdit
          ? `Invoice ${inv.invoice_number} updated successfully!`
          : `Invoice ${inv.invoice_number} created successfully!`,
      );
      void queryClient.invalidateQueries({ queryKey: ["invoices"] });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save invoice.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="size-5 text-[#67B239]" />
            {invoiceToEdit ? `Edit Bill (${invoiceToEdit.invoice_number})` : "Create New Invoice"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {invoiceToEdit
              ? "Update invoice financial amounts, service item descriptions, and due dates."
              : "Generate an official invoice for a prospect or client. Initial status will be Pending."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Prospect Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="invoice-prospect" className="text-xs font-semibold text-foreground">
              Select Client / Prospect <span className="text-destructive">*</span>
            </Label>
            <Select value={prospectId} onValueChange={setProspectId}>
              <SelectTrigger id="invoice-prospect" className="h-10 text-sm rounded-xl">
                <SelectValue placeholder="Choose a prospect..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {prospectOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.business_name ? `${p.business_name} (${p.contact_name})` : p.contact_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="invoice-desc" className="text-xs font-semibold text-foreground">
              Item / Service Description <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invoice-desc"
              placeholder="e.g. Website Design & Development (Phase 1)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
              required
            />
          </div>

          {/* Total Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="invoice-amount" className="text-xs font-semibold text-foreground">
              Total Amount (৳) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-mono font-bold text-sm">
                ৳
              </span>
              <Input
                id="invoice-amount"
                type="number"
                min="1"
                step="any"
                placeholder="50000"
                value={totalAmountStr}
                onChange={(e) => setTotalAmountStr(e.target.value)}
                className="pl-8 h-10 text-sm rounded-xl font-mono focus-visible:ring-[#67B239]"
                required
              />
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="invoice-bill-date" className="text-xs font-semibold text-foreground">
                Bill Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invoice-bill-date"
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invoice-due-date" className="text-xs font-semibold text-foreground">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invoice-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="invoice-notes" className="text-xs font-semibold text-foreground">
              Notes & Terms
            </Label>
            <Textarea
              id="invoice-notes"
              rows={2}
              placeholder="e.g. 50% advance received, balance payable upon delivery."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none text-sm rounded-xl focus-visible:ring-[#67B239]"
            />
          </div>

          {/* Action Buttons in Brand Color */}
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
              disabled={saveMutation.isPending}
              className="h-10 px-6 rounded-xl bg-[#67B239] hover:bg-[#5AA030] text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              {saveMutation.isPending
                ? invoiceToEdit
                  ? "Saving Changes..."
                  : "Creating Invoice..."
                : invoiceToEdit
                  ? "Update Invoice"
                  : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
