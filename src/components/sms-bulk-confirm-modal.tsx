import { AlertTriangle, Send, Users, MessageSquare } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateSmsInfo, type SmsRecipientInput } from "@/lib/sms";

type SmsBulkConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: SmsRecipientInput[];
  message: string;
  onConfirmSend: () => void;
  isSending?: boolean;
};

export function SmsBulkConfirmModal({
  open,
  onOpenChange,
  recipients,
  message,
  onConfirmSend,
  isSending = false,
}: SmsBulkConfirmModalProps) {
  const recipientCount = recipients.length;
  const smsInfo = calculateSmsInfo(message);
  const totalPartsNeeded = recipientCount * smsInfo.parts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="size-5 text-amber-500 shrink-0" />
            Confirm Bulk SMS Broadcast
          </DialogTitle>
          <DialogDescription>
            You are about to dispatch a bulk SMS broadcast. Please review details before confirming
            execution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Summary KPI Pills */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 dark:bg-card border p-3">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Users className="size-3.5 text-blue-600" />
                Recipients Count:
              </span>
              <p className="text-base font-bold text-foreground mt-1">{recipientCount} Clients</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-card border p-3">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <MessageSquare className="size-3.5 text-[#67B239]" />
                Estimated Credits:
              </span>
              <p className="text-base font-bold text-[#67B239] mt-1">
                {totalPartsNeeded} SMS Credits
              </p>
            </div>
          </div>

          {/* Encoding & Parts Breakdown */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-muted/50 p-2.5 rounded-md border text-muted-foreground">
            <span>Encoding format:</span>
            <Badge variant="outline" className="font-mono text-[11px] bg-white dark:bg-background">
              {smsInfo.isUnicode ? "Unicode (Bangla / Special)" : "GSM-7 (Standard English)"}
            </Badge>
          </div>

          {/* Message Content Preview */}
          <div className="space-y-1">
            <span className="font-semibold text-foreground">Broadcast Message Preview:</span>
            <div className="bg-slate-50 dark:bg-muted/40 p-3 rounded-md border max-h-28 overflow-y-auto text-foreground italic leading-relaxed">
              "{message}"
            </div>
          </div>

          {/* Confirmation Warning Note */}
          <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200 dark:border-amber-900/60">
            <strong>Warning:</strong> Bulk dispatch cannot be paused after execution. Each recipient
            will receive an individual SMS message and log entry.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
            onClick={onConfirmSend}
            disabled={isSending}
          >
            <Send className="size-3.5" />
            {isSending ? "Broadcasting SMS..." : `Confirm & Send (${recipientCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
