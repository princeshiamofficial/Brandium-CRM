import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getRolesFn,
  getPermissionsFn,
  saveRoleFn,
  deleteRoleFn,
  type CrmRoleItem,
  type RolePermissionItem,
  type SaveRolePayload,
} from "./roles.functions";

export type { CrmRoleItem, RolePermissionItem, SaveRolePayload };

export const rolesQueryOptions = () =>
  queryOptions({
    queryKey: ["admin-roles"],
    queryFn: async (): Promise<CrmRoleItem[]> => {
      const res = await getRolesFn();
      if (!res.success) {
        throw new Error(res.error || "Failed to fetch roles");
      }
      return res.roles || [];
    },
    staleTime: 1000 * 30, // 30 seconds cache
  });

export const permissionsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin-permissions"],
    queryFn: async (): Promise<RolePermissionItem[]> => {
      const res = await getPermissionsFn();
      if (!res.success) {
        throw new Error(res.error || "Failed to fetch permissions");
      }
      return res.permissions || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

export function useSaveRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveRolePayload) => {
      const res = await saveRoleFn({ data: payload });
      if (!res.success) {
        throw new Error(res.error || "Failed to save role");
      }
      return res;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success(
        variables.id
          ? `Role "${variables.name}" updated successfully!`
          : `Role "${variables.name}" created successfully!`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save role");
    },
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const res = await deleteRoleFn({ data: { id: roleId } });
      if (!res.success) {
        throw new Error(res.error || "Failed to delete role");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast.success("Role deleted successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete role");
    },
  });
}
