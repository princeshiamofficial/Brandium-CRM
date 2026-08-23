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
  const host = process.env.MYSQL_HOST || "127.0.0.1";
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

  console.log("Migration executed successfully!");
  await conn.end();
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
