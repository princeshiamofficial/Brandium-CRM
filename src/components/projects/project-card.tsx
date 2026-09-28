"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import {
  addHours,
  differenceInSeconds,
  format,
  formatDistanceToNowStrict,
  isAfter,
} from "date-fns";
import { CalendarDays, ReceiptText, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES, resolveOrderStatus, type CrmOrder } from "@/lib/orders";
import { getInitials } from "@/components/orders/assign-stage-dialog";

/** Stages that run on the clock; Delivered has no SLA bar. */
const SLA_STAGES = ORDER_STATUSES.filter((s) => s.id !== "delivered");
/** Default per-stage SLA when the order has no delivery date. */
const DEFAULT_STAGE_SLA_HOURS = 48;

const StopwatchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="14" r="8" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="10" y1="2" x2="14" y2="2" />
    <path d="M12 14l2-2" />
  </svg>
);

const formatDurationPrecise = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return "Due";
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return minutes > 0 ? `${minutes}m` : "<1m";
};

const formatSlaHours = (hours: number): string => {
  const d = Math.floor(hours / 24);
  const h = hours % 24;
  if (h === 0) return d === 1 ? "1 Day SLA" : `${d} Days SLA`;
  if (d === 0) return h === 1 ? "1 Hour SLA" : `${h} Hours SLA`;
  return `${d}d ${h}H SLA`;
};

/** When the order entered its current stage (latest matching history entry). */
export const getStageStartedAt = (order: CrmOrder): string => {
  const current = resolveOrderStatus(order.status).id;
  const entry = [...order.status_history]
    .reverse()
    .find((h) => resolveOrderStatus(h.status).id === current);
  return entry?.timestamp || order.updated_at || order.created_at;
};

interface ProgressInfo {
  showProgressBar: boolean;
  percentage: number;
  displayText: string;
  isOverdue: boolean;
  targetLabel: string;
}

/**
 * ERPAPP stage SLA: with a delivery date the remaining time is split evenly across the
 * working stages; otherwise each stage gets DEFAULT_STAGE_SLA_HOURS.
 */
const calculateProgressInfo = (order: CrmOrder, now: Date): ProgressInfo => {
  const status = resolveOrderStatus(order.status);
  if (status.id === "delivered") {
    const deliveredAt = getStageStartedAt(order);
    return {
      showProgressBar: false,
      percentage: 100,
      displayText: "",
      isOverdue: false,
      targetLabel: format(new Date(deliveredAt), "d MMM yyyy"),
    };
  }

  const stageStart = new Date(getStageStartedAt(order));
  let target: Date;
  let slaHours: number;
  if (order.delivery_date) {
    const projectStart = new Date(order.created_at);
    const projectEnd = new Date(order.delivery_date);
    const totalDays = Math.max(1, differenceInSeconds(projectEnd, projectStart) / 86400);
    const allocatedDays = totalDays / SLA_STAGES.length;
    slaHours = Math.max(1, Math.round(allocatedDays * 24));
    target = new Date(stageStart.getTime() + Math.round(allocatedDays * 86400000));
  } else {
    slaHours = DEFAULT_STAGE_SLA_HOURS;
    target = addHours(stageStart, slaHours);
  }

  const sla = ` (${formatSlaHours(slaHours)})`;
  if (isAfter(now, target)) {
    return {
      showProgressBar: true,
      percentage: 100,
      displayText: `Overdue by ${formatDistanceToNowStrict(target)}${sla}`,
      isOverdue: true,
      targetLabel: format(target, "d MMM yyyy"),
    };
  }
  const total = differenceInSeconds(target, stageStart);
  const elapsed = differenceInSeconds(now, stageStart);
  return {
    showProgressBar: true,
    percentage: total > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / total) * 100))) : 0,
    displayText: `${formatDurationPrecise(differenceInSeconds(target, now))} remaining${sla}`,
    isOverdue: false,
    targetLabel: format(target, "d MMM yyyy"),
  };
};

interface ProjectCardProps {
  order: CrmOrder;
  isDragging?: boolean;
  onAssign: (order: CrmOrder) => void;
  onDragStart: (order: CrmOrder) => void;
  onDragEnd: () => void;
}

/** Clone of ERPAPP `ProjectCard.tsx` for an order on the projects Kanban. */
function ProjectCardComponent({
  order,
  isDragging = false,
  onAssign,
  onDragStart,
  onDragEnd,
}: ProjectCardProps) {
  const [progressInfo, setProgressInfo] = useState<ProgressInfo>(() =>
    calculateProgressInfo(order, new Date()),
  );

  useEffect(() => {
    const update = () => setProgressInfo(calculateProgressInfo(order, new Date()));
    update();
    const intervalId = setInterval(update, 5000);
    return () => clearInterval(intervalId);
  }, [order]);

  const status = resolveOrderStatus(order.status);
  const isDelivered = status.id === "delivered";
  const name = `${order.job_id ? `${order.job_id} • ` : ""}${order.company_name}`;
  const truncatedName = name.length > 35 ? `${name.substring(0, 35)}...` : name;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", order.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(order);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "relative group transition-all duration-150",
        isDragging ? "opacity-40 scale-[1.02]" : "opacity-100",
      )}
    >
      <Card
        className={cn(
          "bg-card w-full py-0 shadow-xs hover:shadow-md transition-shadow",
          isDragging
            ? "ring-2 ring-[#67B239] cursor-grabbing"
            : "cursor-grab active:cursor-grabbing",
        )}
      >
        <CardContent className="p-3 space-y-2.5">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-foreground truncate">
              {order.order_number}
            </span>
            <Link
              href={`/track/${order.order_number}`}
              className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted"
              onClick={(e) => e.stopPropagation()}
              title="View Invoice / Order Details"
              draggable={false}
            >
              <ReceiptText className="h-4 w-4 text-muted-foreground hover:text-[#67B239]" />
            </Link>
          </div>

          <p className="text-xs font-medium text-muted-foreground" title={name}>
            {truncatedName}
          </p>

          <Link
            href={`/track/${order.order_number}`}
            onClick={(e) => e.stopPropagation()}
            title="View Tracking Page"
            draggable={false}
          >
            <div
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors",
                isDelivered
                  ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/30"
                  : "border-destructive/30 bg-destructive/20 text-destructive hover:bg-destructive/30",
              )}
            >
              <CalendarDays className="mr-1.5 h-3 w-3" />
              {isDelivered ? "Delivered" : "Target"}: {progressInfo.targetLabel}
            </div>
          </Link>

          {progressInfo.showProgressBar && (
            <div className="pt-1">
              <div className="flex items-center space-x-2 mb-1">
                <StopwatchIcon className="h-4 w-4 text-[#67B239] shrink-0" />
                <span
                  className="text-xs font-medium text-muted-foreground truncate"
                  title={progressInfo.displayText}
                >
                  {progressInfo.displayText}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 shadow-inner overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    progressInfo.isOverdue
                      ? "bg-destructive"
                      : "bg-linear-to-r from-[#67B239] to-[#0a2e5c]",
                  )}
                  style={{ width: `${progressInfo.percentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-start mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "hover:bg-muted/50 p-1 -m-1 rounded-md transition-colors",
                      status.assignable && !order.designer_name && "cursor-pointer",
                    )}
                    onClick={
                      status.assignable && !order.designer_name
                        ? (e) => {
                            e.stopPropagation();
                            onAssign(order);
                          }
                        : undefined
                    }
                  >
                    <Avatar className="h-7 w-7 text-xs border bg-muted">
                      <AvatarImage src={order.crm_user_avatar || undefined} alt="CRM" />
                      <AvatarFallback className="text-muted-foreground font-semibold">
                        {getInitials(order.crm_user_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>CRM: {order.crm_user_name || "N/A"}</p>
                  {status.assignable && !order.designer_name && (
                    <p className="text-xs">(Click to assign {status.name})</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {order.designer_name && (
              <>
                <div className="w-px h-5 bg-border mx-1.5" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "hover:bg-muted/50 p-1 -m-1 rounded-md transition-colors",
                          status.assignable && "cursor-pointer",
                        )}
                        onClick={
                          status.assignable
                            ? (e) => {
                                e.stopPropagation();
                                onAssign(order);
                              }
                            : undefined
                        }
                      >
                        <Avatar className="h-7 w-7 text-xs border border-[#67B239] bg-muted">
                          <AvatarImage
                            src={order.designer_avatar || undefined}
                            alt={order.designer_name}
                          />
                          <AvatarFallback className="text-[#55962e] font-semibold">
                            {getInitials(order.designer_name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Assigned: {order.designer_name}</p>
                      {status.assignable && (
                        <p className="text-xs">(Click to re-assign {status.name})</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            {order.is_starred > 0 && (
              <div
                className="ml-auto flex items-center gap-0.5 shrink-0"
                title={`${order.is_starred.toFixed(1)} Stars Priority`}
              >
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const isFull = order.is_starred >= starIndex;
                  const isHalf = !isFull && order.is_starred >= starIndex - 0.5;
                  return (
                    <div key={starIndex} className="relative shrink-0">
                      {isFull ? (
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      ) : isHalf ? (
                        <div className="relative">
                          <Star className="h-3.5 w-3.5 text-muted-foreground/30" />
                          <div className="absolute top-0 left-0 overflow-hidden w-1/2 h-full">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          </div>
                        </div>
                      ) : (
                        <Star className="h-3.5 w-3.5 text-muted-foreground/30" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export const ProjectCard = memo(ProjectCardComponent);
