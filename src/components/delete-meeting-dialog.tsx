import { Calendar, Clock, MapPin, Trash2, TriangleAlert, User } from "lucide-react";

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
import type { Meeting } from "@/lib/meetings";

export type DeleteMeetingDialogProps = {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export function DeleteMeetingDialog({
  meeting,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteMeetingDialogProps) {
  if (!meeting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-card border border-border shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-red-600 dark:text-red-400">
            <div className="size-9 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
              <Trash2 className="size-4.5 text-red-600 dark:text-red-400" />
            </div>
            Delete Meeting
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
            Are you sure you want to permanently delete this meeting? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Meeting Information Summary Card */}
        <div className="my-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
              {meeting.title}
            </span>
            <Badge
              variant="outline"
              className="text-[11px] font-semibold border-slate-300 dark:border-border shrink-0"
            >
              {meeting.meeting_type}
            </Badge>
          </div>

          <div className="space-y-1.5 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="size-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                Prospect:{" "}
                <strong className="text-foreground">
                  {meeting.business_name
                    ? `${meeting.business_name} (${meeting.prospect_name || "Direct"})`
                    : meeting.prospect_name || "Direct Client"}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 text-slate-400 shrink-0" />
              <span>
                Schedule:{" "}
                <strong className="text-foreground">
                  {meeting.meeting_date} at {meeting.meeting_time}
                </strong>
              </span>
            </div>

            {meeting.location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{meeting.location}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-xl border-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:border-border text-slate-700 dark:text-foreground font-medium text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm gap-1.5 shadow-xs transition-colors"
          >
            <Trash2 className="size-4" />
            {isDeleting ? "Deleting Meeting..." : "Delete Meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
