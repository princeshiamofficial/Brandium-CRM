import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Client } = require("ssh2");

const alterQueries = [
  "ALTER TABLE invoices ADD COLUMN due_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER paid_amount;",
  "ALTER TABLE invoices ADD COLUMN description TEXT NULL AFTER due_amount;",
  "ALTER TABLE invoices ADD COLUMN bill_date VARCHAR(20) NULL AFTER description;",
  "ALTER TABLE invoices ADD COLUMN due_date VARCHAR(20) NULL AFTER bill_date;",
  "ALTER TABLE invoices ADD COLUMN notes TEXT NULL AFTER due_date;",
  "ALTER TABLE opportunities ADD COLUMN status VARCHAR(100) NULL AFTER stage;",
  "ALTER TABLE opportunities ADD COLUMN estimated_value DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER value;",
  "ALTER TABLE opportunities ADD COLUMN notes TEXT NULL AFTER expected_close_date;",
  "ALTER TABLE opportunities ADD COLUMN assigned_to VARCHAR(36) NULL AFTER notes;",
  "ALTER TABLE opportunities ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;",
  "ALTER TABLE meetings ADD COLUMN phone VARCHAR(50) NULL AFTER notes;",
  "ALTER TABLE meetings ADD COLUMN location VARCHAR(255) NULL AFTER phone;",
  "ALTER TABLE meetings ADD COLUMN meeting_type VARCHAR(50) NULL AFTER location;",
  "ALTER TABLE meetings ADD COLUMN meeting_date VARCHAR(20) NULL AFTER meeting_type;",
  "ALTER TABLE meetings ADD COLUMN meeting_time VARCHAR(20) NULL AFTER meeting_date;",
  "ALTER TABLE meetings ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;",
  "ALTER TABLE payments ADD COLUMN transaction_reference VARCHAR(255) NULL AFTER payment_method;",
  "ALTER TABLE payments ADD COLUMN notes TEXT NULL AFTER transaction_reference;",
  "ALTER TABLE services ADD COLUMN price DECIMAL(12, 2) NOT NULL DEFAULT 0.00 AFTER description;",
  "ALTER TABLE services ADD COLUMN category VARCHAR(100) NULL AFTER price;",
  "ALTER TABLE services ADD COLUMN icon VARCHAR(100) NULL AFTER category;"
];

const conn = new Client();
conn
  .on("ready", () => {
    console.log("Connected via SSH. Executing ALTER TABLE statements cleanly...");
    const combinedSQL = alterQueries.join(" ");
    conn.exec(
      `mysql -u crm_brandium -pBrandium456 crm_brandium -e "${combinedSQL}"`,
      (err, stream) => {
        if (err) throw err;
        stream
          .on("close", () => {
            console.log("Done executing ALTER queries!");
            conn.end();
          })
          .on("data", (data) => console.log("" + data))
          .stderr.on("data", (data) => console.log("ERR: " + data));
      }
    );
  })
  .connect({
    host: "93.127.166.176",
    port: 22,
    username: "crmbr8784",
    password: "Brandium456",
  });
