import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "./mysql-api";

export type WonSaleItem = {
  id: string;
  prospect_id: string;
  client_name: string;
  business_name: string | null;
  client_designation: string;
  phone: string;
  email: string;
  assigned_agent_id: string;
  assigned_agent_name: string;
  deal_value: number;
  sale_amount: number;
  paid_amount: number;
  due_amount: number;
  service_id: string | null;
  service_name: string;
  created_by_id: string;
  created_by_name: string;
  billing_invoice_id: string;
  notes: string;
  won_at: string;
  created_at: string;
  updated_at?: string | undefined;
};

export type WonSaleFilters = {
  agent_id?: string | undefined;
  service_id?: string | undefined;
  search?: string | undefined;
  from_date?: string | undefined;
  to_date?: string | undefined;
};

export type AgentOption = {
  id: string;
  name: string;
  role?: string;
};

export type ArtistOption = {
  id: string;
  name: string;
  role?: string;
};

export async function fetchWonSales(
  filters: WonSaleFilters = {},
  userId?: string,
  isAdmin: boolean = false,
): Promise<WonSaleItem[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        s.id,
        s.prospect_id,
        COALESCE(p.contact_name, 'Client') AS client_name,
        p.business_name,
        COALESCE(p.designation, '') AS client_designation,
        COALESCE(p.phone, '') AS phone,
        COALESCE(p.email, '') AS email,
        COALESCE(s.agent_id, p.assigned_to, '') AS assigned_agent_id,
        COALESCE(u_agent.name, 'Unassigned') AS assigned_agent_name,
        COALESCE(s.deal_value, 0) AS deal_value,
        COALESCE(s.paid_amount, 0) AS paid_amount,
        COALESCE(s.due_amount, 0) AS due_amount,
        s.service_id,
        COALESCE(srv.name, 'Custom Package') AS service_name,
        COALESCE(s.created_by, '') AS created_by_id,
        COALESCE(u_creator.name, 'Admin') AS created_by_name,
        COALESCE(s.billing_invoice_id, '') AS billing_invoice_id,
        COALESCE(s.notes, '') AS notes,
        COALESCE(s.won_at, s.created_at, NOW()) AS won_at,
        COALESCE(s.created_at, NOW()) AS created_at
      FROM \`sales\` s
      LEFT JOIN \`prospects\` p ON s.prospect_id = p.id
      LEFT JOIN \`services\` srv ON s.service_id = srv.id
      LEFT JOIN \`users\` u_agent ON (s.agent_id = u_agent.id OR p.assigned_to = u_agent.id)
      LEFT JOIN \`users\` u_creator ON s.created_by = u_creator.id
      WHERE (s.is_deleted = 0 OR s.is_deleted IS NULL)
      ORDER BY s.created_at DESC;`,
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    let items: WonSaleItem[] = res.data.map((r) => {
      const dealValue = Number(r["deal_value"] || 0);
      const paidAmount = Number(r["paid_amount"] || 0);
      const dueAmount = Number(r["due_amount"] || Math.max(0, dealValue - paidAmount));

      return {
        id: String(r["id"]),
        prospect_id: String(r["prospect_id"] || ""),
        client_name: String(r["client_name"] || "Client"),
        business_name: r["business_name"] ? String(r["business_name"]) : null,
        client_designation: String(r["client_designation"] || ""),
        phone: String(r["phone"] || ""),
        email: String(r["email"] || ""),
        assigned_agent_id: String(r["assigned_agent_id"] || ""),
        assigned_agent_name: String(r["assigned_agent_name"] || "Unassigned"),
        deal_value: dealValue,
        sale_amount: dealValue,
        paid_amount: paidAmount,
        due_amount: dueAmount,
        service_id: r["service_id"] ? String(r["service_id"]) : null,
        service_name: String(r["service_name"] || "General Service"),
        created_by_id: String(r["created_by_id"] || ""),
        created_by_name: String(r["created_by_name"] || "Admin"),
        billing_invoice_id: String(r["billing_invoice_id"] || ""),
        notes: String(r["notes"] || ""),
        won_at: String(r["won_at"] || new Date().toISOString()),
        created_at: String(r["created_at"] || new Date().toISOString()),
        updated_at: r["updated_at"] ? String(r["updated_at"]) : undefined,
      };
    });

    if (!isAdmin && userId) {
      items = items.filter((s) => s.assigned_agent_id === userId || s.created_by_id === userId);
    }

    return applyFilters(items, filters);
  } catch (err) {
    console.warn("fetchWonSales MySQL error:", err);
    return [];
  }
}

function applyFilters(items: WonSaleItem[], filters: WonSaleFilters): WonSaleItem[] {
  let result = [...items];

  if (filters.agent_id && filters.agent_id !== "all") {
    result = result.filter(
      (item) =>
        item.assigned_agent_id === filters.agent_id || item.created_by_id === filters.agent_id,
    );
  }

  if (filters.service_id && filters.service_id !== "all") {
    result = result.filter((item) => item.service_id === filters.service_id);
  }

  if (filters.search) {
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
      `SELECT u.id, COALESCE(p.full_name, u.name, u.email) AS name, u.role 
       FROM \`users\` u 
       LEFT JOIN \`profiles\` p ON u.id = p.id 
       WHERE (u.is_deleted = 0 OR u.is_deleted IS NULL) 
         AND (u.status = 'Active' OR u.status IS NULL)
         AND (LOWER(u.role) = 'agent' OR LOWER(u.role) LIKE '%agent%' OR LOWER(u.role) = 'admin')
       ORDER BY name ASC;`,
    );
    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }
    return res.data.map((u) => ({
      id: String(u["id"]),
      name: String(u["name"] || "Agent"),
      role: String(u["role"] || "AGENT"),
    }));
  } catch (err) {
    console.warn("fetchAgentOptions MySQL error:", err);
    return [];
  }
}

export async function fetchArtistOptions(): Promise<ArtistOption[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT u.id, COALESCE(p.full_name, u.name, u.email) AS name, u.role 
       FROM \`users\` u 
       LEFT JOIN \`profiles\` p ON u.id = p.id 
       WHERE (u.is_deleted = 0 OR u.is_deleted IS NULL) 
         AND (u.status = 'Active' OR u.status IS NULL)
         AND (LOWER(u.role) = 'artist' OR LOWER(u.role) LIKE '%artist%')
       ORDER BY name ASC;`,
    );
    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }
    return res.data.map((u) => ({
      id: String(u["id"]),
      name: String(u["name"] || "Artist"),
      role: String(u["role"] || "ARTIST"),
    }));
  } catch (err) {
    console.warn("fetchArtistOptions MySQL error:", err);
    return [];
  }
}

export const wonSalesQueryOptions = (
  filters: WonSaleFilters = {},
  userId?: string,
  isAdmin: boolean = false,
) =>
  queryOptions({
    queryKey: ["won-sales", filters, userId, isAdmin],
    queryFn: () => fetchWonSales(filters, userId, isAdmin),
  });

export const agentOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["agents", "options"],
    queryFn: () => fetchAgentOptions(),
  });

export const artistOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ["artists", "options"],
    queryFn: () => fetchArtistOptions(),
  });
