import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";
import { getMySQLTimestamp } from "@/lib/mysql-client";

export type InvoiceStatus = "Pending" | "Partially Paid" | "Paid" | "Cancelled";
export type PaymentMethod = "Bank Transfer" | "bKash" | "Nagad" | "Cash" | "Card";

export type Invoice = {
  id: string;
  invoice_number: string;
  prospect_id: string;
  prospect_name: string;
  business_name?: string | undefined;
  client_email?: string | undefined;
  client_phone?: string | undefined;
  description: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  bill_date: string;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  created_by: string | null;
  created_by_name: string;
  created_at: string;
  updated_at: string;
};

export type InvoicePayment = {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_reference: string | null;
  payment_date: string;
  notes: string | null;
  recorded_by: string | null;
  recorded_by_name: string;
  is_valid: boolean;
  created_at: string;
};

export type CreateInvoiceInput = {
  prospect_id: string;
  description: string;
  total_amount: number;
  bill_date: string;
  due_date: string;
  notes?: string | null;
};

export type RecordPaymentInput = {
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_reference?: string | null;
  notes?: string | null;
};

export type InvoiceFilters = {
  search?: string | undefined;
  status?: InvoiceStatus | "all" | undefined;
  from_date?: string | undefined;
  to_date?: string | undefined;
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

export function calculateInvoiceFinancials(
  totalAmount: number,
  payments: InvoicePayment[],
): { paidAmount: number; dueAmount: number; status: InvoiceStatus } {
  const validPayments = payments.filter((p) => p.is_valid);
  const paidAmount = validPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  let status: InvoiceStatus = "Pending";
  if (dueAmount <= 0) {
    status = "Paid";
  } else if (paidAmount > 0) {
    status = "Partially Paid";
  }

  return {
    paidAmount: Math.min(totalAmount, paidAmount),
    dueAmount,
    status,
  };
}

export async function fetchInvoices(
  filters: InvoiceFilters = {},
  userId?: string,
  isAdmin: boolean = false,
): Promise<Invoice[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        i.*,
        p.contact_name AS prospect_name,
        p.business_name,
        p.email AS client_email,
        p.phone AS client_phone,
        p.assigned_to,
        p.assigned_artist_id,
        u.name AS created_by_name
      FROM \`invoices\` i
      LEFT JOIN \`prospects\` p ON i.prospect_id = p.id
      LEFT JOIN \`users\` u ON i.created_by = u.id
      ORDER BY i.created_at DESC;`,
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    let mapped: Invoice[] = res.data.map((item) => {
      const totalAmount = Number(item["total_amount"] || 0);
      const paidAmount = Number(item["paid_amount"] || 0);
      const dueAmount = Number(item["due_amount"] ?? Math.max(0, totalAmount - paidAmount));

      return {
        id: String(item["id"]),
        invoice_number: String(item["invoice_number"] || `INV-2026-${item["id"]}`),
        prospect_id: String(item["prospect_id"] || ""),
        prospect_name: String(item["prospect_name"] || "Client"),
        business_name: (item["business_name"] as string) || undefined,
        client_email: (item["client_email"] as string) || undefined,
        client_phone: (item["client_phone"] as string) || undefined,
        description: String(item["description"] || "Software Services"),
        total_amount: totalAmount,
        paid_amount: paidAmount,
        due_amount: dueAmount,
        bill_date: String(item["bill_date"] || new Date().toISOString().split("T")[0]),
        due_date: String(item["due_date"] || new Date().toISOString().split("T")[0]),
        status: (item["status"] as InvoiceStatus) || "Pending",
        notes: (item["notes"] as string) || null,
        created_by: (item["created_by"] as string) || null,
        created_by_name: String(item["created_by_name"] || "Agent"),
        created_at: String(item["created_at"] || new Date().toISOString()),
        updated_at: String(item["updated_at"] || new Date().toISOString()),
      };
    });

    if (!isAdmin && userId) {
      const rawRows = Array.isArray(res.data) ? res.data : [];
      mapped = mapped.filter((inv, idx) => {
        const raw = rawRows[idx];
        return (
          inv.created_by === userId ||
          raw?.["assigned_to"] === userId ||
          raw?.["assigned_artist_id"] === userId
        );
      });
    }

    return applyInvoiceFilters(mapped, filters);
  } catch (err) {
    console.warn("fetchInvoices MySQL error:", err);
    return [];
  }
}

function applyInvoiceFilters(list: Invoice[], filters: InvoiceFilters): Invoice[] {
  let result = list;

  if (filters.status && filters.status !== "all") {
    result = result.filter((inv) => inv.status === filters.status);
  }

  if (filters.from_date) {
    const fromStr = filters.from_date;
    result = result.filter((inv) => inv.bill_date >= fromStr);
  }

  if (filters.to_date) {
    const toStr = filters.to_date;
    result = result.filter((inv) => inv.bill_date <= toStr);
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.prospect_name.toLowerCase().includes(q) ||
        (inv.business_name && inv.business_name.toLowerCase().includes(q)) ||
        inv.description.toLowerCase().includes(q) ||
        (inv.client_phone && inv.client_phone.includes(q)) ||
        (inv.client_email && inv.client_email.toLowerCase().includes(q)) ||
        inv.created_by_name.toLowerCase().includes(q),
    );
  }

  return result;
}

export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  const invoices = await fetchInvoices();
  return invoices.find((inv) => inv.id === id) || null;
}

export async function fetchInvoicePayments(invoiceId: string): Promise<InvoicePayment[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        p.*,
        u.name AS recorded_by_name
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
      payment_method: (p["payment_method"] as PaymentMethod) || "Bank Transfer",
      transaction_reference: (p["transaction_reference"] as string) || null,
      payment_date: String(p["payment_date"] || new Date().toISOString()),
      notes: (p["notes"] as string) || null,
      recorded_by: (p["recorded_by"] as string) || null,
      recorded_by_name: String(p["recorded_by_name"] || "Agent"),
      is_valid: Boolean(Number(p["is_valid"] ?? 1)),
      created_at: String(p["created_at"] || new Date().toISOString()),
    }));
  } catch (err) {
    console.warn("fetchInvoicePayments MySQL error:", err);
    return [];
  }
}

export async function createInvoice(
  input: CreateInvoiceInput,
  user?: { id?: string; email?: string } | null,
): Promise<Invoice> {
  const invId = generateUUID();
  const invNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
  const now = getMySQLTimestamp();

  const res = await runMySQLQuery(
    `INSERT INTO \`invoices\` (
      \`id\`, \`invoice_number\`, \`prospect_id\`, \`description\`, \`total_amount\`,
      \`paid_amount\`, \`due_amount\`, \`bill_date\`, \`due_date\`, \`status\`,
      \`notes\`, \`created_by\`, \`created_at\`, \`updated_at\`
    ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 'Pending', ?, ?, ?, ?);`,
    [
      invId,
      invNum,
      input.prospect_id,
      input.description,
      input.total_amount,
      input.total_amount,
      input.bill_date,
      input.due_date,
      input.notes || null,
      user?.id || null,
      now,
      now,
    ],
  );

  if (!res.success) {
    throw new Error(res.error || "Failed to create invoice in database.");
  }

  // Synchronize with Opportunities, Prospect stage, and Stage History
  try {
    const oppCheck = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT id FROM `opportunities` WHERE `prospect_id` = ? AND `is_active` = 1 LIMIT 1;",
      [input.prospect_id],
    );

    if (oppCheck.success && Array.isArray(oppCheck.data) && oppCheck.data.length > 0) {
      const existingOppId = oppCheck.data[0]?.["id"] as string;
      await runMySQLQuery(
        "UPDATE `opportunities` SET `estimated_value` = ?, `notes` = COALESCE(?, `notes`), `updated_at` = ? WHERE `id` = ?;",
        [input.total_amount, input.description || null, now, existingOppId],
      );
    } else {
      const newOppId = generateUUID();
      // Fetch prospect's assigned agent
      const pRes = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT assigned_to FROM `prospects` WHERE `id` = ? LIMIT 1;",
        [input.prospect_id],
      );
      const assignedTo = (pRes.data?.[0]?.["assigned_to"] as string) || user?.id || null;

      await runMySQLQuery(
        `INSERT INTO \`opportunities\` (
            \`id\`, \`prospect_id\`, \`estimated_value\`, \`assigned_to\`, \`created_by\`,
            \`status\`, \`notes\`, \`is_active\`, \`created_at\`, \`updated_at\`
          ) VALUES (?, ?, ?, ?, ?, 'Opportunity Created', ?, 1, ?, ?);`,
        [
          newOppId,
          input.prospect_id,
          input.total_amount,
          assignedTo,
          user?.id || null,
          input.description || null,
          now,
          now,
        ],
      );
    }

    // Resolve the "Opportunity Created" stage ID from MySQL
    const stageRes = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) LIKE '%opportunity%' LIMIT 1;",
    );
    const oppStageId =
      stageRes?.success && stageRes.data?.[0]
        ? String(stageRes.data[0]["id"])
        : "opportunity-created";

    // Get the prospect's current stage for history
    let fromStageId: string | null = null;
    try {
      const currRes = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT `stage_id` FROM `prospects` WHERE `id` = ? LIMIT 1;",
        [input.prospect_id],
      );
      if (currRes?.success && currRes.data?.[0]) {
        fromStageId = String(currRes.data[0]["stage_id"] || "") || null;
      }
    } catch {
      // ignore
    }

    // Update prospect stage to Opportunity Created
    await runMySQLQuery("UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;", [
      oppStageId,
      now,
      input.prospect_id,
    ]);

    // Write stage history record
    const historyId = generateUUID();
    await runMySQLQuery(
      `INSERT INTO \`prospect_stage_history\`
           (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_at\`)
         VALUES (?, ?, ?, ?, ?, ?);`,
      [
        historyId,
        input.prospect_id,
        fromStageId,
        oppStageId,
        `Invoice ${invNum} generated for ${input.description} (৳${input.total_amount})`,
        now,
      ],
    );
  } catch (err) {
    console.warn("Error synchronizing invoice to opportunities and stages:", err);
  }

  return {
    id: invId,
    invoice_number: invNum,
    prospect_id: input.prospect_id,
    prospect_name: "Client",
    description: input.description,
    total_amount: input.total_amount,
    paid_amount: 0,
    due_amount: input.total_amount,
    bill_date: input.bill_date,
    due_date: input.due_date,
    status: "Pending",
    notes: input.notes || null,
    created_by: user?.id || null,
    created_by_name: user?.email || "Agent",
    created_at: now,
    updated_at: now,
  };
}

export async function recordInvoicePayment(
  input: RecordPaymentInput,
  user?: { id?: string; email?: string } | null,
): Promise<{ success: boolean; dueAmount: number; status: InvoiceStatus }> {
  if (input.amount <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

  const payId = generateUUID();
  const now = getMySQLTimestamp();

  const payRes = await runMySQLQuery(
    `INSERT INTO \`payments\` (
      \`id\`, \`invoice_id\`, \`amount\`, \`payment_method\`,
      \`transaction_reference\`, \`notes\`, \`recorded_by\`, \`payment_date\`, \`created_at\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      payId,
      input.invoice_id,
      input.amount,
      input.payment_method,
      input.transaction_reference || null,
      input.notes || null,
      user?.id || null,
      now,
      now,
    ],
  );

  if (!payRes.success) {
    throw new Error(payRes.error || "Failed to record payment in database.");
  }

  // Update invoice paid_amount, due_amount, status
  const invRes = await runMySQLQuery<Record<string, unknown>[]>(
    "SELECT total_amount FROM `invoices` WHERE `id` = ? LIMIT 1;",
    [input.invoice_id],
  );
  const totalAmount = Number(invRes?.data?.[0]?.["total_amount"] || 0);

  const sumRes = await runMySQLQuery<Record<string, unknown>[]>(
    "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM `payments` WHERE `invoice_id` = ? AND `is_valid` = 1;",
    [input.invoice_id],
  );
  const totalPaid = Number(sumRes?.data?.[0]?.["total_paid"] || input.amount);
  const dueAmount = Math.max(0, totalAmount - totalPaid);
  const newStatus: InvoiceStatus =
    dueAmount === 0 ? "Paid" : totalPaid > 0 ? "Partially Paid" : "Pending";

  await runMySQLQuery(
    "UPDATE `invoices` SET `paid_amount` = ?, `due_amount` = ?, `status` = ?, `updated_at` = ? WHERE `id` = ?;",
    [totalPaid, dueAmount, newStatus, now, input.invoice_id],
  );

  return {
    success: true,
    dueAmount,
    status: newStatus,
  };
}

export async function cancelInvoice(id: string): Promise<void> {
  const now = getMySQLTimestamp();
  await runMySQLQuery(
    "UPDATE `invoices` SET `status` = 'Cancelled', `updated_at` = ? WHERE `id` = ?;",
    [now, id],
  );
}

export async function deleteInvoice(id: string): Promise<void> {
  // 1. Get prospect_id of the invoice before deleting
  let prospectId: string | null = null;
  try {
    const invRes = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT prospect_id FROM `invoices` WHERE `id` = ? LIMIT 1;",
      [id],
    );
    if (invRes.success && invRes.data?.[0]) {
      prospectId = (invRes.data[0]["prospect_id"] as string) || null;
    }
  } catch {
    // ignore
  }

  // 2. Delete payments and invoice
  await runMySQLQuery("DELETE FROM `payments` WHERE `invoice_id` = ?;", [id]);
  await runMySQLQuery("DELETE FROM `invoices` WHERE `id` = ?;", [id]);

  // 3. Clean up associated opportunity if no other invoices exist for this prospect
  if (prospectId) {
    try {
      const otherInvs = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT id FROM `invoices` WHERE `prospect_id` = ? LIMIT 1;",
        [prospectId],
      );
      if (!otherInvs.data || otherInvs.data.length === 0) {
        await runMySQLQuery("DELETE FROM `opportunities` WHERE `prospect_id` = ?;", [prospectId]);
        await runMySQLQuery(
          "UPDATE `prospects` SET `stage_id` = 'prospect', `updated_at` = NOW() WHERE `id` = ? AND `stage_id` = 'opportunity-created';",
          [prospectId],
        );
      }
    } catch (err) {
      console.warn("Error cleaning up opportunity on invoice delete:", err);
    }
  }
}

export async function updateInvoice(
  id: string,
  updates: Partial<CreateInvoiceInput>,
): Promise<Invoice> {
  const now = getMySQLTimestamp();
  const sets: string[] = ["`updated_at` = ?"];
  const params: (string | number | null)[] = [now];

  if (updates.description !== undefined) {
    sets.push("`description` = ?");
    params.push(updates.description);
  }
  if (updates.total_amount !== undefined) {
    sets.push("`total_amount` = ?");
    params.push(updates.total_amount);
  }
  if (updates.bill_date !== undefined) {
    sets.push("`bill_date` = ?");
    params.push(updates.bill_date);
  }
  if (updates.due_date !== undefined) {
    sets.push("`due_date` = ?");
    params.push(updates.due_date);
  }
  if (updates.notes !== undefined) {
    sets.push("`notes` = ?");
    params.push(updates.notes);
  }

  params.push(id);
  const sql = `UPDATE \`invoices\` SET ${sets.join(", ")} WHERE \`id\` = ?;`;
  await runMySQLQuery(sql, params);

  const inv = await fetchInvoiceById(id);
  if (!inv) throw new Error("Failed to find updated invoice");
  return inv;
}

export const invoicesQueryOptions = (
  filters: InvoiceFilters = {},
  userId?: string,
  isAdmin: boolean = false,
) =>
  queryOptions({
    queryKey: ["invoices", filters, userId, isAdmin],
    queryFn: () => fetchInvoices(filters, userId, isAdmin),
  });

export const invoiceDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["invoices", "detail", id],
    queryFn: () => fetchInvoiceById(id),
  });

export const invoicePaymentsQueryOptions = (invoiceId: string) =>
  queryOptions({
    queryKey: ["invoices", "payments", invoiceId],
    queryFn: () => fetchInvoicePayments(invoiceId),
  });

export function exportBillingHistoryCSV(invoices: Invoice[]): void {
  const headers = [
    "Invoice Number",
    "Client Name",
    "Client ID",
    "Business Name",
    "Total Amount (৳)",
    "Paid Amount (৳)",
    "Due Amount (৳)",
    "Description",
    "Bill Date",
    "Due Date",
    "Status",
    "Created By",
    "Created At",
  ];

  const rows = invoices.map((inv) => [
    `"${inv.invoice_number}"`,
    `"${inv.prospect_name.replace(/"/g, '""')}"`,
    `"${inv.prospect_id}"`,
    `"${(inv.business_name || "").replace(/"/g, '""')}"`,
    inv.total_amount,
    inv.paid_amount,
    inv.due_amount,
    `"${inv.description.replace(/"/g, '""')}"`,
    `"${inv.bill_date}"`,
    `"${inv.due_date}"`,
    `"${inv.status}"`,
    `"${inv.created_by_name.replace(/"/g, '""')}"`,
    `"${inv.created_at}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Billing_History_Export_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
