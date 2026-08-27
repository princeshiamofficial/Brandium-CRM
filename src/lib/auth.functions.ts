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

// In-Memory Schema Bootstrapping Cache & Concurrency Latch
let isSchemaInitialized = false;
let initSchemaPromise: Promise<void> | null = null;

/**
 * ERP-Style Enterprise Automatic Database Schema Bootstrapper.
 * Automatically checks and creates all missing tables & columns on connection with one-time execution cache.
 */
export async function ensureMySQLTablesExist(
  conn: mysql.Connection,
  dbName?: string,
): Promise<void> {
  if (isSchemaInitialized) {
    return;
  }

  if (initSchemaPromise) {
    return initSchemaPromise;
  }

  initSchemaPromise = (async () => {
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
        \`website_url\` VARCHAR(500) NULL,
        \`logo_url\` VARCHAR(500) NULL,
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

      // 16. `sessions` table — stores auth sessions server-side
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

      // 17. `projects` table — ERPApp-style Projects & Creative Production Lifecycle
      await conn.query(`
        CREATE TABLE IF NOT EXISTS \`projects\` (
          \`id\` VARCHAR(36) NOT NULL,
          \`project_code\` VARCHAR(50) NOT NULL,
          \`title\` VARCHAR(255) NOT NULL,
          \`prospect_id\` VARCHAR(36) NULL,
          \`client_name\` VARCHAR(255) NOT NULL,
          \`service_id\` VARCHAR(36) NULL,
          \`status\` VARCHAR(50) NOT NULL DEFAULT 'CR Clearance',
          \`assigned_agent_id\` VARCHAR(36) NULL,
          \`assigned_artist_id\` VARCHAR(36) NULL,
          \`budget\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
          \`paid_amount\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
          \`progress\` INT NOT NULL DEFAULT 0,
          \`deadline\` DATE NULL,
          \`notes\` TEXT NULL,
          \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`idx_projects_code\` (\`project_code\`),
          KEY \`idx_projects_status\` (\`status\`),
          KEY \`idx_projects_prospect\` (\`prospect_id\`),
          KEY \`idx_projects_artist\` (\`assigned_artist_id\`),
          KEY \`idx_projects_agent\` (\`assigned_agent_id\`)
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

      // Safe dynamic column migrations for existing tables
      const ensureColumns = [
        // meetings
        { table: "meetings", column: "assigned_user_id", def: "VARCHAR(36) NULL" },
        { table: "meetings", column: "assigned_to", def: "VARCHAR(36) NULL" },
        { table: "meetings", column: "phone", def: "VARCHAR(50) NULL" },
        { table: "meetings", column: "location", def: "VARCHAR(255) NULL" },
        { table: "meetings", column: "meeting_type", def: "VARCHAR(50) NOT NULL DEFAULT 'Office'" },
        { table: "meetings", column: "meeting_date", def: "VARCHAR(20) NULL" },
        { table: "meetings", column: "meeting_time", def: "VARCHAR(20) NULL" },
        { table: "meetings", column: "scheduled_at", def: "DATETIME NULL" },
        { table: "meetings", column: "status", def: "VARCHAR(50) NOT NULL DEFAULT 'Scheduled'" },
        { table: "meetings", column: "sms_sent", def: "TINYINT(1) NOT NULL DEFAULT 0" },
        { table: "meetings", column: "notes", def: "TEXT NULL" },
        // prospects
        { table: "prospects", column: "assigned_artist_id", def: "VARCHAR(36) NULL" },
        { table: "prospects", column: "business_name", def: "VARCHAR(255) NULL" },
        { table: "prospects", column: "logo_url", def: "TEXT NULL" },
        { table: "prospects", column: "address", def: "TEXT NULL" },
        { table: "prospects", column: "currency", def: "VARCHAR(10) NOT NULL DEFAULT 'USD'" },
        { table: "prospects", column: "lead_score", def: "INT NOT NULL DEFAULT 0" },
        { table: "prospects", column: "tags", def: "TEXT NULL" },
        { table: "prospects", column: "last_activity", def: "DATETIME NULL" },
        { table: "prospects", column: "website", def: "VARCHAR(255) NULL" },
        { table: "prospects", column: "city", def: "VARCHAR(100) NULL" },
        { table: "prospects", column: "country", def: "VARCHAR(100) NULL" },
        { table: "prospects", column: "state", def: "VARCHAR(100) NULL" },
        { table: "prospects", column: "priority", def: "VARCHAR(20) NULL" },
        { table: "prospects", column: "source", def: "VARCHAR(100) NULL" },
        { table: "prospects", column: "notes", def: "TEXT NULL" },
        // invoices
        { table: "invoices", column: "due_amount", def: "DECIMAL(12, 2) NOT NULL DEFAULT 0.00" },
        { table: "invoices", column: "bill_date", def: "VARCHAR(20) NULL" },
        { table: "invoices", column: "due_date", def: "VARCHAR(20) NULL" },
        { table: "invoices", column: "description", def: "TEXT NULL" },
        { table: "invoices", column: "notes", def: "TEXT NULL" },
        { table: "invoices", column: "created_by", def: "VARCHAR(36) NULL" },
        // payments
        {
          table: "payments",
          column: "payment_method",
          def: "VARCHAR(100) NOT NULL DEFAULT 'Bank Transfer'",
        },
        { table: "payments", column: "transaction_reference", def: "VARCHAR(100) NULL" },
        { table: "payments", column: "notes", def: "TEXT NULL" },
        { table: "payments", column: "recorded_by", def: "VARCHAR(36) NULL" },
        { table: "payments", column: "is_valid", def: "TINYINT(1) NOT NULL DEFAULT 1" },
        // services
        { table: "services", column: "icon", def: "VARCHAR(50) NULL" },
        { table: "services", column: "is_active", def: "TINYINT(1) NOT NULL DEFAULT 1" },
        // opportunities
        {
          table: "opportunities",
          column: "estimated_value",
          def: "DECIMAL(12, 2) NOT NULL DEFAULT 0.00",
        },
        { table: "opportunities", column: "is_active", def: "TINYINT(1) NOT NULL DEFAULT 1" },
        { table: "opportunities", column: "expected_close_date", def: "DATE NULL" },
        // projects
        { table: "projects", column: "assigned_agent_id", def: "VARCHAR(36) NULL" },
        { table: "projects", column: "assigned_artist_id", def: "VARCHAR(36) NULL" },
        { table: "projects", column: "budget", def: "DECIMAL(12, 2) NOT NULL DEFAULT 0.00" },
        { table: "projects", column: "paid_amount", def: "DECIMAL(12, 2) NOT NULL DEFAULT 0.00" },
        { table: "projects", column: "progress", def: "INT NOT NULL DEFAULT 0" },
        { table: "projects", column: "deadline", def: "DATE NULL" },
        { table: "projects", column: "notes", def: "TEXT NULL" },
        // users & profiles
        { table: "users", column: "phone", def: "VARCHAR(50) NULL" },
        { table: "users", column: "avatar_url", def: "TEXT NULL" },
        { table: "users", column: "status", def: "VARCHAR(20) NOT NULL DEFAULT 'active'" },
        { table: "profiles", column: "phone", def: "VARCHAR(50) NULL" },
        { table: "profiles", column: "avatar_url", def: "TEXT NULL" },
      ];

      for (const col of ensureColumns) {
        try {
          const [cols] = await conn.query<mysql.RowDataPacket[]>(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [col.table, col.column],
          );
          if (cols.length === 0) {
            await conn.query(
              `ALTER TABLE \`${col.table}\` ADD COLUMN \`${col.column}\` ${col.def}`,
            );
          }
        } catch {
          // Ignore if table does not exist yet or column already exists
        }
      }

      await conn.query(`
        INSERT IGNORE INTO \`roles\` (\`id\`, \`tenant_id\`, \`name\`, \`description\`)
        VALUES
          ('role-global-admin', NULL, 'Admin', 'Platform administrator with full system access'),
          ('role-global-agent', NULL, 'Agent', 'CRM sales agent for telesales & prospect management'),
          ('role-global-artist', NULL, 'Artist', 'Creative artist for graphic designs, video ads & media assets');
      `);

      await conn.query(`
        INSERT IGNORE INTO \`permissions\` (\`id\`, \`resource\`, \`action\`, \`description\`)
        VALUES
          ('perm-prospects-read', 'prospects', 'read', 'View prospects and lead records'),
          ('perm-prospects-write', 'prospects', 'write', 'Create and update prospects'),
          ('perm-prospects-delete', 'prospects', 'delete', 'Delete and manage prospects'),
          ('perm-opportunities-manage', 'opportunities', 'manage', 'Manage sales opportunities and deals'),
          ('perm-followups-manage', 'follow_ups', 'manage', 'Manage prospect follow-ups'),
          ('perm-meetings-manage', 'meetings', 'manage', 'Schedule and manage client meetings'),
          ('perm-sales-view', 'sales', 'read', 'View won sales and achievements'),
          ('perm-services-read', 'services', 'read', 'View agency services and packages'),
          ('perm-services-manage', 'services', 'manage', 'Create and modify services'),
          ('perm-stages-manage', 'stages', 'manage', 'Configure pipeline stages'),
          ('perm-billing-read', 'billing', 'read', 'Read billing and invoice records'),
          ('perm-billing-write', 'billing', 'write', 'Create and collect payments/invoices'),
          ('perm-sms-send', 'sms', 'send', 'Send bulk SMS to clients'),
          ('perm-reports-view', 'reports', 'read', 'View performance reports and analytics'),
          ('perm-admin-users', 'users', 'admin', 'Manage user accounts and credentials'),
          ('perm-admin-roles', 'roles', 'admin', 'Manage system roles and permissions');
      `);

      await conn.query(`
        INSERT IGNORE INTO \`role_permissions\` (\`role_id\`, \`permission_id\`)
        VALUES
          ('role-global-admin', 'perm-prospects-read'),
          ('role-global-admin', 'perm-prospects-write'),
          ('role-global-admin', 'perm-prospects-delete'),
          ('role-global-admin', 'perm-opportunities-manage'),
          ('role-global-admin', 'perm-followups-manage'),
          ('role-global-admin', 'perm-meetings-manage'),
          ('role-global-admin', 'perm-sales-view'),
          ('role-global-admin', 'perm-services-read'),
          ('role-global-admin', 'perm-services-manage'),
          ('role-global-admin', 'perm-stages-manage'),
          ('role-global-admin', 'perm-billing-read'),
          ('role-global-admin', 'perm-billing-write'),
          ('role-global-admin', 'perm-sms-send'),
          ('role-global-admin', 'perm-reports-view'),
          ('role-global-admin', 'perm-admin-users'),
          ('role-global-admin', 'perm-admin-roles'),

          ('role-global-agent', 'perm-prospects-read'),
          ('role-global-agent', 'perm-prospects-write'),
          ('role-global-agent', 'perm-opportunities-manage'),
          ('role-global-agent', 'perm-followups-manage'),
          ('role-global-agent', 'perm-meetings-manage'),
          ('role-global-agent', 'perm-services-read'),
          ('role-global-agent', 'perm-sales-view'),

          ('role-global-artist', 'perm-prospects-read'),
          ('role-global-artist', 'perm-services-read'),
          ('role-global-artist', 'perm-sales-view');
      `);

      try {
        await conn.query(
          "ALTER TABLE `users` MODIFY COLUMN `role` VARCHAR(50) NOT NULL DEFAULT 'AGENT';",
        );
      } catch {
        // Ignore if already modified
      }
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

      // Safe auto-column additions for invoices, opportunities, meetings, payments, services
      const autoColumns: Array<{ table: string; col: string; query: string }> = [
        {
          table: "invoices",
          col: "due_amount",
          query:
            "ALTER TABLE `invoices` ADD COLUMN `due_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER `paid_amount`;",
        },
        {
          table: "invoices",
          col: "description",
          query: "ALTER TABLE `invoices` ADD COLUMN `description` TEXT NULL AFTER `due_amount`;",
        },
        {
          table: "invoices",
          col: "bill_date",
          query:
            "ALTER TABLE `invoices` ADD COLUMN `bill_date` VARCHAR(20) NULL AFTER `description`;",
        },
        {
          table: "invoices",
          col: "due_date",
          query: "ALTER TABLE `invoices` ADD COLUMN `due_date` VARCHAR(20) NULL AFTER `bill_date`;",
        },
        {
          table: "invoices",
          col: "notes",
          query: "ALTER TABLE `invoices` ADD COLUMN `notes` TEXT NULL AFTER `due_date`;",
        },
        {
          table: "opportunities",
          col: "status",
          query: "ALTER TABLE `opportunities` ADD COLUMN `status` VARCHAR(100) NULL AFTER `stage`;",
        },
        {
          table: "opportunities",
          col: "estimated_value",
          query:
            "ALTER TABLE `opportunities` ADD COLUMN `estimated_value` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER `value`;",
        },
        {
          table: "opportunities",
          col: "notes",
          query:
            "ALTER TABLE `opportunities` ADD COLUMN `notes` TEXT NULL AFTER `expected_close_date`;",
        },
        {
          table: "opportunities",
          col: "assigned_to",
          query:
            "ALTER TABLE `opportunities` ADD COLUMN `assigned_to` VARCHAR(36) NULL AFTER `notes`;",
        },
        {
          table: "opportunities",
          col: "updated_at",
          query:
            "ALTER TABLE `opportunities` ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;",
        },
        {
          table: "meetings",
          col: "phone",
          query: "ALTER TABLE `meetings` ADD COLUMN `phone` VARCHAR(50) NULL AFTER `notes`;",
        },
        {
          table: "meetings",
          col: "location",
          query: "ALTER TABLE `meetings` ADD COLUMN `location` VARCHAR(255) NULL AFTER `phone`;",
        },
        {
          table: "meetings",
          col: "meeting_type",
          query:
            "ALTER TABLE `meetings` ADD COLUMN `meeting_type` VARCHAR(50) NULL AFTER `location`;",
        },
        {
          table: "meetings",
          col: "meeting_date",
          query:
            "ALTER TABLE `meetings` ADD COLUMN `meeting_date` VARCHAR(20) NULL AFTER `meeting_type`;",
        },
        {
          table: "meetings",
          col: "meeting_time",
          query:
            "ALTER TABLE `meetings` ADD COLUMN `meeting_time` VARCHAR(20) NULL AFTER `meeting_date`;",
        },
        {
          table: "meetings",
          col: "updated_at",
          query:
            "ALTER TABLE `meetings` ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;",
        },
        {
          table: "payments",
          col: "transaction_reference",
          query:
            "ALTER TABLE `payments` ADD COLUMN `transaction_reference` VARCHAR(255) NULL AFTER `payment_method`;",
        },
        {
          table: "payments",
          col: "notes",
          query:
            "ALTER TABLE `payments` ADD COLUMN `notes` TEXT NULL AFTER `transaction_reference`;",
        },
        {
          table: "services",
          col: "price",
          query:
            "ALTER TABLE `services` ADD COLUMN `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER `description`;",
        },
        {
          table: "services",
          col: "category",
          query: "ALTER TABLE `services` ADD COLUMN `category` VARCHAR(100) NULL AFTER `price`;",
        },
        {
          table: "services",
          col: "icon",
          query: "ALTER TABLE `services` ADD COLUMN `icon` VARCHAR(100) NULL AFTER `category`;",
        },
        {
          table: "prospects",
          col: "assigned_artist_id",
          query:
            "ALTER TABLE `prospects` ADD COLUMN `assigned_artist_id` VARCHAR(36) NULL AFTER `assigned_to`;",
        },
        {
          table: "prospects",
          col: "budget",
          query:
            "ALTER TABLE `prospects` ADD COLUMN `budget` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER `assigned_artist_id`;",
        },
        {
          table: "prospects",
          col: "paid_amount",
          query:
            "ALTER TABLE `prospects` ADD COLUMN `paid_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER `budget`;",
        },
        {
          table: "prospects",
          col: "progress",
          query:
            "ALTER TABLE `prospects` ADD COLUMN `progress` INT NOT NULL DEFAULT 0 AFTER `paid_amount`;",
        },
        {
          table: "prospects",
          col: "website_url",
          query:
            "ALTER TABLE `prospects` ADD COLUMN `website_url` VARCHAR(500) NULL AFTER `address`;",
        },
        {
          table: "prospects",
          col: "logo_url",
          query:
            "ALTER TABLE `prospects` ADD COLUMN `logo_url` VARCHAR(500) NULL AFTER `website_url`;",
        },
        {
          table: "prospects",
          col: "deadline",
          query: "ALTER TABLE `prospects` ADD COLUMN `deadline` DATE NULL AFTER `progress`;",
        },
      ];

      for (const c of autoColumns) {
        try {
          const [colCheck] = await conn.query(
            `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [dbName, c.table, c.col],
          );
          if (Number((colCheck as Array<{ cnt: number }>)?.[0]?.cnt ?? 0) === 0) {
            await conn.query(c.query);
          }
        } catch {
          // Ignore if column already exists
        }
      }

      // Re-enable foreign key checks
      await conn.query("SET FOREIGN_KEY_CHECKS = 1;");

      // Seed default admin accounts into \`users\` if table is empty
      const [countRows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`users\`;`);
      if (Number((countRows as Array<{ cnt: number }>)?.[0]?.cnt ?? 0) === 0) {
        const hashAdmin = bcrypt.hashSync("Admin@12345", 10);
        const hashAgent = bcrypt.hashSync("Agent@12345", 10);
        const now = getMySQLTimestamp();

        await conn.query(
          `
        INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`avatar_url\`, \`is_deleted\`, \`created_at\`, \`updated_at\`)
        VALUES
        ('usr-admin-1', 'Mehan Ahmed (System Admin)', 'admin@example.com', ?, 'ADMIN', 'Active', NULL, 0, ?, ?),
        ('usr-admin-2', 'Mehan Ahmed', 'mehan.ahmed.official@gmail.com', ?, 'ADMIN', 'Active', NULL, 0, ?, ?),
        ('usr-agent-0', 'Agent User', 'agent@brandium.com', ?, 'AGENT', 'Active', NULL, 0, ?, ?),
        ('usr-artist-1', 'Sabbir Hossain (Artist)', 'sabbir.artist@brandium.com', ?, 'ARTIST', 'Active', NULL, 0, ?, ?),
        ('usr-artist-2', 'Arefin Shuvo (Artist)', 'arefin.artist@brandium.com', ?, 'ARTIST', 'Active', NULL, 0, ?, ?);
      `,
          [
            hashAdmin,
            now,
            now,
            hashAdmin,
            now,
            now,
            hashAgent,
            now,
            now,
            hashAgent,
            now,
            now,
            hashAgent,
            now,
            now,
          ],
        );
      }

      // Ensure default artist accounts exist if missing
      try {
        const [artCountRows] = await conn.query(
          `SELECT COUNT(*) as cnt FROM \`users\` WHERE UPPER(role) = 'ARTIST' AND is_deleted = 0;`,
        );
        if (Number((artCountRows as Array<{ cnt: number }>)?.[0]?.cnt ?? 0) === 0) {
          const hashArtist = bcrypt.hashSync("Artist@12345", 10);
          const now = getMySQLTimestamp();
          await conn.query(
            `
            INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`avatar_url\`, \`is_deleted\`, \`created_at\`, \`updated_at\`)
            VALUES
            ('usr-artist-1', 'Sabbir Hossain', 'sabbir.artist@brandium.com', ?, 'ARTIST', 'Active', NULL, 0, ?, ?),
            ('usr-artist-2', 'Arefin Shuvo', 'arefin.artist@brandium.com', ?, 'ARTIST', 'Active', NULL, 0, ?, ?)
            ON DUPLICATE KEY UPDATE \`role\` = 'ARTIST', \`status\` = 'Active';
          `,
            [hashArtist, now, now, hashArtist, now, now],
          );
        }
      } catch {
        // Ignore
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

      // Seed default projects into `projects` if table is empty
      const [projectRows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`projects\`;`);
      if (Number((projectRows as Array<{ cnt: number }>)?.[0]?.cnt ?? 0) === 0) {
        await conn.query(`
          INSERT INTO \`projects\` (
            \`id\`, \`project_code\`, \`title\`, \`client_name\`, \`service_id\`, \`status\`, 
            \`budget\`, \`paid_amount\`, \`progress\`, \`deadline\`, \`notes\`
          )
          VALUES
          ('prj-1001', 'PRJ-1001', 'Apex Footwear E-Commerce Commercial Ads', 'Apex Footwear Ltd.', 'srv-5', 'On Design', 45000.00, 25000.00, 60, DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 'High-priority celebrity video ad production for seasonal footwear launch.'),
          ('prj-1002', 'PRJ-1002', 'Navana Real Estate Brand Identity & Logo Suite', 'Navana Group', 'srv-12', 'CR Clearance', 30000.00, 15000.00, 20, DATE_ADD(CURRENT_DATE, INTERVAL 14 DAY), 'Vector logo design with brand guidelines and corporate stationery.'),
          ('prj-1003', 'PRJ-1003', 'Shwapno Supermarket 3D Motion Promo Video', 'ACI Logistics / Shwapno', 'srv-11', 'CO Clearance', 55000.00, 30000.00, 35, DATE_ADD(CURRENT_DATE, INTERVAL 10 DAY), '2D/3D motion graphics animation for Facebook & YouTube campaigns.'),
          ('prj-1004', 'PRJ-1004', 'Beximco Pharma Medical Product Catalog Shoot', 'Beximco Pharma', 'srv-1', 'Logistics', 40000.00, 40000.00, 85, DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'High-resolution studio product photography and color grading.'),
          ('prj-1005', 'PRJ-1005', 'Chaldal Monthly Social Media & Ad Campaigns', 'Chaldal.com', 'srv-3', 'Delivered', 75000.00, 75000.00, 100, CURRENT_DATE, 'Monthly digital marketing plan, ad copy, and video production completed.'),
          ('prj-1006', 'PRJ-1006', 'Aarong Handcraft Artisans Video Docu-Series', 'BRAC Aarong', 'srv-6', 'On Hold', 60000.00, 20000.00, 40, DATE_ADD(CURRENT_DATE, INTERVAL 21 DAY), 'Waiting for client script approval and location clearances.');
        `);
      }

      // Mark as initialized in memory for lightning fast 0ms subsequent queries
      isSchemaInitialized = true;
    } catch (e) {
      console.error("ERP Auto Database Init Error:", e);
      initSchemaPromise = null;
    } finally {
      try {
        await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
      } catch {
        // Ignore
      }
    }
  })();

  return initSchemaPromise;
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
