import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarClock,
  CheckCircle2,
  CircleSlash,
  Clock,
  ExternalLink,
  History,
  Phone,
  Plus,
  UserCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  prospectTimelineQuery,
  statusBadgeVariant,
  useSetFollowUpStatus,
  type FollowUp,
  type FollowUpStatus,
} from "@/lib/follow-ups";
import { Link } from "@/components/navigation-link";

export type FollowUpDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp: FollowUp | null;
  onScheduleNext?: (prospectId: string, prospectLabel: string) => void;
};

export function FollowUpDetailModal({
  open,
  onOpenChange,
  followUp,
  onScheduleNext,
}: FollowUpDetailModalProps) {
  const statusMutation = useSetFollowUpStatus();

  const prospectId = followUp?.prospect_id ?? "";
  const timeline = useQuery({
    ...prospectTimelineQuery(prospectId),
    enabled: open && !!prospectId,
  });

  if (!followUp) return null;

  const setStatus = (status: "completed" | "cancelled" | "pending") => {
    statusMutation.mutate(
      {
        id: followUp.id,
        status,
        prospectId: followUp.prospect_id,
        prospectName: followUp.prospect_name,
        note: followUp.note || undefined,
      },
      {
        onSuccess: () => toast.success(`Follow-up status set to ${status}`),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const dueAtDate = followUp.due_at ? new Date(followUp.due_at) : null;
  const createdAtDate = followUp.created_at ? new Date(followUp.created_at) : null;
  const updatedAtDate = followUp.updated_at ? new Date(followUp.updated_at) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <Badge
              variant={statusBadgeVariant(followUp.effective_status)}
              className="capitalize text-xs"
            >
              {followUp.effective_status}
            </Badge>
            <span className="text-xs text-muted-foreground">ID: {followUp.id.substring(0, 8)}</span>
          </div>
          <DialogTitle className="text-xl font-bold mt-1">
            {followUp.prospect_name || "Follow-up Details"}
            {followUp.prospect_business ? (
              <span className="text-muted-foreground font-normal text-base block sm:inline sm:ml-2">
                ({followUp.prospect_business})
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Complete details and chronological timeline for this prospect follow-up task.
          </DialogDescription>
        </DialogHeader>

        {/* Action Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {followUp.prospect_phone && (
              <Button size="sm" variant="default" asChild>
                <a href={`tel:${followUp.prospect_phone}`}>
                  <Phone className="mr-2 size-4" />
                  Call {followUp.prospect_phone}
                </a>
              </Button>
            )}

            {followUp.effective_status !== "completed" && (
              <Button
                size="sm"
                variant="outline"
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200"
                onClick={() => setStatus("completed")}
                disabled={statusMutation.isPending}
              >
                <CheckCircle2 className="mr-1.5 size-4 text-emerald-600" />
                Complete Task
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Update Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setStatus("pending")}>
                  <CalendarClock className="mr-2 size-4 text-amber-500" />
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("completed")}>
                  <CheckCircle2 className="mr-2 size-4 text-emerald-500" />
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatus("cancelled")}>
                  <CircleSlash className="mr-2 size-4 text-muted-foreground" />
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              onOpenChange(false);
              onScheduleNext?.(followUp.prospect_id, followUp.prospect_name ?? "this prospect");
            }}
          >
            <Plus className="mr-1.5 size-4" />
            Add next follow-up
          </Button>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid gap-4 sm:grid-cols-2 text-sm pt-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarClock className="size-3.5" /> Scheduled At
            </span>
            <p className="font-semibold">
              {dueAtDate ? format(dueAtDate, "PPP 'at' p") : "Not set"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <UserCheck className="size-3.5" /> Assigned Agent
            </span>
            <p className="font-medium">{followUp.agent_name || "Unassigned"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="size-3.5" /> Created By
            </span>
            <p className="font-medium">{followUp.creator_name || "System"}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3.5" /> Created / Updated
            </span>
            <p className="text-xs text-muted-foreground">
              Created: {createdAtDate ? format(createdAtDate, "dd MMM yyyy, p") : "—"}
              <br />
              Updated: {updatedAtDate ? format(updatedAtDate, "dd MMM yyyy, p") : "—"}
            </p>
          </div>

          <div className="sm:col-span-2 space-y-1 rounded-lg border bg-card p-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Notes / Instructions
            </span>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {followUp.note || "No specific note added."}
            </p>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Chronological Follow-Up Timeline Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <History className="size-4 text-primary" />
              Chronological Follow-up Timeline
            </h4>
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <Link to="/prospects">
                View Prospects <ExternalLink className="ml-1 size-3" />
              </Link>
            </Button>
          </div>

          {timeline.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
          ) : (timeline.data ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No previous timeline records found for this prospect.
            </p>
          ) : (
            <ol className="relative space-y-3 border-l pl-4 ml-2">
              {(timeline.data ?? []).map((item) => (
                <li key={item.id} className="relative pl-2">
                  <span
                    className={`absolute -left-5.75 top-1.5 size-2.5 rounded-full border-2 border-background ${
                      item.status === "completed"
                        ? "bg-emerald-500"
                        : item.status === "overdue"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                    }`}
                  />
                  <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <span>{item.date}</span>
                        <span className="text-muted-foreground">· {item.time}</span>
                      </div>
                      <Badge
                        variant={statusBadgeVariant(item.status)}
                        className="capitalize text-[10px] px-1.5 py-0"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-foreground/90 font-normal">{item.note}</p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Agent: {item.agent}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
