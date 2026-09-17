import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { runMySQLQuery } from "./mysql-api";
import { generateUUID } from "./mysql-client";
import { resolveStageIcon, type Stage } from "./stages";

export type ProjectAssignee = {
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

export type CrmProjectItem = {
  id: string;
  project_code: string;
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
  assignees: ProjectAssignee[];
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

export type SaveProjectPayload = {
  id?: string | null;
  project_code?: string | null;
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
};

export const PROJECT_WORKFLOW_STAGES: Stage[] = [
  {
    id: "CR Clearance",
    name: "CR Clearance",
    stage_group: "in_progress",
    sort_order: 1,
    is_follow_up: false,
    is_active: true,
    color: "#6366F1",
    icon: "FileText",
  },
  {
    id: "On Design",
    name: "On Design",
    stage_group: "in_progress",
    sort_order: 2,
    is_follow_up: false,
    is_active: true,
    color: "#0284C7",
    icon: "DraftingCompass",
  },
  {
    id: "CO Clearance",
    name: "CO Clearance",
    stage_group: "in_progress",
    sort_order: 3,
    is_follow_up: false,
    is_active: true,
    color: "#D97706",
    icon: "Sparkles",
  },
  {
    id: "Logistics",
    name: "Logistics",
    stage_group: "in_progress",
    sort_order: 4,
    is_follow_up: false,
    is_active: true,
    color: "#8B5CF6",
    icon: "Layers",
  },
  {
    id: "Delivered",
    name: "Delivered",
    stage_group: "won",
    sort_order: 5,
    is_follow_up: false,
    is_active: true,
    color: "#16A34A",
    icon: "Trophy",
  },
  {
    id: "On Hold",
    name: "On Hold",
    stage_group: "lost",
    sort_order: 6,
    is_follow_up: false,
    is_active: true,
    color: "#DC2626",
    icon: "PowerOff",
  },
];

export function resolveProjectStageColor(status?: string | null): string {
  if (!status) return "#6366F1";
  const s = status.toLowerCase().trim();
  if (s.includes("cr")) return "#6366F1";
  if (s.includes("design")) return "#0284C7";
  if (s.includes("co")) return "#D97706";
  if (s.includes("logistics")) return "#8B5CF6";
  if (s.includes("delivered") || s.includes("done") || s.includes("completed")) return "#16A34A";
  if (s.includes("hold")) return "#DC2626";
  return "#0ea5e9";
}

export type ProjectsQueryResult = {
  projects: CrmProjectItem[];
  stages: Stage[];
};

export const projectsQueryOptions = (userId?: string, isAdmin: boolean = false) =>
  queryOptions({
    queryKey: ["crm-projects-with-stages", userId, isAdmin],
    queryFn: async (): Promise<ProjectsQueryResult> => {
      const sql = `
        SELECT 
          prj.id,
          prj.project_code,
          prj.title,
          prj.prospect_id,
          prj.client_name,
          COALESCE(prj.client_phone, p.phone) AS client_phone,
          COALESCE(prj.client_email, p.email) AS client_email,
          p.logo_url AS prospect_logo_url,
          prj.service_id,
          COALESCE(prj.status, 'CR Clearance') AS status,
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
        FROM projects prj
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
          pa.project_id,
          pa.user_id,
          pa.role,
          COALESCE(prof.full_name, u.name, u.email) AS name,
          COALESCE(prof.avatar_url, u.avatar_url) AS avatar,
          u.role AS user_role
        FROM project_assignees pa
        JOIN users u ON pa.user_id = u.id
        LEFT JOIN profiles prof ON pa.user_id = prof.id;
      `;

      const [projectsRes, assigneesRes] = await Promise.all([
        runMySQLQuery<Record<string, unknown>[]>(sql),
        runMySQLQuery<Record<string, unknown>[]>(assigneesSql),
      ]);

      const assigneesMap = new Map<string, ProjectAssignee[]>();
      if (assigneesRes.success && Array.isArray(assigneesRes.data)) {
        assigneesRes.data.forEach((row) => {
          const pId = String(row["project_id"]);
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

      let projects: CrmProjectItem[] = [];
      if (projectsRes.success && Array.isArray(projectsRes.data)) {
        projects = projectsRes.data.map((r, idx) => {
          const budget = Number(r["budget"] || 0);
          const paidAmount = Number(r["paid_amount"] || 0);
          const dueAmount = Math.max(0, budget - paidAmount);
          const progress = Number(r["progress"] || 0);
          const rawId = String(r["id"]);
          const status = String(r["status"] || "CR Clearance");
          const priority = String(r["priority"] || "Medium");
          const code =
            (r["project_code"] as string) ||
            `PRJ-${rawId.slice(0, 4).toUpperCase() || (idx + 1).toString().padStart(4, "0")}`;

          const projectAssignees = assigneesMap.get(rawId) || [];
          const assignedUserIds: string[] = projectAssignees.map((a) => a.id);

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

          // Fallback if no assignees recorded in project_assignees yet
          if (projectAssignees.length === 0) {
            if (r["assigned_artist_id"] && r["artist_name"]) {
              projectAssignees.push({
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
              projectAssignees.push({
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
            project_code: code,
            title: String(r["title"] || "Untitled Project"),
            business_name: (r["client_name"] as string) || null,
            contact_name: (r["client_name"] as string) || null,
            prospect_id: (r["prospect_id"] as string) || null,
            prospect_logo_url: (r["prospect_logo_url"] as string) || null,
            client_name: String(r["client_name"] || "N/A"),
            client_email: (r["client_email"] as string) || null,
            client_phone: (r["client_phone"] as string) || null,
            client_address: null,
            service_id: (r["service_id"] as string) || null,
            service_name: (r["service_name"] as string) || null,
            stage_id: status,
            stage_name: status,
            stage_group:
              status === "Delivered" ? "won" : status === "On Hold" ? "lost" : "in_progress",
            stage_color: resolveProjectStageColor(status),
            stage_icon: resolveStageIcon(status),
            priority,
            assigned_agent_id: (r["assigned_agent_id"] as string) || null,
            assigned_agent_name: (r["agent_name"] as string) || null,
            assigned_agent_avatar: (r["agent_avatar"] as string) || null,
            assigned_artist_id: (r["assigned_artist_id"] as string) || null,
            assigned_artist_name: (r["artist_name"] as string) || null,
            assigned_artist_avatar: (r["artist_avatar"] as string) || null,
            assignees: projectAssignees,
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
        projects = projects.filter(
          (p) =>
            p.assigned_user_ids.includes(userId) ||
            p.assigned_artist_id === userId ||
            p.assigned_agent_id === userId ||
            p.created_by === userId,
        );
      }

      return { projects, stages: PROJECT_WORKFLOW_STAGES };
    },
    staleTime: 1000 * 30,
  });

export function useSaveProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveProjectPayload) => {
      const id = payload.id || generateUUID();
      const isUpdate = Boolean(payload.id);

      if (isUpdate) {
        await runMySQLQuery(
          `UPDATE projects SET 
            title = ?, 
            prospect_id = ?,
            client_name = ?, 
            client_phone = ?,
            client_email = ?,
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
            payload.service_id || null,
            payload.stage_id || "CR Clearance",
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
        const randomCode = payload.project_code || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
        await runMySQLQuery(
          `INSERT INTO projects (
            id, project_code, title, prospect_id, client_name, client_phone, client_email,
            service_id, status, priority, budget, paid_amount, advance_payments, progress, order_date, deadline,
            notes, assigned_agent_id, assigned_artist_id, created_by, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
          [
            id,
            randomCode,
            payload.title,
            payload.prospect_id || null,
            payload.client_name,
            payload.client_phone || null,
            payload.client_email || null,
            payload.service_id || null,
            payload.stage_id || "CR Clearance",
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
          ],
        );
      }

      return { success: true, id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      toast.success(
        variables.id
          ? `Project "${variables.title}" updated successfully!`
          : `Project "${variables.title}" created successfully!`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save project");
    },
  });
}

export function useUpdateProjectAssigneesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, userIds }: { projectId: string; userIds: string[] }) => {
      // 1. Clear current assignees for this project
      await runMySQLQuery("DELETE FROM project_assignees WHERE project_id = ?;", [projectId]);

      // 2. Insert new assignees
      for (const uid of userIds) {
        const assignId = generateUUID();
        await runMySQLQuery(
          "INSERT INTO project_assignees (id, project_id, user_id) VALUES (?, ?, ?);",
          [assignId, projectId, uid],
        );
      }

      // 3. Update cached array on projects table
      const jsonIds = JSON.stringify(userIds);
      await runMySQLQuery("UPDATE projects SET assigned_user_ids = ? WHERE id = ?;", [
        jsonIds,
        projectId,
      ]);

      return { success: true, projectId, userIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      toast.success("Project assignees updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update project assignees");
    },
  });
}

export function useUpdateProjectStatusMutation() {
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
          : payload.stage_id === "Delivered"
            ? 100
            : undefined;

      // Fetch current status_history
      const curr = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT status_history FROM projects WHERE id = ? LIMIT 1;",
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
        notes: payload.notes || `Order moved to stage "${payload.stage_name || payload.stage_id}".`,
        proofUrl: payload.proof_url || null,
      });

      const updatedHistoryStr = JSON.stringify(historyList);

      if (progressUpdate !== undefined) {
        await runMySQLQuery(
          "UPDATE projects SET status = ?, progress = ?, status_history = ?, updated_at = NOW() WHERE id = ?;",
          [payload.stage_id, progressUpdate, updatedHistoryStr, payload.id],
        );
      } else {
        await runMySQLQuery(
          "UPDATE projects SET status = ?, status_history = ?, updated_at = NOW() WHERE id = ?;",
          [payload.stage_id, updatedHistoryStr, payload.id],
        );
      }
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      queryClient.invalidateQueries({ queryKey: ["project-invoice-details"] });
      toast.success(
        variables.stage_name
          ? `Moved to stage "${variables.stage_name}"`
          : "Project stage updated!",
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update project stage");
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      await runMySQLQuery("UPDATE projects SET is_active = 0 WHERE id = ?;", [projectId]);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      toast.success("Project deleted successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete project");
    },
  });
}
