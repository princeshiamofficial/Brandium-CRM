import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";
import { getMySQLTimestamp } from "@/lib/mysql-client";
import { InvoiceStatus, PaymentMethod } from "@/lib/billing";

export type Payment = {
  id: string;
  invoice_id: string;
  invoice_number?: string | undefined;
  amount: number;
  payment_date: string;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  created_by: string | null;
  created_by_name: string;
  created_at: string;
};

export type ProcessPaymentInput = {
  invoice_id: string;
  amount: number;
  method: PaymentMethod;
  reference?: string | null | undefined;
  notes?: string | null | undefined;
};

export type ProcessPaymentResult = {
  success: boolean;
  payment_id: string;
  invoice_id: string;
  total_amount: number;
  total_paid: number;
  due: number;
  status: InvoiceStatus;
  activity_message: string;
};

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function calculateInvoiceStatus(paid: number, due: number): InvoiceStatus {
  if (paid <= 0) {
    return "Pending";
  }
  if (paid > 0 && due > 0) {
    return "Partially Paid";
  }
  return "Paid";
}

export async function processInvoicePayment(
  input: ProcessPaymentInput,
  user?: { id?: string; email?: string } | null,
): Promise<ProcessPaymentResult> {
  if (!input.amount || input.amount <= 0) {
    throw new Error("Invalid payment amount. Payment amount must be greater than zero.");
  }

  const paymentId = generateUUID();
  const now = getMySQLTimestamp();

  // 1. Fetch current invoice
  const invRes = await runMySQLQuery<Record<string, unknown>[]>(
    "SELECT id, total_amount, paid_amount, status, prospect_id FROM `invoices` WHERE `id` = ? LIMIT 1;",
    [input.invoice_id],
  );

  if (!invRes.success || !Array.isArray(invRes.data) || !invRes.data[0]) {
    throw new Error("Invoice not found.");
  }

  const invoice = invRes.data[0];
  if (invoice["status"] === "Cancelled") {
    throw new Error("Cannot record payment on a cancelled invoice.");
  }

  const totalAmount = Number(invoice["total_amount"] || 0);

  // 2. Insert payment record into MySQL
  const payInsert = await runMySQLQuery(
    `INSERT INTO \`payments\` (
      \`id\`, \`invoice_id\`, \`amount\`, \`payment_method\`,
      \`transaction_reference\`, \`notes\`, \`recorded_by\`, \`payment_date\`, \`created_at\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      paymentId,
      input.invoice_id,
      input.amount,
      input.method,
      input.reference || null,
      input.notes || null,
      user?.id || null,
      now,
      now,
    ],
  );

  if (!payInsert.success) {
    throw new Error(payInsert.error || "Failed to record payment in database.");
  }

  // 3. Recalculate totals
  const sumRes = await runMySQLQuery<Record<string, unknown>[]>(
    "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM `payments` WHERE `invoice_id` = ? AND `is_valid` = 1;",
    [input.invoice_id],
  );
  const totalPaid = Number(sumRes?.data?.[0]?.["total_paid"] || input.amount);
  const due = Math.max(0, totalAmount - totalPaid);
  const status = calculateInvoiceStatus(totalPaid, due);

  // 4. Update invoice
  await runMySQLQuery(
    "UPDATE `invoices` SET `paid_amount` = ?, `due_amount` = ?, `status` = ?, `updated_at` = ? WHERE `id` = ?;",
    [totalPaid, due, status, now, input.invoice_id],
  );

  // 5. Log activity
  const activityMsg = `Payment of ৳${input.amount} recorded via ${input.method}${input.reference ? ` (Ref: ${input.reference})` : ""}`;
  await runMySQLQuery(
    `INSERT INTO \`activities\` (\`id\`, \`actor_id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
     VALUES (?, ?, ?, 'payment_recorded', ?, ?);`,
    [
      generateUUID(),
      user?.id || null,
      (invoice["prospect_id"] as string) || null,
      activityMsg,
      now,
    ],
  );

  return {
    success: true,
    payment_id: paymentId,
    invoice_id: input.invoice_id,
    total_amount: totalAmount,
    total_paid: totalPaid,
    due,
    status,
    activity_message: activityMsg,
  };
}

export async function restoreCancelledInvoice(invoiceId: string): Promise<boolean> {
  const now = getMySQLTimestamp();
  const res = await runMySQLQuery(
    "UPDATE `invoices` SET `status` = 'Pending', `updated_at` = ? WHERE `id` = ?;",
    [now, invoiceId],
  );
  return Boolean(res.success);
}

export async function fetchPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        p.*,
        u.name AS created_by_name
      FROM \`payments\` p
      LEFT JOIN \`users\` u ON p.recorded_by = u.id
      WHERE p.invoice_id = ?
      ORDER BY p.payment_date DESC;`,
      [invoiceId],
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    return res.data.map((p) => ({
      id: String(p["id"]),
      invoice_id: String(p["invoice_id"]),
      amount: Number(p["amount"] || 0),
      payment_date: String(p["payment_date"] || new Date().toISOString()),
      method: (p["payment_method"] as PaymentMethod) || "Bank Transfer",
      reference: (p["transaction_reference"] as string) || null,
      notes: (p["notes"] as string) || null,
      created_by: (p["recorded_by"] as string) || null,
      created_by_name: String(p["created_by_name"] || "Agent"),
      created_at: String(p["created_at"] || new Date().toISOString()),
    }));
  } catch (err) {
    console.warn("fetchPaymentsForInvoice MySQL error:", err);
    return [];
  }
}

export const paymentsForInvoiceQueryOptions = (invoiceId: string) =>
  queryOptions({
    queryKey: ["payments", "invoice", invoiceId],
    queryFn: () => fetchPaymentsForInvoice(invoiceId),
  });
