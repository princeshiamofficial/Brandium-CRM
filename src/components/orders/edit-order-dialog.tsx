"use client";

import React, { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, Gift, Loader2, Percent, ReceiptText, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { generateUUID } from "@/lib/mysql-client";
import { useAuth } from "@/lib/auth";
import type { CrmOrder, SaveOrderPayload } from "@/lib/orders";
import type { AdvancePaymentRecord } from "@/lib/projects";
import {
  calculateLineItemTotal,
  formatCurrencyBdt,
  giftTotalOf,
  isItemComplete,
  itemsTotalOf,
  LineItemsTable,
  PAYMENT_METHOD_OPTIONS,
  PaymentMethodCombobox,
  resolveDiscountAmount,
  toMySQLDateTime,
  type DialogLineItem,
  type ServiceOption,
} from "@/components/sales/line-items-dialog-shared";
import { toOrderLineItems } from "./create-order-dialog";
import { OrderDateField, PriorityStarField } from "./order-dialog-fields";

interface EditOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: CrmOrder;
  services: ServiceOption[];
  onSave: (data: SaveOrderPayload) => Promise<void>;
  isSaving: boolean;
}

const toDate = (value: string | null | undefined): Date | undefined => {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
};

const formatDateForDialogInput = (value: string | Date | undefined): string => {
  const date = typeof value === "string" ? toDate(value) : value;
  return date ? format(date, "PPP") : "N/A";
};

/** Clone of ERPAPP `edit-order-dialog.tsx`; mount with a `key` so state initialises per order. */
export function EditOrderDialog({
  open,
  onOpenChange,
  order,
  services,
  onSave,
  isSaving,
}: EditOrderDialogProps) {
  const { user, profile, isAdmin } = useAuth();

  const [jobIdInput, setJobIdInput] = useState(order.job_id || "");
  const [companyNameInput, setCompanyNameInput] = useState(order.company_name);
  const [address, setAddress] = useState(order.address || "");
  const [phoneNumber, setPhoneNumber] = useState(order.phone || "");
  const [createdAt, setCreatedAt] = useState<Date | undefined>(
    () => toDate(order.order_date || order.created_at) || new Date(),
  );
  const [acceptedDeliveryDate, setAcceptedDeliveryDate] = useState<Date | undefined>(() =>
    toDate(order.delivery_date),
  );
  const [isStarred, setIsStarred] = useState(order.is_starred);
  const [orderNotes, setOrderNotes] = useState(order.notes || "");
  const [orderItems, setOrderItems] = useState<DialogLineItem[]>(() =>
    order.items.map((item) => ({
      id: item.id,
      model: item.model,
      quantity: String(item.quantity),
      unitPrice: item.unitPrice,
      lineItemTotalPrice: calculateLineItemTotal(item.unitPrice, String(item.quantity)),
      isGift: item.isGift,
    })),
  );
  const [specialClientDiscount, setSpecialClientDiscount] = useState(
    order.discount_amount > 0 ? String(order.discount_amount) : "",
  );
  const [shippingCharge, setShippingCharge] = useState(
    order.shipping_charge > 0 ? String(order.shipping_charge) : "",
  );

  const [existingAdvancePayments, setExistingAdvancePayments] = useState<AdvancePaymentRecord[]>(
    () => order.advance_payments,
  );
  const [newAdvanceAmount, setNewAdvanceAmount] = useState("");
  const [newAdvancePaymentMethod, setNewAdvancePaymentMethod] = useState("");
  const [newCustomPaymentMethodText, setNewCustomPaymentMethodText] = useState("");
  const [newAdvancePaymentNotes, setNewAdvancePaymentNotes] = useState("");

  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState("");
  const [editingMethod, setEditingMethod] = useState("");
  const [editingNotes, setEditingNotes] = useState("");
  const [paymentToDelete, setPaymentToDelete] = useState<AdvancePaymentRecord | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const orderItemsTotal = itemsTotalOf(orderItems);
  const giftTotal = giftTotalOf(orderItems);
  const rawDiscount = resolveDiscountAmount(specialClientDiscount, orderItemsTotal);
  const calculatedDiscountAmount = Math.min(rawDiscount, orderItemsTotal);
  const netPayable = Math.max(0, orderItemsTotal - calculatedDiscountAmount);
  const shippingNum = parseFloat(shippingCharge) || 0;
  const grandTotal = netPayable + shippingNum;
  const totalExistingAdvancePaid = existingAdvancePayments.reduce(
    (sum, record) => sum + (Number(record.amount) || 0),
    0,
  );
  const newAdvanceNum = parseFloat(newAdvanceAmount) || 0;
  const totalPaidAfterNew = totalExistingAdvancePaid + newAdvanceNum;
  const amountDue = Math.max(0, grandTotal - totalPaidAfterNew);
  const isNewAdvanceEntered = newAdvanceNum > 0;
  const isOtherMethod = newAdvancePaymentMethod.toLowerCase() === "other";

  const handleStartEditPayment = (payment: AdvancePaymentRecord) => {
    if (!isAdmin) return;
    setEditingPaymentId(payment.id);
    setEditingAmount(String(payment.amount));
    setEditingMethod(payment.paymentMethod || "");
    setEditingNotes(payment.notes || "");
    setTimeout(() => {
      amountInputRef.current?.focus();
      amountInputRef.current?.select();
    }, 0);
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
    if (resolveDiscountAmount(value, orderItemsTotal) > orderItemsTotal && orderItemsTotal > 0) {
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
      setNewAdvancePaymentNotes("");
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
      !(isNewAdvanceEntered && newAdvancePaymentNotes.trim().length < 4) &&
      (totalPaidAfterNew <= grandTotal || grandTotal === 0) &&
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
      newAdvancePaymentNotes,
      totalPaidAfterNew,
      grandTotal,
      rawDiscount,
      orderItemsTotal,
    ],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !createdAt) {
      toast.error("Validation Error", {
        description: "Please fill all required fields correctly and ensure values are valid.",
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
        notes: newAdvancePaymentNotes.trim(),
        recordedByUserId: user?.id || null,
        recordedByUserName: profile?.full_name || null,
        status: "Approved",
      });
    }

    await onSave({
      id: order.id,
      job_id: jobIdInput.trim() || null,
      company_name: companyNameInput.trim(),
      phone: phoneNumber.trim(),
      address: address.trim(),
      items: toOrderLineItems(orderItems),
      discount_amount: calculatedDiscountAmount,
      shipping_charge: shippingNum,
      total_amount: netPayable,
      advance_payments: advancePayments,
      is_starred: isStarred,
      notes: orderNotes.trim() || null,
      order_date: toMySQLDateTime(createdAt),
      delivery_date: acceptedDeliveryDate ? toMySQLDateTime(acceptedDeliveryDate) : null,
      changed_by_name: profile?.full_name || "Admin",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] sm:max-h-[90vh] p-3.5 sm:p-6 overflow-hidden flex flex-col">
          <DialogHeader className="pb-1 sm:pb-2 pr-8 sm:pr-0">
            <DialogTitle className="text-base sm:text-lg">
              Edit Order:{" "}
              <span className="font-normal">
                {order.job_id ? `${order.job_id} • ` : ""}
                {order.company_name}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Modify details for order ID: <span className="font-mono">{order.order_number}</span>.
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
                    Job ID *
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
                  <Label
                    htmlFor="edit-companyNamePart"
                    className="text-xs sm:text-sm truncate block"
                  >
                    Company Name *
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
                  Address *
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
                    Phone Number *
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
                <OrderDateField
                  id="edit-orderDate"
                  label="Date Created *"
                  value={createdAt}
                  onChange={setCreatedAt}
                  disabled={isSaving}
                  displayFormat="PPP"
                />
                <OrderDateField
                  id="edit-acceptedDeliveryDate"
                  label="Delivery Date"
                  value={acceptedDeliveryDate}
                  onChange={setAcceptedDeliveryDate}
                  disabled={isSaving}
                  displayFormat="PPP"
                />
                <PriorityStarField value={isStarred} onChange={setIsStarred} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-orderNotes">Order Notes (Optional)</Label>
                <Textarea
                  id="edit-orderNotes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-3 mt-4 border-t border-border pt-4 w-full min-w-0">
                <Label className="text-lg font-semibold">Order Items *</Label>
                <LineItemsTable
                  items={orderItems}
                  setItems={setOrderItems}
                  serviceOptions={services}
                  disabled={isSaving}
                  addLabel="Add Item"
                />
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
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
                <div className="space-y-1">
                  <Label htmlFor="edit-shippingCharge">Shipping Charge</Label>
                  <Input
                    id="edit-shippingCharge"
                    type="number"
                    value={shippingCharge}
                    onChange={(e) => setShippingCharge(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {existingAdvancePayments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label className="text-base font-semibold flex items-center">
                    <ReceiptText className="mr-2 h-5 w-5 text-[#0a2e5c]/80 dark:text-sky-300/80" />
                    Payment History
                  </Label>
                  <div className="w-full max-w-full max-h-40 overflow-y-auto overflow-x-auto rounded-md border bg-muted/20 p-2 custom-scrollbar">
                    <Table className="w-full min-w-112.5">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-8 text-xs">Date</TableHead>
                          <TableHead className="h-8 text-xs">Amount</TableHead>
                          <TableHead className="h-8 text-xs">Method</TableHead>
                          <TableHead className="h-8 text-xs">Reference/Notes</TableHead>
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
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPaymentToDelete(record);
                                    }}
                                    title="Delete payment"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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

              <div className="mt-4 border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
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
                    <Label>Payment Method *</Label>
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
                        <Label htmlFor="newCustomPaymentText">Specify Other Method *</Label>
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
                    <Label htmlFor="newAdvancePaymentNotes">Reference/Notes *</Label>
                    <Input
                      id="newAdvancePaymentNotes"
                      value={newAdvancePaymentNotes}
                      onChange={(e) => setNewAdvancePaymentNotes(e.target.value)}
                      placeholder="Reference or Transaction ID"
                      required
                      minLength={4}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 border rounded-md bg-muted/30 space-y-2">
                <h4 className="text-base font-semibold text-foreground mb-2">Order Summary</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Items Total:</span>
                  <span className="font-medium text-foreground">
                    {formatCurrencyBdt(orderItemsTotal)}
                  </span>
                </div>
                {giftTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Gift className="h-4 w-4 mr-1 text-yellow-500" />
                      Gift Value:
                    </span>
                    <span className="font-medium text-yellow-500">
                      {formatCurrencyBdt(giftTotal)}
                    </span>
                  </div>
                )}
                {calculatedDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium text-red-600">
                      - {formatCurrencyBdt(calculatedDiscountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net Payable:</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrencyBdt(netPayable)}
                  </span>
                </div>
                {shippingNum > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping Charge:</span>
                    <span className="font-medium text-foreground">
                      + {formatCurrencyBdt(shippingNum)}
                    </span>
                  </div>
                )}
                {totalPaidAfterNew > 0 && (
                  <div className="flex justify-between text-sm mt-1 pt-1 border-t border-dashed border-border">
                    <span className="text-muted-foreground">Total Paid:</span>
                    <span className="font-medium text-green-600">
                      - {formatCurrencyBdt(totalPaidAfterNew)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold mt-1 pt-1 border-t border-border">
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

      {paymentToDelete && (
        <AlertDialog
          open={Boolean(paymentToDelete)}
          onOpenChange={(isOpen) => !isOpen && setPaymentToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the payment of{" "}
                {formatCurrencyBdt(paymentToDelete.amount)} made on{" "}
                {formatDateForDialogInput(paymentToDelete.date)}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-white"
                onClick={() => {
                  setExistingAdvancePayments((prev) =>
                    prev.filter((p) => p.id !== paymentToDelete.id),
                  );
                  setPaymentToDelete(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
