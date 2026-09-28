import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { runMySQLQuery } from "./mysql-api";
import { generateUUID } from "./mysql-client";
import { resolveStageIcon, type Stage } from "./stages";

export type QuotationAssignee = {
  id: string;
  name: string;
  avatar: string | null;
  role?: string | undefined;
};

export interface AdvancePaymentRecord {
  id: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes?: string | null | undefined;
  recordedByUserId?: string | null | undefined;
  recordedByUserName?: string | null | undefined;
  documentUrl?: string | null | undefined;
  status?: "Pending" | "Approved" | "Declined" | undefined;
}

export type CrmQuotationItem = {
  id: string;
  quotation_code: string;
  title: string;
  business_name: string | null;
  contact_name: string | null;
  prospect_id?: string | null;
  prospect_logo_url?: string | null;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  client_address: string | null;
  service_id: string | null;
  service_name: string | null;
  stage_id: string;
  stage_name: string;
  stage_group: string | null;
  stage_color: string | null;
  stage_icon: string | null;
  priority: string;
  assigned_agent_id: string | null;
  assigned_agent_name: string | null;
  assigned_agent_avatar: string | null;
  assigned_artist_id: string | null;
  assigned_artist_name: string | null;
  assigned_artist_avatar: string | null;
  assignees: QuotationAssignee[];
  assigned_user_ids: string[];
  created_by?: string | null;
  creator_name?: string | null;
  creator_avatar?: string | null;
  budget: number;
  paid_amount: number;
  due_amount: number;
  advance_payments?: AdvancePaymentRecord[] | null;
  progress: number;
  order_date: string | null;
  deadline: string | null;
  notes: string | null;
  prospect_notes?: string | null;
  status_history?: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveQuotationPayload = {
  id?: string | null;
  quotation_code?: string | null;
  prospect_id?: string | null;
  title: string;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  service_id?: string | null;
  stage_id?: string | null;
  priority?: string | null;
  assigned_agent_id?: string | null;
  assigned_artist_id?: string | null;
  assigned_user_ids?: string[] | null;
  created_by?: string | null;
  budget?: number;
  paid_amount?: number;
  advance_payments?: AdvancePaymentRecord[] | null;
  progress?: number;
  order_date?: string | null;
  deadline?: string | null;
  notes?: string | null;
  client_address?: string | null;
  created_at?: string | null;
};

export const QUOTATION_WORKFLOW_STAGES: Stage[] = [
  {
    id: "Draft",
    name: "Draft",
    stage_group: "in_progress",
    sort_order: 1,
    is_follow_up: false,
    is_active: true,
    color: "#3B82F6",
    icon: "FileText",
  },
  {
    id: "Sent",
    name: "Sent",
    stage_group: "in_progress",
    sort_order: 2,
    is_follow_up: false,
    is_active: true,
    color: "#0891B2",
    icon: "Send",
  },
  {
    id: "Under Review",
    name: "Under Review",
    stage_group: "in_progress",
    sort_order: 3,
    is_follow_up: false,
    is_active: true,
    color: "#8B5CF6",
    icon: "Eye",
  },
  {
    id: "Negotiation",
    name: "Negotiation",
    stage_group: "in_progress",
    sort_order: 4,
    is_follow_up: false,
    is_active: true,
    color: "#F59E0B",
    icon: "MessagesSquare",
  },
  {
    id: "Revised",
    name: "Revised",
    stage_group: "in_progress",
    sort_order: 5,
    is_follow_up: false,
    is_active: true,
    color: "#10B981",
    icon: "RefreshCw",
  },
  {
    id: "Accepted",
    name: "Accepted",
    stage_group: "won",
    sort_order: 6,
    is_follow_up: false,
    is_active: true,
    color: "#16A34A",
    icon: "Trophy",
  },
  {
    id: "Rejected",
    name: "Rejected",
    stage_group: "lost",
    sort_order: 7,
    is_follow_up: false,
    is_active: true,
    color: "#DC2626",
    icon: "XCircle",
  },
];

export function resolveQuotationStageColor(status?: string | null): string {
  if (!status) return "#3B82F6";
  const s = status.toLowerCase().trim();
  if (s.includes("accepted") || s.includes("approved")) return "#16A34A";
  if (s.includes("rejected") || s.includes("expired")) return "#DC2626";
  if (s.includes("revised")) return "#10B981";
  if (s.includes("negotiation")) return "#F59E0B";
  if (s.includes("review")) return "#8B5CF6";
  if (s.includes("sent")) return "#0891B2";
  return "#3B82F6";
}

export type QuotationsQueryResult = {
  quotations: CrmQuotationItem[];
  stages: Stage[];
};

export const quotationsQueryOptions = (userId?: string, isAdmin: boolean = false) =>
  queryOptions({
    queryKey: ["crm-quotations-with-stages", userId, isAdmin],
    queryFn: async (): Promise<QuotationsQueryResult> => {
      const sql = `
        SELECT 
          prj.id,
          prj.quotation_code,
          prj.title,
          prj.prospect_id,
          prj.client_name,
          COALESCE(prj.client_phone, p.phone) AS client_phone,
          COALESCE(prj.client_email, p.email) AS client_email,
          p.logo_url AS prospect_logo_url,
          prj.service_id,
          COALESCE(prj.status, 'Draft') AS status,
          COALESCE(prj.priority, 'Medium') AS priority,
          prj.assigned_agent_id,
          prj.assigned_artist_id,
          prj.assigned_user_ids,
          prj.created_by,
          COALESCE(prj.budget, 0) AS budget,
          COALESCE(prj.paid_amount, 0) AS paid_amount,
          prj.advance_payments,
          COALESCE(prj.progress, 0) AS progress,
          prj.order_date,
          prj.deadline,
          prj.notes,
          prj.client_address,
          prj.status_history,
          p.notes AS prospect_notes,
          prj.is_active,
          prj.created_at,
          prj.updated_at,
          COALESCE(srv.name, srv_p.name, p.service_id, prj.service_id) AS service_name,
          COALESCE(prof_artist.full_name, u_artist.name) AS artist_name,
          prof_artist.avatar_url AS artist_avatar,
          COALESCE(prof_agent.full_name, u_agent.name) AS agent_name,
          prof_agent.avatar_url AS agent_avatar,
          COALESCE(prof_creator.full_name, u_creator.name, prof_agent.full_name, u_agent.name) AS creator_name,
          COALESCE(prof_creator.avatar_url, u_creator.avatar_url, prof_agent.avatar_url, u_agent.avatar_url) AS creator_avatar
        FROM quotations prj
        LEFT JOIN prospects p ON prj.prospect_id = p.id
        LEFT JOIN services srv ON (prj.service_id = srv.id OR prj.service_id = srv.name)
        LEFT JOIN services srv_p ON (p.service_id = srv_p.id OR p.service_id = srv_p.name)
        LEFT JOIN users u_artist ON prj.assigned_artist_id = u_artist.id
        LEFT JOIN profiles prof_artist ON prj.assigned_artist_id = prof_artist.id
        LEFT JOIN users u_agent ON prj.assigned_agent_id = u_agent.id
        LEFT JOIN profiles prof_agent ON prj.assigned_agent_id = prof_agent.id
        LEFT JOIN users u_creator ON prj.created_by = u_creator.id
        LEFT JOIN profiles prof_creator ON prj.created_by = prof_creator.id
        WHERE prj.is_active = 1
        ORDER BY prj.updated_at DESC;
      `;

      const assigneesSql = `
        SELECT 
          pa.quotation_id,
          pa.user_id,
          pa.role,
          COALESCE(prof.full_name, u.name, u.email) AS name,
          COALESCE(prof.avatar_url, u.avatar_url) AS avatar,
          u.role AS user_role
        FROM quotation_assignees pa
        JOIN users u ON pa.user_id = u.id
        LEFT JOIN profiles prof ON pa.user_id = prof.id;
      `;

      const [quotationsRes, assigneesRes] = await Promise.all([
        runMySQLQuery<Record<string, unknown>[]>(sql),
        runMySQLQuery<Record<string, unknown>[]>(assigneesSql),
      ]);

      const assigneesMap = new Map<string, QuotationAssignee[]>();
      if (assigneesRes.success && Array.isArray(assigneesRes.data)) {
        assigneesRes.data.forEach((row) => {
          const pId = String(row["quotation_id"]);
          const list = assigneesMap.get(pId) || [];
          list.push({
            id: String(row["user_id"]),
            name: String(row["name"] || "User"),
            avatar: (row["avatar"] as string) || null,
            role: (row["user_role"] as string) || undefined,
          });
          assigneesMap.set(pId, list);
        });
      }

      let quotations: CrmQuotationItem[] = [];
      if (quotationsRes.success && Array.isArray(quotationsRes.data)) {
        quotations = quotationsRes.data.map((r, idx) => {
          const budget = Number(r["budget"] || 0);
          const paidAmount = Number(r["paid_amount"] || 0);
          const dueAmount = Math.max(0, budget - paidAmount);
          const progress = Number(r["progress"] || 0);
          const rawId = String(r["id"]);
          const status = String(r["status"] || "Draft");
          const priority = String(r["priority"] || "Medium");
          const code =
            (r["quotation_code"] as string) ||
            `QT-${rawId.slice(0, 4).toUpperCase() || (idx + 1).toString().padStart(4, "0")}`;

          const quotationAssignees = assigneesMap.get(rawId) || [];
          const assignedUserIds: string[] = quotationAssignees.map((a) => a.id);

          if (r["assigned_user_ids"]) {
            try {
              const parsed = JSON.parse(String(r["assigned_user_ids"]));
              if (Array.isArray(parsed)) {
                parsed.forEach((uid) => {
                  const sUid = String(uid);
                  if (!assignedUserIds.includes(sUid)) {
                    assignedUserIds.push(sUid);
                  }
                });
              }
            } catch {
              // ignore json parse error
            }
          }

          // Fallback if no assignees recorded in quotation_assignees yet
          if (quotationAssignees.length === 0) {
            if (r["assigned_artist_id"] && r["artist_name"]) {
              quotationAssignees.push({
                id: String(r["assigned_artist_id"]),
                name: String(r["artist_name"]),
                avatar: (r["artist_avatar"] as string) || null,
                role: "artist",
              });
              if (!assignedUserIds.includes(String(r["assigned_artist_id"]))) {
                assignedUserIds.push(String(r["assigned_artist_id"]));
              }
            }
            if (r["assigned_agent_id"] && r["agent_name"]) {
              quotationAssignees.push({
                id: String(r["assigned_agent_id"]),
                name: String(r["agent_name"]),
                avatar: (r["agent_avatar"] as string) || null,
                role: "agent",
              });
              if (!assignedUserIds.includes(String(r["assigned_agent_id"]))) {
                assignedUserIds.push(String(r["assigned_agent_id"]));
              }
            }
          }

          return {
            id: rawId,
            quotation_code: code,
            title: String(r["title"] || "Untitled Quotation"),
            business_name: (r["client_name"] as string) || null,
            contact_name: (r["client_name"] as string) || null,
            prospect_id: (r["prospect_id"] as string) || null,
            prospect_logo_url: (r["prospect_logo_url"] as string) || null,
            client_name: String(r["client_name"] || "N/A"),
            client_email: (r["client_email"] as string) || null,
            client_phone: (r["client_phone"] as string) || null,
            client_address: (r["client_address"] as string) || null,
            service_id: (r["service_id"] as string) || null,
            service_name: (r["service_name"] as string) || null,
            stage_id: status,
            stage_name: status,
            stage_group:
              status === "Accepted" ? "won" : status === "Rejected" ? "lost" : "in_progress",
            stage_color: resolveQuotationStageColor(status),
            stage_icon: resolveStageIcon(status),
            priority,
            assigned_agent_id: (r["assigned_agent_id"] as string) || null,
            assigned_agent_name: (r["agent_name"] as string) || null,
            assigned_agent_avatar: (r["agent_avatar"] as string) || null,
            assigned_artist_id: (r["assigned_artist_id"] as string) || null,
            assigned_artist_name: (r["artist_name"] as string) || null,
            assigned_artist_avatar: (r["artist_avatar"] as string) || null,
            assignees: quotationAssignees,
            assigned_user_ids: assignedUserIds,
            created_by: (r["created_by"] as string) || null,
            creator_name: (r["creator_name"] as string) || null,
            creator_avatar: (r["creator_avatar"] as string) || null,
            budget,
            paid_amount: paidAmount,
            due_amount: dueAmount,
            advance_payments: (() => {
              if (!r["advance_payments"]) return [];
              try {
                const raw =
                  typeof r["advance_payments"] === "string"
                    ? JSON.parse(String(r["advance_payments"]))
                    : r["advance_payments"];
                return Array.isArray(raw) ? (raw as AdvancePaymentRecord[]) : [];
              } catch {
                return [];
              }
            })(),
            progress,
            order_date: (r["order_date"] as string) || null,
            deadline: (r["deadline"] as string) || null,
            notes: (r["notes"] as string) || null,
            prospect_notes: (r["prospect_notes"] as string) || null,
            status_history: (r["status_history"] as string) || null,
            created_at: String(r["created_at"] || new Date().toISOString()),
            updated_at: String(r["updated_at"] || new Date().toISOString()),
          };
        });
      }

      if (!isAdmin && userId) {
        quotations = quotations.filter(
          (p) =>
            p.assigned_user_ids.includes(userId) ||
            p.assigned_artist_id === userId ||
            p.assigned_agent_id === userId ||
            p.created_by === userId,
        );
      }

      return { quotations, stages: QUOTATION_WORKFLOW_STAGES };
    },
    staleTime: 1000 * 30,
  });

export function useSaveQuotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveQuotationPayload) => {
      const id = payload.id || generateUUID();
      const isUpdate = Boolean(payload.id);

      if (isUpdate) {
        await runMySQLQuery(
          `UPDATE quotations SET 
            title = ?, 
            prospect_id = ?,
            client_name = ?, 
            client_phone = ?,
            client_email = ?,
            client_address = COALESCE(?, client_address),
            created_at = COALESCE(?, created_at),
            service_id = ?, 
            status = ?, 
            priority = ?,
            budget = ?, 
            paid_amount = ?, 
            advance_payments = ?,
            progress = ?, 
            order_date = ?,
            deadline = ?, 
            notes = ?, 
            assigned_agent_id = ?, 
            assigned_artist_id = ?,
            created_by = ?
          WHERE id = ?;`,
          [
            payload.title,
            payload.prospect_id !== undefined ? payload.prospect_id : null,
            payload.client_name,
            payload.client_phone || null,
            payload.client_email || null,
            payload.client_address || null,
            payload.created_at || null,
            payload.service_id || null,
            payload.stage_id || "Draft",
            payload.priority || "Medium",
            payload.budget || 0,
            payload.paid_amount || 0,
            payload.advance_payments !== undefined
              ? payload.advance_payments
                ? JSON.stringify(payload.advance_payments)
                : null
              : null,
            payload.progress || 0,
            payload.order_date || null,
            payload.deadline || null,
            payload.notes || null,
            payload.assigned_agent_id || null,
            payload.assigned_artist_id || null,
            payload.created_by || null,
            id,
          ],
        );
      } else {
        const randomCode =
          payload.quotation_code || `QT-${Math.floor(1000 + Math.random() * 9000)}`;
        await runMySQLQuery(
          `INSERT INTO quotations (
            id, quotation_code, title, prospect_id, client_name, client_phone, client_email, client_address,
            service_id, status, priority, budget, paid_amount, advance_payments, progress, order_date, deadline,
            notes, assigned_agent_id, assigned_artist_id, created_by, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, COALESCE(?, NOW()));`,
          [
            id,
            randomCode,
            payload.title,
            payload.prospect_id || null,
            payload.client_name,
            payload.client_phone || null,
            payload.client_email || null,
            payload.client_address || null,
            payload.service_id || null,
            payload.stage_id || "Draft",
            payload.priority || "Medium",
            payload.budget || 0,
            payload.paid_amount || 0,
            payload.advance_payments ? JSON.stringify(payload.advance_payments) : null,
            payload.progress || 0,
            payload.order_date || null,
            payload.deadline || null,
            payload.notes || null,
            payload.assigned_agent_id || null,
            payload.assigned_artist_id || null,
            payload.created_by || null,
            payload.created_at || null,
          ],
        );
      }

      return { success: true, id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-quotations-with-stages"] });
      toast.success(
        variables.id
          ? `Quotation "${variables.title}" updated successfully!`
          : `Quotation "${variables.title}" created successfully!`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save quotation");
    },
  });
}

export function useUpdateQuotationAssigneesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quotationId, userIds }: { quotationId: string; userIds: string[] }) => {
      // 1. Clear current assignees for this quotation
      await runMySQLQuery("DELETE FROM quotation_assignees WHERE quotation_id = ?;", [quotationId]);

      // 2. Insert new assignees
      for (const uid of userIds) {
        const assignId = generateUUID();
        await runMySQLQuery(
          "INSERT INTO quotation_assignees (id, quotation_id, user_id) VALUES (?, ?, ?);",
          [assignId, quotationId, uid],
        );
      }

      // 3. Update cached array on quotations table
      const jsonIds = JSON.stringify(userIds);
      await runMySQLQuery("UPDATE quotations SET assigned_user_ids = ? WHERE id = ?;", [
        jsonIds,
        quotationId,
      ]);

      return { success: true, quotationId, userIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-quotations-with-stages"] });
      toast.success("Quotation assignees updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update quotation assignees");
    },
  });
}

export function useUpdateQuotationStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      stage_id: string;
      stage_name?: string;
      progress?: number;
      changed_by_name?: string;
      notes?: string;
      proof_url?: string;
    }) => {
      const progressUpdate =
        payload.progress !== undefined
          ? payload.progress
          : payload.stage_id === "Accepted"
            ? 100
            : undefined;

      // Fetch current status_history
      const curr = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT status_history FROM quotations WHERE id = ? LIMIT 1;",
        [payload.id],
      );
      let historyList: Array<{
        id: string;
        status: string;
        timestamp: string;
        changedByUserName: string;
        notes?: string | null;
        proofUrl?: string | null;
      }> = [];
      if (curr.success && curr.data && curr.data[0]?.["status_history"]) {
        try {
          const raw = curr.data[0]["status_history"];
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (Array.isArray(parsed)) historyList = parsed;
        } catch {
          // ignore parse error
        }
      }

      historyList.push({
        id: `sh-${Date.now()}`,
        status: payload.stage_name || payload.stage_id,
        timestamp: new Date().toISOString(),
        changedByUserName: payload.changed_by_name || "Mehan Ahmed",
        notes:
          payload.notes || `Quotation moved to stage "${payload.stage_name || payload.stage_id}".`,
        proofUrl: payload.proof_url || null,
      });

      const updatedHistoryStr = JSON.stringify(historyList);

      if (progressUpdate !== undefined) {
        await runMySQLQuery(
          "UPDATE quotations SET status = ?, progress = ?, status_history = ?, updated_at = NOW() WHERE id = ?;",
          [payload.stage_id, progressUpdate, updatedHistoryStr, payload.id],
        );
      } else {
        await runMySQLQuery(
          "UPDATE quotations SET status = ?, status_history = ?, updated_at = NOW() WHERE id = ?;",
          [payload.stage_id, updatedHistoryStr, payload.id],
        );
      }
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-quotations-with-stages"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-details"] });
      toast.success(
        variables.stage_name
          ? `Moved to stage "${variables.stage_name}"`
          : "Quotation stage updated!",
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update quotation stage");
    },
  });
}

export function useDeleteQuotationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      await runMySQLQuery("UPDATE quotations SET is_active = 0 WHERE id = ?;", [quotationId]);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-quotations-with-stages"] });
      toast.success("Quotation deleted successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete quotation");
    },
  });
}
