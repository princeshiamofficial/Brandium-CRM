"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, endOfMonth, format, startOfDay, startOfMonth } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Check,
  Download,
  Edit3,
  Eye,
  Hourglass,
  Loader2,
  MoreVertical,
  Package as PackageIcon,
  PlusCircle,
  Search,
  Trash2,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { crmUsersQueryOptions, type CrmUser } from "@/lib/admin-users";
import { servicesQueryOptions } from "@/lib/services";
import {
  getContrastTextColor,
  ORDER_STATUSES,
  ordersQueryOptions,
  requiresStatusReason,
  resolveOrderStatus,
  useAssignStageMutation,
  useDeleteOrderMutation,
  useSaveOrderMutation,
  useUpdateOrderStatusMutation,
  type CrmOrder,
} from "@/lib/orders";
import { CreateOrderDialog } from "@/components/orders/create-order-dialog";
import { EditOrderDialog } from "@/components/orders/edit-order-dialog";
import { DateRangePicker3 } from "@/components/dashboard/date-range-picker3";
import { AssignStageDialog, getInitials } from "@/components/orders/assign-stage-dialog";
import { StatusReasonDialog } from "@/components/orders/status-reason-dialog";

const ITEMS_PER_PAGE = 25;

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "Invalid Date" : format(d, "d MMM yyyy");
};

function PersonCell({ name, avatar }: { name: string; avatar: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={avatar || undefined} />
        <AvatarFallback className="text-[10px] bg-[#67B239]/10 text-[#55962e]">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <span>{name}</span>
    </div>
  );
}

/** Clone of ERPAPP `/orders` list, backed by MySQL `orders`. */
export default function OrdersPage() {
  const router = useRouter();
  const { user, profile, isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<CrmOrder | null>(null);
  const [stageAssign, setStageAssign] = useState<{ order: CrmOrder; statusId: string } | null>(
    null,
  );
  const [reasonTarget, setReasonTarget] = useState<{ order: CrmOrder; statusId: string } | null>(
    null,
  );
  const [orderToDelete, setOrderToDelete] = useState<CrmOrder | null>(null);

  const { data: ordersData, isLoading } = useQuery(ordersQueryOptions(user?.id, isAdmin));
  const { data: usersData } = useQuery(crmUsersQueryOptions());
  const { data: servicesData } = useQuery(servicesQueryOptions());

  const orders = useMemo(() => ordersData || [], [ordersData]);
  const users = useMemo(() => (usersData as CrmUser[]) || [], [usersData]);
  const services = useMemo(() => servicesData || [], [servicesData]);

  const saveOrderMutation = useSaveOrderMutation();
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const assignStageMutation = useAssignStageMutation();
  const deleteOrderMutation = useDeleteOrderMutation();
  const changedByName = profile?.full_name || "Admin";

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    // Search ignores the date range, like ERPAPP
    const from = !term && dateRange?.from ? startOfDay(dateRange.from).getTime() : null;
    const to = !term && dateRange?.to ? endOfDay(dateRange.to).getTime() : null;
    return orders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      if (!term) return true;
      return [o.order_number, o.company_name, o.job_id, o.phone, o.crm_user_name, o.designer_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [orders, searchTerm, dateRange]);

  const totalOrders = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const pageNumbers = (() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    let start = Math.max(1, safePage - 2);
    let end = Math.min(totalPages, safePage + 2);
    if (safePage < 3) end = 5;
    else if (safePage > totalPages - 2) start = totalPages - 4;
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  })();

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full min-w-0">
      <div className="flex items-center justify-between gap-2 w-full min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0a2e5c] dark:text-slate-100">
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View, track, and manage all customer orders.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          disabled={isLoading}
          className="bg-[#67B239] hover:bg-[#5aa030] text-white rounded-md shadow-md hover:shadow-lg transition-shadow font-semibold h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm shrink-0 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
          ) : (
            <PlusCircle className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          )}
          <span>{isLoading ? "Loading..." : "Create Order"}</span>
        </Button>
      </div>

      <Card className="shadow-xl border bg-card rounded-lg overflow-hidden w-full max-w-full min-w-0 py-0 gap-0">
        <CardHeader className="border-b p-3.5 sm:p-5 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 min-w-0">
            <div className="grow" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DateRangePicker3
                initialRange={dateRange}
                onDateRangeChange={(range) => setDateRange(range)}
                compactOnMobile
                className="h-10"
              />
              <div className="relative flex-1 sm:w-64 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background h-10 rounded-md w-full"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 w-full max-w-full min-w-0 overflow-hidden">
          <div className="w-full max-w-full overflow-x-auto custom-scrollbar">
            <Table className="w-full min-w-175">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Order ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CRM Contact</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={`skel-order-${i}`}>
                      <TableCell className="pl-6">
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-28 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Skeleton className="h-9 w-9 inline-block rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading &&
                  paginatedOrders.map((order) => {
                    const status = resolveOrderStatus(order.status);
                    return (
                      <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="pl-6">
                          <Link
                            href={`/track/${order.order_number}`}
                            className="font-semibold text-[#67B239] hover:text-[#5aa030] dark:text-[#7ac142] hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {order.job_id ? `${order.job_id} • ` : ""}
                          {order.company_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="border-transparent"
                            style={{
                              backgroundColor: status.color,
                              color: getContrastTextColor(status.color),
                            }}
                          >
                            {status.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {order.crm_user_name ? (
                            <PersonCell name={order.crm_user_name} avatar={order.crm_user_avatar} />
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {order.designer_name ? (
                            <PersonCell name={order.designer_name} avatar={order.designer_avatar} />
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell className="pr-6 text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 cursor-pointer"
                                title="Order Actions"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => setOrderToEdit(order)}
                                className="cursor-pointer"
                              >
                                <Edit3 className="mr-2 h-4 w-4" /> Edit Order
                              </DropdownMenuItem>
                              {status.assignable && (
                                <DropdownMenuItem
                                  onSelect={() => setStageAssign({ order, statusId: status.id })}
                                  className="cursor-pointer"
                                >
                                  <Users2 className="mr-2 h-4 w-4" />
                                  {order.designer_id ? "Re-assign" : "Assign"} {status.name}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="cursor-pointer">
                                  <Hourglass className="mr-2 h-4 w-4" /> Change Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="p-1 space-y-0.5">
                                  {ORDER_STATUSES.map((st) => (
                                    <DropdownMenuItem
                                      key={st.id}
                                      onSelect={() =>
                                        st.assignable
                                          ? setStageAssign({ order, statusId: st.id })
                                          : requiresStatusReason(st.id)
                                            ? setReasonTarget({ order, statusId: st.id })
                                            : updateStatusMutation.mutate({
                                                order,
                                                statusId: st.id,
                                                changedByName,
                                              })
                                      }
                                      className="cursor-pointer focus:opacity-90"
                                      style={{
                                        backgroundColor: st.color,
                                        color: getContrastTextColor(st.color),
                                      }}
                                    >
                                      {st.name}
                                      {status.id === st.id && (
                                        <Check className="ms-auto size-3.5" />
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/track/${order.order_number}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/track/${order.order_number}?print=1`}>
                                  <Download className="mr-2 h-4 w-4" /> Invoice
                                </Link>
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={() => setOrderToDelete(order)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {!isLoading && paginatedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 h-75">
                      <PackageIcon className="mx-auto h-12 w-12 opacity-50 mb-3 text-muted-foreground" />
                      <p className="text-lg text-muted-foreground font-medium">
                        {searchTerm ? "No orders match your search." : "No orders found."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm
                          ? "Try a different search term."
                          : "Start by creating a new one!"}
                      </p>
                      {!searchTerm && (
                        <Button
                          size="sm"
                          onClick={() => setIsCreateOpen(true)}
                          className="mt-4 bg-[#67B239] hover:bg-[#5aa030] text-white cursor-pointer"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Create Order
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="py-4 border-t flex-col sm:flex-row items-center justify-between gap-4 min-w-0">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Showing{" "}
            <span className="font-medium text-foreground">{totalOrders ? pageStart + 1 : 0}</span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(pageStart + ITEMS_PER_PAGE, totalOrders)}
            </span>{" "}
            of <span className="font-medium text-foreground">{totalOrders}</span> orders
          </div>
          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto flex-wrap">
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.max(1, safePage - 1));
                    }}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {pageNumbers.map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={safePage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        className={cn(
                          safePage === page &&
                            "bg-[#67B239] text-white hover:bg-[#5aa030] hover:text-white",
                        )}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.min(totalPages, safePage + 1));
                    }}
                    aria-disabled={safePage === totalPages}
                    className={safePage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardFooter>
      </Card>

      {isCreateOpen && (
        <CreateOrderDialog
          open
          onOpenChange={setIsCreateOpen}
          services={services}
          allOrders={orders}
          onSave={async (data) => {
            const result = await saveOrderMutation.mutateAsync(data);
            setIsCreateOpen(false);
            if (result.order_number) router.push(`/track/${result.order_number}`);
          }}
          isSaving={saveOrderMutation.isPending}
        />
      )}

      {orderToEdit && (
        <EditOrderDialog
          key={`${orderToEdit.id}-${orderToEdit.updated_at}`}
          open
          onOpenChange={(open) => !open && setOrderToEdit(null)}
          order={orderToEdit}
          services={services}
          onSave={async (data) => {
            await saveOrderMutation.mutateAsync(data);
            setOrderToEdit(null);
          }}
          isSaving={saveOrderMutation.isPending}
        />
      )}

      {reasonTarget && (
        <StatusReasonDialog
          key={`${reasonTarget.order.id}-${reasonTarget.statusId}`}
          order={reasonTarget.order}
          statusId={reasonTarget.statusId}
          isSaving={updateStatusMutation.isPending}
          onCancel={() => setReasonTarget(null)}
          onConfirm={(reason) =>
            updateStatusMutation.mutate(
              { ...reasonTarget, changedByName, reason },
              { onSuccess: () => setReasonTarget(null) },
            )
          }
        />
      )}

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

      <AlertDialog
        open={Boolean(orderToDelete)}
        onOpenChange={(open) => !open && !deleteOrderMutation.isPending && setOrderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash Bin?</AlertDialogTitle>
            <AlertDialogDescription>
              Order &quot;<span className="font-semibold">{orderToDelete?.order_number}</span>
              &quot; will be moved to the trash bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOrderMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={deleteOrderMutation.isPending}
              onClick={async (e) => {
                e.preventDefault();
                if (!orderToDelete) return;
                await deleteOrderMutation.mutateAsync(orderToDelete);
                setOrderToDelete(null);
              }}
            >
              {deleteOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving to Trash...
                </>
              ) : (
                "Move to Trash"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
