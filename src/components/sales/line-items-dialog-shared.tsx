"use client";

import React, { useRef, useState } from "react";
import { format } from "date-fns";
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { generateUUID } from "@/lib/mysql-client";
import type { AdvancePaymentRecord } from "@/lib/quotations";

/* Shared building blocks for the ERPAPP-cloned Quotation and Order dialogs. */

export interface DialogLineItem {
  id: string;
  model: string;
  quantity: string;
  unitPrice: number | null;
  lineItemTotalPrice: number | null;
  isGift?: boolean | undefined;
}

export type ServiceOption = { id: string; name: string };

export const PAYMENT_METHOD_OPTIONS = [
  { id: "pm-1", name: "bKash" },
  { id: "pm-2", name: "Nagad" },
  { id: "pm-3", name: "Rocket" },
  { id: "pm-4", name: "Bank Transfer" },
  { id: "pm-5", name: "Cash" },
  { id: "pm-6", name: "Card" },
  { id: "pm-7", name: "Other" },
];

export const formatCurrencyBdt = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(value);
};

export const createEmptyItem = (): DialogLineItem => ({
  id: generateUUID(),
  model: "",
  quantity: "1",
  unitPrice: null,
  lineItemTotalPrice: null,
  isGift: false,
});

export const calculateLineItemTotal = (
  unitPrice: number | null,
  quantityStr: string,
): number | null => {
  if (unitPrice === null) return null;
  const quantity = parseInt(quantityStr, 10);
  if (isNaN(quantity) || quantity < 1) return null;
  return unitPrice * quantity;
};

/** Parses "100" or "10%" against the items total, clamped to the total. */
export const resolveDiscountAmount = (discountStr: string, itemsTotal: number): number => {
  const trimmed = discountStr.trim();
  let amount = 0;
  if (trimmed.endsWith("%")) {
    const pct = parseFloat(trimmed.slice(0, -1));
    if (!isNaN(pct) && pct >= 0) amount = (pct / 100) * itemsTotal;
  } else {
    const fixed = parseFloat(trimmed);
    if (!isNaN(fixed) && fixed >= 0) amount = fixed;
  }
  return amount;
};

export const itemsTotalOf = (items: DialogLineItem[]): number =>
  items.reduce((sum, item) => sum + (item.isGift ? 0 : item.lineItemTotalPrice || 0), 0);

export const giftTotalOf = (items: DialogLineItem[]): number =>
  items.reduce((sum, item) => sum + (item.isGift ? item.lineItemTotalPrice || 0 : 0), 0);

export const isItemComplete = (item: DialogLineItem): boolean =>
  Boolean(item.model) &&
  parseInt(item.quantity, 10) > 0 &&
  item.unitPrice !== null &&
  item.unitPrice >= 0 &&
  item.lineItemTotalPrice !== null;

/** Strips technical tags so only human-written notes remain. */
export function cleanQuotationNotes(rawNotes: string | null | undefined): string {
  if (!rawNotes) return "";
  return rawNotes
    .replace(/\[Payments?:\s*\[[\s\S]*?\]\]/gi, "")
    .replace(/\[Payments?:\s*[^\]]+\]/gi, "")
    .replace(/\[Discount:\s*[^\]]+\]/gi, "")
    .replace(/\[Shipping:\s*[^\]]+\]/gi, "")
    .replace(/\[Items:\s*\[[\s\S]*?\]\s*\]/gi, "")
    .replace(/\[Artist:\s*[^\]]+\]/gi, "")
    .replace(/\[Agent:\s*[^\]]+\]/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseDiscountTag(rawNotes: string | null | undefined): string {
  const match = rawNotes?.match(/\[Discount:\s*([^\]]+)\]/i);
  return match?.[1]?.trim() || "";
}

export function parseItemsTag(rawNotes: string | null | undefined): DialogLineItem[] {
  const match = rawNotes?.match(/\[Items:\s*(\[[\s\S]*?\])\s*\]/);
  if (!match?.[1]) return [];
  try {
    const parsed = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((it: Record<string, unknown>) => {
      const quantity = String(it["quantity"] ?? "1");
      const unitPrice =
        it["unitPrice"] !== undefined && it["unitPrice"] !== null ? Number(it["unitPrice"]) : null;
      return {
        id: String(it["id"] || generateUUID()),
        model: String(it["model"] || ""),
        quantity,
        unitPrice,
        lineItemTotalPrice: calculateLineItemTotal(unitPrice, quantity),
        isGift: Boolean(it["isGift"]),
      };
    });
  } catch {
    return [];
  }
}

/** Layered fallback: advance_payments column → [Payments: [...]] tag → legacy paid_amount. */
export function parseQuotationPayments(
  notes: string | null | undefined,
  paidAmount: number,
  quotationDate?: string | null,
  advancePayments?: AdvancePaymentRecord[] | string | null,
): AdvancePaymentRecord[] {
  const fallbackDate = quotationDate
    ? format(new Date(quotationDate), "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");

  const normalize = (list: Record<string, unknown>[]): AdvancePaymentRecord[] =>
    list.map((p, idx) => ({
      id: String(p["id"] || `payment-${idx + 1}`),
      amount: Number(p["amount"]) || 0,
      date: String(p["date"] || fallbackDate),
      paymentMethod: String(p["paymentMethod"] || p["method"] || "Cash"),
      notes: (p["notes"] as string) || (p["ref"] as string) || "",
      recordedByUserId: (p["recordedByUserId"] as string) || null,
      recordedByUserName: (p["recordedByUserName"] as string) || null,
    }));

  if (Array.isArray(advancePayments) && advancePayments.length > 0) {
    return normalize(advancePayments as unknown as Record<string, unknown>[]);
  }
  if (typeof advancePayments === "string" && advancePayments.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(advancePayments);
      if (Array.isArray(parsed) && parsed.length > 0) return normalize(parsed);
    } catch {
      // ignore invalid json
    }
  }
  const tag = notes?.match(/\[Payments:\s*(\[[\s\S]*?\])\]/);
  if (tag?.[1]) {
    try {
      const parsed = JSON.parse(tag[1]);
      if (Array.isArray(parsed) && parsed.length > 0) return normalize(parsed);
    } catch {
      // ignore invalid json
    }
  }
  if (paidAmount > 0) {
    return [
      {
        id: "legacy-advance-001",
        amount: paidAmount,
        date: fallbackDate,
        paymentMethod: "Unknown",
        notes: "Initial advance payment (legacy).",
      },
    ];
  }
  return [];
}

/** Rebuilds the notes column: user notes + [Discount] + [Items] tags read by the detail page. */
export function buildQuotationNotes(
  notes: string,
  discount: string,
  items: DialogLineItem[],
): string | null {
  const serializedItems = items.map((item) => ({
    id: item.id,
    model: item.model,
    quantity: parseInt(item.quantity, 10),
    unitPrice: item.unitPrice,
    lineItemTotalPrice: item.lineItemTotalPrice,
    isGift: item.isGift || false,
  }));
  const parts = [
    notes.trim() || null,
    discount.trim() ? `[Discount: ${discount.trim()}]` : null,
    items.length > 0 ? `[Items: ${JSON.stringify(serializedItems)}]` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join("\n") : null;
}

export const toMySQLDateTime = (date: Date): string => format(date, "yyyy-MM-dd HH:mm:ss");

interface LineItemsTableProps {
  items: DialogLineItem[];
  setItems: React.Dispatch<React.SetStateAction<DialogLineItem[]>>;
  serviceOptions: ServiceOption[];
  disabled: boolean;
  addLabel: string;
}

/** ERPAPP "Quotation Items" table: Service, Quantity, Unit Price, Total Price (double-click = gift). */
export function LineItemsTable({
  items,
  setItems,
  serviceOptions,
  disabled,
  addLabel,
}: LineItemsTableProps) {
  const [popoverOpenStates, setPopoverOpenStates] = useState<Record<string, boolean>>({});
  const lastTapRef = useRef<Record<string, number>>({});

  const togglePopover = (itemId: string, open?: boolean) =>
    setPopoverOpenStates((prev) => ({
      ...prev,
      [itemId]: open === undefined ? !prev[itemId] : open,
    }));

  const handleItemChange = (
    itemId: string,
    field: "model" | "quantity" | "unitPrice",
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item };
        if (field === "model") updated.model = value;
        if (field === "quantity") updated.quantity = value;
        if (field === "unitPrice") {
          const parsed = parseFloat(value);
          updated.unitPrice = value === "" || isNaN(parsed) ? null : parsed;
        }
        updated.lineItemTotalPrice = calculateLineItemTotal(updated.unitPrice, updated.quantity);
        return updated;
      }),
    );
  };

  const handleToggleGift = (itemId: string) =>
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isGift: !item.isGift } : item)),
    );

  const handleItemTouchEnd = (itemId: string, e: React.TouchEvent) => {
    const now = Date.now();
    const lastTap = lastTapRef.current[itemId] || 0;
    if (now - lastTap < 350) {
      e.preventDefault();
      handleToggleGift(itemId);
      lastTapRef.current[itemId] = 0;
    } else {
      lastTapRef.current[itemId] = now;
    }
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <div className="w-full max-w-full overflow-x-auto rounded-md border bg-background custom-scrollbar">
        <Table className="w-full min-w-155">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">Service *</TableHead>
              <TableHead className="w-[15%]">Quantity *</TableHead>
              <TableHead className="w-[20%]">Unit Price *</TableHead>
              <TableHead className="w-[15%] text-right pr-4">Total Price</TableHead>
              <TableHead className="w-[5%] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/30">
                <TableCell className="p-2 align-middle">
                  <Popover
                    open={popoverOpenStates[item.id] || false}
                    onOpenChange={(open) => togglePopover(item.id, open)}
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={popoverOpenStates[item.id] || false}
                        className="w-full min-w-0 justify-between bg-background text-sm"
                        disabled={disabled || serviceOptions.length === 0}
                      >
                        <span className="flex-1 text-left truncate">
                          {item.model ||
                            (serviceOptions.length === 0 ? "No services" : "Select service...")}
                        </span>
                        <ChevronsUpDown className="ml-1.5 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="min-w-(--radix-popover-trigger-width) w-[90vw] sm:w-max max-w-lg p-0 z-60"
                      align="start"
                      side="bottom"
                      sideOffset={4}
                    >
                      <Command className="max-h-96 overflow-hidden flex flex-col">
                        <CommandInput placeholder="Search service..." />
                        <CommandList
                          className="max-h-80 overflow-y-auto"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          <CommandEmpty>No service found.</CommandEmpty>
                          <CommandGroup>
                            {serviceOptions.map((option) => (
                              <CommandItem
                                key={option.id}
                                value={option.name}
                                onSelect={() => {
                                  handleItemChange(
                                    item.id,
                                    "model",
                                    option.name === item.model ? "" : option.name,
                                  );
                                  togglePopover(item.id, false);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Check
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    item.model === option.name ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted text-xs font-semibold text-muted-foreground">
                                  {option.name.charAt(0).toUpperCase()}
                                </span>
                                <span className="flex-1 truncate">{option.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="p-2 align-middle">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                    placeholder="e.g., 1"
                    min="1"
                    required
                    disabled={disabled}
                    className="bg-background text-sm h-9"
                  />
                </TableCell>
                <TableCell className="p-2 align-middle">
                  <Input
                    type="number"
                    value={item.unitPrice ?? ""}
                    onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    disabled={disabled}
                    className="bg-background text-sm h-9"
                  />
                </TableCell>
                <TableCell
                  className="p-2 align-middle text-right pr-4 font-semibold text-sm whitespace-nowrap cursor-pointer select-none"
                  onDoubleClick={() => handleToggleGift(item.id)}
                  onTouchEnd={(e) => handleItemTouchEnd(item.id, e)}
                  title="Double-click to mark as gift"
                >
                  <span
                    className={cn(item.isGift && "line-through decoration-red-500 text-gray-500")}
                  >
                    {formatCurrencyBdt(item.lineItemTotalPrice)}
                  </span>
                  {item.isGift && " (Gift)"}
                </TableCell>
                <TableCell className="p-2 align-middle text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={disabled || items.length <= 1}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => setItems((prev) => [...prev, createEmptyItem()])}
        className="mt-2"
        disabled={disabled}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> {addLabel}
      </Button>
    </>
  );
}

interface PaymentMethodComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

/** ERPAPP searchable payment method picker. */
export function PaymentMethodCombobox({ value, onChange, disabled }: PaymentMethodComboboxProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between bg-background"
          disabled={disabled}
        >
          <span className="flex-1 text-left whitespace-nowrap">{value || "Select method..."}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-(--radix-popover-trigger-width) w-max max-w-md p-0">
        <Command>
          <CommandInput placeholder="Search method..." />
          <CommandList>
            <CommandEmpty>No method found.</CommandEmpty>
            <CommandGroup>
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => {
                    onChange(opt.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === opt.name ? "opacity-100" : "opacity-0")}
                  />
                  <span className="whitespace-nowrap">{opt.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
