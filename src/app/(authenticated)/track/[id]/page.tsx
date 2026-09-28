"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import JsBarcode from "jsbarcode";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Building,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Gift,
  Info,
  Layers,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Percent,
  Phone,
  Printer,
  ReceiptText,
  ScrollText,
  Send,
  StickyNote,
  Trash2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { crmUsersQueryOptions, type CrmUser } from "@/lib/admin-users";
import {
  orderCommentsQueryOptions,
  orderDetailQueryOptions,
  resolveOrderStatus,
  useAddOrderCommentMutation,
  useDeleteOrderCommentMutation,
  type OrderComment,
} from "@/lib/orders";
import { BRANDIUM_TERMS } from "@/components/invoices/torn-paper-terms";
import { StatusInfoIcon } from "@/components/sales/status-info-icon";
import { getInitials } from "@/components/orders/assign-stage-dialog";

const MAX_INITIAL_REPLIES_TO_SHOW = 1;

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(value);
};

const formatDate = (value: string | null | undefined, relative = false, includeTime = true) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Invalid Date";
  if (relative) return `${formatDistanceToNowStrict(d)} ago`;
  return format(d, includeTime ? "d MMM, yyyy 'at' hh:mm a" : "d MMM, yyyy");
};

/** Neutral info box (Brandium's `bg-secondary` is brand green, ERPAPP's is gray). */
const INFO_BOX_CLASS =
  "space-y-1 p-3 bg-slate-100/80 dark:bg-slate-800/60 border border-border/20 rounded-lg shadow-xs";

/** Clone of ERPAPP `/track/[trackingId]` (core sections), for logged-in Brandium users. */
export default function OrderTrackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = params ? params["id"] : undefined;
  const orderRef = Array.isArray(rawId) ? String(rawId[0]) : String(rawId || "");
  const { user, profile, role, isAdmin } = useAuth();

  const { data: order, isLoading } = useQuery(orderDetailQueryOptions(orderRef));
  const { data: comments = [] } = useQuery(orderCommentsQueryOptions(order?.id));
  const { data: usersData } = useQuery(crmUsersQueryOptions());
  const usersById = useMemo(() => {
    const map = new Map<string, CrmUser>();
    ((usersData as CrmUser[]) || []).forEach((u) => map.set(u.id, u));
    return map;
  }, [usersData]);

  const addCommentMutation = useAddOrderCommentMutation();
  const deleteCommentMutation = useDeleteOrderCommentMutation();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<{
    parentId: string;
    targetName: string;
    formUnderId: string;
  } | null>(null);
  const [currentReplyText, setCurrentReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [commentToDelete, setCommentToDelete] = useState<OrderComment | null>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  const myName = profile?.full_name || user?.email || "User";
  const myAvatar = user?.id ? usersById.get(user.id)?.avatar_url : null;

  // Barcode svg only mounts after loading, so the loading flag must be a dependency
  useEffect(() => {
    if (!barcodeRef.current || !order?.order_number) return;
    try {
      JsBarcode(barcodeRef.current, order.order_number, {
        format: "CODE128",
        displayValue: false,
        width: 1.4,
        height: 34,
        margin: 0,
      });
    } catch (e) {
      console.error("JsBarcode generation error:", e);
    }
  }, [order?.order_number, isLoading]);

  // "Invoice" action on /orders opens this page with ?print=1
  useEffect(() => {
    if (order && searchParams?.get("print") === "1") {
      const timer = setTimeout(() => window.print(), 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [order, searchParams]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-card rounded-2xl border shadow-xs space-y-4">
        <Package className="size-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-sm text-muted-foreground">No order matches ID &quot;{orderRef}&quot;.</p>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/orders">
            <ArrowLeft className="size-4 mr-1.5" /> Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  const currentStatus = resolveOrderStatus(order.status);
  const history = [...order.status_history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const lastStatusEntry = history[history.length - 1];

  const orderSubtotal = order.items.reduce(
    (acc, item) => acc + (item.isGift ? 0 : Number(item.lineItemTotalPrice) || 0),
    0,
  );
  const giftTotal = order.items.reduce(
    (acc, item) => acc + (item.isGift ? Number(item.lineItemTotalPrice) || 0 : 0),
    0,
  );
  const effectiveDiscount = order.discount_amount;
  const netPayable = orderSubtotal - effectiveDiscount;
  const payments = [...order.advance_payments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const totalAdvancePaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const shippingCharge = order.shipping_charge;
  const grandTotal = netPayable + shippingCharge;
  const amountDue = grandTotal - totalAdvancePaid;
  const showPaidBadge = grandTotal > 0 && amountDue <= 0.01;

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const repliesByParent = comments.reduce<Record<string, OrderComment[]>>((acc, c) => {
    if (c.parent_id) (acc[c.parent_id] ||= []).push(c);
    return acc;
  }, {});

  const postComment = async (text: string, parentId: string | null) => {
    await addCommentMutation.mutateAsync({
      order_id: order.id,
      parent_id: parentId,
      user_id: user?.id || null,
      user_name: myName,
      user_role: role ? role.toUpperCase() : null,
      text: text.trim(),
    });
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await postComment(newComment, null);
    setNewComment("");
  };

  const handleReplySubmit = async () => {
    if (!replyingTo || !currentReplyText.trim()) return;
    await postComment(currentReplyText, replyingTo.parentId);
    setReplyingTo(null);
    setCurrentReplyText("");
  };

  const renderComment = (comment: OrderComment, isReply = false, parentCommentId?: string) => {
    const author = comment.user_id ? usersById.get(comment.user_id) : undefined;
    const visibleReplies = repliesByParent[comment.id] || [];
    const isExpanded = expandedReplies[comment.id] || false;
    const repliesToRender =
      isExpanded || visibleReplies.length <= MAX_INITIAL_REPLIES_TO_SHOW
        ? visibleReplies
        : visibleReplies.slice(0, MAX_INITIAL_REPLIES_TO_SHOW);
    const hiddenCount = visibleReplies.length - MAX_INITIAL_REPLIES_TO_SHOW;

    return (
      <div
        key={comment.id}
        className={cn("flex space-x-2.5 sm:space-x-3", isReply && "ml-8 sm:ml-10")}
      >
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-[#67B239]/30 shadow-xs shrink-0 mt-0.5">
          <AvatarImage src={author?.avatar_url || undefined} alt={comment.user_name} />
          <AvatarFallback className="bg-[#67B239]/10 text-[#55962e] text-xs font-semibold">
            {getInitials(comment.user_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-muted dark:bg-muted/60 px-3.5 py-2.5 rounded-xl shadow-xs transition-colors border border-transparent hover:border-[#67B239]/30">
            <div className="flex items-baseline space-x-1.5">
              <p className="text-sm font-semibold text-foreground">{comment.user_name}</p>
              {comment.user_role && (
                <span className="text-xs text-muted-foreground">({comment.user_role})</span>
              )}
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap mt-0.5">{comment.text}</p>
          </div>
          <div className="flex items-center space-x-1 mt-1.5 pl-1 text-xs">
            <button
              type="button"
              onClick={() => {
                const opening = !replyingTo || replyingTo.formUnderId !== comment.id;
                setReplyingTo(
                  opening
                    ? {
                        parentId: isReply && parentCommentId ? parentCommentId : comment.id,
                        targetName: comment.user_name,
                        formUnderId: comment.id,
                      }
                    : null,
                );
                setCurrentReplyText(opening ? `@${comment.user_name.replace(/\s+/g, "")} ` : "");
                if (opening) {
                  // Put the caret after the prefilled @mention
                  setTimeout(() => {
                    const el = replyTextareaRef.current;
                    if (!el) return;
                    el.focus();
                    el.setSelectionRange(el.value.length, el.value.length);
                  }, 0);
                }
              }}
              className="font-medium text-muted-foreground hover:text-[#67B239] hover:bg-[#67B239]/10 px-1.5 py-0.5 rounded-sm transition-colors cursor-pointer"
            >
              Reply
            </button>
            <span className="text-muted-foreground">&middot;</span>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setCommentToDelete(comment)}
                  className="font-medium text-destructive hover:bg-destructive/10 px-1.5 py-0.5 rounded-sm transition-colors flex items-center gap-1 cursor-pointer"
                  title="Delete Comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
                <span className="text-muted-foreground">&middot;</span>
              </>
            )}
            <span className="text-muted-foreground" title={formatDate(comment.created_at)}>
              {formatDate(comment.created_at, true)}
            </span>
          </div>
          {replyingTo?.formUnderId === comment.id && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReplySubmit();
              }}
              className="mt-2.5 flex items-start space-x-2.5 pl-0 sm:pl-1"
            >
              <Avatar className="h-7 w-7 border border-border/40 shrink-0 mt-0.5 shadow-xs">
                <AvatarImage src={myAvatar || undefined} alt="Your avatar" />
                <AvatarFallback className="bg-muted text-xs font-semibold">
                  {getInitials(myName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  ref={replyTextareaRef}
                  placeholder={`Replying to ${replyingTo.targetName}...`}
                  value={currentReplyText}
                  onChange={(e) => setCurrentReplyText(e.target.value)}
                  className="min-h-12.5 sm:min-h-15 text-sm bg-background/70 border-border/50 rounded-lg shadow-inner p-2.5"
                  disabled={addCommentMutation.isPending}
                  rows={2}
                />
                <div className="flex justify-end items-center mt-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2.5 mr-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setReplyingTo(null);
                      setCurrentReplyText("");
                    }}
                    disabled={addCommentMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={addCommentMutation.isPending || !currentReplyText.trim()}
                    className="bg-[#67B239] hover:bg-[#5aa030] text-white text-xs h-7 px-3 rounded-md"
                  >
                    {addCommentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reply"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
          {repliesToRender.length > 0 && (
            <div className="mt-3 space-y-3">
              {repliesToRender.map((reply) => renderComment(reply, true, comment.id))}
            </div>
          )}
          {!isReply && hiddenCount > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setExpandedReplies((prev) => ({ ...prev, [comment.id]: !isExpanded }))}
              className="text-xs font-medium text-[#67B239] hover:text-[#5aa030] mt-2 pl-1"
            >
              {isExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
              )}
              {isExpanded
                ? "Hide Replies"
                : `View ${hiddenCount} more ${hiddenCount === 1 ? "reply" : "replies"}`}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <main className="max-w-4xl mx-auto space-y-4 sm:space-y-5 pb-6 print:space-y-0">
        <div className="flex items-center justify-between gap-2 print:hidden">
          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
            <Link href="/orders">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Orders
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="cursor-pointer"
          >
            <Printer className="mr-1.5 h-4 w-4" /> Print Invoice
          </Button>
        </div>

        {/* Current Status header */}
        <div className="shadow-2xl overflow-hidden border border-border/40 bg-card hover:shadow-[#67B239]/10 transition-shadow duration-300 rounded-xl print:hidden">
          <div className="bg-card py-2 px-3 sm:py-2.5 sm:px-4 flex items-start gap-2">
            <StatusInfoIcon className="h-14 w-14 shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground flex flex-wrap items-center gap-2 leading-tight">
                <span>Current Status:</span>
                <span
                  className="inline-flex items-center text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full border shadow-xs"
                  style={{
                    backgroundColor: `${currentStatus.color}15`,
                    color: currentStatus.color,
                    borderColor: `${currentStatus.color}30`,
                  }}
                >
                  {currentStatus.name}
                </span>
              </h3>
              <div className="text-xs text-muted-foreground mt-2">
                {lastStatusEntry
                  ? `Last status update: ${formatDate(lastStatusEntry.timestamp, true)} by ${lastStatusEntry.changedByUserName}`
                  : "Status pending."}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice - Fixed A4 Dimensions with Letterhead */}
        <div className="w-full overflow-x-auto py-2 sm:py-4 flex justify-center print:p-0 print:overflow-visible print:block">
          <div
            className="relative w-[210mm] min-h-[297mm] mx-auto bg-card border border-border/40 rounded-xl shadow-2xl invoice-page overflow-hidden bg-cover bg-no-repeat bg-center print:shadow-none print:border-none print:rounded-none print:m-0 print:p-0 print:w-[210mm] print:h-[297mm] print:text-[13px] print:leading-tight pt-[38mm] pb-[30mm] px-[16mm] flex flex-col justify-between"
            style={{
              width: "210mm",
              minHeight: "297mm",
              backgroundImage: "url('/brandium_invoice_bg.jpg')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center top",
            }}
          >
            {/* Dark Mode Overlay */}
            <div className="hidden dark:block absolute inset-0 bg-slate-950/80 pointer-events-none z-0 print:hidden" />

            <div className="relative z-10 flex-1 flex flex-col justify-between">
              <div>
                {/* Bill To & Order Meta */}
                <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b border-border/20 print:mb-3 print:pb-2 print:break-inside-avoid items-start">
                  {/* Bill To Info */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-[#67B239]" />
                      <span>Bill To:</span>
                    </div>
                    <p className="text-base sm:text-lg font-bold text-foreground">
                      {order.job_id ? `${order.job_id} • ` : ""}
                      {order.company_name}
                    </p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {order.address && (
                        <p className="flex items-start gap-1.5 leading-relaxed">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                          <span>{order.address}</span>
                        </p>
                      )}
                      {order.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{order.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Meta Info */}
                  <div className="flex flex-col items-end justify-start space-y-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Order No:
                      </span>
                      <span className="font-mono font-bold text-base text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20">
                        #{order.order_number}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-[#67B239] shrink-0" />
                          <span>Order Date:</span>
                        </span>
                        <span className="font-semibold text-foreground whitespace-nowrap">
                          {formatDate(order.created_at, false)}
                        </span>
                      </div>

                      {order.delivery_date && (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>Delivery Date:</span>
                          </span>
                          <span className="font-semibold text-foreground whitespace-nowrap">
                            {formatDate(order.delivery_date, false, false)}
                          </span>
                        </div>
                      )}

                      <div className="flex sm:justify-end mt-1.5">
                        <svg ref={barcodeRef} className="object-contain" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Table */}
                <div className="mb-6 print:mb-2 print:break-inside-auto">
                  <h3 className="text-base font-semibold mb-3 print:mb-1 text-foreground flex items-center">
                    Order Items
                  </h3>
                  {order.items.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-border/30 bg-background/85 backdrop-blur-xs shadow-2xs">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-[52%]">
                              Service
                            </TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-center whitespace-nowrap w-[16%]">
                              Quantity
                            </TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap w-[16%]">
                              Unit Price
                            </TableHead>
                            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap pr-4 w-[16%]">
                              Total Price
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item, index) => (
                            <TableRow
                              key={item.id || index}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium text-card-foreground">
                                {item.model}
                              </TableCell>
                              <TableCell className="text-center text-card-foreground whitespace-nowrap">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right text-card-foreground whitespace-nowrap">
                                {formatCurrency(item.unitPrice)}
                              </TableCell>
                              <TableCell
                                className="text-right font-semibold text-card-foreground whitespace-nowrap pr-4"
                                style={
                                  item.isGift
                                    ? {
                                        textDecoration: "line-through",
                                        textDecorationColor: "#ef4444",
                                        color: "#6b7280",
                                      }
                                    : undefined
                                }
                              >
                                {formatCurrency(item.lineItemTotalPrice)}
                                {item.isGift && " (Gift)"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground border border-dashed border-border/40 rounded-md bg-slate-100/60 dark:bg-slate-800/40">
                      <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No service items specified for this order.
                    </div>
                  )}
                </div>

                {/* Order Notes */}
                {order.notes && (
                  <div className="mb-6 print:mb-2">
                    <h3 className="text-base font-semibold text-foreground mb-2 print:mb-1 flex items-center">
                      <StickyNote className="mr-2 h-4 w-4 text-[#67B239]" /> Order Notes:
                    </h3>
                    <Card className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/40 shadow-2xs">
                      <CardContent className="p-4 print:p-2 text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">
                        {order.notes}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Payments History */}
                {payments.length > 0 && (
                  <div className="mb-6 print:mb-2">
                    <h3 className="text-base font-semibold text-foreground mb-3 print:mb-1 flex items-center">
                      <ReceiptText className="mr-2 h-4 w-4 text-[#67B239]" /> Payments History
                    </h3>
                    <div className="overflow-x-auto rounded-lg border border-border/30 bg-background/85 backdrop-blur-xs shadow-2xs print:shadow-none">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/40 hover:bg-transparent">
                            <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                              Date
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                              Amount
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                              Method
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                              Notes
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-muted-foreground whitespace-nowrap h-9 px-3">
                              Recorded By
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((record) => (
                            <TableRow
                              key={record.id}
                              className="hover:bg-muted/50 transition-colors border-border/30"
                            >
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-2 px-3">
                                {formatDate(record.date, false)}
                              </TableCell>
                              <TableCell className="text-xs font-semibold text-emerald-600 print:text-emerald-700 whitespace-nowrap py-2 px-3">
                                {formatCurrency(record.amount)}
                              </TableCell>
                              <TableCell className="text-xs text-card-foreground whitespace-nowrap py-2 px-3">
                                {record.paymentMethod || "N/A"}
                              </TableCell>
                              <TableCell
                                className="text-xs text-muted-foreground whitespace-nowrap py-2 px-3"
                                title={record.notes || undefined}
                              >
                                {record.notes || "N/A"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-2 px-3">
                                {record.recordedByUserName || "N/A"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mt-6 pt-4 border-t border-border/30 print:mt-2 print:pt-2 print:break-inside-avoid">
                {/* Terms & Conditions (bottom-left) */}
                <div className="w-full sm:max-w-[55%]">
                  <h4 className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#0a2e5c] dark:text-slate-200">
                    <ScrollText className="size-3.5 text-[#67B239]" /> Terms & Conditions
                  </h4>
                  <ol className="list-decimal pl-4 space-y-0.5 text-[11px] leading-snug text-muted-foreground">
                    {BRANDIUM_TERMS.map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ol>
                </div>

                {/* Financial Summary Box (bottom-right) */}
                <div className="w-full sm:max-w-sm relative">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Items Total:</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(orderSubtotal)}
                    </span>
                  </div>

                  {giftTotal > 0 && (
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Gift className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                        Gift Value:
                      </span>
                      <span className="text-sm font-medium text-yellow-500">
                        {formatCurrency(giftTotal)}
                      </span>
                    </div>
                  )}

                  {effectiveDiscount > 0 && (
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Percent className="h-3.5 w-3.5 mr-1 text-red-500" /> Special Discount:
                      </span>
                      <span className="text-sm font-medium text-red-500">
                        - {formatCurrency(effectiveDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between mb-2 pt-1 border-t border-dashed border-border/40">
                    <span className="text-sm font-semibold text-foreground">Net Payable:</span>
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(netPayable)}
                    </span>
                  </div>

                  {shippingCharge > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Truck className="h-3.5 w-3.5 mr-1" />
                        Shipping Charge:
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        + {formatCurrency(shippingCharge)}
                      </span>
                    </div>
                  )}

                  {totalAdvancePaid > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {showPaidBadge ? "Total Paid:" : "Total Advance Paid:"}
                      </span>
                      <span className="text-sm font-medium text-emerald-600">
                        - {formatCurrency(totalAdvancePaid)}
                      </span>
                    </div>
                  )}

                  {/* PAID Stamp or Amount Due */}
                  {showPaidBadge ? (
                    <div className="absolute -left-12 -top-10 sm:-left-20 sm:-top-14 transform rotate-[-20deg] pointer-events-none select-none">
                      <Image
                        src="/paid-stamp.png"
                        alt="Paid Stamp"
                        width={140}
                        height={140}
                        className="opacity-80"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    grandTotal > 0 &&
                    amountDue > 0.01 && (
                      <>
                        <Separator className="my-2 bg-border/50" />
                        <div className="flex justify-between">
                          <span className="text-base sm:text-lg font-bold text-[#EF1E1E] dark:text-red-400">
                            Amount Due:
                          </span>
                          <span className="text-base sm:text-lg font-bold text-[#EF1E1E] dark:text-red-400">
                            {formatCurrency(amountDue)}
                          </span>
                        </div>
                      </>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status History */}
        <Card className="shadow-2xl border border-border/40 bg-card hover:shadow-[#67B239]/10 transition-shadow duration-300 rounded-xl print:hidden">
          <CardHeader className="bg-card p-6 sm:p-8 border-b border-border/40">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Info className="h-8 w-8 sm:h-10 sm:w-10 text-[#67B239] shrink-0 p-1.5 bg-[#67B239]/10 rounded-lg border border-[#67B239]/20" />
              <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">
                Status History
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground mt-1 ml-11 sm:ml-14">
              Timeline of order progress and updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No status updates recorded yet.</p>
            ) : (
              <div className="space-y-6 sm:space-y-8 relative pl-5 sm:pl-6 border-l-2 border-zinc-400 dark:border-zinc-600 ml-2 sm:ml-3">
                {history
                  .slice()
                  .reverse()
                  .map((entry, index) => {
                    const info = resolveOrderStatus(entry.status);
                    const isLatest = index === 0;
                    return (
                      <div
                        key={entry.id}
                        className="flex items-start space-x-3 sm:space-x-4 relative group"
                      >
                        <div
                          className={cn(
                            "absolute z-10 -left-9 sm:-left-10.5 top-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center ring-4 ring-background",
                            isLatest ? "shadow-lg" : "border-2",
                          )}
                          style={{
                            backgroundColor: isLatest ? info.color : "var(--background)",
                            backgroundImage: isLatest
                              ? "none"
                              : `linear-gradient(${info.color}15, ${info.color}15)`,
                            borderColor: isLatest ? "transparent" : `${info.color}30`,
                          }}
                        >
                          <Info
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            style={{ color: isLatest ? "#FFFFFF" : info.color }}
                          />
                        </div>
                        <div className="flex-1 pt-px ml-2 sm:ml-3">
                          <p
                            className={cn(
                              "font-semibold text-base sm:text-lg",
                              isLatest ? "text-[#0a2e5c] dark:text-sky-300" : "text-foreground",
                            )}
                          >
                            {info.name}
                          </p>
                          <div className="text-xs sm:text-sm text-muted-foreground flex items-center flex-wrap mt-0.5">
                            <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 opacity-70 shrink-0" />
                            {formatDate(entry.timestamp, false)}
                            <span className="mx-1.5 hidden sm:inline">&bull;</span>
                            <span className="block sm:inline w-full sm:w-auto mt-0.5 sm:mt-0">
                              {entry.changedByUserName}
                            </span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm sm:text-base mt-2 sm:mt-2.5 bg-muted/50 p-3 sm:p-4 rounded-lg border border-border/40 text-foreground/80 shadow-xs">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments & Updates */}
        <Card className="shadow-2xl border border-border/40 bg-card hover:shadow-[#67B239]/10 transition-shadow duration-300 rounded-xl print:hidden">
          <CardHeader className="bg-card p-6 sm:p-8 border-b border-border/40">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-[#67B239] shrink-0 p-1.5 bg-[#67B239]/10 rounded-lg border border-[#67B239]/20" />
              <CardTitle className="text-xl sm:text-2xl font-semibold text-card-foreground">
                Comments & Updates ({comments.length})
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground mt-1 ml-11 sm:ml-14">
              Share updates or ask questions about this order.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-5">
            <div className="space-y-4 sm:space-y-5 max-h-150 overflow-y-auto pr-2 sm:pr-3 custom-scrollbar">
              {topLevelComments.map((comment) => renderComment(comment))}
              {comments.length === 0 && (
                <div className="text-center py-8 sm:py-10">
                  <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground/30" />
                  <p className="mt-4 sm:mt-5 text-muted-foreground text-base sm:text-lg">
                    No comments yet.
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Be the first to add one using the form below!
                  </p>
                </div>
              )}
            </div>
            <Separator className="my-6 sm:my-8 bg-border/30" />
            <form onSubmit={handleCommentSubmit} className="mt-2.5 flex items-start space-x-2.5">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-[#67B239]/30 shadow-xs shrink-0 mt-0.5">
                <AvatarImage src={myAvatar || undefined} alt="Your avatar" />
                <AvatarFallback className="bg-[#67B239]/10 text-[#55962e] text-sm font-semibold">
                  {getInitials(myName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  id="comment"
                  placeholder="Write a comment..."
                  className="min-h-20 sm:min-h-25 text-sm sm:text-base mb-2.5 p-3 bg-background/70 border-border/70 rounded-lg shadow-inner"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={addCommentMutation.isPending}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="shadow-md transition-all duration-300 bg-[#67B239] hover:bg-[#5aa030] text-white font-semibold text-sm py-2 px-5 rounded-lg cursor-pointer"
                    disabled={addCommentMutation.isPending || !newComment.trim()}
                  >
                    {addCommentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <AlertDialog
        open={Boolean(commentToDelete)}
        onOpenChange={(open) => !open && setCommentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Are you sure you want to delete this comment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Replies to this comment are deleted too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {commentToDelete && (
            <blockquote className="p-2 border-l-4 border-muted-foreground bg-muted text-muted-foreground italic rounded-r-md text-sm">
              &quot;{commentToDelete.text.substring(0, 100)}
              {commentToDelete.text.length > 100 ? "..." : ""}&quot;
            </blockquote>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCommentMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteCommentMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={async (e) => {
                e.preventDefault();
                if (!commentToDelete) return;
                await deleteCommentMutation.mutateAsync(commentToDelete);
                setCommentToDelete(null);
              }}
            >
              {deleteCommentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
