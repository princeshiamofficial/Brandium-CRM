import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { runMySQLQuery } from "./mysql-api";
import { generateUUID } from "./mysql-client";
import { resolveStageColor, resolveStageIcon, type Stage } from "./stages";

export type CrmProjectItem = {
  id: string;
  project_code: string;
  title: string;
  business_name: string | null;
  contact_name: string | null;
  prospect_id: string;
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
  assigned_agent_id: string | null;
  assigned_agent_name: string | null;
  assigned_agent_avatar: string | null;
  assigned_artist_id: string | null;
  assigned_artist_name: string | null;
  assigned_artist_avatar: string | null;
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
  title: string;
  client_name: string;
  service_id?: string | null;
  stage_id?: string | null;
  assigned_agent_id?: string | null;
  assigned_artist_id?: string | null;
  budget?: number;
  paid_amount?: number;
  progress?: number;
  deadline?: string | null;
  notes?: string | null;
};

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
          p.id, p.contact_name, p.business_name, p.email, p.phone, p.stage_id,
          p.service_id, p.assigned_to, p.assigned_artist_id, p.created_by,
          COALESCE(p.budget, 0) AS budget,
          COALESCE(p.paid_amount, 0) AS paid_amount,
          COALESCE(p.progress, 0) AS progress,
          p.deadline,
          p.notes, p.is_active, p.created_at, p.updated_at,
          COALESCE(st.name, p.stage_id, 'Prospect') AS stage_name,
          COALESCE(st.stage_group, 'in_progress') AS stage_group,
          st.color AS stage_color, st.icon AS stage_icon,
          srv.name AS service_name,
          COALESCE(prof_artist.full_name, u_artist.name) AS artist_name,
          prof_artist.avatar_url AS artist_avatar,
          COALESCE(prof_agent.full_name, u_agent.name) AS agent_name,
          prof_agent.avatar_url AS agent_avatar
        FROM prospects p
        LEFT JOIN stages st ON (p.stage_id = st.id OR p.stage_id = REPLACE(st.id, '-', '_') OR p.stage_id = st.name)
        LEFT JOIN services srv ON p.service_id = srv.id
        LEFT JOIN users u_artist ON p.assigned_artist_id = u_artist.id
        LEFT JOIN profiles prof_artist ON p.assigned_artist_id = prof_artist.id
        LEFT JOIN users u_agent ON p.assigned_to = u_agent.id
        LEFT JOIN profiles prof_agent ON p.assigned_to = prof_agent.id
        WHERE p.is_active = 1
        ORDER BY p.updated_at DESC;
      `;

      const [prospectsRes, stagesRes] = await Promise.all([
        runMySQLQuery<Record<string, unknown>[]>(sql),
        runMySQLQuery<Record<string, unknown>[]>(
          "SELECT * FROM stages WHERE is_active = 1 ORDER BY sort_order ASC;",
        ),
      ]);

      const stages: Stage[] = Array.isArray(stagesRes.data)
        ? stagesRes.data.map((s) => ({
            id: String(s["id"]),
            name: String(s["name"]),
            stage_group: String(s["stage_group"] || "in_progress"),
            sort_order: Number(s["sort_order"] || 0),
            is_follow_up: Boolean(s["is_follow_up"]),
            is_active: Boolean(s["is_active"]),
            color: (s["color"] as string) || null,
            icon: (s["icon"] as string) || null,
          }))
        : [];

      let projects: CrmProjectItem[] = [];
      if (prospectsRes.success && Array.isArray(prospectsRes.data)) {
        projects = prospectsRes.data.map((r, idx) => {
          const budget = Number(r["budget"] || 0);
          const paidAmount = Number(r["paid_amount"] || 0);
          const dueAmount = Math.max(0, budget - paidAmount);
          const progress = Number(r["progress"] || 0);
          const rawId = String(r["id"]);
          const shortCode = `PRJ-${rawId.slice(0, 4).toUpperCase() || (idx + 1).toString().padStart(4, "0")}`;
          const stageName = String(r["stage_name"] || "Prospect");
          return {
            id: rawId,
            project_code: shortCode,
            title: String(r["business_name"] || r["contact_name"] || "Untitled Project"),
            business_name: (r["business_name"] as string) || null,
            contact_name: (r["contact_name"] as string) || null,
            prospect_id: rawId,
            client_name: String(r["contact_name"] || r["business_name"] || "N/A"),
            client_email: (r["email"] as string) || null,
            client_phone: (r["phone"] as string) || null,
            client_address: null,
            service_id: (r["service_id"] as string) || null,
            service_name: (r["service_name"] as string) || null,
            stage_id: String(r["stage_id"] || "prospect"),
            stage_name: stageName,
            stage_group: (r["stage_group"] as string) || "in_progress",
            stage_color: (r["stage_color"] as string) || resolveStageColor(stageName),
            stage_icon: (r["stage_icon"] as string) || resolveStageIcon(stageName),
            assigned_agent_id: (r["assigned_to"] as string) || null,
            assigned_agent_name: (r["agent_name"] as string) || null,
            assigned_agent_avatar: (r["agent_avatar"] as string) || null,
            assigned_artist_id: (r["assigned_artist_id"] as string) || null,
            assigned_artist_name: (r["artist_name"] as string) || null,
            assigned_artist_avatar: (r["artist_avatar"] as string) || null,
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

      return { projects, stages };
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
          `UPDATE prospects SET contact_name = ?, business_name = ?, service_id = ?, stage_id = ?, deal_value = ?, notes = ?, assigned_to = ?, assigned_artist_id = ? WHERE id = ?;`,
          [
            payload.client_name,
            payload.title,
            payload.service_id || null,
            payload.stage_id || "prospect",
            payload.budget || 0,
            payload.notes || null,
            payload.assigned_agent_id || null,
            payload.assigned_artist_id || null,
            id,
          ],
        );
      } else {
        await runMySQLQuery(
          `INSERT INTO prospects (id, contact_name, business_name, service_id, stage_id, deal_value, notes, assigned_to, assigned_artist_id, created_by, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'usr_admin', 1);`,
          [
            id,
            payload.client_name,
            payload.title,
            payload.service_id || null,
            payload.stage_id || "prospect",
            payload.budget || 0,
            payload.notes || null,
            payload.assigned_agent_id || null,
            payload.assigned_artist_id || null,
          ],
        );
      }

      return { success: true, id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      queryClient.invalidateQueries({ queryKey: ["mysql-prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
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
      await runMySQLQuery("UPDATE prospects SET stage_id = ? WHERE id = ?;", [
        payload.stage_id,
        payload.id,
      ]);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      queryClient.invalidateQueries({ queryKey: ["mysql-prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
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
      await runMySQLQuery("UPDATE prospects SET is_active = 0 WHERE id = ?;", [projectId]);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      queryClient.invalidateQueries({ queryKey: ["mysql-prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      toast.success("Project deleted successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete project");
    },
  });
}
