"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Gift, Loader2, Percent } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { generateUUID } from "@/lib/mysql-client";
import { useAuth } from "@/lib/auth";
import type { CrmOrder, SaveOrderPayload } from "@/lib/orders";
import type { AdvancePaymentRecord } from "@/lib/projects";
import {
  createEmptyItem,
  formatCurrencyBdt,
  giftTotalOf,
  isItemComplete,
  itemsTotalOf,
  LineItemsTable,
  PaymentMethodCombobox,
  resolveDiscountAmount,
  toMySQLDateTime,
  type DialogLineItem,
  type ServiceOption,
} from "@/components/sales/line-items-dialog-shared";
import { OrderDateField, PriorityStarField } from "./order-dialog-fields";

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: ServiceOption[];
  allOrders: CrmOrder[];
  onSave: (data: SaveOrderPayload) => Promise<void>;
  isSaving: boolean;
}

export const toOrderLineItems = (items: DialogLineItem[]) =>
  items.map((item) => ({
    id: item.id,
    model: item.model,
    quantity: parseInt(item.quantity, 10),
    unitPrice: item.unitPrice,
    lineItemTotalPrice: item.lineItemTotalPrice,
    isGift: item.isGift || false,
  }));

/** Clone of ERPAPP `create-order-dialog.tsx`, persisted to MySQL `orders`. */
export function CreateOrderDialog({
  open,
  onOpenChange,
  services,
  allOrders,
  onSave,
  isSaving,
}: CreateOrderDialogProps) {
  const { user, profile } = useAuth();

  const [jobId, setJobId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentOrderDate, setCurrentOrderDate] = useState<Date | undefined>(new Date());
  const [acceptedDeliveryDate, setAcceptedDeliveryDate] = useState<Date | undefined>(undefined);
  const [isStarred, setIsStarred] = useState(0);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderItems, setOrderItems] = useState<DialogLineItem[]>(() => [createEmptyItem()]);
  const [specialClientDiscount, setSpecialClientDiscount] = useState("");
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState("");
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState("");
  const [customPaymentMethodText, setCustomPaymentMethodText] = useState("");
  const [newAdvancePaymentNotes, setNewAdvancePaymentNotes] = useState("");
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const orderItemsTotal = itemsTotalOf(orderItems);
  const giftTotal = giftTotalOf(orderItems);
  const rawDiscount = resolveDiscountAmount(specialClientDiscount, orderItemsTotal);
  const calculatedDiscountAmount = Math.min(rawDiscount, orderItemsTotal);
  const netPayable = Math.max(0, orderItemsTotal - calculatedDiscountAmount);
  const advanceNum = parseFloat(advancePaymentAmount) || 0;
  const amountDue = Math.max(0, netPayable - advanceNum);
  const isAdvancePaymentEntered = advanceNum > 0;
  const isOtherMethod = advancePaymentMethod.toLowerCase() === "other";

  // Job ID lookup: auto-fill client details from an earlier order with the same Job ID
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = jobId.trim().toLowerCase();
      const existing = trimmed
        ? allOrders.find((o) => (o.job_id || "").trim().toLowerCase() === trimmed)
        : undefined;
      if (existing && !isAutoFilled) {
        setCompanyName(existing.company_name);
        setAddress(existing.address || "");
        setPhoneNumber(existing.phone || "");
        setIsAutoFilled(true);
        toast.success("Existing Job ID Found", {
          description: `Details for "${jobId.trim()}" have been auto-filled from existing orders.`,
        });
      } else if (!existing && isAutoFilled) {
        setCompanyName("");
        setAddress("");
        setPhoneNumber("");
        setIsAutoFilled(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [jobId, allOrders, isAutoFilled]);

  const handleAdvancePaymentAmountChange = (value: string) => {
    setAdvancePaymentAmount(value);
    const numeric = parseFloat(value);
    if (!isNaN(numeric) && numeric > netPayable && netPayable > 0) {
      toast.error("Validation Warning", {
        description: `Advance payment cannot exceed grand total of ${formatCurrencyBdt(netPayable)}.`,
      });
    }
    if (isNaN(numeric) || numeric <= 0) {
      setAdvancePaymentMethod("");
      setCustomPaymentMethodText("");
      setNewAdvancePaymentNotes("");
    }
  };

  const handleDiscountChange = (value: string) => {
    setSpecialClientDiscount(value);
    if (resolveDiscountAmount(value, orderItemsTotal) > orderItemsTotal && orderItemsTotal > 0) {
      toast.error("Validation Warning", {
        description: `Special Client Discount cannot exceed total items price of ${formatCurrencyBdt(orderItemsTotal)}.`,
      });
    }
  };

  const canSubmit = useMemo(
    () =>
      !isSaving &&
      Boolean(companyName.trim()) &&
      Boolean(address.trim()) &&
      Boolean(phoneNumber.trim()) &&
      Boolean(currentOrderDate) &&
      orderItems.length > 0 &&
      orderItems.every(isItemComplete) &&
      !(isAdvancePaymentEntered && !advancePaymentMethod.trim()) &&
      !(isAdvancePaymentEntered && isOtherMethod && !customPaymentMethodText.trim()) &&
      !(isAdvancePaymentEntered && newAdvancePaymentNotes.trim().length < 4) &&
      (advanceNum <= netPayable || netPayable === 0) &&
      (rawDiscount <= orderItemsTotal || orderItemsTotal === 0),
    [
      isSaving,
      companyName,
      address,
      phoneNumber,
      currentOrderDate,
      orderItems,
      isAdvancePaymentEntered,
      advancePaymentMethod,
      isOtherMethod,
      customPaymentMethodText,
      newAdvancePaymentNotes,
      advanceNum,
      netPayable,
      rawDiscount,
      orderItemsTotal,
    ],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !currentOrderDate) {
      toast.error("Validation Error", {
        description: "Please fill all required fields correctly.",
      });
      return;
    }

    const advancePayments: AdvancePaymentRecord[] = isAdvancePaymentEntered
      ? [
          {
            id: generateUUID(),
            amount: advanceNum,
            date: new Date().toISOString(),
            paymentMethod: isOtherMethod
              ? customPaymentMethodText.trim()
              : advancePaymentMethod.trim(),
            notes: newAdvancePaymentNotes.trim(),
            recordedByUserId: user?.id || null,
            recordedByUserName: profile?.full_name || null,
            status: "Approved",
          },
        ]
      : [];

    await onSave({
      job_id: jobId.trim() || null,
      company_name: companyName.trim(),
      phone: phoneNumber.trim(),
      address: address.trim(),
      crm_user_id: user?.id || null,
      items: toOrderLineItems(orderItems),
      discount_amount: calculatedDiscountAmount,
      shipping_charge: 0,
      total_amount: netPayable,
      advance_payments: advancePayments,
      is_starred: isStarred,
      notes: orderNotes.trim() || null,
      order_date: toMySQLDateTime(currentOrderDate),
      delivery_date: acceptedDeliveryDate ? toMySQLDateTime(acceptedDeliveryDate) : null,
      changed_by_name: profile?.full_name || "Admin",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] sm:max-h-[90vh] p-3.5 sm:p-6 overflow-hidden flex flex-col">
        <DialogHeader className="pb-1 sm:pb-2 pr-8 sm:pr-0">
          <DialogTitle className="text-base sm:text-lg">Create New Order</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Enter company details and add order items. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden w-full max-w-full min-w-0"
        >
          <div className="grid gap-3 sm:gap-4 py-2 sm:py-4 max-h-[68vh] sm:max-h-[70vh] overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0 pr-1 sm:pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full min-w-0">
              <div className="space-y-1 min-w-0">
                <Label htmlFor="jobId" className="text-xs sm:text-sm truncate block">
                  Job ID
                </Label>
                <Input
                  id="jobId"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  placeholder="Leave blank"
                  autoFocus
                  className="w-full text-xs sm:text-sm h-9"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <Label htmlFor="companyName" className="text-xs sm:text-sm truncate block">
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="e.g., Brandium"
                  readOnly={isAutoFilled}
                  className={cn(
                    "w-full text-xs sm:text-sm h-9",
                    isAutoFilled && "bg-muted/50 cursor-not-allowed",
                  )}
                />
              </div>
            </div>
            <div className="space-y-1 min-w-0">
              <Label htmlFor="address" className="text-xs sm:text-sm">
                Address *
              </Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                readOnly={isAutoFilled}
                className={cn(
                  "w-full text-xs sm:text-sm min-h-15",
                  isAutoFilled && "bg-muted/50 cursor-not-allowed",
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 w-full min-w-0">
              <div className="space-y-1 min-w-0">
                <Label
                  htmlFor="phoneNumber"
                  className="text-xs sm:text-sm h-5 flex items-center truncate"
                >
                  Phone Number *
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, "");
                    if (numericValue.length <= 11) setPhoneNumber(numericValue);
                  }}
                  required
                  pattern="0\d{10}"
                  maxLength={11}
                  title="Phone number must be an 11-digit number starting with 0."
                  placeholder="01xxxxxxxxx"
                  readOnly={isAutoFilled}
                  className={cn(
                    "w-full text-xs sm:text-sm h-9",
                    isAutoFilled && "bg-muted/50 cursor-not-allowed",
                  )}
                />
              </div>
              <OrderDateField
                id="orderDate"
                label="Order Date *"
                value={currentOrderDate}
                onChange={setCurrentOrderDate}
                disabled={isSaving}
              />
              <OrderDateField
                id="acceptedDeliveryDate"
                label="Delivery Date"
                value={acceptedDeliveryDate}
                onChange={setAcceptedDeliveryDate}
                disabled={isSaving}
              />
              <PriorityStarField value={isStarred} onChange={setIsStarred} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
              <Textarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add any specific instructions or notes for this order..."
                rows={3}
              />
            </div>

            <div className="space-y-3 mt-4 border-t border-border pt-4 w-full min-w-0">
              <Label className="text-lg font-semibold">Order Items *</Label>
              <LineItemsTable
                items={orderItems}
                setItems={setOrderItems}
                serviceOptions={services}
                disabled={isSaving}
                addLabel="Add Another Item"
              />
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="specialClientDiscount">Special Client Discount</Label>
                <div className="relative">
                  <Input
                    id="specialClientDiscount"
                    type="text"
                    value={specialClientDiscount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    placeholder="e.g., 100 or 10%"
                    className="pl-7"
                  />
                  <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="advancePaymentAmount">Advance Payment</Label>
                <Input
                  id="advancePaymentAmount"
                  type="number"
                  value={advancePaymentAmount}
                  onChange={(e) => handleAdvancePaymentAmountChange(e.target.value)}
                  placeholder="e.g., 500.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {isAdvancePaymentEntered && (
                <>
                  <div className="space-y-1">
                    <Label>Payment Method *</Label>
                    <PaymentMethodCombobox
                      value={advancePaymentMethod}
                      onChange={(value) => {
                        setAdvancePaymentMethod(value);
                        setCustomPaymentMethodText("");
                      }}
                      disabled={isSaving}
                    />
                    {isOtherMethod && (
                      <div className="mt-2 space-y-1">
                        <Label htmlFor="customPaymentMethodText">
                          Specify Other Payment Method *
                        </Label>
                        <Input
                          id="customPaymentMethodText"
                          value={customPaymentMethodText}
                          onChange={(e) => setCustomPaymentMethodText(e.target.value)}
                          placeholder="e.g., Specific Mobile Wallet"
                          required
                        />
                      </div>
                    )}
                  </div>
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
                </>
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
                  <span className="text-muted-foreground">Special Client Discount:</span>
                  <span className="font-medium text-red-600">
                    - {formatCurrencyBdt(calculatedDiscountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-foreground">Net Payable:</span>
                <span className="text-foreground">{formatCurrencyBdt(netPayable)}</span>
              </div>
              {isAdvancePaymentEntered && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Advance Paid:</span>
                  <span className="font-medium text-green-600">
                    - {formatCurrencyBdt(advanceNum)}
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
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
