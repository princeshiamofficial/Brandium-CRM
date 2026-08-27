import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProjectsFn,
  saveProjectFn,
  updateProjectStatusFn,
  deleteProjectFn,
  type CrmProjectItem,
  type SaveProjectPayload,
} from "./projects.functions";
import { type Stage } from "./stages";

export type { CrmProjectItem, SaveProjectPayload };

export type ProjectsQueryResult = {
  projects: CrmProjectItem[];
  stages: Stage[];
};

export const projectsQueryOptions = (userId?: string, isAdmin: boolean = false) =>
  queryOptions({
    queryKey: ["crm-projects-with-stages", userId, isAdmin],
    queryFn: async (): Promise<ProjectsQueryResult> => {
      const res = await getProjectsFn();
      if (!res.success) {
        throw new Error(res.error || "Failed to fetch projects");
      }
      let projects = res.projects || [];
      if (!isAdmin && userId) {
        projects = projects.filter(
          (p) => p.assigned_artist_id === userId || p.assigned_agent_id === userId,
        );
      }
      return {
        projects,
        stages: res.stages || [],
      };
    },
    staleTime: 1000 * 30, // 30 seconds
  });

export function useSaveProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveProjectPayload) => {
      const res = await saveProjectFn({ data: payload });
      if (!res.success) {
        throw new Error(res.error || "Failed to save project");
      }
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      queryClient.invalidateQueries({ queryKey: ["mysql-prospects"] });
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
      const updateData: { id: string; stage_id: string; progress?: number } = {
        id: payload.id,
        stage_id: payload.stage_id,
      };
      if (typeof payload.progress === "number") {
        updateData.progress = payload.progress;
      }
      const res = await updateProjectStatusFn({ data: updateData });
      if (!res.success) {
        throw new Error(res.error || "Failed to update project stage");
      }
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      queryClient.invalidateQueries({ queryKey: ["mysql-prospects"] });
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
      const res = await deleteProjectFn({ data: { id: projectId } });
      if (!res.success) {
        throw new Error(res.error || "Failed to delete project");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-projects-with-stages"] });
      queryClient.invalidateQueries({ queryKey: ["mysql-prospects"] });
      toast.success("Project deleted successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete project");
    },
  });
}
