"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  MapPin,
  MessageSquarePlus,
  MoreVertical,
  Phone,
  StickyNote,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/components/orders/assign-stage-dialog";
import type { FollowUpBoardItem } from "@/lib/follow-ups";
import { parseNotesToItems } from "@/lib/stages";
import { cn } from "@/lib/utils";

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.substring(0, max)}...` : value;

export const formatFollowUpDate = (value: string, pattern: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : format(date, pattern);
};

interface FollowUpCardProps {
  followUp: FollowUpBoardItem;
  statusColor: string;
  isDragging: boolean;
  isAdmin: boolean;
  onDragStart: (item: FollowUpBoardItem) => void;
  onDragEnd: () => void;
  onAddUpdate: (item: FollowUpBoardItem) => void;
  onViewTimeline: (item: FollowUpBoardItem) => void;
  onDelete: (item: FollowUpBoardItem) => void;
}

/** Clone of ERPAPP `FollowUpCard.tsx`, using native HTML5 drag-and-drop. */
export function FollowUpCard({
  followUp,
  statusColor,
  isDragging,
  isAdmin,
  onDragStart,
  onDragEnd,
  onAddUpdate,
  onViewTimeline,
  onDelete,
}: FollowUpCardProps) {
  const displayName = followUp.business_name || followUp.contact_name || "Unnamed prospect";
  const latestNote = parseNotesToItems(followUp.note).at(-1)?.text || "";

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", followUp.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(followUp);
      }}
      onDragEnd={onDragEnd}
      className={cn("relative group w-full transition-opacity", isDragging && "opacity-40")}
    >
      <Card
        className={cn(
          "bg-card w-full shadow-xs cursor-grab active:cursor-grabbing",
          isDragging && "ring-2 ring-[#67B239]",
        )}
      >
        <CardContent className="p-3 space-y-2.5">
          <h3
            className="text-sm font-semibold text-foreground group-hover:text-[#67B239] transition-colors"
            title={displayName}
          >
            {truncate(displayName, 22)}
          </h3>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium min-w-0">
              <UserIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate" title={followUp.contact_name}>
                {followUp.contact_name || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {followUp.phone ? (
                <a
                  href={`tel:${followUp.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-[#67B239]"
                >
                  {followUp.phone}
                </a>
              ) : (
                <span>N/A</span>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 pt-1">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Next Follow-up
              </span>
              <div
                className="inline-flex w-fit items-center rounded-md border px-2 py-1 text-[10px] font-bold shadow-xs"
                style={{
                  backgroundColor: `${statusColor}1A`,
                  color: statusColor,
                  borderColor: `${statusColor}33`,
                }}
                title="Next follow-up date"
              >
                <CalendarDays className="mr-1.5 h-3 w-3 shrink-0" />
                <span>{formatFollowUpDate(followUp.due_at, "dd MMM, yyyy h:mm a")}</span>
              </div>
            </div>

            {followUp.address && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-7 w-7 shrink-0 rounded-lg bg-muted/30 flex items-center justify-center cursor-help border border-border/40">
                      <MapPin className="h-3.5 w-3.5 text-[#67B239]" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs leading-relaxed">{followUp.address}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div
            className="flex items-start gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 px-2 py-1.5 text-[11px] leading-snug"
            title={latestNote || "No note"}
          >
            <StickyNote className="h-3.5 w-3.5 shrink-0 mt-px text-amber-700 dark:text-amber-400" />
            {latestNote ? (
              <span className="line-clamp-2 wrap-anywhere text-amber-900 dark:text-amber-200">
                {latestNote}
              </span>
            ) : (
              <span className="italic text-muted-foreground">No note</span>
            )}
          </div>

          <div className="pt-2.5 border-t border-border/40 flex items-center justify-between">
            <div
              className="flex items-center gap-2 min-w-0"
              title={`Assigned to ${followUp.agent_name}`}
            >
              <Avatar className="h-7 w-7 ring-2 ring-background border border-border/40 shadow-xs">
                <AvatarImage src={followUp.agent_avatar || undefined} alt={followUp.agent_name} />
                <AvatarFallback className="text-[9px] font-bold bg-[#67B239]/10 text-[#55962e]">
                  {getInitials(followUp.agent_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-bold text-foreground/80 truncate max-w-24">
                {followUp.agent_name}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Follow-up actions"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-[#67B239] hover:bg-[#67B239]/5 cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onAddUpdate(followUp)} className="cursor-pointer">
                  <MessageSquarePlus className="h-4 w-4" />
                  Add Update
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onViewTimeline(followUp)}
                  className="cursor-pointer"
                >
                  <StickyNote className="h-4 w-4" />
                  View Timeline
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(followUp)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Record
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
