"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getContrastTextColor, type CrmOrder } from "@/lib/orders";
import { ProjectCard } from "./project-card";

const PROJECTS_PER_PAGE = 20;

interface KanbanColumnProps {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  orders: CrmOrder[];
  isLoading: boolean;
  draggingOrderId: string | null;
  onDropOrder: (orderId: string, statusId: string) => void;
  onAssign: (order: CrmOrder) => void;
  onCardDragStart: (order: CrmOrder) => void;
  onCardDragEnd: () => void;
}

/** Clone of ERPAPP `KanbanColumn.tsx`, using native HTML5 drag-and-drop. */
export function KanbanColumn({
  id,
  title,
  icon: Icon,
  color,
  orders,
  isLoading,
  draggingOrderId,
  onDropOrder,
  onAssign,
  onCardDragStart,
  onCardDragEnd,
}: KanbanColumnProps) {
  const [visibleCount, setVisibleCount] = useState(PROJECTS_PER_PAGE);
  const [isOver, setIsOver] = useState(false);
  const visibleOrders = orders.slice(0, visibleCount);
  const textColor = getContrastTextColor(color);

  return (
    <div
      onDragOver={(e) => {
        if (!draggingOrderId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!isOver) setIsOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const orderId = e.dataTransfer.getData("text/plain") || draggingOrderId;
        if (orderId) onDropOrder(orderId, id);
      }}
      className={cn(
        "w-64 shrink-0 flex flex-col bg-muted/30 rounded-lg overflow-hidden transition-all duration-200 ease-in-out h-full border",
        isOver
          ? "border-[#67B239] ring-2 ring-[#67B239] shadow-xl scale-[1.01]"
          : "border-border/30 shadow-xs",
      )}
    >
      <div
        className="px-3 py-2.5 flex items-center justify-between rounded-t-lg shrink-0"
        style={{ backgroundColor: color, color: textColor }}
      >
        <div className="flex items-center">
          <Icon className="mr-2 h-4 w-4" />
          <h2 className="font-semibold text-sm tracking-wide">{title}</h2>
        </div>
        <span className="text-xs px-2 py-0.5 bg-black/20 rounded-full">
          {isLoading ? <Skeleton className="h-4 w-4 inline-block" /> : orders.length}
        </span>
      </div>
      <ScrollArea className="flex-1 min-h-0 w-full">
        <div className="p-3 min-h-full space-y-3 w-full">
          {isLoading && orders.length === 0 ? (
            <>
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </>
          ) : visibleOrders.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-xs text-muted-foreground text-center italic">
                No projects in this stage.
              </p>
            </div>
          ) : (
            visibleOrders.map((order) => (
              <ProjectCard
                key={order.id}
                order={order}
                isDragging={draggingOrderId === order.id}
                onAssign={onAssign}
                onDragStart={onCardDragStart}
                onDragEnd={onCardDragEnd}
              />
            ))
          )}
          {visibleCount < orders.length && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setVisibleCount((c) => c + PROJECTS_PER_PAGE)}
              >
                Load {Math.min(PROJECTS_PER_PAGE, orders.length - visibleCount)} more
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
