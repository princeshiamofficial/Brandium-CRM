import { format } from "date-fns";
import JsBarcode from "jsbarcode";
import { BRANDIUM_TERMS } from "@/components/invoices/torn-paper-terms";
import type { CrmOrder } from "@/lib/orders";

/** Everything the shared order / quotation PDF needs, already formatted for display. */
export type SalesPdfData = {
  documentTitle: string;
  fileName: string;
  /** "Order No:" / "Quotation No:" shown before the code. */
  codeLabel: string;
  code: string;
  billTo: {
    name: string;
    company?: string | null | undefined;
    address?: string | null | undefined;
    phone?: string | null | undefined;
  };
  dates: { label: string; value: string }[];
  itemsTitle: string;
  items: {
    name: string;
    quantity: number | string;
    unitPrice: string;
    total: string;
    isGift?: boolean | undefined;
  }[];
  notesTitle: string;
  notes?: string | null | undefined;
  payments: { date: string; amount: string; method: string; notes: string; recordedBy: string }[];
  terms: readonly string[];
  totals: { label: string; value: string; tone?: "minus" | "paid" | "strong" | undefined }[];
  /** Formatted amount due; omitted when fully paid. */
  amountDue?: string | null | undefined;
  isPaid: boolean;
  // Filled in by buildPdfBlob()
  letterheadUrl?: string | undefined;
  barcodeDataUrl?: string | undefined;
  paidStampUrl?: string | undefined;
};

const barcodePng = (code: string): string | undefined => {
  try {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, code, {
      format: "CODE128",
      displayValue: false,
      width: 2,
      height: 60,
      margin: 0,
    });
    return canvas.toDataURL("image/png");
  } catch {
    return undefined;
  }
};

/**
 * Renders the PDF in the browser. `@react-pdf/renderer` (~1 MB) is imported only here, on
 * demand, so it never lands in the page bundles.
 */
async function buildPdfBlob(data: SalesPdfData): Promise<Blob> {
  const [{ pdf }, { SalesPdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/sales/sales-pdf-document"),
  ]);
  const origin = window.location.origin;
  const full: SalesPdfData = {
    ...data,
    letterheadUrl: `${origin}/brandium_invoice_bg.jpg`,
    barcodeDataUrl: barcodePng(data.code),
    paidStampUrl: data.isPaid ? `${origin}/paid-stamp.png` : undefined,
  };
  return pdf(SalesPdfDocument({ data: full })).toBlob();
}

/** Opens the browser print dialog for the generated PDF. */
export async function printSalesPdf(data: SalesPdfData): Promise<void> {
  const url = URL.createObjectURL(await buildPdfBlob(data));
  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.src = url;
  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    // Keep the frame until the dialog has had time to read it
    setTimeout(() => {
      frame.remove();
      URL.revokeObjectURL(url);
    }, 60_000);
  };
  document.body.appendChild(frame);
}

/** Downloads the generated PDF as `data.fileName`. */
export async function downloadSalesPdf(data: SalesPdfData): Promise<void> {
  const url = URL.createObjectURL(await buildPdfBlob(data));
  const link = document.createElement("a");
  link.href = url;
  link.download = data.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const formatBdt = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "N/A"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT" }).format(value);

const formatPdfDate = (value: string | null | undefined, withTime = true) => {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return format(d, withTime ? "d MMM, yyyy 'at' hh:mm a" : "d MMM, yyyy");
};

/** Order invoice (`/track/[id]`) → PDF data, with the same totals rules as the page. */
export function orderToPdfData(order: CrmOrder): SalesPdfData {
  const subtotal = order.items.reduce(
    (acc, item) => acc + (item.isGift ? 0 : Number(item.lineItemTotalPrice) || 0),
    0,
  );
  const giftTotal = order.items.reduce(
    (acc, item) => acc + (item.isGift ? Number(item.lineItemTotalPrice) || 0 : 0),
    0,
  );
  const netPayable = subtotal - order.discount_amount;
  const payments = [...order.advance_payments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const grandTotal = netPayable + order.shipping_charge;
  const due = grandTotal - paid;
  const isPaid = grandTotal > 0 && due <= 0.01;

  const totals: SalesPdfData["totals"] = [{ label: "Items Total:", value: formatBdt(subtotal) }];
  if (giftTotal > 0) totals.push({ label: "Gift Value:", value: formatBdt(giftTotal) });
  if (order.discount_amount > 0) {
    totals.push({
      label: "Special Discount:",
      value: `- ${formatBdt(order.discount_amount)}`,
      tone: "minus",
    });
  }
  totals.push({ label: "Net Payable:", value: formatBdt(netPayable), tone: "strong" });
  if (order.shipping_charge > 0) {
    totals.push({ label: "Shipping Charge:", value: `+ ${formatBdt(order.shipping_charge)}` });
  }
  if (paid > 0) {
    totals.push({
      label: isPaid ? "Total Paid:" : "Total Advance Paid:",
      value: `- ${formatBdt(paid)}`,
      tone: "paid",
    });
  }

  return {
    documentTitle: `Invoice ${order.order_number}`,
    fileName: `Invoice-${order.order_number}.pdf`,
    codeLabel: "Order No:",
    code: order.order_number,
    billTo: {
      name: `${order.job_id ? `${order.job_id} • ` : ""}${order.company_name}`,
      address: order.address,
      phone: order.phone,
    },
    dates: [
      { label: "Order Date:", value: formatPdfDate(order.created_at) },
      ...(order.delivery_date
        ? [{ label: "Delivery Date:", value: formatPdfDate(order.delivery_date, false) }]
        : []),
    ],
    itemsTitle: "Order Items",
    items: order.items.map((item) => ({
      name: item.model,
      quantity: item.quantity,
      unitPrice: formatBdt(item.unitPrice),
      total: formatBdt(item.lineItemTotalPrice),
      isGift: item.isGift,
    })),
    notesTitle: "Order Notes:",
    notes: order.notes,
    payments: payments.map((p) => ({
      date: formatPdfDate(p.date, false),
      amount: formatBdt(p.amount),
      method: p.paymentMethod || "N/A",
      notes: p.notes || "N/A",
      recordedBy: p.recordedByUserName || "N/A",
    })),
    terms: BRANDIUM_TERMS,
    totals,
    amountDue: !isPaid && grandTotal > 0 && due > 0.01 ? formatBdt(due) : null,
    isPaid,
  };
}

export { formatBdt as formatPdfBdt, formatPdfDate };
