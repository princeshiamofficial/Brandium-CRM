import { createServerFn } from "@tanstack/react-start";
import mysql from "mysql2/promise";
import { getMySQLConfig, generateUUID } from "./mysql-client";
import { ensureMySQLTablesExist } from "./auth.functions";

async function getMySQLConn() {
  const config = getMySQLConfig();
  const conn = await mysql.createConnection({
    host: config.host === "localhost" ? "127.0.0.1" : config.host,
    port: config.port,
    user: config.user,
    password: config.password ?? "",
    database: config.database,
  });
  await ensureMySQLTablesExist(conn, config.database);
  return conn;
}

export type MySQLProspectInput = {
  id?: string;
  contact_name: string;
  business_name?: string | null;
  designation?: string | null;
  phone?: string | null;
  alternative_phone?: string | null;
  email?: string | null;
  address?: string | null;
  service_id?: string | null;
  stage_id?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  notes?: string | null;
};

/**
 * Server Function: Saves or inserts a prospect directly into local MySQL database `brandium_crm.prospects`.
 */
export const saveMySQLProspect = createServerFn({ method: "POST" })
  .validator((input: MySQLProspectInput) => input)
  .handler(async ({ data }): Promise<{ success: boolean; id?: string; error?: string }> => {
    const contactName = String(data?.contact_name || "").trim();
    if (!contactName) {
      return { success: false, error: "Contact name is required." };
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

      const prospectId = data.id && data.id.trim() ? data.id.trim() : generateUUID();
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      await conn.query(
        `INSERT INTO \`prospects\` (
          \`id\`, \`contact_name\`, \`business_name\`, \`designation\`, \`phone\`,
          \`alternative_phone\`, \`email\`, \`address\`, \`service_id\`, \`stage_id\`,
          \`assigned_to\`, \`created_by\`, \`notes\`, \`is_active\`, \`created_at\`, \`updated_at\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE
          \`contact_name\` = VALUES(\`contact_name\`),
          \`business_name\` = VALUES(\`business_name\`),
          \`designation\` = VALUES(\`designation\`),
          \`phone\` = VALUES(\`phone\`),
          \`alternative_phone\` = VALUES(\`alternative_phone\`),
          \`email\` = VALUES(\`email\`),
          \`address\` = VALUES(\`address\`),
          \`service_id\` = VALUES(\`service_id\`),
          \`stage_id\` = VALUES(\`stage_id\`),
          \`assigned_to\` = VALUES(\`assigned_to\`),
          \`created_by\` = VALUES(\`created_by\`),
          \`notes\` = VALUES(\`notes\`),
          \`updated_at\` = VALUES(\`updated_at\`);`,
        [
          prospectId,
          contactName,
          data.business_name || null,
          data.designation || null,
          data.phone || null,
          data.alternative_phone || null,
          data.email || null,
          data.address || null,
          data.service_id || null,
          data.stage_id || null,
          data.assigned_to || null,
          data.created_by || null,
          data.notes || null,
          now,
          now,
        ],
      );

      await conn.end();
      return { success: true, id: prospectId };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("saveMySQLProspect error:", errObj);
      return {
        success: false,
        error: errObj?.message || "Failed to save prospect to MySQL database.",
      };
    }
  });

/**
 * Server Function: Fetches all prospects from local MySQL database `brandium_crm.prospects`.
 */
export const fetchMySQLProspects = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    success: boolean;
    prospects?: Array<Record<string, string | number | boolean | null>>;
    error?: string;
  }> => {
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

      const [rows] = await conn.query(
        `SELECT 
          p.*,
          s.name AS service_name,
          st.name AS stage_name,
          st.stage_group AS stage_group,
          u_assign.name AS assigned_agent_name,
          u_create.name AS creator_name
        FROM \`prospects\` p
        LEFT JOIN \`services\` s ON p.service_id = s.id
        LEFT JOIN \`stages\` st ON p.stage_id = st.id
        LEFT JOIN \`users\` u_assign ON p.assigned_to = u_assign.id
        LEFT JOIN \`users\` u_create ON p.created_by = u_create.id
        WHERE p.is_active = 1
        ORDER BY p.created_at DESC;`,
      );

      await conn.end();
      return {
        success: true,
        prospects: rows as Array<Record<string, string | number | boolean | null>>,
      };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("fetchMySQLProspects error:", errObj);
      return {
        success: false,
        error: errObj?.message || "Failed to fetch prospects from MySQL database.",
      };
    }
  },
);

/**
 * Server Function: Seeds prospects into MySQL `brandium_crm.prospects` table if table is empty.
 */
export const seedMySQLProspects = createServerFn({ method: "POST" })
  .validator((input: { prospects: MySQLProspectInput[] }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; count?: number; error?: string }> => {
    const list = data?.prospects || [];
    if (list.length === 0) return { success: true, count: 0 };

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

      let insertedCount = 0;

      for (const item of list) {
        const prospectId = item.id && item.id.trim() ? item.id.trim() : generateUUID();
        const now = new Date().toISOString().slice(0, 19).replace("T", " ");

        await conn.query(
          `INSERT INTO \`prospects\` (
            \`id\`, \`contact_name\`, \`business_name\`, \`designation\`, \`phone\`,
            \`alternative_phone\`, \`email\`, \`address\`, \`service_id\`, \`stage_id\`,
            \`assigned_to\`, \`created_by\`, \`notes\`, \`is_active\`, \`created_at\`, \`updated_at\`
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
          ON DUPLICATE KEY UPDATE \`contact_name\` = VALUES(\`contact_name\`);`,
          [
            prospectId,
            item.contact_name,
            item.business_name || null,
            item.designation || null,
            item.phone || null,
            item.alternative_phone || null,
            item.email || null,
            item.address || null,
            item.service_id || null,
            item.stage_id || null,
            item.assigned_to || null,
            item.created_by || null,
            item.notes || null,
            now,
            now,
          ],
        );
        insertedCount++;
      }

      await conn.end();
      return { success: true, count: insertedCount };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("seedMySQLProspects error:", errObj);
      return { success: false, error: errObj?.message || "Failed to seed prospects into MySQL." };
    }
  });

/**
 * Server Function: Soft-deletes (marks is_active=0) a prospect in MySQL `brandium_crm.prospects`.
 */
export const deleteMySQLProspect = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const prospectId = String(data?.id || "").trim();
    if (!prospectId) {
      return { success: false, error: "Prospect ID is required." };
    }
    try {
      const conn = await getMySQLConn();
      await conn.query("DELETE FROM `prospects` WHERE `id` = ?", [prospectId]);
      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("deleteMySQLProspect error:", errObj);
      return { success: false, error: errObj?.message || "Failed to delete prospect from MySQL." };
    }
  });

/**
 * Server Function: Updates a prospect in MySQL `brandium_crm.prospects`.
 */
export const updateMySQLProspect = createServerFn({ method: "POST" })
  .validator((input: MySQLProspectInput & { id: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const prospectId = String(data?.id || "").trim();
    if (!prospectId) {
      return { success: false, error: "Prospect ID is required." };
    }
    try {
      const conn = await getMySQLConn();
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      await conn.query(
        `UPDATE \`prospects\` SET
          \`contact_name\` = ?,
          \`business_name\` = ?,
          \`designation\` = ?,
          \`phone\` = ?,
          \`alternative_phone\` = ?,
          \`email\` = ?,
          \`address\` = ?,
          \`service_id\` = ?,
          \`stage_id\` = ?,
          \`assigned_to\` = ?,
          \`created_by\` = ?,
          \`notes\` = ?,
          \`updated_at\` = ?
        WHERE \`id\` = ?`,
        [
          data.contact_name,
          data.business_name || null,
          data.designation || null,
          data.phone || null,
          data.alternative_phone || null,
          data.email || null,
          data.address || null,
          data.service_id || null,
          data.stage_id || null,
          data.assigned_to || null,
          data.created_by || null,
          data.notes || null,
          now,
          prospectId,
        ],
      );
      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("updateMySQLProspect error:", errObj);
      return { success: false, error: errObj?.message || "Failed to update prospect in MySQL." };
    }
  });
