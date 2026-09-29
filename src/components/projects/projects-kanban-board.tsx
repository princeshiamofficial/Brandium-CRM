"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, format, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  ChevronsUpDown,
  ClipboardCheck,
  Code,
  Download,
  Film,
  Loader2,
  Megaphone,
  NotebookPen,
  PackageCheck,
  PenLine,
  User as UserIcon,
  Users as UsersIcon,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { crmUsersQueryOptions, type CrmUser } from "@/lib/admin-users";
import {
  ORDER_STATUSES,
  ORDER_SUBMITTED_STATUS_ID,
  ordersQueryOptions,
  resolveOrderStatus,
  useAssignStageMutation,
  useUpdateOrderStatusMutation,
  type CrmOrder,
} from "@/lib/orders";
import { DateRangePicker3 } from "@/components/dashboard/date-range-picker3";
import { AssignStageDialog, getInitials } from "@/components/orders/assign-stage-dialog";
import { KanbanColumn } from "./kanban-column";
import { getStageStartedAt } from "./project-card";

const STAGE_ICONS: Record<string, LucideIcon> = {
  "order-submitted": ClipboardCheck,
  "script-writer": PenLine,
  "content-planner": NotebookPen,
  videographer: Video,
  "video-graphy-complete": CheckCircle2,
  "video-editor": Film,
  marketer: Megaphone,
  developer: Code,
  delivered: PackageCheck,
};

const COLUMN_IDS = new Set(ORDER_STATUSES.map((s) => s.id));

/** Column for an order; legacy statuses outside the workflow land in Order Submitted. */
const columnIdFor = (order: CrmOrder) => {
  const id = resolveOrderStatus(order.status).id;
  return COLUMN_IDS.has(id) ? id : ORDER_SUBMITTED_STATUS_ID;
};

const toCsvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** Clone of ERPAPP `ProjectsKanbanClient2.tsx`: every order is a card in its stage column. */
export function ProjectsKanbanBoard() {
  const { user, profile, isAdmin } = useAuth();
  const {
    data: ordersData,
    isLoading,
    isFetching,
  } = useQuery({
    ...ordersQueryOptions(user?.id, isAdmin),
    refetchInterval: 30000,
  });
  const { data: usersData } = useQuery(crmUsersQueryOptions());
  const orders = useMemo(() => ordersData || [], [ordersData]);
  const users = useMemo(() => (usersData as CrmUser[]) || [], [usersData]);

  const updateStatusMutation = useUpdateOrderStatusMutation();
  const assignStageMutation = useAssignStageMutation();
  const changedByName = profile?.full_name || "Admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [selectedUserIdFilter, setSelectedUserIdFilter] = useState("all");
  const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);
  const [draggingOrder, setDraggingOrder] = useState<CrmOrder | null>(null);
  const [stageAssign, setStageAssign] = useState<{ order: CrmOrder; statusId: string } | null>(
    null,
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const selectedUser = users.find((u) => u.id === selectedUserIdFilter);

  const filteredOrders = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      if (
        selectedUserIdFilter !== "all" &&
        order.crm_user_id !== selectedUserIdFilter &&
        order.designer_id !== selectedUserIdFilter
      ) {
        return false;
      }
      if (
        term &&
        ![
          order.company_name,
          order.job_id,
          order.order_number,
          order.crm_user_name,
          order.designer_name,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term))
      ) {
        return false;
      }
      if (selectedDateRange?.from) {
        const start = startOfDay(selectedDateRange.from).getTime();
        const end = endOfDay(selectedDateRange.to || selectedDateRange.from).getTime();
        const t = new Date(order.created_at).getTime();
        if (t < start || t > end) return false;
      }
      return true;
    });
  }, [orders, debouncedSearchTerm, selectedDateRange, selectedUserIdFilter]);

  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, CrmOrder[]> = {};
    ORDER_STATUSES.forEach((s) => (grouped[s.id] = []));
    // Starred first (most stars), then newest stage entry first — like ERPAPP
    const sorted = [...filteredOrders].sort((a, b) => {
      if (a.is_starred !== b.is_starred) return b.is_starred - a.is_starred;
      return new Date(getStageStartedAt(b)).getTime() - new Date(getStageStartedAt(a)).getTime();
    });
    sorted.forEach((order) => grouped[columnIdFor(order)]?.push(order));
    return grouped;
  }, [filteredOrders]);

  const handleDropOrder = (orderId: string, statusId: string) => {
    setDraggingOrder(null);
    const order = orders.find((o) => o.id === orderId);
    if (!order || columnIdFor(order) === statusId) return;
    const target = resolveOrderStatus(statusId);
    if (target.assignable) {
      setStageAssign({ order, statusId });
      return;
    }
    updateStatusMutation.mutate({ order, statusId, changedByName });
  };

  const handleExport = (statusId: string) => {
    const stage = resolveOrderStatus(statusId);
    const rows = ordersByStatus[statusId] || [];
    if (rows.length === 0) {
      toast("No Data", {
        description: `There are no projects in the '${stage.name}' stage to export.`,
      });
      return;
    }
    const header = ["Job ID", "Company Name", "Assignee", "Assigned To", "Status", "Created At"];
    const lines = rows.map((o) =>
      [
        o.job_id || o.order_number,
        o.company_name,
        o.crm_user_name || "N/A",
        o.designer_name || "N/A",
        stage.name,
        format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
      ]
        .map((v) => toCsvCell(String(v)))
        .join(","),
    );
    const csv = [header.map(toCsvCell).join(","), ...lines].join("\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${stage.name.toLowerCase().replace(/ /g, "_")}_projects_export.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Export Started", {
      description: `Your ${stage.name} projects data is being downloaded.`,
    });
  };

  const handleCardDragMove = useCallback(
    (e: DragEvent) => {
      if (!draggingOrder || !scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const rect = container.getBoundingClientRect();
      const SCROLL_THRESHOLD = 60;
      const SCROLL_SPEED = 15;

      const distFromRight = rect.right - e.clientX;
      const distFromLeft = e.clientX - rect.left;

      if (distFromRight < SCROLL_THRESHOLD && container.scrollLeft < container.scrollWidth - container.clientWidth) {
        if (!autoScrollIntervalRef.current) {
          autoScrollIntervalRef.current = setInterval(() => {
            container.scrollLeft += SCROLL_SPEED;
          }, 16);
        }
      } else if (distFromLeft < SCROLL_THRESHOLD && container.scrollLeft > 0) {
        if (!autoScrollIntervalRef.current) {
          autoScrollIntervalRef.current = setInterval(() => {
            container.scrollLeft -= SCROLL_SPEED;
          }, 16);
        }
      } else {
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
          autoScrollIntervalRef.current = null;
        }
      }
    },
    [draggingOrder],
  );

  useEffect(() => {
    if (draggingOrder) {
      document.addEventListener("dragover", handleCardDragMove);
      return () => {
        document.removeEventListener("dragover", handleCardDragMove);
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
          autoScrollIntervalRef.current = null;
        }
      };
    }
  }, [draggingOrder, handleCardDragMove]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-card border-border/50 pr-8 h-10"
          />
          {isFetching && (
            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {isAdmin && (
          <Popover open={isUserFilterOpen} onOpenChange={setIsUserFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isUserFilterOpen}
                className="w-full justify-between bg-card border-border/50 h-10 cursor-pointer"
              >
                <span className="flex items-center min-w-0">
                  {selectedUser ? (
                    <Avatar className="mr-2 h-6 w-6">
                      <AvatarImage src={selectedUser.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="truncate">{selectedUser?.name || "All Users"}</span>
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
              <Command>
                <CommandInput placeholder="Search user..." />
                <CommandList>
                  <CommandEmpty>No user found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all-users"
                      onSelect={() => {
                        setSelectedUserIdFilter("all");
                        setIsUserFilterOpen(false);
                      }}
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedUserIdFilter === "all" ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <UsersIcon className="h-5 w-5 text-muted-foreground" />
                      <span>All Users</span>
                    </CommandItem>
                    {users.map((u) => (
                      <CommandItem
                        key={u.id}
                        value={u.name}
                        onSelect={() => {
                          setSelectedUserIdFilter(u.id);
                          setIsUserFilterOpen(false);
                        }}
                        className="cursor-pointer flex items-center gap-2"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            selectedUserIdFilter === u.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={u.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{getInitials(u.name)}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{u.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto capitalize">
                          ({(u.role || "").toLowerCase()})
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
        <DateRangePicker3
          initialRange={selectedDateRange}
          onDateRangeChange={(range) => setSelectedDateRange(range)}
          className="bg-card border-border/50 w-full sm:w-full"
        />
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={isLoading}
                className="bg-card border-border/50 w-full h-10 cursor-pointer"
              >
                {isFetching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select Stage to Export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ORDER_STATUSES.map((stage) => {
                const Icon = STAGE_ICONS[stage.id] || ClipboardCheck;
                return (
                  <DropdownMenuItem
                    key={stage.id}
                    onClick={() => handleExport(stage.id)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4 opacity-70" />
                    {stage.name}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex space-x-4 h-full min-w-max">
          {ORDER_STATUSES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              title={stage.name}
              icon={STAGE_ICONS[stage.id] || ClipboardCheck}
              color={stage.color}
              orders={ordersByStatus[stage.id] || []}
              isLoading={isLoading}
              draggingOrderId={draggingOrder?.id || null}
              onDropOrder={handleDropOrder}
              onAssign={(order) => setStageAssign({ order, statusId: columnIdFor(order) })}
              onCardDragStart={setDraggingOrder}
              onCardDragEnd={() => setDraggingOrder(null)}
            />
          ))}
        </div>
        {filteredOrders.length === 0 && !isLoading && (
          <div className="text-center py-10 text-muted-foreground mt-8">
            <ClipboardCheck className="mx-auto h-16 w-16 opacity-30 mb-4" />
            <p className="text-xl font-semibold">No projects found.</p>
            <p className="text-sm">
              {searchTerm
                ? "Try adjusting your filters or search term."
                : "Get started by adding new orders."}
            </p>
          </div>
        )}
      </div>

      {stageAssign && (
        <AssignStageDialog
          key={`${stageAssign.order.id}-${stageAssign.statusId}`}
          open
          onOpenChange={(open) => !open && setStageAssign(null)}
          order={stageAssign.order}
          statusId={stageAssign.statusId}
          users={users}
          onAssign={async (assignee) => {
            await assignStageMutation.mutateAsync({
              order: stageAssign.order,
              statusId: stageAssign.statusId,
              assigneeId: assignee.id,
              assigneeName: assignee.name,
              changedByName,
            });
            setStageAssign(null);
          }}
          isSaving={assignStageMutation.isPending}
        />
      )}
    </div>
  );
}
