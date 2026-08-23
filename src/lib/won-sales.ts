import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// Safe DB accessor wrapper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dynamicDb = supabase as unknown as { from: (table: string) => any };

// Won Sales Dataset
const DEMO_WON_SALES: WonSale[] = [];

const DEMO_AGENTS: AgentOption[] = [];

export async function fetchWonSales(filters: WonSaleFilters = {}): Promise<WonSale[]> {
  try {
    const { data, error } = await dynamicDb
      .from("sales")
      .select("*, prospects(contact_name, business_name, email, phone)")
      .order("won_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    const mapped: WonSale[] = (data as Record<string, unknown>[]).map((item) => {
      const prospectObj = item["prospects"] as {
        contact_name?: string;
        business_name?: string;
        email?: string;
        phone?: string;
      } | null;

      const oppObj = item["opportunities"] as {
        estimated_value?: number;
        notes?: string;
      } | null;

      return {
        id: String(item["id"]),
        opportunity_id: String(item["opportunity_id"] || `opp-${item["id"]}`),
        prospect_id: String(item["prospect_id"]),
        client_name: prospectObj?.contact_name || String(item["client_name"] || "Client"),
        business_name: prospectObj?.business_name || (item["business_name"] as string) || undefined,
        client_designation: String(item["client_designation"] || "Managing Director"),
        phone: prospectObj?.phone || String(item["phone"] || ""),
        email: prospectObj?.email || String(item["email"] || ""),
        sale_amount: Number(item["sale_amount"] || oppObj?.estimated_value || 0),
        assigned_agent_id: (item["assigned_agent_id"] as string) || null,
        assigned_agent_name: String(item["assigned_agent_name"] || "Agent"),
        created_by_id: (item["created_by_id"] as string) || null,
        created_by_name: String(item["created_by_name"] || "Admin"),
        billing_invoice_id: String(item["billing_invoice_id"] || "INV-2026-001"),
        notes: String(item["notes"] || oppObj?.notes || "Sales Won agreement terms."),
        won_at: String(item["won_at"] || item["updated_at"] || new Date().toISOString()),
        created_at: String(item["created_at"] || new Date().toISOString()),
        updated_at: String(item["updated_at"] || new Date().toISOString()),
      };
    });

    return applyClientFilters(mapped, filters);
  } catch {
    // Fall back to relational demo dataset
    return applyClientFilters(DEMO_WON_SALES, filters);
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
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEMO_AGENTS;
    }

    return (data as Record<string, unknown>[]).map((p) => ({
      id: String(p["id"] ?? ""),
      name: String((p["full_name"] as string) || (p["email"] as string) || "Agent"),
    }));
  } catch {
    return DEMO_AGENTS;
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
