"use client";

import React, { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  Edit,
  Gift,
  Loader2,
  Percent,
  ReceiptText,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { generateUUID } from "@/lib/mysql-client";
import { useAuth } from "@/lib/auth";
import type {
  AdvancePaymentRecord,
  CrmQuotationItem,
  SaveQuotationPayload,
} from "@/lib/quotations";
import {
  buildQuotationNotes,
  cleanQuotationNotes,
  createEmptyItem,
  formatCurrencyBdt,
  giftTotalOf,
  isItemComplete,
  itemsTotalOf,
  parseDiscountTag,
  parseItemsTag,
  parseQuotationPayments,
  PaymentMethodCombobox,
  PAYMENT_METHOD_OPTIONS,
  LineItemsTable,
  resolveDiscountAmount,
  toMySQLDateTime,
  type DialogLineItem,
  type ServiceOption,
} from "@/components/sales/line-items-dialog-shared";

interface EditQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: CrmQuotationItem;
  services: ServiceOption[];
  onSave: (data: SaveQuotationPayload) => Promise<void>;
  isSaving: boolean;
}

const formatDateForDialogInput = (value: string | Date | undefined): string => {
  if (!value) return "N/A";
  const date = typeof value === "string" ? new Date(value) : value;
  return isNaN(date.getTime()) ? "Invalid Date" : format(date, "PPP");
};

/** Clone of ERPAPP `edit-quotation-dialog.tsx`; mount with a `key` so state initialises per quotation. */
export function EditQuotationDialog({
  open,
  onOpenChange,
  quotation,
  services,
  onSave,
  isSaving,
}: EditQuotationDialogProps) {
  const { user, profile, isAdmin } = useAuth();

  const [jobIdInput, setJobIdInput] = useState(quotation.client_name || "");
  const [companyNameInput, setCompanyNameInput] = useState(
    quotation.title || quotation.client_name || "",
  );
  const [address, setAddress] = useState(quotation.client_address || "");
  const [phoneNumber, setPhoneNumber] = useState(quotation.client_phone || "");
  const [createdAt, setCreatedAt] = useState<Date | undefined>(() => {
    const d = new Date(quotation.created_at || quotation.order_date || "");
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const [specialClientDiscount, setSpecialClientDiscount] = useState(() =>
    parseDiscountTag(quotation.notes),
  );
  const [orderNotes, setOrderNotes] = useState(() => cleanQuotationNotes(quotation.notes));
  const [orderItems, setOrderItems] = useState<DialogLineItem[]>(() => {
    const items = parseItemsTag(quotation.notes);
    if (items.length > 0) return items;
    // Legacy quotations without an [Items] tag: one line for the whole budget
    const budget = Number(quotation.budget) || 0;
    return [
      {
        ...createEmptyItem(),
        model: quotation.service_name || "",
        unitPrice: budget > 0 ? budget : null,
        lineItemTotalPrice: budget > 0 ? budget : null,
      },
    ];
  });

  const [existingAdvancePayments, setExistingAdvancePayments] = useState<AdvancePaymentRecord[]>(
    () =>
      parseQuotationPayments(
        quotation.notes,
        Number(quotation.paid_amount || 0),
        quotation.order_date || quotation.created_at,
        quotation.advance_payments,
      ),
  );
  const [newAdvanceAmount, setNewAdvanceAmount] = useState("");
  const [newAdvancePaymentMethod, setNewAdvancePaymentMethod] = useState("");
  const [newCustomPaymentMethodText, setNewCustomPaymentMethodText] = useState("");
  const [newAdvancePaymentNotes, setNewAdvancePaymentNotes] = useState("");

  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState("");
  const [editingMethod, setEditingMethod] = useState("");
  const [editingNotes, setEditingNotes] = useState("");
  const amountInputRef = useRef<HTMLInputElement>(null);

  const orderItemsTotal = itemsTotalOf(orderItems);
  const giftTotal = giftTotalOf(orderItems);
  const rawDiscount = resolveDiscountAmount(specialClientDiscount, orderItemsTotal);
  const calculatedDiscountAmount = Math.min(rawDiscount, orderItemsTotal);
  const netPayable = Math.max(0, orderItemsTotal - calculatedDiscountAmount);
  const totalExistingAdvancePaid = existingAdvancePayments.reduce(
    (sum, record) => sum + (Number(record.amount) || 0),
    0,
  );
  const newAdvanceNum = parseFloat(newAdvanceAmount) || 0;
  const totalPaidAfterNew = totalExistingAdvancePaid + newAdvanceNum;
  const amountDue = Math.max(0, netPayable - totalPaidAfterNew);
  const isNewAdvanceEntered = newAdvanceNum > 0;
  const isOtherMethod = newAdvancePaymentMethod.toLowerCase() === "other";

  const handleStartEditPayment = (payment: AdvancePaymentRecord) => {
    if (!isAdmin) return;
    setEditingPaymentId(payment.id);
    setEditingAmount(payment.amount.toString());
    setEditingMethod(payment.paymentMethod || "");
    setEditingNotes(payment.notes || "");
    setTimeout(() => amountInputRef.current?.focus(), 0);
  };

  const handleSavePaymentEdit = (paymentId: string) => {
    const newAmount = parseFloat(editingAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a valid positive number for the payment.",
      });
      return;
    }
    setExistingAdvancePayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, amount: newAmount, paymentMethod: editingMethod, notes: editingNotes }
          : p,
      ),
    );
    setEditingPaymentId(null);
  };

  const handleDiscountChangeEdit = (value: string) => {
    setSpecialClientDiscount(value);
    const discountVal = resolveDiscountAmount(value, orderItemsTotal);
    if (discountVal > orderItemsTotal && orderItemsTotal > 0) {
      toast.error("Validation Warning", {
        description: `Special Client Discount cannot exceed total items price of ${formatCurrencyBdt(orderItemsTotal)}.`,
      });
    }
  };

  const handleNewAdvanceAmountChange = (value: string) => {
    setNewAdvanceAmount(value);
    const numeric = parseFloat(value);
    if (isNaN(numeric) || numeric <= 0) {
      setNewAdvancePaymentMethod("");
      setNewCustomPaymentMethodText("");
    }
  };

  const canSubmit = useMemo(
    () =>
      !isSaving &&
      Boolean(jobIdInput.trim()) &&
      Boolean(companyNameInput.trim()) &&
      Boolean(address.trim()) &&
      Boolean(phoneNumber.trim()) &&
      Boolean(createdAt) &&
      orderItems.length > 0 &&
      orderItems.every(isItemComplete) &&
      !(isNewAdvanceEntered && !newAdvancePaymentMethod.trim()) &&
      !(isNewAdvanceEntered && isOtherMethod && !newCustomPaymentMethodText.trim()) &&
      (totalPaidAfterNew <= netPayable || netPayable === 0) &&
      (rawDiscount <= orderItemsTotal || orderItemsTotal === 0),
    [
      isSaving,
      jobIdInput,
      companyNameInput,
      address,
      phoneNumber,
      createdAt,
      orderItems,
      isNewAdvanceEntered,
      newAdvancePaymentMethod,
      isOtherMethod,
      newCustomPaymentMethodText,
      totalPaidAfterNew,
      netPayable,
      rawDiscount,
      orderItemsTotal,
    ],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !jobIdInput.trim() ||
      !companyNameInput.trim() ||
      !address.trim() ||
      !phoneNumber.trim() ||
      !createdAt
    ) {
      toast.error("Validation Error", {
        description: "Contact Person, Company, Address, Phone, Date Created are required.",
      });
      return;
    }
    if (orderItems.length === 0 || !orderItems.every(isItemComplete)) {
      toast.error("Validation Error", { description: "All quotation items must be complete." });
      return;
    }
    if (isNewAdvanceEntered && !newAdvancePaymentMethod.trim()) {
      toast.error("Validation Error", {
        description: "Payment Method is required for new advance payment.",
      });
      return;
    }
    if (isNewAdvanceEntered && isOtherMethod && !newCustomPaymentMethodText.trim()) {
      toast.error("Validation Error", { description: "Specify 'Other' payment method." });
      return;
    }
    if (totalPaidAfterNew > netPayable && netPayable > 0) {
      toast.error("Validation Error", {
        description: "Total advance payment cannot exceed grand total.",
      });
      return;
    }
    if (rawDiscount > orderItemsTotal && orderItemsTotal > 0) {
      toast.error("Validation Error", {
        description: "Discount cannot exceed total items price.",
      });
      return;
    }

    const advancePayments = [...existingAdvancePayments];
    if (isNewAdvanceEntered) {
      advancePayments.push({
        id: generateUUID(),
        amount: newAdvanceNum,
        date: new Date().toISOString(),
        paymentMethod: isOtherMethod
          ? newCustomPaymentMethodText.trim()
          : newAdvancePaymentMethod.trim(),
        notes: newAdvancePaymentNotes.trim() || null,
        recordedByUserId: user?.id || null,
        recordedByUserName: profile?.full_name || null,
      });
    }

    await onSave({
      id: quotation.id,
      quotation_code: quotation.quotation_code,
      prospect_id: quotation.prospect_id ?? null,
      title: companyNameInput.trim(),
      client_name: jobIdInput.trim(),
      client_phone: phoneNumber.trim(),
      client_email: quotation.client_email,
      client_address: address.trim(),
      service_id: orderItems[0]?.model || quotation.service_id,
      stage_id: quotation.stage_id,
      priority: quotation.priority,
      assigned_agent_id: quotation.assigned_agent_id,
      assigned_artist_id: quotation.assigned_artist_id,
      created_by: quotation.created_by ?? null,
      budget: netPayable,
      paid_amount: advancePayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      advance_payments: advancePayments,
      progress: quotation.progress,
      order_date: format(createdAt, "yyyy-MM-dd"),
      deadline: quotation.deadline,
      created_at: toMySQLDateTime(createdAt),
      notes: buildQuotationNotes(orderNotes, specialClientDiscount, orderItems),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] sm:max-h-[90vh] p-3.5 sm:p-6 overflow-hidden flex flex-col">
        <DialogHeader className="pb-1 sm:pb-2 pr-8 sm:pr-0">
          <DialogTitle className="text-base sm:text-lg">
            Edit Quotation:{" "}
            <span className="font-normal">
              {quotation.client_name} • {quotation.title}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Modify details for quotation ID:{" "}
            <span className="font-mono">{quotation.quotation_code || quotation.id}</span>.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden w-full max-w-full min-w-0"
        >
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4 max-h-[68vh] sm:max-h-[70vh] overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0 pr-1 sm:pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full min-w-0">
              <div className="space-y-1 min-w-0">
                <Label htmlFor="edit-jobId" className="text-xs sm:text-sm truncate block">
                  Contact Person
                </Label>
                <Input
                  id="edit-jobId"
                  value={jobIdInput}
                  onChange={(e) => setJobIdInput(e.target.value)}
                  required
                  disabled={isSaving}
                  className="w-full text-xs sm:text-sm h-9"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <Label htmlFor="edit-companyNamePart" className="text-xs sm:text-sm truncate block">
                  Company Name
                </Label>
                <Input
                  id="edit-companyNamePart"
                  value={companyNameInput}
                  onChange={(e) => setCompanyNameInput(e.target.value)}
                  required
                  disabled={isSaving}
                  className="w-full text-xs sm:text-sm h-9"
                />
              </div>
            </div>
            <div className="space-y-1 min-w-0">
              <Label htmlFor="edit-address" className="text-xs sm:text-sm">
                Address
              </Label>
              <Textarea
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={isSaving}
                className="w-full text-xs sm:text-sm min-h-15"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full min-w-0">
              <div className="space-y-1 min-w-0">
                <Label
                  htmlFor="edit-phoneNumber"
                  className="text-xs sm:text-sm h-5 flex items-center truncate"
                >
                  Phone Number
                </Label>
                <Input
                  id="edit-phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, "");
                    if (numericValue.length <= 11) setPhoneNumber(numericValue);
                  }}
                  required
                  disabled={isSaving}
                  pattern="0\d{10}"
                  maxLength={11}
                  title="Phone number must be an 11-digit number starting with 0."
                  placeholder="01xxxxxxxxx"
                  className="w-full text-xs sm:text-sm h-9"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <Label
                  htmlFor="edit-orderDate"
                  className="text-xs sm:text-sm h-5 flex items-center truncate"
                >
                  Date Created
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="edit-orderDate"
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal min-w-0 text-xs sm:text-sm h-9 px-2.5",
                        !createdAt && "text-muted-foreground",
                      )}
                      disabled={isSaving}
                    >
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {createdAt ? formatDateForDialogInput(createdAt) : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={createdAt}
                      onSelect={setCreatedAt}
                      initialFocus
                      disabled={isSaving}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-1 min-w-0">
              <Label htmlFor="edit-orderNotes" className="text-xs sm:text-sm">
                Notes (Optional)
              </Label>
              <Textarea
                id="edit-orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                disabled={isSaving}
                className="w-full text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-3 mt-3 sm:mt-4 border-t border-border pt-3 sm:pt-4 w-full min-w-0">
              <Label className="text-base sm:text-lg font-semibold">Quotation Items</Label>
              <LineItemsTable
                items={orderItems}
                setItems={setOrderItems}
                serviceOptions={services}
                disabled={isSaving}
                addLabel="Add Item"
              />
            </div>
            <Separator className="my-3 sm:my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="edit-specialClientDiscount">Special Client Discount</Label>
                <div className="relative">
                  <Input
                    id="edit-specialClientDiscount"
                    type="text"
                    value={specialClientDiscount}
                    onChange={(e) => handleDiscountChangeEdit(e.target.value)}
                    placeholder="e.g., 100 or 10%"
                    disabled={isSaving}
                    className="pl-7"
                  />
                  <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {existingAdvancePayments.length > 0 && (
              <div className="mt-3 sm:mt-4 space-y-2">
                <Label className="text-sm sm:text-base font-semibold flex items-center">
                  <ReceiptText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#0a2e5c]/80 dark:text-sky-300/80" />
                  Payment History
                </Label>
                <div className="w-full max-w-full max-h-40 overflow-y-auto overflow-x-auto rounded-md border bg-muted/20 p-2 custom-scrollbar">
                  <Table className="w-full min-w-112.5">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-8 text-xs">Date</TableHead>
                        <TableHead className="h-8 text-xs">Amount</TableHead>
                        <TableHead className="h-8 text-xs">Method</TableHead>
                        <TableHead className="h-8 text-xs">Notes</TableHead>
                        {isAdmin && (
                          <TableHead className="h-8 text-right text-xs">Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {existingAdvancePayments.map((record) => (
                        <TableRow
                          key={record.id}
                          className="group"
                          onDoubleClick={() => {
                            if (!editingPaymentId) handleStartEditPayment(record);
                          }}
                        >
                          <TableCell className="text-xs py-1.5">
                            {formatDateForDialogInput(record.date)}
                          </TableCell>
                          <TableCell className="text-xs py-1.5">
                            {editingPaymentId === record.id ? (
                              <Input
                                ref={amountInputRef}
                                type="number"
                                value={editingAmount}
                                onChange={(e) => setEditingAmount(e.target.value)}
                                className="h-7 text-xs"
                              />
                            ) : (
                              formatCurrencyBdt(record.amount)
                            )}
                          </TableCell>
                          <TableCell className="text-xs py-1.5">
                            {editingPaymentId === record.id ? (
                              <Select value={editingMethod} onValueChange={setEditingMethod}>
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PAYMENT_METHOD_OPTIONS.map((pm) => (
                                    <SelectItem key={pm.id} value={pm.name}>
                                      {pm.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              record.paymentMethod || "N/A"
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-1.5">
                            {editingPaymentId === record.id ? (
                              <Input
                                value={editingNotes}
                                onChange={(e) => setEditingNotes(e.target.value)}
                                className="h-7 text-xs"
                                placeholder="Notes/Ref"
                              />
                            ) : (
                              record.notes || "N/A"
                            )}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right py-1.5">
                              {editingPaymentId === record.id ? (
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-green-600 hover:bg-green-100"
                                    onClick={() => handleSavePaymentEdit(record.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:bg-muted"
                                    onClick={() => setEditingPaymentId(null)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Edit
                                  className="ms-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-pointer"
                                  onClick={() => handleStartEditPayment(record)}
                                />
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="mt-3 sm:mt-4 border-t border-border pt-3 sm:pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="newAdvanceAmount">
                  {existingAdvancePayments.length > 0 ? "Adjustment Payment" : "Advance Payment"}
                </Label>
                <Input
                  id="newAdvanceAmount"
                  type="number"
                  value={newAdvanceAmount}
                  onChange={(e) => handleNewAdvanceAmountChange(e.target.value)}
                  placeholder="Amount (BDT)"
                  min="0"
                  step="0.01"
                  disabled={isSaving}
                />
              </div>
              {isNewAdvanceEntered && (
                <div className="space-y-1">
                  <Label>
                    Payment Method <span className="text-destructive">*</span>
                  </Label>
                  <PaymentMethodCombobox
                    value={newAdvancePaymentMethod}
                    onChange={(value) => {
                      setNewAdvancePaymentMethod(value);
                      setNewCustomPaymentMethodText("");
                    }}
                    disabled={isSaving}
                  />
                  {isOtherMethod && (
                    <div className="mt-2 space-y-1">
                      <Label htmlFor="newCustomPaymentText">
                        Specify Other Method <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="newCustomPaymentText"
                        value={newCustomPaymentMethodText}
                        onChange={(e) => setNewCustomPaymentMethodText(e.target.value)}
                        required
                        disabled={isSaving}
                      />
                    </div>
                  )}
                </div>
              )}
              {isNewAdvanceEntered && (
                <div className="space-y-1">
                  <Label htmlFor="newAdvancePaymentNotes">New Payment Notes</Label>
                  <Textarea
                    id="newAdvancePaymentNotes"
                    value={newAdvancePaymentNotes}
                    onChange={(e) => setNewAdvancePaymentNotes(e.target.value)}
                    rows={1}
                    placeholder="Optional notes for this payment"
                    disabled={isSaving}
                  />
                </div>
              )}
            </div>

            <div className="mt-3 sm:mt-4 p-3 sm:p-4 border rounded-md bg-muted/30 space-y-2">
              <h4 className="text-sm sm:text-base font-semibold text-foreground mb-2">
                Quotation Summary
              </h4>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Items Total:</span>
                <span className="font-medium text-foreground">
                  {formatCurrencyBdt(orderItemsTotal)}
                </span>
              </div>
              {giftTotal > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 text-yellow-500" />
                    Gift Value:
                  </span>
                  <span className="font-medium text-yellow-500">
                    {formatCurrencyBdt(giftTotal)}
                  </span>
                </div>
              )}
              {calculatedDiscountAmount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-red-600">
                    - {formatCurrencyBdt(calculatedDiscountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs sm:text-sm font-semibold">
                <span className="text-foreground">Net Payable:</span>
                <span className="text-foreground">{formatCurrencyBdt(netPayable)}</span>
              </div>
              {totalPaidAfterNew > 0 && (
                <div className="flex justify-between text-xs sm:text-sm mt-1 pt-1 border-t border-dashed border-border">
                  <span className="text-muted-foreground">Total Paid:</span>
                  <span className="font-medium text-green-600">
                    - {formatCurrencyBdt(totalPaidAfterNew)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base sm:text-lg font-bold mt-1 pt-1 border-t border-border">
                <span className="text-[#0a2e5c] dark:text-sky-300">Amount Due:</span>
                <span className="text-[#0a2e5c] dark:text-sky-300">
                  {formatCurrencyBdt(amountDue)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-3 sm:pt-4 border-t flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-[#67B239] hover:bg-[#5aa030] text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
