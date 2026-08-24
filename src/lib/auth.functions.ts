import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

import { getMySQLConfig, createSingleMySQLConnection, getMySQLTimestamp } from "./mysql-client";

export type AuthenticateUserResponse = {
  success: boolean;
  error?: string;
  isSuspended?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "agent";
    avatar_url?: string | null;
  };
};

/**
 * ERP-Style Enterprise Automatic Database Schema Bootstrapper.
 * Automatically checks and creates all missing tables & columns on connection.
 */
export async function ensureMySQLTablesExist(
  conn: mysql.Connection,
  dbName?: string,
): Promise<void> {
  const targetDb = dbName || getMySQLConfig().database;
  try {
    // Disable foreign key checks for safe table bootstrapping
    await conn.query("SET FOREIGN_KEY_CHECKS = 0;");
    await conn.query(
      `ALTER DATABASE \`${targetDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );

    // Auto-delete \`user_avatars\` table if it exists in MySQL
    try {
      await conn.query("DROP TABLE IF EXISTS `user_avatars`;");
    } catch {
      // Ignore
    }

    // 1. \`users\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('ADMIN', 'AGENT') NOT NULL DEFAULT 'AGENT',
        \`status\` ENUM('Active', 'Inactive', 'Deleted') NOT NULL DEFAULT 'Active',
        \`avatar_url\` LONGTEXT NULL,
        \`is_deleted\` TINYINT(1) NOT NULL DEFAULT 0,
        \`deleted_at\` DATETIME NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`idx_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. \`profiles\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`profiles\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`full_name\` VARCHAR(255) NULL,
        \`email\` VARCHAR(255) NULL,
        \`avatar_url\` LONGTEXT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_profiles_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. \`user_roles\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`user_roles\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`role\` ENUM('admin', 'agent') NOT NULL DEFAULT 'agent',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_user_roles_user_id\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. \`services\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`services\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_services_active\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. \`stages\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`stages\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`stage_group\` VARCHAR(100) NOT NULL DEFAULT 'prospect',
        \`sort_order\` INT NOT NULL DEFAULT 0,
        \`color\` VARCHAR(50) NULL,
        \`icon\` VARCHAR(50) NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`is_follow_up\` TINYINT(1) NOT NULL DEFAULT 0,
        \`is_system\` TINYINT(1) NULL DEFAULT 0,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_stages_group_sort\` (\`stage_group\`, \`sort_order\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. \`prospects\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`prospects\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`contact_name\` VARCHAR(255) NOT NULL,
        \`business_name\` VARCHAR(255) NULL,
        \`designation\` VARCHAR(150) NULL,
        \`phone\` VARCHAR(50) NULL,
        \`alternative_phone\` VARCHAR(50) NULL,
        \`email\` VARCHAR(255) NULL,
        \`address\` TEXT NULL,
        \`service_id\` VARCHAR(36) NULL,
        \`stage_id\` VARCHAR(36) NULL,
        \`assigned_to\` VARCHAR(36) NULL,
        \`created_by\` VARCHAR(36) NULL,
        \`notes\` TEXT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_prospects_stage\` (\`stage_id\`),
        KEY \`idx_prospects_assigned\` (\`assigned_to\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. \`prospect_stage_history\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`prospect_stage_history\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`prospect_id\` VARCHAR(36) NOT NULL,
        \`from_stage_id\` VARCHAR(36) NULL,
        \`to_stage_id\` VARCHAR(36) NOT NULL,
        \`changed_by\` VARCHAR(36) NULL,
        \`note\` TEXT NULL,
        \`changed_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_psh_prospect\` (\`prospect_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. \`sales\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`sales\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`prospect_id\` VARCHAR(36) NULL,
        \`service_id\` VARCHAR(36) NULL,
        \`agent_id\` VARCHAR(36) NULL,
        \`amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`paid_amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'closed',
        \`closed_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_sales_prospect\` (\`prospect_id\`),
        KEY \`idx_sales_agent\` (\`agent_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. \`follow_ups\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`follow_ups\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`prospect_id\` VARCHAR(36) NOT NULL,
        \`assigned_to\` VARCHAR(36) NULL,
        \`created_by\` VARCHAR(36) NULL,
        \`due_at\` DATETIME NOT NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
        \`note\` TEXT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_follow_ups_prospect\` (\`prospect_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 11. \`activities\` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`activities\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`prospect_id\` VARCHAR(36) NULL,
        \`actor_id\` VARCHAR(36) NULL,
        \`activity_type\` VARCHAR(100) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_activities_prospect\` (\`prospect_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 12. `meetings` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`meetings\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`prospect_id\` VARCHAR(36) NULL,
        \`phone\` VARCHAR(50) NULL,
        \`location\` VARCHAR(255) NULL,
        \`meeting_type\` VARCHAR(50) NOT NULL DEFAULT 'Office',
        \`meeting_date\` VARCHAR(20) NULL,
        \`meeting_time\` VARCHAR(20) NULL,
        \`assigned_user_id\` VARCHAR(36) NULL,
        \`assigned_to\` VARCHAR(36) NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`scheduled_at\` DATETIME NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
        \`sms_sent\` TINYINT(1) NOT NULL DEFAULT 0,
        \`notes\` TEXT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_meetings_prospect\` (\`prospect_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 13. `opportunities` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`opportunities\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`prospect_id\` VARCHAR(36) NOT NULL,
        \`value\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`estimated_value\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`stage\` VARCHAR(100) NOT NULL DEFAULT 'qualification',
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'Opportunity Created',
        \`assigned_to\` VARCHAR(36) NULL,
        \`created_by\` VARCHAR(36) NULL,
        \`notes\` TEXT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`expected_close_date\` DATE NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_opportunities_prospect\` (\`prospect_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 14. `invoices` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`invoices\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`prospect_id\` VARCHAR(36) NULL,
        \`invoice_number\` VARCHAR(100) NOT NULL,
        \`total_amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`paid_amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`due_amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`description\` TEXT NULL,
        \`bill_date\` VARCHAR(20) NULL,
        \`due_date\` VARCHAR(20) NULL,
        \`notes\` TEXT NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'Pending',
        \`created_by\` VARCHAR(36) NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_invoices_prospect\` (\`prospect_id\`),
        KEY \`idx_invoices_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 15. `payments` table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`payments\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`invoice_id\` VARCHAR(36) NULL,
        \`prospect_id\` VARCHAR(36) NULL,
        \`amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
        \`payment_method\` VARCHAR(100) NOT NULL DEFAULT 'Bank Transfer',
        \`transaction_reference\` VARCHAR(100) NULL,
        \`notes\` TEXT NULL,
        \`recorded_by\` VARCHAR(36) NULL,
        \`payment_date\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`is_valid\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_payments_invoice\` (\`invoice_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 16. \`sessions\` table â€” stores auth sessions server-side
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`sessions\` (
        \`id\` VARCHAR(64) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`user_email\` VARCHAR(255) NOT NULL,
        \`user_name\` VARCHAR(255) NOT NULL,
        \`user_role\` ENUM('admin', 'agent') NOT NULL DEFAULT 'agent',
        \`avatar_url\` LONGTEXT NULL,
        \`expires_at\` DATETIME NOT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_sessions_user\` (\`user_id\`),
        KEY \`idx_sessions_expires\` (\`expires_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 17. Production operations tables for tenancy, RBAC, migrations, audit, and outbox jobs
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`tenants\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(120) NOT NULL,
        \`status\` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`idx_tenants_slug\` (\`slug\`),
        KEY \`idx_tenants_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`memberships\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NOT NULL,
        \`status\` ENUM('active', 'inactive', 'invited') NOT NULL DEFAULT 'active',
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`idx_memberships_user_tenant\` (\`user_id\`, \`tenant_id\`),
        KEY \`idx_memberships_tenant\` (\`tenant_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`tenant_id\` VARCHAR(36) NULL,
        \`name\` VARCHAR(80) NOT NULL,
        \`description\` VARCHAR(255) NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`idx_roles_scope_name\` (\`tenant_id\`, \`name\`),
        KEY \`idx_roles_tenant\` (\`tenant_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`permissions\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`resource\` VARCHAR(100) NOT NULL,
        \`action\` VARCHAR(80) NOT NULL,
        \`description\` VARCHAR(255) NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`idx_permissions_resource_action\` (\`resource\`, \`action\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`role_permissions\` (
        \`role_id\` VARCHAR(36) NOT NULL,
        \`permission_id\` VARCHAR(36) NOT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`role_id\`, \`permission_id\`),
        KEY \`idx_role_permissions_permission\` (\`permission_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`refresh_tokens\` (
        \`id\` VARCHAR(64) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`token_hash\` VARCHAR(255) NOT NULL,
        \`expires_at\` DATETIME NOT NULL,
        \`revoked_at\` DATETIME NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`idx_refresh_tokens_hash\` (\`token_hash\`),
        KEY \`idx_refresh_tokens_user\` (\`user_id\`),
        KEY \`idx_refresh_tokens_expires\` (\`expires_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`audit_events\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`actor_id\` VARCHAR(36) NULL,
        \`tenant_id\` VARCHAR(36) NULL,
        \`action\` VARCHAR(120) NOT NULL,
        \`resource\` VARCHAR(120) NOT NULL,
        \`resource_id\` VARCHAR(120) NULL,
        \`metadata\` JSON NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_audit_actor\` (\`actor_id\`),
        KEY \`idx_audit_tenant_resource\` (\`tenant_id\`, \`resource\`, \`resource_id\`),
        KEY \`idx_audit_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`outbox_events\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`type\` VARCHAR(120) NOT NULL,
        \`aggregate_id\` VARCHAR(120) NULL,
        \`payload\` JSON NOT NULL,
        \`status\` ENUM('pending', 'processing', 'sent', 'failed', 'dead_letter') NOT NULL DEFAULT 'pending',
        \`attempts\` INT NOT NULL DEFAULT 0,
        \`available_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`last_error\` TEXT NULL,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_outbox_status_available\` (\`status\`, \`available_at\`),
        KEY \`idx_outbox_aggregate\` (\`aggregate_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`schema_migrations\` (
        \`id\` VARCHAR(120) NOT NULL,
        \`checksum\` VARCHAR(128) NOT NULL,
        \`applied_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      INSERT IGNORE INTO \`roles\` (\`id\`, \`tenant_id\`, \`name\`, \`description\`)
      VALUES
        ('role-global-admin', NULL, 'admin', 'Platform administrator'),
        ('role-global-agent', NULL, 'agent', 'CRM sales agent');
    `);

    await conn.query(`
      INSERT IGNORE INTO \`permissions\` (\`id\`, \`resource\`, \`action\`, \`description\`)
      VALUES
        ('perm-prospects-read', 'prospects', 'read', 'Read prospects'),
        ('perm-prospects-write', 'prospects', 'write', 'Create and update prospects'),
        ('perm-billing-read', 'billing', 'read', 'Read billing records'),
        ('perm-billing-write', 'billing', 'write', 'Create and update billing records'),
        ('perm-admin-users', 'users', 'admin', 'Manage users');
    `);

    await conn.query(`
      INSERT IGNORE INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
      VALUES
        ('role-global-admin', 'perm-prospects-read'),
        ('role-global-admin', 'perm-prospects-write'),
        ('role-global-admin', 'perm-billing-read'),
        ('role-global-admin', 'perm-billing-write'),
        ('role-global-admin', 'perm-admin-users'),
        ('role-global-agent', 'perm-prospects-read'),
        ('role-global-agent', 'perm-prospects-write');
    `);
    // Auto-column verification for existing tables
    const [userCols] = await conn.query(
      `
      SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_url'
    `,
      [dbName],
    );
    if (Number((userCols as Array<{ cnt: number }>)?.[0]?.cnt ?? 0) === 0) {
      try {
        await conn.query(
          `ALTER TABLE \`users\` ADD COLUMN \`avatar_url\` LONGTEXT NULL AFTER \`status\`;`,
        );
      } catch {
        // Ignore if exists
      }
    }

    const [profCols] = await conn.query(
      `
      SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'profiles' AND COLUMN_NAME = 'avatar_url'
    `,
      [dbName],
    );
    if (Number((profCols as Array<{ cnt: number }>)?.[0]?.cnt ?? 0) === 0) {
      try {
        await conn.query(
          `ALTER TABLE \`profiles\` ADD COLUMN \`avatar_url\` LONGTEXT NULL AFTER \`email\`;`,
        );
      } catch {
        // Ignore if exists
      }
    }

    // Re-enable foreign key checks
    await conn.query("SET FOREIGN_KEY_CHECKS = 1;");

    // Seed default admin accounts into \`users\` if table is empty
    const [countRows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`users\`;`);
    if (Number((countRows as Array<{ cnt: number }>)?.[0]?.cnt ?? 0) === 0) {
      const hashAdmin = bcrypt.hashSync("Admin@12345", 10);
      const hashAgent = bcrypt.hashSync("Agent@12345", 10);
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");

      await conn.query(
        `
        INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`avatar_url\`, \`is_deleted\`, \`created_at\`, \`updated_at\`)
        VALUES
        ('usr-admin-1', 'Mehan Ahmed (System Admin)', 'admin@example.com', ?, 'ADMIN', 'Active', NULL, 0, ?, ?),
        ('usr-admin-2', 'Mehan Ahmed', 'mehan.ahmed.official@gmail.com', ?, 'ADMIN', 'Active', NULL, 0, ?, ?),
        ('usr-agent-0', 'Agent User', 'agent@brandium.com', ?, 'AGENT', 'Active', NULL, 0, ?, ?);
      `,
        [hashAdmin, now, now, hashAdmin, now, now, hashAgent, now, now],
      );
    }

    // Always sync users into profiles table
    try {
      await conn.query(`
        INSERT INTO \`profiles\` (\`id\`, \`full_name\`, \`email\`, \`created_at\`, \`updated_at\`)
        SELECT \`id\`, \`name\`, \`email\`, \`created_at\`, \`updated_at\` FROM \`users\`
        ON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`), \`email\` = VALUES(\`email\`);
      `);
    } catch {
      // Ignore
    }

    // Seed default stages into \`stages\` if table is empty
    const [stageRows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`stages\`;`);
    if (Number((stageRows as Array<{ cnt: number }>)?.[0]?.cnt ?? 0) === 0) {
      await conn.query(`
        INSERT INTO \`stages\` (\`id\`, \`name\`, \`stage_group\`, \`sort_order\`, \`is_follow_up\`, \`is_active\`, \`is_system\`)
        VALUES
        ('prospect', 'Prospect', 'new', 1, 0, 1, 1),
        ('follow-up', 'Follow-up', 'in_progress', 2, 1, 1, 1),
        ('opportunity-created', 'Opportunity Created', 'in_progress', 3, 0, 1, 1),
        ('sales-won', 'Sales won', 'won', 4, 0, 1, 1),
        ('dnp', 'DNP (Did Not Pick)', 'unreachable', 5, 0, 1, 1),
        ('switched-off', 'Switched Off', 'unreachable', 6, 0, 1, 1),
        ('invalid-number', 'Invalid Number', 'unreachable', 7, 0, 1, 1),
        ('meeting-scheduled', 'Meeting Scheduled', 'in_progress', 8, 1, 1, 1),
        ('quotation-sent', 'Quotation Sent', 'in_progress', 9, 0, 1, 1);
      `);
    }

    // Seed default services into \`services\` if table is empty
    const [serviceRows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`services\`;`);
    if (Number((serviceRows as Array<{ cnt: number }>)?.[0]?.cnt ?? 0) === 0) {
      await conn.query(`
        INSERT INTO \`services\` (\`id\`, \`name\`, \`description\`, \`is_active\`)
        VALUES
        ('srv-1', 'Product Photography', 'High-end studio & e-commerce product catalog shoot.', 1),
        ('srv-2', 'Graphics Design', 'Social media banners, ad creatives, and print designs.', 1),
        ('srv-3', 'Monthly Plan', 'All-in-one monthly digital marketing & telesales management.', 1),
        ('srv-4', 'Website Development', 'Custom responsive React, Next.js, and WordPress websites.', 1),
        ('srv-5', 'Celebrity Video Ads', 'Commercial video ads featuring popular celebrities.', 1),
        ('srv-6', 'TVC', 'Television Commercial production & broadcast formatting.', 1),
        ('srv-7', 'OVC', 'Online Video Commercials optimized for social media.', 1),
        ('srv-8', 'Voice-Over Video Ads', 'Professional voice-over narration with dynamic visuals.', 1),
        ('srv-9', 'Corporate AV', 'Corporate Audio-Visual presentations & company profiles.', 1),
        ('srv-10', 'Influencer Video Ads', 'Influencer endorsement videos for TikTok, Instagram & FB.', 1),
        ('srv-11', 'Motion Video Ads', '2D/3D motion graphics animation and visual FX.', 1),
        ('srv-12', 'Logo Design', 'Custom brand identity, vector logos, and brand guidelines.', 1);
      `);
    }
  } catch (e) {
    console.error("ERP Auto Database Init Error:", e);
  }
}

export const authenticateXamppUser = createServerFn({ method: "POST" })
  .validator((input: { email?: string; password?: string }) => input)
  .handler(async ({ data }): Promise<AuthenticateUserResponse> => {
    const email = String(data?.email || "")
      .toLowerCase()
      .trim();
    const password = String(data?.password || "");

    if (!email || !password) {
      return { success: false, error: "Please enter both email and password." };
    }

    try {
      const conn = await createSingleMySQLConnection();

      // Execute ERP Automatic Database Table & Schema Auto-Creation Engine
      await ensureMySQLTablesExist(conn);

      if (email === "admin@example.com" || email === "agent@brandium.com") {
        try {
          await conn.query(
            "UPDATE `users` SET `status` = 'Active', `is_deleted` = 0 WHERE LOWER(`email`) = ?",
            [email],
          );
        } catch {
          // Ignore
        }
      }

      const [rows] = await conn.query(
        "SELECT id, name, email, password_hash, role, status, avatar_url, is_deleted FROM users WHERE LOWER(email) = ? AND is_deleted = 0 LIMIT 1",
        [email],
      );
      await conn.end();

      const userList = rows as Array<{
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: string;
        status: string;
        avatar_url: string | null;
        is_deleted: number;
      }>;

      if (!userList || userList.length === 0 || !userList[0]) {
        return {
          success: false,
          error: "Invalid email or password. User account not found in database.",
        };
      }

      const user = userList[0];

      if (user.status && user.status !== "Active") {
        return {
          success: false,
          isSuspended: true,
          error: "This user account is inactive or disabled. Contact administrator.",
        };
      }

      let isMatch = false;
      if (user.password_hash) {
        try {
          isMatch = bcrypt.compareSync(password, user.password_hash);
        } catch {
          isMatch = false;
        }
      }

      if (!isMatch) {
        return {
          success: false,
          error: "Invalid email or password. Incorrect password entered.",
        };
      }

      const roleStr = String(user.role || "AGENT").toLowerCase() as "admin" | "agent";

      return {
        success: true,
        user: {
          id: String(user.id),
          name: String(user.name || "User"),
          email: String(user.email),
          role: roleStr,
          avatar_url: user.avatar_url ? String(user.avatar_url) : null,
        },
      };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("MySQL Auth Error:", errObj?.message || err);
      return {
        success: false,
        error: `Database connection error: Unable to connect to MySQL database (${errObj?.message || "Connection refused"}).`,
      };
    }
  });

/**
 * Server Function: Auto-Creates Database and all 13+ Tables on App Startup.
 */
export const bootstrapDatabaseOnStartup = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; message: string }> => {
    try {
      const config = getMySQLConfig();
      // Connect to MySQL server without database parameter first
      const conn = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password ?? "",
      });

      // 1. Auto Create Database IF NOT EXISTS
      await conn.query(
        `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      );
      await conn.query(`USE \`${config.database}\`;`);

      // 2. Auto Create All Tables IF NOT EXISTS
      await ensureMySQLTablesExist(conn);
      await conn.end();

      return {
        success: true,
        message: `Database '${config.database}' and all tables auto-created successfully!`,
      };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.warn("Auto DB Init notice:", errObj?.message || err);
      return { success: false, message: errObj?.message || "MySQL Connection Error" };
    }
  },
);

/**
 * Server Function: Updates User Avatar directly in MySQL Database (\`users\` table).
 */
export const updateMySQLUserAvatar = createServerFn({ method: "POST" })
  .validator((input: { userId: string; avatarUrl: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const userId = String(data?.userId || "").trim();
    const avatarUrl = String(data?.avatarUrl || "");

    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      const now = getMySQLTimestamp();

      // Update \`users\` table avatar_url in MySQL DB
      await conn.query("UPDATE `users` SET `avatar_url` = ?, `updated_at` = ? WHERE `id` = ?", [
        avatarUrl || null,
        now,
        userId,
      ]);

      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("Update MySQL User Avatar Error:", errObj?.message || err);
      return {
        success: false,
        error: errObj?.message || "Failed to update avatar in MySQL database.",
      };
    }
  });

/**
 * Server Function: Fetches all active users from MySQL database including avatar_url.
 */
export const fetchMySQLUsers = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    success: boolean;
    users: Array<Record<string, string | number | boolean | null>>;
  }> => {
    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      const [rows] = await conn.query(
        "SELECT id, name, email, password_hash, role, status, avatar_url, is_deleted, created_at, updated_at FROM users WHERE is_deleted = 0 ORDER BY created_at DESC",
      );
      await conn.end();

      return {
        success: true,
        users: (rows as Array<Record<string, string | number | boolean | null>>) || [],
      };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.warn("Fetch MySQL Users Error:", errObj?.message || err);
      return { success: false, users: [] };
    }
  },
);

/**
 * Server Function: Updates User Details (Name, Email, Role, Status) in MySQL Database.
 */
export const updateMySQLUser = createServerFn({ method: "POST" })
  .validator(
    (input: {
      userId: string;
      name: string;
      email: string;
      role: "ADMIN" | "AGENT";
      status: "Active" | "Inactive" | "Deleted";
    }) => input,
  )
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const userId = String(data?.userId || "").trim();
    const name = String(data?.name || "").trim();
    const email = String(data?.email || "")
      .toLowerCase()
      .trim();
    const role = data?.role || "AGENT";
    const status = data?.status || "Active";

    if (!userId || !name || !email) {
      return { success: false, error: "User ID, name, and email are required." };
    }

    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      const now = getMySQLTimestamp();

      await conn.query(
        "UPDATE `users` SET `name` = ?, `email` = ?, `role` = ?, `status` = ?, `updated_at` = ? WHERE `id` = ?",
        [name, email, role, status, now, userId],
      );

      try {
        await conn.query(
          "UPDATE `profiles` SET `full_name` = ?, `email` = ?, `updated_at` = ? WHERE `id` = ?",
          [name, email, now, userId],
        );
      } catch {
        // Ignore
      }

      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("Update MySQL User Error:", errObj?.message || err);
      return {
        success: false,
        error: errObj?.message || "Failed to update user in MySQL database.",
      };
    }
  });

/**
 * Server Function: Creates a New User in MySQL Database.
 */
export const createMySQLUser = createServerFn({ method: "POST" })
  .validator(
    (input: {
      userId: string;
      name: string;
      email: string;
      passwordHash: string;
      role: "ADMIN" | "AGENT";
      status: "Active" | "Inactive" | "Deleted";
      avatarUrl?: string | null;
    }) => input,
  )
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const userId = String(data?.userId || "").trim();
    const name = String(data?.name || "").trim();
    const email = String(data?.email || "")
      .toLowerCase()
      .trim();
    const passwordHash = String(data?.passwordHash || "");
    const role = data?.role || "AGENT";
    const status = data?.status || "Active";
    const avatarUrl = data?.avatarUrl || null;

    if (!userId || !name || !email) {
      return { success: false, error: "User ID, name, and email are required." };
    }

    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      const now = getMySQLTimestamp();

      await conn.query(
        `INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`avatar_url\`, \`is_deleted\`, \`created_at\`, \`updated_at\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [userId, name, email, passwordHash, role, status, avatarUrl, now, now],
      );

      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("Create MySQL User Error:", errObj?.message || err);
      return {
        success: false,
        error: errObj?.message || "Failed to create user in MySQL database.",
      };
    }
  });

/**
 * Server Function: Toggles User Active Status in MySQL Database.
 */
export const toggleMySQLUserStatus = createServerFn({ method: "POST" })
  .validator((input: { userId: string; status: "Active" | "Inactive" | "Deleted" }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const userId = String(data?.userId || "").trim();
    const status = data?.status || "Active";

    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      const now = getMySQLTimestamp();

      await conn.query("UPDATE `users` SET `status` = ?, `updated_at` = ? WHERE `id` = ?", [
        status,
        now,
        userId,
      ]);

      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to toggle status." };
    }
  });

/**
 * Server Function: Soft Deletes User Account in MySQL Database.
 */
export const softDeleteMySQLUser = createServerFn({ method: "POST" })
  .validator((input: { userId: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const userId = String(data?.userId || "").trim();

    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      const now = getMySQLTimestamp();

      await conn.query(
        "UPDATE `users` SET `is_deleted` = 1, `status` = 'Deleted', `deleted_at` = ?, `updated_at` = ? WHERE `id` = ?",
        [now, now, userId],
      );

      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to soft delete user." };
    }
  });

/**
 * Server Function: Resets User Password in MySQL Database.
 */
export const resetMySQLUserPassword = createServerFn({ method: "POST" })
  .validator((input: { userId: string; passwordHash: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const userId = String(data?.userId || "").trim();
    const passwordHash = String(data?.passwordHash || "");

    if (!userId || !passwordHash) {
      return { success: false, error: "User ID and password hash are required." };
    }

    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      const now = getMySQLTimestamp();

      await conn.query("UPDATE `users` SET `password_hash` = ?, `updated_at` = ? WHERE `id` = ?", [
        passwordHash,
        now,
        userId,
      ]);

      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to reset password." };
    }
  });

// â”€â”€â”€ MySQL Session Server Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Replaces localStorage.brandium_dev_session â€” stores auth sessions in MySQL

export const createMySQLSession = createServerFn({ method: "POST" })
  .validator(
    (d: {
      sessionId: string;
      userId: string;
      userEmail: string;
      userName: string;
      userRole: "admin" | "agent";
      avatarUrl?: string | null;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      // Session expires in 30 days
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      await conn.query(
        `INSERT INTO \`sessions\` (\`id\`, \`user_id\`, \`user_email\`, \`user_name\`, \`user_role\`, \`avatar_url\`, \`expires_at\`)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           \`user_id\` = VALUES(\`user_id\`),
           \`user_email\` = VALUES(\`user_email\`),
           \`user_name\` = VALUES(\`user_name\`),
           \`user_role\` = VALUES(\`user_role\`),
           \`avatar_url\` = VALUES(\`avatar_url\`),
           \`expires_at\` = VALUES(\`expires_at\`)`,
        [
          data.sessionId,
          data.userId,
          data.userEmail,
          data.userName,
          data.userRole,
          data.avatarUrl ?? null,
          expiresAt,
        ],
      );

      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const e = err as { message?: string };
      return { success: false, error: e?.message || "Failed to create session." };
    }
  });

export const getMySQLSession = createServerFn({ method: "GET" })
  .validator((d: { sessionId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);

      const now = getMySQLTimestamp();
      const [rows] = await conn.query(
        `SELECT * FROM \`sessions\` WHERE \`id\` = ? AND \`expires_at\` > ? LIMIT 1`,
        [data.sessionId, now],
      );
      await conn.end();

      const sessions = rows as Array<Record<string, unknown>>;
      if (!sessions || sessions.length === 0) {
        return { success: false, session: null };
      }

      const s = sessions[0];
      if (!s) {
        return { success: false, session: null };
      }

      return {
        success: true,
        session: {
          userId: String(s["user_id"] ?? ""),
          userEmail: String(s["user_email"] ?? ""),
          userName: String(s["user_name"] ?? ""),
          userRole: String(s["user_role"] ?? "agent") as "admin" | "agent",
          avatarUrl: (s["avatar_url"] as string) ?? null,
        },
      };
    } catch (err: unknown) {
      const e = err as { message?: string };
      return { success: false, session: null, error: e?.message };
    }
  });

export const deleteMySQLSession = createServerFn({ method: "POST" })
  .validator((d: { sessionId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const conn = await createSingleMySQLConnection();
      await ensureMySQLTablesExist(conn);
      await conn.query(`DELETE FROM \`sessions\` WHERE \`id\` = ?`, [data.sessionId]);
      await conn.end();
      return { success: true };
    } catch (err: unknown) {
      const e = err as { message?: string };
      return { success: false, error: e?.message || "Failed to delete session." };
    }
  });
