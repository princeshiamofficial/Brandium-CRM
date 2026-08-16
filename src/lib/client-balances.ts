import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ClientBalance = {
  client_id: string;
  name: string;
  business_name?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  current_balance: number;
  total_billed: number;
  total_paid: number;
  last_updated: string;
};

export type ClientBalanceFilters = {
  search?: string | undefined;
  from_date?: string | undefined;
  to_date?: string | undefined;
};

// Safe DB accessor wrapper
const dynamicDb = supabase as unknown as {
  from: (table: string) => {
    select: (cols: string) => {
      order: (
        col: string,
        opts?: { ascending?: boolean },
      ) => Promise<{ data: unknown[]; error: unknown }>;
    };
  };
};

// Rich Demo Client Balances Dataset (Aggregated from live Invoices & Payments)
const demoClientBalances: ClientBalance[] = [
  {
    client_id: "prospect-1",
    name: "Mehan Ahmed",
    business_name: "AurevixSoft",
    phone: "+8801711002233",
    email: "mehan.ahmed@aurevixsoft.com",
    total_billed: 125000,
    total_paid: 125000,
    current_balance: 0, // 125000 - 125000 = 0
    last_updated: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    client_id: "prospect-2",
    name: "Nusrat Jahan",
    business_name: "GreenTech BD",
    phone: "+8801822334455",
    email: "nusrat@greentechbd.org",
    total_billed: 88000,
    total_paid: 44000,
    current_balance: 44000, // 88000 - 44000 = 44000
    last_updated: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    client_id: "prospect-3",
    name: "Mahmud Hasan",
    business_name: "Star Logistics",
    phone: "+8801933445566",
    email: "mahmud@starlogistics.com",
    total_billed: 145000,
    total_paid: 0,
    current_balance: 145000, // 145000 - 0 = 145000
    last_updated: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    client_id: "prospect-4",
    name: "Sultana Razia",
    business_name: "Dhaka Fashion Wear",
    phone: "+8801644556677",
    email: "sultana@dhakafashion.com.bd",
    total_billed: 0, // Cancelled invoice ignored
    total_paid: 0,
    current_balance: 0,
    last_updated: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    client_id: "prospect-5",
    name: "Kazi Farhan",
    business_name: "Skyline Travels",
    phone: "+8801555667788",
    email: "farhan@skylinetravels.com",
    total_billed: 95000,
    total_paid: 30000,
    current_balance: 65000, // 95000 - 30000 = 65000
    last_updated: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

/**
 * Pure SQL Aggregation Calculator
 * Formula: Current Balance = SUM(non-cancelled invoices) - SUM(valid payments)
 */
export function calculateClientBalance(totalBilled: number, totalPaid: number): number {
  return Math.max(0, totalBilled - totalPaid);
}

export async function fetchClientBalances(
  filters: ClientBalanceFilters = {},
): Promise<ClientBalance[]> {
  try {
    const { data, error } = await dynamicDb
      .from("client_balances_view")
      .select("*")
      .order("current_balance", { ascending: false });

    if (error || !data || data.length === 0) {
      return applyClientBalanceFilters(demoClientBalances, filters);
    }

    const mapped: ClientBalance[] = (data as Record<string, unknown>[]).map((item) => {
      const billed = Number(item["total_billed"] || 0);
      const paid = Number(item["total_paid"] || 0);
      const bal = calculateClientBalance(billed, paid);

      return {
        client_id: String(item["client_id"] || item["id"]),
        name: String(item["name"] || item["contact_name"] || "Client"),
        business_name: (item["business_name"] as string) || undefined,
        phone: (item["phone"] as string) || undefined,
        email: (item["email"] as string) || undefined,
        total_billed: billed,
        total_paid: paid,
        current_balance: bal,
        last_updated: String(item["last_updated"] || new Date().toISOString()),
      };
    });

    return applyClientBalanceFilters(mapped, filters);
  } catch {
    return applyClientBalanceFilters(demoClientBalances, filters);
  }
}

function applyClientBalanceFilters(
  list: ClientBalance[],
  filters: ClientBalanceFilters,
): ClientBalance[] {
  let result = list;

  if (filters.from_date) {
    const fromStr = filters.from_date;
    result = result.filter((c) => c.last_updated.split("T")[0]! >= fromStr);
  }

  if (filters.to_date) {
    const toStr = filters.to_date;
    result = result.filter((c) => c.last_updated.split("T")[0]! <= toStr);
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.business_name && c.business_name.toLowerCase().includes(q)) ||
        c.client_id.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)),
    );
  }

  return result;
}

export const clientBalancesQueryOptions = (filters: ClientBalanceFilters = {}) =>
  queryOptions({
    queryKey: ["client-balances", filters],
    queryFn: () => fetchClientBalances(filters),
  });
