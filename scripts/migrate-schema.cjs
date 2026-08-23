const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// Load .env file into process.env if present
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

async function runMigration() {
  let host = process.env.MYSQL_HOST || "127.0.0.1";
  if (host === "localhost") {
    host = "127.0.0.1";
  }
  const port = parseInt(process.env.MYSQL_PORT || "3306", 10);
  const user = process.env.MYSQL_USER || "root";
  const password = process.env.MYSQL_PASSWORD ?? "";
  const database = process.env.MYSQL_DATABASE || "brandium_crm";


  console.log(`Connecting to MySQL database '${database}' on ${host}:${port} as '${user}'...`);

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  // Create base tables IF NOT EXISTS
  const tables = [
    `CREATE TABLE IF NOT EXISTS \`users\` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`profiles\` (
      \`id\` VARCHAR(36) NOT NULL,
      \`full_name\` VARCHAR(255) NULL,
      \`email\` VARCHAR(255) NULL,
      \`avatar_url\` LONGTEXT NULL,
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      KEY \`idx_profiles_email\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`services\` (
      \`id\` VARCHAR(36) NOT NULL,
      \`name\` VARCHAR(255) NOT NULL,
      \`description\` TEXT NULL,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`icon\` VARCHAR(50) NOT NULL DEFAULT 'Layers',
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`stages\` (
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
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`prospects\` (
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
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`prospect_stage_history\` (
      \`id\` VARCHAR(36) NOT NULL,
      \`prospect_id\` VARCHAR(36) NOT NULL,
      \`from_stage_id\` VARCHAR(36) NULL,
      \`to_stage_id\` VARCHAR(36) NOT NULL,
      \`changed_by\` VARCHAR(36) NULL,
      \`note\` TEXT NULL,
      \`changed_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`sales\` (
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
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`follow_ups\` (
      \`id\` VARCHAR(36) NOT NULL,
      \`prospect_id\` VARCHAR(36) NOT NULL,
      \`assigned_to\` VARCHAR(36) NULL,
      \`created_by\` VARCHAR(36) NULL,
      \`due_at\` DATETIME NOT NULL,
      \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending',
      \`note\` TEXT NULL,
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`activities\` (
      \`id\` VARCHAR(36) NOT NULL,
      \`prospect_id\` VARCHAR(36) NULL,
      \`actor_id\` VARCHAR(36) NULL,
      \`activity_type\` VARCHAR(100) NOT NULL,
      \`message\` TEXT NOT NULL,
      \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`meetings\` (
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
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`opportunities\` (
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
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`invoices\` (
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
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    `CREATE TABLE IF NOT EXISTS \`payments\` (
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
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  ];

  for (const query of tables) {
    await conn.query(query);
  }

  const addCol = async (tbl, col, def) => {
    const [cols] = await conn.query("DESCRIBE `" + tbl + "`");
    if (!cols.some((c) => c.Field === col)) {
      console.log("Adding column " + col + " to " + tbl);
      await conn.query("ALTER TABLE `" + tbl + "` ADD COLUMN `" + col + "` " + def);
    }
  };


  // 1. meetings
  await addCol("meetings", "phone", "VARCHAR(50) NULL");
  await addCol("meetings", "location", "VARCHAR(255) NULL");
  await addCol("meetings", "meeting_type", "VARCHAR(50) NOT NULL DEFAULT 'Office'");
  await addCol("meetings", "meeting_date", "VARCHAR(20) NULL");
  await addCol("meetings", "meeting_time", "VARCHAR(20) NULL");
  await addCol("meetings", "assigned_user_id", "VARCHAR(36) NULL");
  await addCol("meetings", "sms_sent", "TINYINT(1) NOT NULL DEFAULT 0");
  await addCol(
    "meetings",
    "updated_at",
    "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  );

  // 2. invoices
  await addCol("invoices", "due_amount", "DECIMAL(12, 2) NOT NULL DEFAULT 0.00");
  await addCol("invoices", "description", "TEXT NULL");
  await addCol("invoices", "bill_date", "VARCHAR(20) NULL");
  await addCol("invoices", "due_date", "VARCHAR(20) NULL");
  await addCol("invoices", "notes", "TEXT NULL");

  // 3. opportunities
  await addCol("opportunities", "estimated_value", "DECIMAL(12, 2) NOT NULL DEFAULT 0.00");
  await addCol("opportunities", "assigned_to", "VARCHAR(36) NULL");
  await addCol("opportunities", "created_by", "VARCHAR(36) NULL");
  await addCol("opportunities", "status", "VARCHAR(50) NOT NULL DEFAULT 'Opportunity Created'");
  await addCol("opportunities", "notes", "TEXT NULL");
  await addCol("opportunities", "is_active", "TINYINT(1) NOT NULL DEFAULT 1");
  await addCol(
    "opportunities",
    "updated_at",
    "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  );

  // 4. payments
  await addCol("payments", "transaction_reference", "VARCHAR(100) NULL");
  await addCol("payments", "notes", "TEXT NULL");
  await addCol("payments", "payment_date", "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP");
  await addCol("payments", "is_valid", "TINYINT(1) NOT NULL DEFAULT 1");

  // 5. services
  await addCol("services", "icon", "VARCHAR(50) NOT NULL DEFAULT 'Layers'");

  // 6. users
  await addCol("users", "is_active", "TINYINT(1) NOT NULL DEFAULT 1");

  // 7. Ensure default stages exist
  const defaultStages = [
    { id: "prospect", name: "Prospect", group: "new", order: 1 },
    { id: "follow-up", name: "Follow-up", group: "in_progress", order: 2 },
    { id: "opportunity-created", name: "Opportunity Created", group: "in_progress", order: 3 },
    { id: "sales-won", name: "Sales won", group: "won", order: 4 },
    { id: "dnp", name: "DNP (Did Not Pick)", group: "unreachable", order: 5 },
    { id: "switched-off", name: "Switched Off", group: "unreachable", order: 6 },
    { id: "invalid-number", name: "Invalid Number", group: "unreachable", order: 7 },
    { id: "meeting-scheduled", name: "Meeting Scheduled", group: "in_progress", order: 8 },
    { id: "quotation-sent", name: "Quotation Sent", group: "in_progress", order: 9 },
    { id: "denied-payment", name: "Denied Payment", group: "lost", order: 10 },
    { id: "sales-lost", name: "Sales Lost", group: "lost", order: 11 },
  ];

  for (const st of defaultStages) {
    const [rows] = await conn.query("SELECT id FROM `stages` WHERE id = ?", [st.id]);
    if (rows.length === 0) {
      await conn.query(
        "INSERT INTO `stages` (id, name, stage_group, sort_order, is_follow_up, is_active, is_system) VALUES (?, ?, ?, ?, 0, 1, 1)",
        [st.id, st.name, st.group, st.order],
      );
      console.log(`Inserted stage ${st.name}`);
    }
  }

  // 8. Seed default demo user accounts into users & profiles
  const [userCount] = await conn.query("SELECT COUNT(*) as cnt FROM `users` WHERE is_deleted = 0;");
  if (Number(userCount?.[0]?.cnt ?? 0) === 0) {
    console.log("Seeding default Admin & Agent user accounts...");
    const hashAdmin = "$2b$10$qpjXnl8CfUihiIU0F5/WbejBPBQSgIdrXIuRsD.xbi.4nUorC8FUS";
    const hashAgent = "$2b$10$EUTCyQWyN2.RES4exZkSVOzCpKGLF7cPmbvkNXsu4359niH7nu84G";
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await conn.query(
      `INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password_hash\`, \`role\`, \`status\`, \`avatar_url\`, \`is_deleted\`, \`created_at\`, \`updated_at\`)
       VALUES
       ('usr-admin-1', 'Mehan Ahmed (System Admin)', 'admin@example.com', ?, 'ADMIN', 'Active', NULL, 0, ?, ?),
       ('usr-admin-2', 'Mehan Ahmed', 'mehan.ahmed.official@gmail.com', ?, 'ADMIN', 'Active', NULL, 0, ?, ?),
       ('usr-agent-0', 'Agent User', 'agent@brandium.com', ?, 'AGENT', 'Active', NULL, 0, ?, ?);`,
      [hashAdmin, now, now, hashAdmin, now, now, hashAgent, now, now]
    );

    await conn.query(
      `INSERT INTO \`profiles\` (\`id\`, \`full_name\`, \`email\`, \`created_at\`, \`updated_at\`)
       SELECT \`id\`, \`name\`, \`email\`, \`created_at\`, \`updated_at\` FROM \`users\`
       ON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`), \`email\` = VALUES(\`email\`);`
    );
    console.log("Default Admin & Agent user accounts seeded successfully!");
  }


  console.log("Migration executed successfully!");
  await conn.end();
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
