import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";

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

export function calculateClientBalance(totalBilled: number, totalPaid: number): number {
  return Math.max(0, totalBilled - totalPaid);
}

export async function fetchClientBalances(
  filters: ClientBalanceFilters = {},
): Promise<ClientBalance[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        p.id AS client_id,
        p.contact_name AS name,
        p.business_name,
        p.phone,
        p.email,
        p.updated_at AS last_updated,
        COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.total_amount ELSE 0 END), 0) AS total_billed,
        COALESCE(SUM(CASE WHEN i.status != 'Cancelled' THEN i.paid_amount ELSE 0 END), 0) AS total_paid
      FROM \`prospects\` p
      LEFT JOIN \`invoices\` i ON p.id = i.prospect_id
      WHERE p.is_active = 1
      GROUP BY p.id, p.contact_name, p.business_name, p.phone, p.email, p.updated_at
      ORDER BY total_billed DESC, p.created_at DESC;`,
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    const mapped: ClientBalance[] = res.data.map((item) => {
      const billed = Number(item["total_billed"] || 0);
      const paid = Number(item["total_paid"] || 0);
      const bal = calculateClientBalance(billed, paid);

      return {
        client_id: String(item["client_id"] || ""),
        name: String(item["name"] || "Client"),
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
  } catch (err) {
    console.warn("fetchClientBalances error:", err);
    return [];
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
