import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileJson, User, Clock, ShieldCheck, Tag } from "lucide-react";

import { ActivityLog } from "@/lib/activity-logs";

type ActivityLogMetadataModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: ActivityLog | null;
};

export function ActivityLogMetadataModal({
  open,
  onOpenChange,
  log,
}: ActivityLogMetadataModalProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileJson className="size-5 text-[#67B239]" />
            Audit Log Metadata Details
          </DialogTitle>
          <DialogDescription className="text-xs">
            Action: <strong>{log.action}</strong> · Entity: <strong>{log.entity_type}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Header Metadata */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-muted/40 p-3 rounded-lg border font-mono">
            <div>
              <span className="text-[10px] text-muted-foreground block font-medium">Logged By</span>
              <span className="font-bold text-foreground flex items-center gap-1">
                <User className="size-3 text-[#67B239]" />
                {log.user_name}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block font-medium">Timestamp</span>
              <span className="font-bold text-foreground flex items-center gap-1">
                <Clock className="size-3 text-slate-400" />
                {new Date(log.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Read-Only Audit Protection Banner */}
          <div className="flex items-center gap-2 p-2.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 text-blue-900 dark:text-blue-200 text-[11px]">
            <ShieldCheck className="size-4 shrink-0 text-blue-600" />
            <span>
              Audit logs are immutable. Editing or deleting audit records is strictly prohibited.
            </span>
          </div>

          {/* JSON Metadata Payload */}
          <div className="space-y-1.5">
            <span className="font-bold text-foreground flex items-center gap-1 text-xs">
              <Tag className="size-3.5 text-slate-500" />
              Event Payload Metadata JSON:
            </span>
            <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-56 border border-slate-800 leading-relaxed">
              {JSON.stringify(log.metadata_json, null, 2)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
