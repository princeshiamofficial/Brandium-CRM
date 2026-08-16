import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Trophy,
  CalendarClock,
  TrendingUp,
  History,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { AgentMetrics } from "@/lib/agent-reports";

type AdminAgentDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentMetrics | null;
};

function formatCurrency(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export function AdminAgentDetailModal({ open, onOpenChange, agent }: AdminAgentDetailModalProps) {
  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-foreground">
            <div className="flex items-center gap-2">
              <User className="size-5 text-[#67B239]" />
              <span>{agent.name}</span>
            </div>
            <Badge
              className={
                agent.status === "Active"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-300 text-slate-700"
              }
            >
              {agent.status}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs font-mono">
            {agent.email} · Last Activity:{" "}
            {new Date(agent.last_activity).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2 text-xs">
          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Assigned prospects */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-muted/40 border">
              <span className="text-[11px] text-muted-foreground block font-medium">
                Assigned Prospects
              </span>
              <span className="text-base font-bold text-foreground font-mono">
                {agent.prospects_count}
              </span>
            </div>

            {/* 2. Follow-ups completed */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium">
                Follow-ups Done
              </span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {agent.followups_completed}
              </span>
            </div>

            {/* 3. Overdue follow-ups */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
              <span className="text-[11px] text-amber-800 dark:text-amber-300 block font-medium">
                Overdue Follow-ups
              </span>
              <span className="text-base font-bold text-amber-700 dark:text-amber-400 font-mono">
                {agent.overdue_followups}
              </span>
            </div>

            {/* 4. Opportunities created */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200">
              <span className="text-[11px] text-blue-800 dark:text-blue-300 block font-medium">
                Opps Created
              </span>
              <span className="text-base font-bold text-blue-700 dark:text-blue-400 font-mono">
                {agent.opportunities_created}
              </span>
            </div>

            {/* 5. Sales won */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium">
                Sales Won Deals
              </span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {agent.sales_won}
              </span>
            </div>

            {/* 6. Won value */}
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 col-span-2">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block font-medium">
                Total Won Revenue Value
              </span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {formatCurrency(agent.won_value)}
              </span>
            </div>

            {/* 7. Conversion rate */}
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
              <span className="text-[11px] text-purple-800 dark:text-purple-300 block font-medium">
                Conversion Rate
              </span>
              <span className="text-base font-bold text-purple-700 dark:text-purple-400 font-mono">
                {agent.conversion_rate}%
              </span>
            </div>
          </div>

          {/* Activity Breakdown Counters */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50/70 dark:bg-muted/20 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground text-[11px]">Stage Change Log Count:</span>
              <div className="font-bold text-foreground text-sm font-mono">
                {agent.stage_changes} Transitions
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-[11px]">Status Change Log Count:</span>
              <div className="font-bold text-foreground text-sm font-mono">
                {agent.status_changes} Updates
              </div>
            </div>
          </div>

          {/* 8. Recent Activities Timeline List */}
          <div className="space-y-2 border-t pt-3">
            <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
              <History className="size-4 text-[#67B239]" />
              Recent Agent Activity Audit Trail
            </h4>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {agent.recent_activities.length === 0 ? (
                <p className="text-muted-foreground text-center py-4 text-xs italic">
                  No recent logged activities recorded for this period.
                </p>
              ) : (
                agent.recent_activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded bg-white dark:bg-card border shadow-2xs space-y-0.5"
                  >
                    <p className="font-medium text-foreground text-xs">{act.message}</p>
                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="size-3 text-slate-400" />
                      {new Date(act.timestamp).toLocaleString("en-US")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
