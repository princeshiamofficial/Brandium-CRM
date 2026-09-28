"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, Gift, Loader2, Percent } from "lucide-react";
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
  createEmptyItem,
  formatCurrencyBdt,
  giftTotalOf,
  isItemComplete,
  itemsTotalOf,
  PaymentMethodCombobox,
  LineItemsTable,
  resolveDiscountAmount,
  toMySQLDateTime,
  type DialogLineItem,
  type ServiceOption,
} from "@/components/sales/line-items-dialog-shared";

interface CreateQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: ServiceOption[];
  allQuotations: CrmQuotationItem[];
  onSave: (data: SaveQuotationPayload) => Promise<void>;
  isSaving: boolean;
}

/** Clone of ERPAPP `create-quotation-dialog.tsx`, persisted to MySQL `quotations`. */
export function CreateQuotationDialog({
  open,
  onOpenChange,
  services,
  allQuotations,
  onSave,
  isSaving,
}: CreateQuotationDialogProps) {
  const { user, profile } = useAuth();

  const [jobId, setJobId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentOrderDate, setCurrentOrderDate] = useState<Date | undefined>(new Date());
  const [orderNotes, setOrderNotes] = useState("");
  const [orderItems, setOrderItems] = useState<DialogLineItem[]>(() => [createEmptyItem()]);
  const [specialClientDiscount, setSpecialClientDiscount] = useState("");
  const [advancePaymentAmount, setAdvancePaymentAmount] = useState("");
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState("");
  const [customPaymentMethodText, setCustomPaymentMethodText] = useState("");
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

  // Auto-fill company, address and phone when the contact person matches an existing quotation
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = jobId.trim().toLowerCase();
      const existing = trimmed
        ? allQuotations.find((q) => (q.client_name || "").trim().toLowerCase() === trimmed)
        : undefined;

      if (existing && !isAutoFilled) {
        setCompanyName(existing.title || existing.client_name);
        setAddress(existing.client_address || "");
        setPhoneNumber(existing.client_phone || "");
        setIsAutoFilled(true);
        toast.success("Existing Contact Person Found", {
          description: `Details for "${jobId.trim()}" have been auto-filled.`,
        });
      } else if (!existing && isAutoFilled) {
        setCompanyName("");
        setAddress("");
        setPhoneNumber("");
        setIsAutoFilled(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [jobId, allQuotations, isAutoFilled]);

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
    }
  };

  const handleDiscountChange = (value: string) => {
    setSpecialClientDiscount(value);
    const discountVal = resolveDiscountAmount(value, orderItemsTotal);
    if (discountVal > orderItemsTotal && orderItemsTotal > 0) {
      toast.error("Validation Warning", {
        description: `Special Client Discount cannot exceed total items price of ${formatCurrencyBdt(orderItemsTotal)}.`,
      });
    }
  };

  const canSubmit = useMemo(
    () =>
      !isSaving &&
      Boolean(jobId.trim()) &&
      Boolean(companyName.trim()) &&
      Boolean(address.trim()) &&
      Boolean(phoneNumber.trim()) &&
      Boolean(currentOrderDate) &&
      orderItems.length > 0 &&
      orderItems.every(isItemComplete) &&
      !(isAdvancePaymentEntered && !advancePaymentMethod.trim()) &&
      !(isAdvancePaymentEntered && isOtherMethod && !customPaymentMethodText.trim()) &&
      (advanceNum <= netPayable || netPayable === 0) &&
      (rawDiscount <= orderItemsTotal || orderItemsTotal === 0),
    [
      isSaving,
      jobId,
      companyName,
      address,
      phoneNumber,
      currentOrderDate,
      orderItems,
      isAdvancePaymentEntered,
      advancePaymentMethod,
      isOtherMethod,
      customPaymentMethodText,
      advanceNum,
      netPayable,
      rawDiscount,
      orderItemsTotal,
    ],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !jobId.trim() ||
      !companyName.trim() ||
      !address.trim() ||
      !phoneNumber.trim() ||
      !currentOrderDate
    ) {
      toast.error("Validation Error", {
        description:
          "Contact Person, Company Name, Address, Phone Number and Quotation Date are required.",
      });
      return;
    }
    if (orderItems.length === 0 || !orderItems.every(isItemComplete)) {
      toast.error("Validation Error", {
        description: "All quotation items must be complete with Service, Quantity and Unit Price.",
      });
      return;
    }
    if (isAdvancePaymentEntered && !advancePaymentMethod.trim()) {
      toast.error("Validation Error", {
        description: "Payment Method is required when Advance Payment is entered.",
      });
      return;
    }
    if (isAdvancePaymentEntered && isOtherMethod && !customPaymentMethodText.trim()) {
      toast.error("Validation Error", {
        description: "Please specify the 'Other' payment method.",
      });
      return;
    }
    if (advanceNum > netPayable && netPayable > 0) {
      toast.error("Validation Error", {
        description: `Advance payment (${formatCurrencyBdt(advanceNum)}) cannot exceed grand total of ${formatCurrencyBdt(netPayable)}.`,
      });
      return;
    }
    if (rawDiscount > orderItemsTotal && orderItemsTotal > 0) {
      toast.error("Validation Error", {
        description: `Special Client Discount cannot exceed total items price of ${formatCurrencyBdt(orderItemsTotal)}.`,
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
            notes: "Advance payment at quotation creation.",
            recordedByUserId: user?.id || null,
            recordedByUserName: profile?.full_name || null,
          },
        ]
      : [];

    await onSave({
      title: companyName.trim(),
      client_name: jobId.trim(),
      client_phone: phoneNumber.trim(),
      client_address: address.trim(),
      service_id: orderItems[0]?.model || null,
      stage_id: "Draft",
      created_by: user?.id || null,
      budget: netPayable,
      paid_amount: advanceNum,
      advance_payments: advancePayments,
      order_date: format(currentOrderDate, "yyyy-MM-dd"),
      created_at: toMySQLDateTime(currentOrderDate),
      notes: buildQuotationNotes(orderNotes, specialClientDiscount, orderItems),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] sm:max-h-[90vh] p-3.5 sm:p-6 overflow-hidden flex flex-col">
        <DialogHeader className="pb-1 sm:pb-2 pr-8 sm:pr-0">
          <DialogTitle className="text-base sm:text-lg">Create New Quotation</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Enter company details and add quotation items. Required fields are marked with a visual
            hint.
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
                  Contact Person
                </Label>
                <Input
                  id="jobId"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  required
                  placeholder="e.g., Mr. Nur Nobi"
                  className="w-full text-xs sm:text-sm h-9"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <Label htmlFor="companyName" className="text-xs sm:text-sm truncate block">
                  Company Name
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
                Address
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
                  Phone Number
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
              <div className="space-y-1 min-w-0">
                <Label
                  htmlFor="orderDate"
                  className="text-xs sm:text-sm h-5 flex items-center truncate"
                >
                  Quotation Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="orderDate"
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal min-w-0 text-xs sm:text-sm h-9 px-2.5",
                        !currentOrderDate && "text-muted-foreground",
                      )}
                      disabled={isSaving}
                    >
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {currentOrderDate ? format(currentOrderDate, "PP") : "Pick a date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={currentOrderDate}
                      onSelect={setCurrentOrderDate}
                      initialFocus
                      disabled={isSaving}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <Label htmlFor="orderNotes">Notes (Optional)</Label>
              <Textarea
                id="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add any specific instructions or requirements..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="space-y-3 mt-3 sm:mt-4 border-t border-border pt-3 sm:pt-4 w-full min-w-0">
              <Label className="text-base sm:text-lg font-semibold">Quotation Items</Label>
              <LineItemsTable
                items={orderItems}
                setItems={setOrderItems}
                serviceOptions={services}
                disabled={isSaving}
                addLabel="Add Another Item"
              />
            </div>

            <Separator className="my-3 sm:my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-start">
              <div className="space-y-1">
                <Label htmlFor="specialClientDiscount">Special Client Discount</Label>
                <div className="relative">
                  <Input
                    id="specialClientDiscount"
                    type="text"
                    value={specialClientDiscount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    placeholder="e.g., 100 or 10%"
                    disabled={isSaving}
                    className="pl-7"
                  />
                  <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="advancePaymentAmount">Advance Payment (Optional)</Label>
                <Input
                  id="advancePaymentAmount"
                  type="number"
                  value={advancePaymentAmount}
                  onChange={(e) => handleAdvancePaymentAmountChange(e.target.value)}
                  placeholder="Amount (BDT)"
                  min="0"
                  step="0.01"
                  disabled={isSaving}
                />
              </div>

              {isAdvancePaymentEntered && (
                <div className="space-y-1">
                  <Label>
                    Payment Method <span className="text-destructive">*</span>
                  </Label>
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
                      <Label htmlFor="customPaymentText">
                        Specify Other Method <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customPaymentText"
                        value={customPaymentMethodText}
                        onChange={(e) => setCustomPaymentMethodText(e.target.value)}
                        placeholder="e.g., City Bank Transfer"
                        required
                      />
                    </div>
                  )}
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
              {isAdvancePaymentEntered && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Advance Paid:</span>
                  <span className="font-medium text-green-600">
                    - {formatCurrencyBdt(advanceNum)}
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
                  Creating...
                </>
              ) : (
                "Create Quotation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
