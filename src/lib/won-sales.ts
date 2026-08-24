import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";

export type WonSale = {
  id: string;
  opportunity_id: string;
  prospect_id: string;
  client_name: string;
  business_name?: string | undefined;
  client_designation: string;
  phone: string;
  email: string;
  sale_amount: number;
  assigned_agent_id: string | null;
  assigned_agent_name: string;
  created_by_id: string | null;
  created_by_name: string;
  billing_invoice_id: string;
  notes: string;
  won_at: string;
  created_at: string;
  updated_at: string;
};

export type WonSaleFilters = {
  search?: string | undefined;
  agent_id?: string | "all" | undefined;
  from_date?: string | undefined;
  to_date?: string | undefined;
};

export type AgentOption = {
  id: string;
  name: string;
};

export async function fetchWonSales(filters: WonSaleFilters = {}): Promise<WonSale[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        o.id AS opportunity_id,
        o.id AS id,
        p.id AS prospect_id,
        p.contact_name AS client_name,
        p.business_name,
        COALESCE(p.designation, 'Managing Director') AS client_designation,
        p.phone,
        p.email,
        o.estimated_value AS sale_amount,
        o.assigned_to AS assigned_agent_id,
        COALESCE(u_assign.name, 'Agent') AS assigned_agent_name,
        o.created_by AS created_by_id,
        COALESCE(u_create.name, 'Admin') AS created_by_name,
        COALESCE(i.invoice_number, CONCAT('INV-2026-', SUBSTRING(o.id, 1, 4))) AS billing_invoice_id,
        COALESCE(o.notes, 'Sales Closed agreement.') AS notes,
        o.updated_at AS won_at,
        o.created_at,
        o.updated_at
      FROM \`opportunities\` o
      JOIN \`prospects\` p ON o.prospect_id = p.id
      LEFT JOIN \`users\` u_assign ON o.assigned_to = u_assign.id
      LEFT JOIN \`users\` u_create ON o.created_by = u_create.id
      LEFT JOIN \`invoices\` i ON p.id = i.prospect_id
      WHERE (o.status = 'Sales Won' OR o.status = 'Won' OR LOWER(o.status) LIKE '%won%')
        AND o.is_active = 1
      ORDER BY o.updated_at DESC;`,
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    const mapped: WonSale[] = res.data.map((item) => ({
      id: String(item["id"]),
      opportunity_id: String(item["opportunity_id"]),
      prospect_id: String(item["prospect_id"] || ""),
      client_name: String(item["client_name"] || "Client"),
      business_name: (item["business_name"] as string) || undefined,
      client_designation: String(item["client_designation"] || "Managing Director"),
      phone: String(item["phone"] || ""),
      email: String(item["email"] || ""),
      sale_amount: Number(item["sale_amount"] || 0),
      assigned_agent_id: (item["assigned_agent_id"] as string) || null,
      assigned_agent_name: String(item["assigned_agent_name"] || "Agent"),
      created_by_id: (item["created_by_id"] as string) || null,
      created_by_name: String(item["created_by_name"] || "Admin"),
      billing_invoice_id: String(item["billing_invoice_id"] || "INV-2026-001"),
      notes: String(item["notes"] || ""),
      won_at: String(item["won_at"] || new Date().toISOString()),
      created_at: String(item["created_at"] || new Date().toISOString()),
      updated_at: String(item["updated_at"] || new Date().toISOString()),
    }));

    return applyClientFilters(mapped, filters);
  } catch (err) {
    console.warn("fetchWonSales MySQL error:", err);
    return [];
  }
}

function applyClientFilters(list: WonSale[], filters: WonSaleFilters): WonSale[] {
  let result = list;

  if (filters.agent_id && filters.agent_id !== "all") {
    result = result.filter((item) => item.assigned_agent_id === filters.agent_id);
  }

  if (filters.from_date) {
    const fromStr = filters.from_date;
    result = result.filter((item) => item.won_at.split("T")[0]! >= fromStr);
  }

  if (filters.to_date) {
    const toStr = filters.to_date;
    result = result.filter((item) => item.won_at.split("T")[0]! <= toStr);
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.client_name.toLowerCase().includes(q) ||
        (item.business_name && item.business_name.toLowerCase().includes(q)) ||
        item.client_designation.toLowerCase().includes(q) ||
        item.phone.includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.assigned_agent_name.toLowerCase().includes(q) ||
        item.created_by_name.toLowerCase().includes(q) ||
        item.billing_invoice_id.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q),
    );
  }

  return result;
}

export async function fetchAgentOptions(): Promise<AgentOption[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT id, name FROM `users` WHERE (is_deleted = 0 OR is_deleted IS NULL) AND (status = 'Active' OR status IS NULL) ORDER BY name ASC;",
    );
    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }
    return res.data.map((u) => ({
      id: String(u["id"]),
      name: String(u["name"] || "Agent"),
    }));
  } catch (err) {
    console.warn("fetchAgentOptions MySQL error:", err);
    return [];
  }
}

export const wonSalesQueryOptions = (filters: WonSaleFilters = {}) =>
  queryOptions({
    queryKey: ["won-sales", filters],
    queryFn: () => fetchWonSales(filters),
  });

export const agentOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["agents", "options"],
    queryFn: () => fetchAgentOptions(),
  });
