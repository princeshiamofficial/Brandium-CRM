import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { runMySQLQuery } from "./mysql-api";
import { generateUUID } from "./mysql-client";
import type { AdvancePaymentRecord } from "./projects";

/* ERPAPP-style Orders (/orders list + /track/[id]) persisted in MySQL `orders` / `order_comments`. */

/** `assignable` stages ask for the responsible user when an order moves into them. */
export type OrderStatus = { id: string; name: string; color: string; assignable?: boolean };

export const ORDER_SUBMITTED_STATUS_ID = "order-submitted";

/** Brandium production workflow, ids stored in `orders.status`. */
export const ORDER_STATUSES: OrderStatus[] = [
  { id: ORDER_SUBMITTED_STATUS_ID, name: "Order Submitted", color: "#3B82F6" },
  { id: "script-writer", name: "Script Writer", color: "#8B5CF6", assignable: true },
  { id: "content-planner", name: "Content Planner", color: "#EC4899", assignable: true },
  { id: "videographer", name: "Videographer", color: "#F59E0B", assignable: true },
  { id: "video-graphy-complete", name: "Video Graphy Complete", color: "#10B981" },
  { id: "video-editor", name: "Video Editor", color: "#6366F1", assignable: true },
  { id: "marketer", name: "Marketer", color: "#06B6D4", assignable: true },
  { id: "developer", name: "Developer", color: "#0284C7", assignable: true },
  { id: "delivered", name: "Delivered", color: "#16A34A" },
];

/** Earlier ERPAPP status ids that may still be stored on older orders (display only). */
const LEGACY_ORDER_STATUSES: OrderStatus[] = [
  { id: "ready-for-design", name: "Ready for Design", color: "#14B8A6" },
  { id: "design-in-progress", name: "Design in Progress", color: "#3B82F6" },
];

/** Resolves a stored status (id, exact name, or legacy label such as "Submitted") to display info. */
export function resolveOrderStatus(status?: string | null): OrderStatus {
  const value = (status || "").trim();
  if (!value) return ORDER_STATUSES[0] as OrderStatus;
  const lower = value.toLowerCase();
  const known = [...ORDER_STATUSES, ...LEGACY_ORDER_STATUSES];
  const exact = known.find((s) => s.id === lower || s.name.toLowerCase() === lower);
  if (exact) return exact;
  const loose = ORDER_STATUSES.find((s) => s.name.toLowerCase().includes(lower));
  if (loose) return { ...loose, name: value };
  return { id: value, name: value, color: "#A1A1AA" };
}

/** Picks dark or white text for a solid badge background. */
export function getContrastTextColor(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#FFFFFF";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111827" : "#FFFFFF";
}

export interface OrderLineItem {
  id: string;
  model: string;
  quantity: number;
  unitPrice: number | null;
  lineItemTotalPrice: number | null;
  isGift?: boolean | undefined;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: string;
  timestamp: string;
  changedByUserName: string;
  notes?: string | null | undefined;
}

export interface CrmOrder {
  id: string;
  order_number: string;
  job_id: string | null;
  company_name: string;
  phone: string | null;
  address: string | null;
  status: string;
  crm_user_id: string | null;
  crm_user_name: string | null;
  crm_user_avatar: string | null;
  designer_id: string | null;
  designer_name: string | null;
  designer_avatar: string | null;
  items: OrderLineItem[];
  discount_amount: number;
  shipping_charge: number;
  /** Net payable (items total − discount), excluding shipping. */
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  advance_payments: AdvancePaymentRecord[];
  status_history: OrderStatusHistoryEntry[];
  is_starred: number;
  notes: string | null;
  order_date: string | null;
  delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderComment {
  id: string;
  order_id: string;
  parent_id: string | null;
  user_id: string | null;
  user_name: string;
  user_role: string | null;
  text: string;
  created_at: string;
}

const parseJsonArray = <T>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const ORDER_SELECT_SQL = `
  SELECT
    o.*,
    COALESCE(prof_c.full_name, u_c.name) AS crm_user_name,
    COALESCE(prof_c.avatar_url, u_c.avatar_url) AS crm_user_avatar,
    COALESCE(prof_d.full_name, u_d.name) AS designer_name,
    COALESCE(prof_d.avatar_url, u_d.avatar_url) AS designer_avatar
  FROM orders o
  LEFT JOIN users u_c ON o.crm_user_id = u_c.id
  LEFT JOIN profiles prof_c ON o.crm_user_id = prof_c.id
  LEFT JOIN users u_d ON o.designer_id = u_d.id
  LEFT JOIN profiles prof_d ON o.designer_id = prof_d.id
`;

function mapOrderRow(r: Record<string, unknown>): CrmOrder {
  const items = parseJsonArray<Record<string, unknown>>(r["items_json"]).map((it, idx) => {
    const quantity = Number(it["quantity"]) || 1;
    const unitPrice =
      it["unitPrice"] !== undefined && it["unitPrice"] !== null ? Number(it["unitPrice"]) : null;
    return {
      id: String(it["id"] || `item-${idx + 1}`),
      model: String(it["model"] || ""),
      quantity,
      unitPrice,
      lineItemTotalPrice:
        it["lineItemTotalPrice"] !== undefined && it["lineItemTotalPrice"] !== null
          ? Number(it["lineItemTotalPrice"])
          : unitPrice !== null
            ? unitPrice * quantity
            : null,
      isGift: Boolean(it["isGift"]),
    };
  });
  // Legacy rows store the payment time as `createdAt` instead of `date`
  const advancePayments = parseJsonArray<AdvancePaymentRecord & { createdAt?: string }>(
    r["payments_json"],
  ).map(({ createdAt, ...p }) => ({
    ...p,
    date: p.date || createdAt || String(r["created_at"] || ""),
    amount: Number(p.amount) || 0,
  }));
  const totalAmount = Number(r["total_amount"] || 0);
  const shipping = Number(r["shipping_charge"] || 0);
  const paid = advancePayments.length
    ? advancePayments.reduce((sum, p) => sum + p.amount, 0)
    : Number(r["paid_amount"] || 0);
  const companyName = String(r["company_name"] || r["client_name"] || "N/A");

  return {
    id: String(r["id"]),
    order_number: String(r["order_number"] || r["id"]),
    job_id: (r["job_id"] as string) || null,
    company_name: companyName,
    phone: (r["phone"] as string) || null,
    address: (r["address"] as string) || null,
    status: String(r["status"] || ORDER_SUBMITTED_STATUS_ID),
    crm_user_id: (r["crm_user_id"] as string) || null,
    crm_user_name: (r["crm_user_name"] as string) || null,
    crm_user_avatar: (r["crm_user_avatar"] as string) || null,
    designer_id: (r["designer_id"] as string) || null,
    designer_name: (r["designer_name"] as string) || null,
    designer_avatar: (r["designer_avatar"] as string) || null,
    items,
    discount_amount: Number(r["discount_amount"] || 0),
    shipping_charge: shipping,
    total_amount: totalAmount,
    paid_amount: paid,
    due_amount: Math.max(0, totalAmount + shipping - paid),
    advance_payments: advancePayments,
    status_history: parseJsonArray<OrderStatusHistoryEntry>(r["status_history"]),
    is_starred: Number(r["is_starred"] || 0),
    notes: (r["notes"] as string) || null,
    order_date: (r["order_date"] as string) || null,
    delivery_date: (r["delivery_date"] as string) || null,
    created_at: String(r["order_date"] || r["created_at"] || new Date().toISOString()),
    updated_at: String(r["updated_at"] || r["created_at"] || new Date().toISOString()),
  };
}

export const ordersQueryOptions = (userId?: string, isAdmin: boolean = false) =>
  queryOptions({
    queryKey: ["crm-orders", userId, isAdmin],
    queryFn: async (): Promise<CrmOrder[]> => {
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        `${ORDER_SELECT_SQL} WHERE COALESCE(o.is_deleted, 0) = 0 ORDER BY COALESCE(o.order_date, o.created_at) DESC;`,
      );
      const orders = (res.data || []).map(mapOrderRow);
      if (isAdmin || !userId) return orders;
      return orders.filter((o) => o.crm_user_id === userId || o.designer_id === userId);
    },
    staleTime: 1000 * 30,
  });

export const orderDetailQueryOptions = (orderRef: string) =>
  queryOptions({
    queryKey: ["order-detail", orderRef],
    queryFn: async (): Promise<CrmOrder | null> => {
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        `${ORDER_SELECT_SQL} WHERE (o.order_number = ? OR o.id = ?) AND COALESCE(o.is_deleted, 0) = 0 LIMIT 1;`,
        [orderRef, orderRef],
      );
      const row = res.data?.[0];
      return row ? mapOrderRow(row) : null;
    },
    enabled: Boolean(orderRef),
  });

export const orderCommentsQueryOptions = (orderId?: string) =>
  queryOptions({
    queryKey: ["order-comments", orderId],
    queryFn: async (): Promise<OrderComment[]> => {
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT * FROM order_comments WHERE order_id = ? ORDER BY created_at ASC;",
        [orderId || ""],
      );
      return (res.data || []).map((r) => ({
        id: String(r["id"]),
        order_id: String(r["order_id"]),
        parent_id: (r["parent_id"] as string) || null,
        user_id: (r["user_id"] as string) || null,
        user_name: String(r["user_name"] || "User"),
        user_role: (r["user_role"] as string) || null,
        text: String(r["text"] || ""),
        created_at: String(r["created_at"] || new Date().toISOString()),
      }));
    },
    enabled: Boolean(orderId),
  });

export type SaveOrderPayload = {
  id?: string | undefined;
  job_id: string | null;
  company_name: string;
  phone: string;
  address: string;
  crm_user_id?: string | null | undefined;
  items: OrderLineItem[];
  discount_amount: number;
  shipping_charge: number;
  total_amount: number;
  advance_payments: AdvancePaymentRecord[];
  is_starred: number;
  notes: string | null;
  /** `yyyy-MM-dd HH:mm:ss` */
  order_date: string;
  /** `yyyy-MM-dd HH:mm:ss` or null */
  delivery_date: string | null;
  changed_by_name: string;
};

const invalidateOrders = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["crm-orders"] });
  queryClient.invalidateQueries({ queryKey: ["order-detail"] });
};

export function useSaveOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SaveOrderPayload) => {
      const paid = payload.advance_payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const due = Math.max(0, payload.total_amount + payload.shipping_charge - paid);
      const common = [
        payload.job_id,
        payload.company_name,
        payload.company_name,
        payload.phone,
        payload.address,
        payload.items[0]?.model || null,
        JSON.stringify(payload.items),
        payload.discount_amount,
        payload.shipping_charge,
        payload.total_amount,
        paid,
        due,
        JSON.stringify(payload.advance_payments),
        payload.is_starred,
        payload.notes,
        payload.order_date,
        payload.delivery_date,
      ];

      if (payload.id) {
        await runMySQLQuery(
          `UPDATE orders SET
            job_id = ?, client_name = ?, company_name = ?, phone = ?, address = ?, service_name = ?,
            items_json = ?, discount_amount = ?, shipping_charge = ?, total_amount = ?, paid_amount = ?,
            due_amount = ?, payments_json = ?, is_starred = ?, notes = ?, order_date = ?, delivery_date = ?,
            updated_at = NOW()
          WHERE id = ?;`,
          [...common, payload.id],
        );
        return { id: payload.id, order_number: null as string | null };
      }

      const id = generateUUID();
      const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const history: OrderStatusHistoryEntry[] = [
        {
          id: generateUUID(),
          status: ORDER_SUBMITTED_STATUS_ID,
          timestamp: new Date().toISOString(),
          changedByUserName: payload.changed_by_name,
          notes: "Order created.",
        },
      ];
      await runMySQLQuery(
        `INSERT INTO orders (
          job_id, client_name, company_name, phone, address, service_name,
          items_json, discount_amount, shipping_charge, total_amount, paid_amount,
          due_amount, payments_json, is_starred, notes, order_date, delivery_date,
          id, order_number, status, crm_user_id, status_history, is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`,
        [
          ...common,
          id,
          orderNumber,
          ORDER_SUBMITTED_STATUS_ID,
          payload.crm_user_id || null,
          JSON.stringify(history),
        ],
      );
      return { id, order_number: orderNumber };
    },
    onSuccess: (_, variables) => {
      invalidateOrders(queryClient);
      toast.success(variables.id ? "Order Updated" : "Order Created", {
        description: variables.id
          ? "Order details have been successfully updated."
          : `Order for ${variables.company_name} has been created.`,
      });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to save order"),
  });
}

/** Appends a status history entry; optionally sets the stage assignee (`designer_id`). */
async function writeStatusChange(
  order: CrmOrder,
  statusId: string,
  changedByName: string,
  notes: string,
  designerId?: string,
) {
  const history: OrderStatusHistoryEntry[] = [
    ...order.status_history,
    {
      id: generateUUID(),
      status: statusId,
      timestamp: new Date().toISOString(),
      changedByUserName: changedByName,
      notes,
    },
  ];
  if (designerId !== undefined) {
    await runMySQLQuery(
      "UPDATE orders SET status = ?, designer_id = ?, status_history = ?, updated_at = NOW() WHERE id = ?;",
      [statusId, designerId, JSON.stringify(history), order.id],
    );
  } else {
    await runMySQLQuery(
      "UPDATE orders SET status = ?, status_history = ?, updated_at = NOW() WHERE id = ?;",
      [statusId, JSON.stringify(history), order.id],
    );
  }
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: { order: CrmOrder; statusId: string; changedByName: string }) => {
      const status = resolveOrderStatus(p.statusId);
      await writeStatusChange(
        p.order,
        p.statusId,
        p.changedByName,
        `Order moved to "${status.name}".`,
      );
    },
    onSuccess: (_, p) => {
      invalidateOrders(queryClient);
      toast.success(`Moved to "${resolveOrderStatus(p.statusId).name}"`);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update order status"),
  });
}

/** Moves the order into an assignable stage and records who is responsible (`designer_id`). */
export function useAssignStageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      order: CrmOrder;
      statusId: string;
      assigneeId: string;
      assigneeName: string;
      changedByName: string;
    }) => {
      const stage = resolveOrderStatus(p.statusId);
      await writeStatusChange(
        p.order,
        p.statusId,
        p.changedByName,
        `Order moved to "${stage.name}" and assigned to ${p.assigneeName}.`,
        p.assigneeId,
      );
    },
    onSuccess: (_, p) => {
      invalidateOrders(queryClient);
      toast.success("User Assigned", {
        description: `${p.assigneeName} assigned to ${resolveOrderStatus(p.statusId).name} for order ${p.order.order_number}.`,
      });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to assign user"),
  });
}

export function useDeleteOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: CrmOrder) => {
      await runMySQLQuery("UPDATE orders SET is_deleted = 1 WHERE id = ?;", [order.id]);
    },
    onSuccess: (_, order) => {
      invalidateOrders(queryClient);
      toast.success("Moved to Trash", {
        description: `Order ${order.order_number} has been moved to the trash bin.`,
      });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete order"),
  });
}

export function useAddOrderCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<OrderComment, "id" | "created_at">) => {
      await runMySQLQuery(
        "INSERT INTO order_comments (id, order_id, parent_id, user_id, user_name, user_role, text) VALUES (?, ?, ?, ?, ?, ?, ?);",
        [generateUUID(), p.order_id, p.parent_id, p.user_id, p.user_name, p.user_role, p.text],
      );
    },
    onSuccess: (_, p) => {
      queryClient.invalidateQueries({ queryKey: ["order-comments", p.order_id] });
    },
    onError: (err: Error) => toast.error(err.message || "Failed to post comment"),
  });
}

export function useDeleteOrderCommentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: OrderComment) => {
      await runMySQLQuery("DELETE FROM order_comments WHERE id = ? OR parent_id = ?;", [
        comment.id,
        comment.id,
      ]);
    },
    onSuccess: (_, comment) => {
      queryClient.invalidateQueries({ queryKey: ["order-comments", comment.order_id] });
      toast.success("Comment deleted");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete comment"),
  });
}
