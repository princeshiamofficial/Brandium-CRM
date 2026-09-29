"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock3, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { followupStagesQueryOptions } from "@/lib/followup-stages";
import type { FollowUp } from "@/lib/follow-ups";
import type { FollowUpStage } from "@/lib/followup-stages";

const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "stage-pending": Clock3,
  "stage-in-progress": AlertCircle,
  "stage-completed": CheckCircle2,
  "stage-canceled": XCircle,
};

function FollowUpCard({ followUp }: { followUp: FollowUp }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
        {followUp.prospect_name || "Unknown"}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
        Due: {new Date(followUp.due_at).toLocaleDateString()}
      </p>
      {followUp.note && (
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{followUp.note}</p>
      )}
    </div>
  );
}

export function FollowUpsKanban({ followUps }: { followUps: FollowUp[] }) {
  const { data: stages = [] } = useQuery(followupStagesQueryOptions());

  const followUpsByStage = useMemo(() => {
    const grouped: Record<string, FollowUp[]> = {};
    stages.forEach((stage) => {
      grouped[stage.id] = [];
    });
    followUps.forEach((fu) => {
      const stageId = `stage-${fu.status}`;
      if (grouped[stageId]) {
        grouped[stageId].push(fu);
      }
    });
    return grouped;
  }, [followUps, stages]);

  return (
    <div className="flex-1 overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max px-0.5">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="w-72 shrink-0 flex flex-col bg-muted/30 rounded-lg overflow-hidden border border-border/30 h-full"
          >
            <div
              className="px-3 py-2.5 flex items-center justify-between rounded-t-lg shrink-0"
              style={{ backgroundColor: stage.color }}
            >
              <div className="flex items-center gap-2">
                {STAGE_ICONS[stage.id] &&
                  (() => {
                    const Icon = STAGE_ICONS[stage.id];
                    return <Icon className="h-4 w-4 text-white" />;
                  })()
                }
                <h3 className="font-semibold text-sm text-white">{stage.name}</h3>
              </div>
              <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white font-medium">
                {(followUpsByStage[stage.id] || []).length}
              </span>
            </div>

            <ScrollArea className="flex-1 min-h-0 w-full">
              <div className="p-3 space-y-3 min-h-full w-full">
                {(followUpsByStage[stage.id] || []).length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-xs text-muted-foreground text-center italic">
                      No follow-ups in this stage.
                    </p>
                  </div>
                ) : (
                  (followUpsByStage[stage.id] || []).map((followUp) => (
                    <FollowUpCard key={followUp.id} followUp={followUp} />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}
