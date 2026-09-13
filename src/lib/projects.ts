import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { runMySQLQuery } from "./mysql-api";
import { generateUUID } from "./mysql-client";
import { resolveStageIcon, type Stage } from "./stages";

export type CrmProjectItem = {
  id: string;
  project_code: string;
  title: string;
  business_name: string | null;
  contact_name: string | null;
  prospect_id?: string | null;
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
  created_by?: string | null;
  creator_name?: string | null;
  creator_avatar?: string | null;
  budget: number;
  paid_amount: number;
  due_amount: number;
  progress: number;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveProjectPayload = {
  id?: string | null;
  project_code?: string | null;
  title: string;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  service_id?: string | null;
  stage_id?: string | null;
  priority?: string | null;
  assigned_agent_id?: string | null;
  assigned_artist_id?: string | null;
  created_by?: string | null;
  budget?: number;
  paid_amount?: number;
  progress?: number;
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
          prj.service_id,
          COALESCE(prj.status, 'CR Clearance') AS status,
          COALESCE(prj.priority, 'Medium') AS priority,
          prj.assigned_agent_id,
          prj.assigned_artist_id,
          prj.created_by,
          COALESCE(prj.budget, 0) AS budget,
          COALESCE(prj.paid_amount, 0) AS paid_amount,
          COALESCE(prj.progress, 0) AS progress,
          prj.deadline,
          prj.notes,
          prj.is_active,
          prj.created_at,
          prj.updated_at,
          srv.name AS service_name,
          COALESCE(prof_artist.full_name, u_artist.name) AS artist_name,
          prof_artist.avatar_url AS artist_avatar,
          COALESCE(prof_agent.full_name, u_agent.name) AS agent_name,
          prof_agent.avatar_url AS agent_avatar,
          COALESCE(prof_creator.full_name, u_creator.name, prof_agent.full_name, u_agent.name) AS creator_name,
          COALESCE(prof_creator.avatar_url, u_creator.avatar_url, prof_agent.avatar_url, u_agent.avatar_url) AS creator_avatar
        FROM projects prj
        LEFT JOIN prospects p ON prj.prospect_id = p.id
        LEFT JOIN services srv ON prj.service_id = srv.id
        LEFT JOIN users u_artist ON prj.assigned_artist_id = u_artist.id
        LEFT JOIN profiles prof_artist ON prj.assigned_artist_id = prof_artist.id
        LEFT JOIN users u_agent ON prj.assigned_agent_id = u_agent.id
        LEFT JOIN profiles prof_agent ON prj.assigned_agent_id = prof_agent.id
        LEFT JOIN users u_creator ON prj.created_by = u_creator.id
        LEFT JOIN profiles prof_creator ON prj.created_by = prof_creator.id
        WHERE prj.is_active = 1
        ORDER BY prj.updated_at DESC;
      `;

      const projectsRes = await runMySQLQuery<Record<string, unknown>[]>(sql);

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

          return {
            id: rawId,
            project_code: code,
            title: String(r["title"] || "Untitled Project"),
            business_name: (r["client_name"] as string) || null,
            contact_name: (r["client_name"] as string) || null,
            prospect_id: (r["prospect_id"] as string) || null,
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
            created_by: (r["created_by"] as string) || null,
            creator_name: (r["creator_name"] as string) || null,
            creator_avatar: (r["creator_avatar"] as string) || null,
            budget,
            paid_amount: paidAmount,
            due_amount: dueAmount,
            progress,
            deadline: (r["deadline"] as string) || null,
            notes: (r["notes"] as string) || null,
            created_at: String(r["created_at"] || new Date().toISOString()),
            updated_at: String(r["updated_at"] || new Date().toISOString()),
          };
        });
      }

      if (!isAdmin && userId) {
        projects = projects.filter(
          (p) => p.assigned_artist_id === userId || p.assigned_agent_id === userId,
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
            client_name = ?, 
            client_phone = ?,
            client_email = ?,
            service_id = ?, 
            status = ?, 
            priority = ?,
            budget = ?, 
            paid_amount = ?, 
            progress = ?, 
            deadline = ?, 
            notes = ?, 
            assigned_agent_id = ?, 
            assigned_artist_id = ? 
          WHERE id = ?;`,
          [
            payload.title,
            payload.client_name,
            payload.client_phone || null,
            payload.client_email || null,
            payload.service_id || null,
            payload.stage_id || "CR Clearance",
            payload.priority || "Medium",
            payload.budget || 0,
            payload.paid_amount || 0,
            payload.progress || 0,
            payload.deadline || null,
            payload.notes || null,
            payload.assigned_agent_id || null,
            payload.assigned_artist_id || null,
            id,
          ],
        );
      } else {
        const randomCode = payload.project_code || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
        await runMySQLQuery(
          `INSERT INTO projects (
            id, project_code, title, client_name, client_phone, client_email,
            service_id, status, priority, budget, paid_amount, progress, deadline,
            notes, assigned_agent_id, assigned_artist_id, created_by, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1);`,
          [
            id,
            randomCode,
            payload.title,
            payload.client_name,
            payload.client_phone || null,
            payload.client_email || null,
            payload.service_id || null,
            payload.stage_id || "CR Clearance",
            payload.priority || "Medium",
            payload.budget || 0,
            payload.paid_amount || 0,
            payload.progress || 0,
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

export function useUpdateProjectStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      stage_id: string;
      stage_name?: string;
      progress?: number;
    }) => {
      const progressUpdate =
        payload.progress !== undefined
          ? payload.progress
          : payload.stage_id === "Delivered"
            ? 100
            : undefined;

      if (progressUpdate !== undefined) {
        await runMySQLQuery("UPDATE projects SET status = ?, progress = ? WHERE id = ?;", [
          payload.stage_id,
          progressUpdate,
          payload.id,
        ]);
      } else {
        await runMySQLQuery("UPDATE projects SET status = ? WHERE id = ?;", [
          payload.stage_id,
          payload.id,
        ]);
      }
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
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
