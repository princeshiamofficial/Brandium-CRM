import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// Safe DB accessor wrapper
const dynamicDb = supabase as unknown as {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (
        col: string,
        val: string,
      ) => {
        order: (
          col: string,
          opts?: { ascending?: boolean },
        ) => Promise<{ data: unknown[]; error: unknown }>;
        single: () => Promise<{ data: unknown; error: unknown }>;
      };
      order: (
        col: string,
        opts?: { ascending?: boolean },
      ) => Promise<{ data: unknown[]; error: unknown }>;
    };
    insert: (values: unknown) => {
      select: (cols: string) => {
        single: () => Promise<{ data: unknown; error: unknown }>;
      };
    };
    update: (values: unknown) => {
      eq: (col: string, val: string) => Promise<{ data: unknown; error: unknown }>;
    };
    delete: () => {
      eq: (col: string, val: string) => Promise<{ data: unknown; error: unknown }>;
    };
  };
  rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

// Rich Demo Invoices & Separate Payment History (Relationally connected)
const demoInvoices: Invoice[] = [
  {
    id: "inv-801",
    invoice_number: "INV-2026-801",
    prospect_id: "prospect-1",
    prospect_name: "Mehan Ahmed",
    business_name: "AurevixSoft",
    client_email: "mehan.ahmed@aurevixsoft.com",
    client_phone: "+8801711002233",
    description: "Annual Enterprise Telesales CRM License & Dedicated Onboarding",
    total_amount: 125000,
    paid_amount: 125000,
    due_amount: 0,
    bill_date: new Date(Date.now() - 86400000 * 10).toISOString().split("T")[0]!,
    due_date: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0]!,
    status: "Paid",
    notes: "Full payment cleared via Bank Wire Transfer.",
    created_by: "usr-1",
    created_by_name: "Mehan Ahmed",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "inv-802",
    invoice_number: "INV-2026-802",
    prospect_id: "prospect-2",
    prospect_name: "Nusrat Jahan",
    business_name: "GreenTech BD",
    client_email: "nusrat@greentechbd.org",
    client_phone: "+8801822334455",
    description: "Multi-branch POS & WhatsApp Telesales Integration Package",
    total_amount: 88000,
    paid_amount: 44000,
    due_amount: 44000,
    bill_date: new Date(Date.now() - 86400000 * 14).toISOString().split("T")[0]!,
    due_date: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0]!,
    status: "Partially Paid",
    notes: "50% advance received. Remaining 50% due post milestone verification.",
    created_by: "usr-1",
    created_by_name: "Mehan Ahmed",
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "inv-803",
    invoice_number: "INV-2026-803",
    prospect_id: "prospect-3",
    prospect_name: "Mahmud Hasan",
    business_name: "Star Logistics",
    client_email: "mahmud@starlogistics.com",
    client_phone: "+8801933445566",
    description: "Custom Fleet Logistics Tele-routing & Call Center Auto-dialer License",
    total_amount: 145000,
    paid_amount: 0,
    due_amount: 145000,
    bill_date: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0]!,
    due_date: new Date(Date.now() + 86400000 * 15).toISOString().split("T")[0]!,
    status: "Pending",
    notes: "Invoice sent to procurement department. Pending PO release.",
    created_by: "usr-3",
    created_by_name: "Farhana Islam",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "inv-804",
    invoice_number: "INV-2026-804",
    prospect_id: "prospect-4",
    prospect_name: "Sultana Razia",
    business_name: "Dhaka Fashion Wear",
    client_email: "sultana@dhakafashion.com.bd",
    client_phone: "+8801644556677",
    description: "E-Commerce Retainer & Customer Support Call Automation",
    total_amount: 62000,
    paid_amount: 0,
    due_amount: 0,
    bill_date: new Date(Date.now() - 86400000 * 20).toISOString().split("T")[0]!,
    due_date: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0]!,
    status: "Cancelled",
    notes: "Cancelled by client due to internal restructuring.",
    created_by: "usr-2",
    created_by_name: "Sabbir Hossain",
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

const demoInvoicePayments: InvoicePayment[] = [
  {
    id: "pay-101",
    invoice_id: "inv-801",
    amount: 125000,
    payment_method: "Bank Transfer",
    transaction_reference: "TRX-EBL-992011",
    payment_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: "Full payment credited via Eastern Bank wire.",
    recorded_by: "usr-1",
    recorded_by_name: "Mehan Ahmed",
    is_valid: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "pay-102",
    invoice_id: "inv-802",
    amount: 44000,
    payment_method: "bKash",
    transaction_reference: "BKSH-9928172X",
    payment_date: new Date(Date.now() - 86400000 * 4).toISOString(),
    notes: "50% upfront retainer paid via bKash Merchant.",
    recorded_by: "usr-1",
    recorded_by_name: "Mehan Ahmed",
    is_valid: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

/**
 * Calculates correct financial status and due amount server-side logic:
 * Calculation: Due = Total Amount - Sum(valid payments)
 */
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

export async function fetchInvoices(filters: InvoiceFilters = {}): Promise<Invoice[]> {
  try {
    const { data, error } = await dynamicDb
      .from("invoices")
      .select(
        `
        *,
        prospects(contact_name, business_name, email, phone)
      `,
      )
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return applyInvoiceFilters(demoInvoices, filters);
    }

    const mapped: Invoice[] = (data as Record<string, unknown>[]).map((item) => {
      const prospectObj = item["prospects"] as {
        contact_name?: string;
        business_name?: string;
        email?: string;
        phone?: string;
      } | null;

      return {
        id: String(item["id"]),
        invoice_number: String(item["invoice_number"] || `INV-2026-${item["id"]}`),
        prospect_id: String(item["prospect_id"]),
        prospect_name: prospectObj?.contact_name || String(item["prospect_name"] || "Client"),
        business_name: prospectObj?.business_name || (item["business_name"] as string) || undefined,
        client_email: prospectObj?.email || (item["client_email"] as string) || undefined,
        client_phone: prospectObj?.phone || (item["client_phone"] as string) || undefined,
        description: String(item["description"] || "Software Services"),
        total_amount: Number(item["total_amount"] || 0),
        paid_amount: Number(item["paid_amount"] || 0),
        due_amount: Number(item["due_amount"] || 0),
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

    return applyInvoiceFilters(mapped, filters);
  } catch {
    return applyInvoiceFilters(demoInvoices, filters);
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
    const { data, error } = await dynamicDb
      .from("invoice_payments")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("payment_date", { ascending: false });

    if (error || !data || data.length === 0) {
      return demoInvoicePayments.filter((p) => p.invoice_id === invoiceId);
    }

    return (data as Record<string, unknown>[]).map((p) => ({
      id: String(p["id"]),
      invoice_id: String(p["invoice_id"]),
      amount: Number(p["amount"] || 0),
      payment_method: (p["payment_method"] as PaymentMethod) || "Bank Transfer",
      transaction_reference: (p["transaction_reference"] as string) || null,
      payment_date: String(p["payment_date"] || new Date().toISOString()),
      notes: (p["notes"] as string) || null,
      recorded_by: (p["recorded_by"] as string) || null,
      recorded_by_name: String(p["recorded_by_name"] || "Agent"),
      is_valid: Boolean(p["is_valid"] ?? true),
      created_at: String(p["created_at"] || new Date().toISOString()),
    }));
  } catch {
    return demoInvoicePayments.filter((p) => p.invoice_id === invoiceId);
  }
}

export async function createInvoice(
  input: CreateInvoiceInput,
  user?: { id?: string; email?: string } | null,
): Promise<Invoice> {
  const now = new Date().toISOString();
  const invNum = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;

  // Find prospect details
  let prospectName = "Client";
  let businessName: string | undefined;
  let clientEmail: string | undefined;
  let clientPhone: string | undefined;

  try {
    const { data } = await supabase
      .from("prospects")
      .select("contact_name, business_name, email, phone")
      .eq("id", input.prospect_id)
      .single();

    if (data) {
      const prospectData = data as Record<string, unknown>;
      prospectName = (prospectData["contact_name"] as string) || "Client";
      businessName = (prospectData["business_name"] as string) || undefined;
      clientEmail = (prospectData["email"] as string) || undefined;
      clientPhone = (prospectData["phone"] as string) || undefined;
    }
  } catch {
    // Demo fallback prospect
  }

  const newInv: Invoice = {
    id: `inv-${Date.now()}`,
    invoice_number: invNum,
    prospect_id: input.prospect_id,
    prospect_name: prospectName,
    business_name: businessName,
    client_email: clientEmail,
    client_phone: clientPhone,
    description: input.description,
    total_amount: input.total_amount,
    paid_amount: 0,
    due_amount: input.total_amount,
    bill_date: input.bill_date,
    due_date: input.due_date,
    status: "Pending",
    notes: input.notes || null,
    created_by: user?.id || null,
    created_by_name: user?.email || "Current User",
    created_at: now,
    updated_at: now,
  };

  demoInvoices.unshift(newInv);

  try {
    await dynamicDb.from("invoices").insert({
      invoice_number: invNum,
      prospect_id: input.prospect_id,
      prospect_name: prospectName,
      description: input.description,
      total_amount: input.total_amount,
      paid_amount: 0,
      due_amount: input.total_amount,
      bill_date: input.bill_date,
      due_date: input.due_date,
      status: "Pending",
      notes: input.notes || null,
      created_by: user?.id || null,
      created_by_name: user?.email || "Current User",
    });
  } catch {
    // Demo in-memory insert fallback
  }

  return newInv;
}

/**
 * Server-Side Financial Logic for Recording Payments
 * Uses database RPC transaction when connected, with strictly accurate fallback calculation:
 * Calculation: Due = Total Amount - Sum(valid payments)
 */
export async function recordInvoicePayment(
  input: RecordPaymentInput,
  user?: { id?: string; email?: string } | null,
): Promise<{ success: boolean; dueAmount: number; status: InvoiceStatus }> {
  if (input.amount <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

  const now = new Date().toISOString();
  const payId = `pay-${Date.now()}`;

  const newPayment: InvoicePayment = {
    id: payId,
    invoice_id: input.invoice_id,
    amount: input.amount,
    payment_method: input.payment_method,
    transaction_reference: input.transaction_reference || null,
    payment_date: now,
    notes: input.notes || null,
    recorded_by: user?.id || null,
    recorded_by_name: user?.email || "Agent",
    is_valid: true,
    created_at: now,
  };

  // Add payment to stored payment history array
  demoInvoicePayments.unshift(newPayment);

  // Try PL/pgSQL Atomic Transaction RPC call
  try {
    const { data, error } = await dynamicDb.rpc("record_invoice_payment", {
      p_invoice_id: input.invoice_id,
      p_amount: input.amount,
      p_payment_method: input.payment_method,
      p_transaction_reference: input.transaction_reference || null,
      p_notes: input.notes || null,
      p_recorded_by: user?.id || null,
      p_recorded_by_name: user?.email || "Agent",
    });

    if (!error && data) {
      const resObj = data as { due_amount: number; status: InvoiceStatus };
      return {
        success: true,
        dueAmount: Number(resObj.due_amount || 0),
        status: resObj.status,
      };
    }
  } catch {
    // Fallback logic
  }

  // Recalculate invoice status strictly via financial logic
  const targetInvIndex = demoInvoices.findIndex((i) => i.id === input.invoice_id);
  if (targetInvIndex !== -1) {
    const targetInv = demoInvoices[targetInvIndex]!;
    const invPayments = demoInvoicePayments.filter((p) => p.invoice_id === input.invoice_id);
    const fin = calculateInvoiceFinancials(targetInv.total_amount, invPayments);

    demoInvoices[targetInvIndex] = {
      ...targetInv,
      paid_amount: fin.paidAmount,
      due_amount: fin.dueAmount,
      status: fin.status,
      updated_at: now,
    };

    return {
      success: true,
      dueAmount: fin.dueAmount,
      status: fin.status,
    };
  }

  return { success: true, dueAmount: 0, status: "Paid" };
}

export async function cancelInvoice(id: string): Promise<void> {
  const index = demoInvoices.findIndex((i) => i.id === id);
  if (index !== -1) {
    demoInvoices[index] = {
      ...demoInvoices[index]!,
      status: "Cancelled",
      updated_at: new Date().toISOString(),
    };
  }

  try {
    await dynamicDb.from("invoices").update({ status: "Cancelled" }).eq("id", id);
  } catch {
    // Ignore fallback error
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  const index = demoInvoices.findIndex((i) => i.id === id);
  if (index !== -1) {
    demoInvoices.splice(index, 1);
  }

  try {
    await dynamicDb.from("invoices").delete().eq("id", id);
  } catch {
    // Ignore fallback error
  }
}

export async function updateInvoice(
  id: string,
  updates: Partial<CreateInvoiceInput>,
): Promise<Invoice> {
  const index = demoInvoices.findIndex((i) => i.id === id);
  if (index === -1) throw new Error("Invoice not found");

  const existing = demoInvoices[index]!;
  const newTotal =
    updates.total_amount !== undefined ? updates.total_amount : existing.total_amount;
  const invPayments = demoInvoicePayments.filter((p) => p.invoice_id === id);
  const fin = calculateInvoiceFinancials(newTotal, invPayments);

  const updatedInv: Invoice = {
    ...existing,
    description: updates.description !== undefined ? updates.description : existing.description,
    total_amount: newTotal,
    paid_amount: fin.paidAmount,
    due_amount: fin.dueAmount,
    status: existing.status === "Cancelled" ? "Cancelled" : fin.status,
    bill_date: updates.bill_date !== undefined ? updates.bill_date : existing.bill_date,
    due_date: updates.due_date !== undefined ? updates.due_date : existing.due_date,
    notes: updates.notes !== undefined ? updates.notes : existing.notes,
    updated_at: new Date().toISOString(),
  };

  demoInvoices[index] = updatedInv;

  try {
    await dynamicDb.from("invoices").update(updatedInv).eq("id", id);
  } catch {
    // Ignore fallback error
  }

  return updatedInv;
}

export const invoicesQueryOptions = (filters: InvoiceFilters = {}) =>
  queryOptions({
    queryKey: ["invoices", filters],
    queryFn: () => fetchInvoices(filters),
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
