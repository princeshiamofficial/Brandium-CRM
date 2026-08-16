import { useQuery } from "@tanstack/react-query";
import { History, Calendar, User, ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { stageHistoryForProspectQueryOptions, DeniedPayment } from "@/lib/denied-payments";

type DeniedPaymentStageHistoryModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: DeniedPayment | null;
};

export function DeniedPaymentStageHistoryModal({
  open,
  onOpenChange,
  record,
}: DeniedPaymentStageHistoryModalProps) {
  const prospectIdKey = record?.prospect_id || (record?.id ? `prospect-${record.id}` : "");

  const { data: historyList, isLoading } = useQuery({
    ...stageHistoryForProspectQueryOptions(prospectIdKey),
    enabled: open && Boolean(prospectIdKey),
  });

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <History className="size-5 text-[#67B239]" />
            Stage Transition History
          </DialogTitle>
          <DialogDescription>
            Audit log of all stage changes for{" "}
            <strong className="text-foreground">{record.prospect_name}</strong> (
            {record.business_name || record.phone})
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : !historyList || historyList.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs">
              <History className="size-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-foreground">No stage history recorded yet</p>
              <p className="text-muted-foreground mt-0.5">
                Stage transitions will be logged automatically when stage changes occur.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
              {historyList.map((item) => (
                <div key={item.id} className="relative pl-6">
                  {/* Dot */}
                  <div className="absolute -left-2 top-1 size-4 rounded-full bg-[#67B239] border-2 border-white dark:border-slate-900 shadow-xs" />

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-card p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {/* Transition Stages */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Badge
                          variant="outline"
                          className="bg-white dark:bg-background text-slate-700 dark:text-slate-300"
                        >
                          {item.from_stage_name}
                        </Badge>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <Badge className="bg-[#67B239] hover:bg-[#5aa030] text-white">
                          {item.to_stage_name}
                        </Badge>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                        <Calendar className="size-3" />
                        {new Date(item.changed_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        {new Date(item.changed_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Note */}
                    {item.note && (
                      <p className="text-xs text-foreground/90 bg-white dark:bg-background p-2 rounded border border-slate-100 dark:border-slate-800/80">
                        "{item.note}"
                      </p>
                    )}

                    {/* Changed By */}
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <User className="size-3 text-slate-400" />
                      <span>Updated by: {item.changed_by_name || "Agent"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
