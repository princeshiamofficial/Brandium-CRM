import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { runMySQLQuery } from "./mysql-api";
import { generateUUID } from "./mysql-client";

export type RolePermissionItem = {
  id: string;
  resource: string;
  action: string;
  description: string | null;
};

export type CrmRoleItem = {
  id: string;
  name: string;
  description: string | null;
  user_count: number;
  is_system: boolean;
  permission_ids: string[];
  permissions: RolePermissionItem[];
  created_at: string;
  updated_at: string;
};

export type SaveRolePayload = {
  id?: string | null;
  name: string;
  description?: string | null;
  permission_ids: string[];
};

const DEFAULT_SYSTEM_PERMISSIONS: RolePermissionItem[] = [
  {
    id: "perm-p-view",
    resource: "prospects",
    action: "view",
    description: "View list of prospects and leads",
  },
  {
    id: "perm-p-create",
    resource: "prospects",
    action: "create",
    description: "Add new prospects to CRM",
  },
  {
    id: "perm-p-edit",
    resource: "prospects",
    action: "edit",
    description: "Edit contact info and stages",
  },
  {
    id: "perm-p-delete",
    resource: "prospects",
    action: "delete",
    description: "Soft-delete or remove prospects",
  },
  {
    id: "perm-b-view",
    resource: "billing",
    action: "view",
    description: "View invoices and payment receipts",
  },
  {
    id: "perm-b-manage",
    resource: "billing",
    action: "manage",
    description: "Create invoices and record payments",
  },
  {
    id: "perm-s-send",
    resource: "sms",
    action: "send",
    description: "Send single and bulk SMS messages",
  },
  {
    id: "perm-a-access",
    resource: "admin",
    action: "access",
    description: "Access system administration pages",
  },
];

export const permissionsQueryOptions = () =>
  queryOptions({
    queryKey: ["admin-permissions"],
    queryFn: async (): Promise<RolePermissionItem[]> => {
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT `id`, `resource`, `action`, `description` FROM `permissions` ORDER BY `resource` ASC, `action` ASC;",
      );
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((r) => ({
          id: String(r["id"]),
          resource: String(r["resource"] || "general"),
          action: String(r["action"] || "view"),
          description: (r["description"] as string) || null,
        }));
      }
      return DEFAULT_SYSTEM_PERMISSIONS;
    },
    staleTime: 1000 * 60 * 5,
  });

export const rolesQueryOptions = () =>
  queryOptions({
    queryKey: ["admin-roles"],
    queryFn: async (): Promise<CrmRoleItem[]> => {
      const res = await runMySQLQuery<Record<string, unknown>[]>(`
        SELECT r.id, r.name, r.description, r.is_system, r.created_at, r.updated_at,
          COUNT(DISTINCT ur.user_id) AS user_count
        FROM roles r
        LEFT JOIN user_roles ur ON (ur.role = r.name OR ur.role = LOWER(r.name) OR ur.role = r.id)
        GROUP BY r.id, r.name, r.description, r.is_system, r.created_at, r.updated_at
        ORDER BY r.is_system DESC, r.name ASC;
      `);

      if (!res.success || !Array.isArray(res.data)) {
        return [
          {
            id: "role-admin",
            name: "Admin",
            description: "Full administrative access to all CRM resources and settings.",
            is_system: true,
            permission_ids: DEFAULT_SYSTEM_PERMISSIONS.map((p) => p.id),
            permissions: DEFAULT_SYSTEM_PERMISSIONS,
            user_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "role-agent",
            name: "Agent",
            description: "Standard CRM agent with pipeline and billing creation permissions.",
            is_system: true,
            permission_ids: ["perm-p-view", "perm-p-create", "perm-p-edit", "perm-b-view"],
            permissions: DEFAULT_SYSTEM_PERMISSIONS.slice(0, 4),
            user_count: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }

      const roleList: CrmRoleItem[] = [];
      for (const r of res.data) {
        const roleId = String(r["id"]);
        const permRes = await runMySQLQuery<Record<string, unknown>[]>(
          "SELECT p.id, p.resource, p.action, p.description FROM role_permissions rp JOIN permissions p ON rp.permission_id = p.id WHERE rp.role_id = ?;",
          [roleId],
        );
        const perms: RolePermissionItem[] = Array.isArray(permRes.data)
          ? permRes.data.map((p) => ({
              id: String(p["id"]),
              resource: String(p["resource"] || "general"),
              action: String(p["action"] || "view"),
              description: (p["description"] as string) || null,
            }))
          : [];

        roleList.push({
          id: roleId,
          name: String(r["name"]),
          description: (r["description"] as string) || null,
          is_system: Boolean(r["is_system"]),
          permission_ids: perms.map((p) => p.id),
          permissions: perms,
          user_count: Number(r["user_count"] || 0),
          created_at: String(r["created_at"] || new Date().toISOString()),
          updated_at: String(r["updated_at"] || new Date().toISOString()),
        });
      }

      return roleList;
    },
    staleTime: 1000 * 30,
  });

export function useSaveRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveRolePayload) => {
      const roleId = payload.id || generateUUID();
      const isUpdate = Boolean(payload.id);

      if (isUpdate) {
        await runMySQLQuery("UPDATE `roles` SET `name` = ?, `description` = ? WHERE `id` = ?;", [
          payload.name,
          payload.description || null,
          roleId,
        ]);
      } else {
        await runMySQLQuery(
          "INSERT INTO `roles` (`id`, `name`, `description`, `is_system`) VALUES (?, ?, ?, 0);",
          [roleId, payload.name, payload.description || null],
        );
      }

      await runMySQLQuery("DELETE FROM `role_permissions` WHERE `role_id` = ?;", [roleId]);
      for (const permId of payload.permission_ids) {
        await runMySQLQuery(
          "INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES (?, ?);",
          [roleId, permId],
        );
      }

      return { success: true, id: roleId };
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
      await runMySQLQuery("DELETE FROM `role_permissions` WHERE `role_id` = ?;", [roleId]);
      await runMySQLQuery("DELETE FROM `roles` WHERE `id` = ? AND `is_system` = 0;", [roleId]);
      return { success: true };
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
