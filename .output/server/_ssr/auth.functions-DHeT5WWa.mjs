import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./createServerFn-CIHAFgYl.mjs";
import { t as createServerRpc } from "./createServerRpc-B90ckaqP.mjs";
import { r as getMySQLConfig } from "./mysql-client-k5RcJc-f.mjs";
import { t as bcryptjs_default } from "../_libs/bcryptjs.mjs";
import { t as require_promise } from "../_libs/mysql2+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.functions-DHeT5WWa.js
var import_promise = /* @__PURE__ */ __toESM(require_promise());
async function ensureMySQLTablesExist(conn, dbName) {
	try {
		await conn.query("SET FOREIGN_KEY_CHECKS = 0;");
		await conn.query(`ALTER DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
		try {
			await conn.query("DROP TABLE IF EXISTS `user_avatars`;");
		} catch {}
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
		const [userCols] = await conn.query(`
      SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'avatar_url'
    `, [dbName]);
		if (Number(userCols?.[0]?.cnt ?? 0) === 0) try {
			await conn.query(`ALTER TABLE \`users\` ADD COLUMN \`avatar_url\` LONGTEXT NULL AFTER \`status\`;`);
		} catch {}
		const [profCols] = await conn.query(`
      SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'profiles' AND COLUMN_NAME = 'avatar_url'
    `, [dbName]);
		if (Number(profCols?.[0]?.cnt ?? 0) === 0) try {
			await conn.query(`ALTER TABLE \`profiles\` ADD COLUMN \`avatar_url\` LONGTEXT NULL AFTER \`email\`;`);
		} catch {}
		await conn.query("SET FOREIGN_KEY_CHECKS = 1;");
		const hashAdmin = "$2b$10$qpjXnl8CfUihiIU0F5/WbejBPBQSgIdrXIuRsD.xbi.4nUorC8FUS";
		const hashAgent = "$2b$10$EUTCyQWyN2.RES4exZkSVOzCpKGLF7cPmbvkNXsu4359niH7nu84G";
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		try {
			await conn.query(`
        INSERT IGNORE INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`avatar_url\`, \`is_deleted\`, \`created_at\`, \`updated_at\`)
        VALUES
        ('usr-admin-1', 'Mehan Ahmed (System Admin)', 'admin@example.com', ?, 'ADMIN', 'Active', NULL, 0, ?, ?),
        ('usr-admin-2', 'Mehan Ahmed', 'mehan.ahmed.official@gmail.com', ?, 'ADMIN', 'Active', NULL, 0, ?, ?),
        ('usr-agent-0', 'Agent User', 'agent@brandium.com', ?, 'AGENT', 'Active', NULL, 0, ?, ?);
      `, [
				hashAdmin,
				now,
				now,
				hashAdmin,
				now,
				now,
				hashAgent,
				now,
				now
			]);
			await conn.query(`
        INSERT INTO \`profiles\` (\`id\`, \`full_name\`, \`email\`, \`created_at\`, \`updated_at\`)
        SELECT \`id\`, \`name\`, \`email\`, \`created_at\`, \`updated_at\` FROM \`users\`
        ON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`), \`email\` = VALUES(\`email\`);
      `);
		} catch (e) {
			console.warn("User seeding notice:", e);
		}
		const [stageRows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`stages\`;`);
		if (Number(stageRows?.[0]?.cnt ?? 0) === 0) await conn.query(`
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
		const [serviceRows] = await conn.query(`SELECT COUNT(*) as cnt FROM \`services\`;`);
		if (Number(serviceRows?.[0]?.cnt ?? 0) === 0) await conn.query(`
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
	} catch (e) {
		console.error("ERP Auto Database Init Error:", e);
	}
}
var authenticateXamppUser_createServerFn_handler = createServerRpc({
	id: "d9e5c27790b88fb18dc203fd44305fd3ac9aebf6052812970379f69c1db654b4",
	name: "authenticateXamppUser",
	filename: "src/lib/auth.functions.ts"
}, (opts) => authenticateXamppUser.__executeServer(opts));
var authenticateXamppUser = createServerFn({ method: "POST" }).validator((input) => input).handler(authenticateXamppUser_createServerFn_handler, async ({ data }) => {
	const email = String(data?.email || "").toLowerCase().trim();
	const password = String(data?.password || "");
	if (!email || !password) return {
		success: false,
		error: "Please enter both email and password."
	};
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		if (email === "admin@example.com" || email === "mehan.ahmed.official@gmail.com" || email === "agent@brandium.com") try {
			const roleVal = email === "agent@brandium.com" ? "AGENT" : "ADMIN";
			const hashVal = email === "agent@brandium.com" ? "$2b$10$EUTCyQWyN2.RES4exZkSVOzCpKGLF7cPmbvkNXsu4359niH7nu84G" : "$2b$10$qpjXnl8CfUihiIU0F5/WbejBPBQSgIdrXIuRsD.xbi.4nUorC8FUS";
			const nameVal = email === "agent@brandium.com" ? "Agent User" : "Mehan Ahmed (System Admin)";
			const idVal = email === "agent@brandium.com" ? "usr-agent-0" : email === "admin@example.com" ? "usr-admin-1" : "usr-admin-2";
			const nowStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
			await conn.query("REPLACE INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `avatar_url`, `is_deleted`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?, 'Active', NULL, 0, ?, ?)", [
				idVal,
				nameVal,
				email,
				hashVal,
				roleVal,
				nowStr,
				nowStr
			]);
			await conn.query("REPLACE INTO `profiles` (`id`, `full_name`, `email`, `created_at`, `updated_at`) VALUES (?, ?, ?, ?, ?)", [
				idVal,
				nameVal,
				email,
				nowStr,
				nowStr
			]);
		} catch (e) {
			console.warn("Auto-upsert default user notice:", e);
		}
		const [rows] = await conn.query("SELECT id, name, email, password_hash, role, status, avatar_url, is_deleted FROM users WHERE LOWER(email) = ? AND is_deleted = 0 LIMIT 1", [email]);
		await conn.end();
		const userList = rows;
		if (!userList || userList.length === 0 || !userList[0]) return {
			success: false,
			error: "Invalid email or password. User account not found in database."
		};
		const user = userList[0];
		if (user.status && user.status !== "Active") return {
			success: false,
			isSuspended: true,
			error: "This user account is inactive or disabled. Contact administrator."
		};
		let isMatch = false;
		if (user.password_hash) try {
			isMatch = bcryptjs_default.compareSync(password, user.password_hash);
		} catch {
			isMatch = false;
		}
		if (!isMatch) return {
			success: false,
			error: "Invalid email or password. Incorrect password entered."
		};
		const roleStr = String(user.role || "AGENT").toLowerCase();
		return {
			success: true,
			user: {
				id: String(user.id),
				name: String(user.name || "User"),
				email: String(user.email),
				role: roleStr,
				avatar_url: user.avatar_url ? String(user.avatar_url) : null
			}
		};
	} catch (err) {
		const errObj = err;
		console.error("XAMPP MySQL Auth Error:", errObj?.message || err);
		return {
			success: false,
			error: `Database connection error: Unable to connect to XAMPP MySQL database (${errObj?.message || "Connection refused"}).`
		};
	}
});
var bootstrapDatabaseOnStartup_createServerFn_handler = createServerRpc({
	id: "193ca774a5e56dae51169ea7a2dcda9148dcaee39d5353c00708b871a8ce841d",
	name: "bootstrapDatabaseOnStartup",
	filename: "src/lib/auth.functions.ts"
}, (opts) => bootstrapDatabaseOnStartup.__executeServer(opts));
var bootstrapDatabaseOnStartup = createServerFn({ method: "GET" }).handler(bootstrapDatabaseOnStartup_createServerFn_handler, async () => {
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? ""
		});
		await conn.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
		await conn.query(`USE \`${config.database}\`;`);
		await ensureMySQLTablesExist(conn, config.database);
		await conn.end();
		return {
			success: true,
			message: `Database '${config.database}' and all tables auto-created successfully!`
		};
	} catch (err) {
		const errObj = err;
		console.warn("Auto DB Init notice:", errObj?.message || err);
		return {
			success: false,
			message: errObj?.message || "MySQL Connection Error"
		};
	}
});
var updateMySQLUserAvatar_createServerFn_handler = createServerRpc({
	id: "78a236a0b762f64ed09ba01b9684547004539ef73468d9ca187bdade0a058798",
	name: "updateMySQLUserAvatar",
	filename: "src/lib/auth.functions.ts"
}, (opts) => updateMySQLUserAvatar.__executeServer(opts));
var updateMySQLUserAvatar = createServerFn({ method: "POST" }).validator((input) => input).handler(updateMySQLUserAvatar_createServerFn_handler, async ({ data }) => {
	const userId = String(data?.userId || "").trim();
	const avatarUrl = String(data?.avatarUrl || "");
	if (!userId) return {
		success: false,
		error: "User ID is required."
	};
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await conn.query("UPDATE `users` SET `avatar_url` = ?, `updated_at` = ? WHERE `id` = ?", [
			avatarUrl || null,
			now,
			userId
		]);
		await conn.end();
		return { success: true };
	} catch (err) {
		const errObj = err;
		console.error("Update MySQL User Avatar Error:", errObj?.message || err);
		return {
			success: false,
			error: errObj?.message || "Failed to update avatar in MySQL database."
		};
	}
});
var fetchMySQLUsers_createServerFn_handler = createServerRpc({
	id: "91a489c77660dee06bbc6398fb17100b4769f2a601beb05d157794a9b69e532f",
	name: "fetchMySQLUsers",
	filename: "src/lib/auth.functions.ts"
}, (opts) => fetchMySQLUsers.__executeServer(opts));
var fetchMySQLUsers = createServerFn({ method: "GET" }).handler(fetchMySQLUsers_createServerFn_handler, async () => {
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const [rows] = await conn.query("SELECT id, name, email, password_hash, role, status, avatar_url, is_deleted, created_at, updated_at FROM users WHERE is_deleted = 0 ORDER BY created_at DESC");
		await conn.end();
		return {
			success: true,
			users: rows || []
		};
	} catch (err) {
		console.warn("Fetch MySQL Users Error:", err?.message || err);
		return {
			success: false,
			users: []
		};
	}
});
var updateMySQLUser_createServerFn_handler = createServerRpc({
	id: "6775950fb1f2337a9abe1504606f7b156cdf4e2db0734c8a7a69b725d1c836ba",
	name: "updateMySQLUser",
	filename: "src/lib/auth.functions.ts"
}, (opts) => updateMySQLUser.__executeServer(opts));
var updateMySQLUser = createServerFn({ method: "POST" }).validator((input) => input).handler(updateMySQLUser_createServerFn_handler, async ({ data }) => {
	const userId = String(data?.userId || "").trim();
	const name = String(data?.name || "").trim();
	const email = String(data?.email || "").toLowerCase().trim();
	const role = data?.role || "AGENT";
	const status = data?.status || "Active";
	if (!userId || !name || !email) return {
		success: false,
		error: "User ID, name, and email are required."
	};
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await conn.query("UPDATE `users` SET `name` = ?, `email` = ?, `role` = ?, `status` = ?, `updated_at` = ? WHERE `id` = ?", [
			name,
			email,
			role,
			status,
			now,
			userId
		]);
		try {
			await conn.query("UPDATE `profiles` SET `full_name` = ?, `email` = ?, `updated_at` = ? WHERE `id` = ?", [
				name,
				email,
				now,
				userId
			]);
		} catch {}
		await conn.end();
		return { success: true };
	} catch (err) {
		const errObj = err;
		console.error("Update MySQL User Error:", errObj?.message || err);
		return {
			success: false,
			error: errObj?.message || "Failed to update user in MySQL database."
		};
	}
});
var createMySQLUser_createServerFn_handler = createServerRpc({
	id: "8811da2d312d4af9ec979cb06387812982c75e292456afed42c0d2e505cdac12",
	name: "createMySQLUser",
	filename: "src/lib/auth.functions.ts"
}, (opts) => createMySQLUser.__executeServer(opts));
var createMySQLUser = createServerFn({ method: "POST" }).validator((input) => input).handler(createMySQLUser_createServerFn_handler, async ({ data }) => {
	const userId = String(data?.userId || "").trim();
	const name = String(data?.name || "").trim();
	const email = String(data?.email || "").toLowerCase().trim();
	const passwordHash = String(data?.passwordHash || "");
	const role = data?.role || "AGENT";
	const status = data?.status || "Active";
	const avatarUrl = data?.avatarUrl || null;
	if (!userId || !name || !email) return {
		success: false,
		error: "User ID, name, and email are required."
	};
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await conn.query(`INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`avatar_url\`, \`is_deleted\`, \`created_at\`, \`updated_at\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`, [
			userId,
			name,
			email,
			passwordHash,
			role,
			status,
			avatarUrl,
			now,
			now
		]);
		await conn.end();
		return { success: true };
	} catch (err) {
		const errObj = err;
		console.error("Create MySQL User Error:", errObj?.message || err);
		return {
			success: false,
			error: errObj?.message || "Failed to create user in MySQL database."
		};
	}
});
var toggleMySQLUserStatus_createServerFn_handler = createServerRpc({
	id: "dd8c650e5769ac99590f905397003ba0e9a2b0a996ef88a6dc33d269e7c7e837",
	name: "toggleMySQLUserStatus",
	filename: "src/lib/auth.functions.ts"
}, (opts) => toggleMySQLUserStatus.__executeServer(opts));
var toggleMySQLUserStatus = createServerFn({ method: "POST" }).validator((input) => input).handler(toggleMySQLUserStatus_createServerFn_handler, async ({ data }) => {
	const userId = String(data?.userId || "").trim();
	const status = data?.status || "Active";
	if (!userId) return {
		success: false,
		error: "User ID is required."
	};
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await conn.query("UPDATE `users` SET `status` = ?, `updated_at` = ? WHERE `id` = ?", [
			status,
			now,
			userId
		]);
		await conn.end();
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to toggle status."
		};
	}
});
var softDeleteMySQLUser_createServerFn_handler = createServerRpc({
	id: "ac4cddad9c3a319ad706badac9762e6e1817b6512bd3f80600ff40673dabec5b",
	name: "softDeleteMySQLUser",
	filename: "src/lib/auth.functions.ts"
}, (opts) => softDeleteMySQLUser.__executeServer(opts));
var softDeleteMySQLUser = createServerFn({ method: "POST" }).validator((input) => input).handler(softDeleteMySQLUser_createServerFn_handler, async ({ data }) => {
	const userId = String(data?.userId || "").trim();
	if (!userId) return {
		success: false,
		error: "User ID is required."
	};
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await conn.query("UPDATE `users` SET `is_deleted` = 1, `status` = 'Deleted', `deleted_at` = ?, `updated_at` = ? WHERE `id` = ?", [
			now,
			now,
			userId
		]);
		await conn.end();
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to soft delete user."
		};
	}
});
var resetMySQLUserPassword_createServerFn_handler = createServerRpc({
	id: "7ab49a44ca72be4b4ca5f148d03b8f9256ff662ac4021ab429283dd55398b016",
	name: "resetMySQLUserPassword",
	filename: "src/lib/auth.functions.ts"
}, (opts) => resetMySQLUserPassword.__executeServer(opts));
var resetMySQLUserPassword = createServerFn({ method: "POST" }).validator((input) => input).handler(resetMySQLUserPassword_createServerFn_handler, async ({ data }) => {
	const userId = String(data?.userId || "").trim();
	const passwordHash = String(data?.passwordHash || "");
	if (!userId || !passwordHash) return {
		success: false,
		error: "User ID and password hash are required."
	};
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		await conn.query("UPDATE `users` SET `password_hash` = ?, `updated_at` = ? WHERE `id` = ?", [
			passwordHash,
			now,
			userId
		]);
		await conn.end();
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to reset password."
		};
	}
});
var createMySQLSession_createServerFn_handler = createServerRpc({
	id: "8decbc842acf74ccb35dd2af22591618cf19eebfbb38d55ffb4f217d0caf0277",
	name: "createMySQLSession",
	filename: "src/lib/auth.functions.ts"
}, (opts) => createMySQLSession.__executeServer(opts));
var createMySQLSession = createServerFn({ method: "POST" }).validator((d) => d).handler(createMySQLSession_createServerFn_handler, async ({ data }) => {
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const expiresAt = new Date(Date.now() + 2592e6).toISOString().slice(0, 19).replace("T", " ");
		await conn.query(`INSERT INTO \`sessions\` (\`id\`, \`user_id\`, \`user_email\`, \`user_name\`, \`user_role\`, \`avatar_url\`, \`expires_at\`)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           \`user_id\` = VALUES(\`user_id\`),
           \`user_email\` = VALUES(\`user_email\`),
           \`user_name\` = VALUES(\`user_name\`),
           \`user_role\` = VALUES(\`user_role\`),
           \`avatar_url\` = VALUES(\`avatar_url\`),
           \`expires_at\` = VALUES(\`expires_at\`)`, [
			data.sessionId,
			data.userId,
			data.userEmail,
			data.userName,
			data.userRole,
			data.avatarUrl ?? null,
			expiresAt
		]);
		await conn.end();
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to create session."
		};
	}
});
var getMySQLSession_createServerFn_handler = createServerRpc({
	id: "6a0938e65611af25332dc99cd74f455b3d22bdcba81469094fa9d5e76660bf67",
	name: "getMySQLSession",
	filename: "src/lib/auth.functions.ts"
}, (opts) => getMySQLSession.__executeServer(opts));
var getMySQLSession = createServerFn({ method: "GET" }).validator((d) => d).handler(getMySQLSession_createServerFn_handler, async ({ data }) => {
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
		const [rows] = await conn.query(`SELECT * FROM \`sessions\` WHERE \`id\` = ? AND \`expires_at\` > ? LIMIT 1`, [data.sessionId, now]);
		await conn.end();
		const sessions = rows;
		if (!sessions || sessions.length === 0) return {
			success: false,
			session: null
		};
		const s = sessions[0];
		if (!s) return {
			success: false,
			session: null
		};
		return {
			success: true,
			session: {
				userId: String(s["user_id"] ?? ""),
				userEmail: String(s["user_email"] ?? ""),
				userName: String(s["user_name"] ?? ""),
				userRole: String(s["user_role"] ?? "agent"),
				avatarUrl: s["avatar_url"] ?? null
			}
		};
	} catch (err) {
		return {
			success: false,
			session: null,
			error: err?.message
		};
	}
});
var deleteMySQLSession_createServerFn_handler = createServerRpc({
	id: "06d113cc0e90ab16a7ca19902fc6e4dbf802e5ef0e424809f01c1093beca72cf",
	name: "deleteMySQLSession",
	filename: "src/lib/auth.functions.ts"
}, (opts) => deleteMySQLSession.__executeServer(opts));
var deleteMySQLSession = createServerFn({ method: "POST" }).validator((d) => d).handler(deleteMySQLSession_createServerFn_handler, async ({ data }) => {
	try {
		const config = getMySQLConfig();
		const conn = await import_promise.createConnection({
			host: config.host,
			port: config.port,
			user: config.user,
			password: config.password ?? "",
			database: config.database
		});
		await ensureMySQLTablesExist(conn, config.database);
		await conn.query(`DELETE FROM \`sessions\` WHERE \`id\` = ?`, [data.sessionId]);
		await conn.end();
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: err?.message || "Failed to delete session."
		};
	}
});
//#endregion
export { authenticateXamppUser_createServerFn_handler, bootstrapDatabaseOnStartup_createServerFn_handler, createMySQLSession_createServerFn_handler, createMySQLUser_createServerFn_handler, deleteMySQLSession_createServerFn_handler, fetchMySQLUsers_createServerFn_handler, getMySQLSession_createServerFn_handler, resetMySQLUserPassword_createServerFn_handler, softDeleteMySQLUser_createServerFn_handler, toggleMySQLUserStatus_createServerFn_handler, updateMySQLUserAvatar_createServerFn_handler, updateMySQLUser_createServerFn_handler };
