import { createServerFn } from "./server-fn";
import mysql from "mysql2/promise";
import { ensureMySQLTablesExist } from "./auth.functions";
import { getMySQLConfig, generateUUID, getMySQLTimestamp } from "./mysql-client";
import { createSingleMySQLConnection } from "./mysql-server";

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

/**
 * Server Function: Fetch all roles with assigned user counts and permission lists
 */
export const getRolesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; roles: CrmRoleItem[]; error?: string }> => {
    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      // Fetch all roles
      const [roleRows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT id, name, description, created_at, updated_at FROM `roles` ORDER BY name ASC;",
      );

      // Fetch all role permissions
      const [rpRows] = await conn.query<mysql.RowDataPacket[]>(`
        SELECT rp.role_id, p.id, p.resource, p.action, p.description
        FROM \`role_permissions\` rp
        INNER JOIN \`permissions\` p ON rp.permission_id = p.id;
      `);

      // Fetch user count per role
      const [userCountRows] = await conn.query<mysql.RowDataPacket[]>(`
        SELECT role, COUNT(*) as cnt FROM \`users\` WHERE is_deleted = 0 GROUP BY role;
      `);

      const userCountMap = new Map<string, number>();
      if (Array.isArray(userCountRows)) {
        for (const row of userCountRows) {
          const rName = String(row["role"] || "").toUpperCase();
          userCountMap.set(rName, Number(row["cnt"] || 0));
        }
      }

      const rolePermsMap = new Map<string, RolePermissionItem[]>();
      if (Array.isArray(rpRows)) {
        for (const rp of rpRows) {
          const rId = String(rp["role_id"]);
          const list = rolePermsMap.get(rId) || [];
          list.push({
            id: String(rp["id"]),
            resource: String(rp["resource"]),
            action: String(rp["action"]),
            description: rp["description"] ? String(rp["description"]) : null,
          });
          rolePermsMap.set(rId, list);
        }
      }

      const roles: CrmRoleItem[] = [];
      if (Array.isArray(roleRows)) {
        for (const r of roleRows) {
          const id = String(r["id"]);
          const name = String(r["name"] || "");
          const isSystem =
            id.startsWith("role-global-") ||
            ["admin", "agent", "artist"].includes(name.toLowerCase());
          const permissions = rolePermsMap.get(id) || [];
          const userCount =
            userCountMap.get(name.toUpperCase()) || userCountMap.get(id.toUpperCase()) || 0;

          roles.push({
            id,
            name,
            description: r["description"] ? String(r["description"]) : null,
            user_count: userCount,
            is_system: isSystem,
            permission_ids: permissions.map((p) => p.id),
            permissions,
            created_at: r["created_at"] ? String(r["created_at"]) : getMySQLTimestamp(),
            updated_at: r["updated_at"] ? String(r["updated_at"]) : getMySQLTimestamp(),
          });
        }
      }

      await conn.end();
      return { success: true, roles };
    } catch (e: unknown) {
      const err = e as { message?: string };
      console.error("Get Roles Server Function Error:", err?.message || e);
      return { success: false, roles: [], error: err?.message || "Failed to fetch roles." };
    }
  },
);

/**
 * Server Function: Fetch all available system permissions grouped by resource
 */
export const getPermissionsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    success: boolean;
    permissions: RolePermissionItem[];
    error?: string;
  }> => {
    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      const [rows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT id, resource, action, description FROM `permissions` ORDER BY resource ASC, action ASC;",
      );

      const permissions: RolePermissionItem[] = [];
      if (Array.isArray(rows)) {
        for (const r of rows) {
          permissions.push({
            id: String(r["id"]),
            resource: String(r["resource"]),
            action: String(r["action"]),
            description: r["description"] ? String(r["description"]) : null,
          });
        }
      }

      await conn.end();
      return { success: true, permissions };
    } catch (e: unknown) {
      const err = e as { message?: string };
      console.error("Get Permissions Server Function Error:", err?.message || e);
      return {
        success: false,
        permissions: [],
        error: err?.message || "Failed to fetch permissions.",
      };
    }
  },
);

/**
 * Server Function: Create or update a role and its assigned permissions
 */
export const saveRoleFn = createServerFn({ method: "POST" })
  .validator((input: SaveRolePayload) => input)
  .handler(async ({ data }): Promise<{ success: boolean; id?: string; error?: string }> => {
    const name = String(data?.name || "").trim();
    if (!name) {
      return { success: false, error: "Role name is required." };
    }

    try {
      const config = getMySQLConfig();
      const conn = await mysql.createConnection({
        host: config.host === "localhost" ? "127.0.0.1" : config.host,
        port: config.port,
        user: config.user,
        password: config.password ?? "",
        database: config.database,
      });

      await ensureMySQLTablesExist(conn, config.database);

      const roleId = data.id && data.id.trim() ? data.id.trim() : `role-${generateUUID()}`;
      const description = data.description ? data.description.trim() : null;
      const now = getMySQLTimestamp();

      // Check if role name already exists for another id
      const [existing] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT id FROM `roles` WHERE LOWER(name) = LOWER(?) AND id != ?;",
        [name, roleId],
      );
      if (Array.isArray(existing) && existing.length > 0) {
        await conn.end();
        return { success: false, error: `A role with the name "${name}" already exists.` };
      }

      // Upsert into roles table
      await conn.query(
        `INSERT INTO \`roles\` (id, tenant_id, name, description, created_at, updated_at)
         VALUES (?, NULL, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), updated_at = VALUES(updated_at);`,
        [roleId, name, description, now, now],
      );

      // Sync role permissions: delete previous assignments and insert selected ones
      await conn.query("DELETE FROM `role_permissions` WHERE role_id = ?;", [roleId]);

      if (Array.isArray(data.permission_ids) && data.permission_ids.length > 0) {
        const values = data.permission_ids.map((pId) => [roleId, pId, now]);
        await conn.query(
          "INSERT IGNORE INTO `role_permissions` (role_id, permission_id, created_at) VALUES ?;",
          [values],
        );
      }

      await conn.end();
      return { success: true, id: roleId };
    } catch (e: unknown) {
      const err = e as { message?: string };
      console.error("Save Role Server Function Error:", err?.message || e);
      return { success: false, error: err?.message || "Failed to save role." };
    }
  });

/**
 * Server Function: Delete a custom role
 */
export const deleteRoleFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const roleId = String(data?.id || "").trim();
    if (!roleId) {
      return { success: false, error: "Role ID is required." };
    }

    try {
      const config = getMySQLConfig();
      const conn = await mysql.createConnection({
        host: config.host === "localhost" ? "127.0.0.1" : config.host,
        port: config.port,
        user: config.user,
        password: config.password ?? "",
        database: config.database,
      });

      await ensureMySQLTablesExist(conn, config.database);

      // Protect default system roles
      const [roleRows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT id, name FROM `roles` WHERE id = ?;",
        [roleId],
      );
      if (!Array.isArray(roleRows) || roleRows.length === 0) {
        await conn.end();
        return { success: false, error: "Role not found." };
      }

      const roleName = String(roleRows[0]?.["name"] || "").toLowerCase();
      if (roleId.startsWith("role-global-") || ["admin", "agent", "artist"].includes(roleName)) {
        await conn.end();
        return {
          success: false,
          error: "System default roles (Admin, Agent, Artist) cannot be deleted.",
        };
      }

      // Check if active users are assigned to this role
      const [userRows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT id FROM `users` WHERE LOWER(role) = LOWER(?) AND is_deleted = 0;",
        [roleName],
      );
      if (Array.isArray(userRows) && userRows.length > 0) {
        await conn.end();
        return {
          success: false,
          error: `Cannot delete role "${roleRows[0]?.["name"]}" because ${userRows.length} active user(s) are assigned to it. Reassign users first.`,
        };
      }

      await conn.query("DELETE FROM `role_permissions` WHERE role_id = ?;", [roleId]);
      await conn.query("DELETE FROM `roles` WHERE id = ?;", [roleId]);

      await conn.end();
      return { success: true };
    } catch (e: unknown) {
      const err = e as { message?: string };
      console.error("Delete Role Server Function Error:", err?.message || e);
      return { success: false, error: err?.message || "Failed to delete role." };
    }
  });
