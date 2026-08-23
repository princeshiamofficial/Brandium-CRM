-- =====================================================================
-- Brandium CRM - Complete MySQL Database Schema
-- Compatible with MySQL 5.7+ / 8.0+ / MariaDB 10.3+
-- Designed for native deployment or Foreign Data Wrapper (mysql_fdw)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `brandium_crm` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `brandium_crm`;

SET FOREIGN_KEY_CHECKS = 0;

-- Auto-cleanup: Drop unused user_avatars table if present
DROP TABLE IF EXISTS `user_avatars`;

-- ---------------------------------------------------------------------
-- 1. PROFILES / USERS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'AGENT') NOT NULL DEFAULT 'AGENT',
  `status` ENUM('Active', 'Inactive', 'Deleted') NOT NULL DEFAULT 'Active',
  `avatar_url` LONGTEXT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `deleted_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `profiles` (
  `id` VARCHAR(36) NOT NULL,
  `full_name` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `avatar_url` LONGTEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_profiles_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. USER ROLES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `role` ENUM('admin', 'agent') NOT NULL DEFAULT 'agent',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_roles_user_id` (`user_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. SERVICES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_services_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. STAGES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stages` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `stage_group` VARCHAR(100) NOT NULL DEFAULT 'prospect',
  `sort_order` INT NOT NULL DEFAULT 0,
  `color` VARCHAR(50) NULL,
  `icon` VARCHAR(50) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_follow_up` TINYINT(1) NOT NULL DEFAULT 0,
  `is_system` TINYINT(1) NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_stages_group_sort` (`stage_group`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. PROSPECTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prospects` (
  `id` VARCHAR(36) NOT NULL,
  `contact_name` VARCHAR(255) NOT NULL,
  `business_name` VARCHAR(255) NULL,
  `designation` VARCHAR(150) NULL,
  `phone` VARCHAR(50) NULL,
  `alternative_phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `service_id` VARCHAR(36) NULL,
  `stage_id` VARCHAR(36) NULL,
  `assigned_to` VARCHAR(36) NULL,
  `created_by` VARCHAR(36) NULL,
  `notes` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prospects_stage` (`stage_id`),
  KEY `idx_prospects_assigned` (`assigned_to`),
  KEY `idx_prospects_service` (`service_id`),
  CONSTRAINT `fk_prospects_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prospects_stage` FOREIGN KEY (`stage_id`) REFERENCES `stages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prospects_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `profiles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prospects_creator` FOREIGN KEY (`created_by`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. PROSPECT STAGE HISTORY
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prospect_stage_history` (
  `id` VARCHAR(36) NOT NULL,
  `prospect_id` VARCHAR(36) NOT NULL,
  `from_stage_id` VARCHAR(36) NULL,
  `to_stage_id` VARCHAR(36) NOT NULL,
  `changed_by` VARCHAR(36) NULL,
  `note` TEXT NULL,
  `changed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_psh_prospect` (`prospect_id`),
  CONSTRAINT `fk_psh_prospect` FOREIGN KEY (`prospect_id`) REFERENCES `prospects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_psh_from_stage` FOREIGN KEY (`from_stage_id`) REFERENCES `stages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_psh_to_stage` FOREIGN KEY (`to_stage_id`) REFERENCES `stages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. SALES / WON SALES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales` (
  `id` VARCHAR(36) NOT NULL,
  `prospect_id` VARCHAR(36) NULL,
  `service_id` VARCHAR(36) NULL,
  `agent_id` VARCHAR(36) NULL,
  `amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(50) NOT NULL DEFAULT 'closed',
  `closed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sales_prospect` (`prospect_id`),
  KEY `idx_sales_agent` (`agent_id`),
  CONSTRAINT `fk_sales_prospect` FOREIGN KEY (`prospect_id`) REFERENCES `prospects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sales_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. FOLLOW UPS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `follow_ups` (
  `id` VARCHAR(36) NOT NULL,
  `prospect_id` VARCHAR(36) NOT NULL,
  `assigned_to` VARCHAR(36) NULL,
  `created_by` VARCHAR(36) NULL,
  `due_at` DATETIME NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `note` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_follow_ups_prospect` (`prospect_id`),
  KEY `idx_follow_ups_due` (`due_at`),
  CONSTRAINT `fk_follow_ups_prospect` FOREIGN KEY (`prospect_id`) REFERENCES `prospects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. ACTIVITIES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activities` (
  `id` VARCHAR(36) NOT NULL,
  `prospect_id` VARCHAR(36) NULL,
  `actor_id` VARCHAR(36) NULL,
  `activity_type` VARCHAR(100) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activities_prospect` (`prospect_id`),
  CONSTRAINT `fk_activities_prospect` FOREIGN KEY (`prospect_id`) REFERENCES `prospects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. MEETINGS / OPPORTUNITIES / BILLING / DENIED PAYMENTS (EXTRA TABLES)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `meetings` (
  `id` VARCHAR(36) NOT NULL,
  `prospect_id` VARCHAR(36) NOT NULL,
  `assigned_to` VARCHAR(36) NULL,
  `title` VARCHAR(255) NOT NULL,
  `scheduled_at` DATETIME NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_meetings_prospect` (`prospect_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `opportunities` (
  `id` VARCHAR(36) NOT NULL,
  `prospect_id` VARCHAR(36) NOT NULL,
  `value` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `stage` VARCHAR(100) NOT NULL DEFAULT 'qualification',
  `expected_close_date` DATE NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_opportunities_prospect` (`prospect_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- End of MySQL Schema
-- =====================================================================
