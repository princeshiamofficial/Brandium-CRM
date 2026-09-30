import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { runMySQLQuery } from "@/lib/mysql-api";
import { generateUUID, getMySQLTimestamp } from "@/lib/mysql-client";

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  payment_method: string;
  expense_date: string;
  vendor: string | null;
  reference_no: string | null;
  receipt_url: string | null;
  notes: string | null;
  recorded_by: string | null;
  recorded_by_name?: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpenseSummary = {
  totalThisMonth: number;
  totalAllTime: number;
  totalCount: number;
  topCategory: string;
};

export type ExpenseFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  payment_method?: string;
  from_date?: string;
  to_date?: string;
};

export const EXPENSE_CATEGORIES = [
  "Office Rent",
  "Utilities & Bills",
  "Salaries & Allowances",
  "Hardware & Equipment",
  "Software & Subscriptions",
  "Marketing & Advertising",
  "Food & Refreshment",
  "Travel & Transport",
  "Office Supplies",
  "Maintenance & Repairs",
  "Miscellaneous",
] as const;

export const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "bKash",
  "Nagad",
  "Credit Card",
  "Cheque",
] as const;

export function getCategoryBadgeClass(category: string): string {
  const norm = (category || "").toLowerCase();
  if (norm.includes("rent"))
    return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200";
  if (norm.includes("utilit") || norm.includes("bill"))
    return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200";
  if (norm.includes("salar") || norm.includes("wage"))
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200";
  if (norm.includes("hard") || norm.includes("equip"))
    return "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200";
  if (norm.includes("soft") || norm.includes("subscrip"))
    return "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200";
  if (norm.includes("market") || norm.includes("ad"))
    return "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200";
  if (norm.includes("food") || norm.includes("refresh"))
    return "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200";
  if (norm.includes("travel") || norm.includes("transp"))
    return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200";
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
}

export function formatCurrencyBdt(amount: number): string {
  return (
    "৳" +
    Number(amount || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export const expensesQuery = (filters: ExpenseFilters = {}) =>
  queryOptions({
    queryKey: ["expenses-list", filters],
    queryFn: async (): Promise<{ items: Expense[]; totalCount: number }> => {
      const page = Math.max(1, Number(filters.page || 1));
      const pageSize = Math.max(1, Number(filters.pageSize || 15));
      const offset = (page - 1) * pageSize;

      const conditions: string[] = ["1=1"];
      const params: (string | number)[] = [];

      if (filters.search && filters.search.trim()) {
        conditions.push(
          "(e.title LIKE ? OR e.vendor LIKE ? OR e.reference_no LIKE ? OR e.notes LIKE ?)",
        );
        const searchPattern = `%${filters.search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (filters.category && filters.category !== "all") {
        conditions.push("e.category = ?");
        params.push(filters.category);
      }

      if (filters.payment_method && filters.payment_method !== "all") {
        conditions.push("e.payment_method = ?");
        params.push(filters.payment_method);
      }

      if (filters.from_date) {
        conditions.push("e.expense_date >= ?");
        params.push(filters.from_date);
      }

      if (filters.to_date) {
        conditions.push("e.expense_date <= ?");
        params.push(filters.to_date);
      }

      const whereClause = conditions.join(" AND ");

      const countSql = `SELECT COUNT(*) AS total FROM \`expenses\` e WHERE ${whereClause}`;
      const countResult = await runMySQLQuery<Record<string, unknown>[]>(countSql, params);
      const totalCount = Number(countResult.data?.[0]?.["total"] ?? 0);

      const itemsSql = `
        SELECT 
          e.*,
          COALESCE(prof.full_name, u.name, e.recorded_by) AS recorded_by_name
        FROM \`expenses\` e
        LEFT JOIN \`users\` u ON e.recorded_by = u.id
        LEFT JOIN \`profiles\` prof ON e.recorded_by = prof.id
        WHERE ${whereClause}
        ORDER BY e.expense_date DESC, e.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const queryParams = [...params, pageSize, offset];
      const rowsRes = await runMySQLQuery<Record<string, unknown>[]>(itemsSql, queryParams);
      const rows = (rowsRes.data || []) as Record<string, unknown>[];

      const items: Expense[] = rows.map((r) => ({
        id: String(r["id"] || ""),
        title: String(r["title"] || ""),
        category: String(r["category"] || "Miscellaneous"),
        amount: Number(r["amount"] || 0),
        payment_method: String(r["payment_method"] || "Cash"),
        expense_date: String(r["expense_date"] || "").slice(0, 10),
        vendor: r["vendor"] ? String(r["vendor"]) : null,
        reference_no: r["reference_no"] ? String(r["reference_no"]) : null,
        receipt_url: r["receipt_url"] ? String(r["receipt_url"]) : null,
        notes: r["notes"] ? String(r["notes"]) : null,
        recorded_by: r["recorded_by"] ? String(r["recorded_by"]) : null,
        recorded_by_name: r["recorded_by_name"] ? String(r["recorded_by_name"]) : null,
        created_at: String(r["created_at"] || ""),
        updated_at: String(r["updated_at"] || ""),
      }));

      return { items, totalCount };
    },
  });

export const expenseSummaryQuery = () =>
  queryOptions({
    queryKey: ["expense-summary"],
    queryFn: async (): Promise<ExpenseSummary> => {
      try {
        const sql = `
          SELECT 
            COALESCE(SUM(CASE WHEN MONTH(expense_date) = MONTH(CURRENT_DATE()) AND YEAR(expense_date) = YEAR(CURRENT_DATE()) THEN amount ELSE 0 END), 0) AS total_this_month,
            COALESCE(SUM(amount), 0) AS total_all_time,
            COUNT(*) AS total_count
          FROM \`expenses\`
        `;
        const result = await runMySQLQuery<Record<string, unknown>[]>(sql);
        const totalThisMonth = Number(result.data?.[0]?.["total_this_month"] || 0);
        const totalAllTime = Number(result.data?.[0]?.["total_all_time"] || 0);
        const totalCount = Number(result.data?.[0]?.["total_count"] || 0);

        const topCatSql = `
          SELECT category, SUM(amount) AS total
          FROM \`expenses\`
          GROUP BY category
          ORDER BY total DESC
          LIMIT 1
        `;
        const topCatResult = await runMySQLQuery<Record<string, unknown>[]>(topCatSql);
        const topCategory = topCatResult.data?.[0]?.["category"]
          ? String(topCatResult.data[0]["category"])
          : "None";

        return {
          totalThisMonth,
          totalAllTime,
          totalCount,
          topCategory,
        };
      } catch (err) {
        console.error("Failed to fetch expense summary:", err);
        return {
          totalThisMonth: 0,
          totalAllTime: 0,
          totalCount: 0,
          topCategory: "None",
        };
      }
    },
  });

export function useAddExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      category: string;
      amount: number;
      payment_method: string;
      expense_date: string;
      vendor?: string | null;
      reference_no?: string | null;
      receipt_url?: string | null;
      notes?: string | null;
      recorded_by?: string | null;
    }) => {
      const id = generateUUID();
      const now = getMySQLTimestamp();

      const sql = `
        INSERT INTO \`expenses\` (
          \`id\`, \`title\`, \`category\`, \`amount\`, \`payment_method\`,
          \`expense_date\`, \`vendor\`, \`reference_no\`, \`receipt_url\`,
          \`notes\`, \`recorded_by\`, \`created_at\`, \`updated_at\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        id,
        payload.title,
        payload.category,
        payload.amount,
        payload.payment_method || "Cash",
        payload.expense_date,
        payload.vendor || null,
        payload.reference_no || null,
        payload.receipt_url || null,
        payload.notes || null,
        payload.recorded_by || null,
        now,
        now,
      ];

      await runMySQLQuery(sql, params);
      return { id };
    },
    onSuccess: () => {
      toast.success("Expense recorded successfully.");
      queryClient.invalidateQueries({ queryKey: ["expenses-list"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to record expense: ${err.message}`);
    },
  });
}

export function useUpdateExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      title: string;
      category: string;
      amount: number;
      payment_method: string;
      expense_date: string;
      vendor?: string | null;
      reference_no?: string | null;
      receipt_url?: string | null;
      notes?: string | null;
    }) => {
      const now = getMySQLTimestamp();

      const sql = `
        UPDATE \`expenses\`
        SET 
          \`title\` = ?,
          \`category\` = ?,
          \`amount\` = ?,
          \`payment_method\` = ?,
          \`expense_date\` = ?,
          \`vendor\` = ?,
          \`reference_no\` = ?,
          \`receipt_url\` = ?,
          \`notes\` = ?,
          \`updated_at\` = ?
        WHERE \`id\` = ?
      `;
      const params = [
        payload.title,
        payload.category,
        payload.amount,
        payload.payment_method,
        payload.expense_date,
        payload.vendor || null,
        payload.reference_no || null,
        payload.receipt_url || null,
        payload.notes || null,
        now,
        payload.id,
      ];

      await runMySQLQuery(sql, params);
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Expense updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["expenses-list"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to update expense: ${err.message}`);
    },
  });
}

export function useDeleteExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const sql = "DELETE FROM `expenses` WHERE `id` = ?";
      await runMySQLQuery(sql, [id]);
      return { id };
    },
    onSuccess: () => {
      toast.success("Expense deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["expenses-list"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete expense: ${err.message}`);
    },
  });
}
