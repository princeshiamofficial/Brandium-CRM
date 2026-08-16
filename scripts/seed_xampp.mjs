import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function seedUsers() {
  try {
    const conn = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "brandium_crm",
    });

    await conn.query("DROP TABLE IF EXISTS crm_users");

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'AGENT') NOT NULL DEFAULT 'AGENT',
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        is_deleted TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const hashAdmin = bcrypt.hashSync("Admin@12345", 10);
    const hashAgent = bcrypt.hashSync("Agent@12345", 10);

    const users = [
      [
        "a0000000-0000-4000-8000-000000000001",
        "Mehan Ahmed (System Admin)",
        "admin@example.com",
        hashAdmin,
        "ADMIN",
        "Active",
      ],
      [
        "a0000000-0000-4000-8000-000000000002",
        "Mehan Ahmed",
        "mehan.ahmed.official@gmail.com",
        hashAdmin,
        "ADMIN",
        "Active",
      ],
      [
        "b0000000-0000-4000-8000-000000000001",
        "Agent User",
        "agent@brandium.com",
        hashAgent,
        "AGENT",
        "Active",
      ],
      [
        "b0000000-0000-4000-8000-000000000002",
        "Tanvir Hasan",
        "tanvir.agent@brandium.com",
        hashAgent,
        "AGENT",
        "Active",
      ],
      [
        "b0000000-0000-4000-8000-000000000003",
        "Nusrat Jahan",
        "nusrat.agent@brandium.com",
        hashAgent,
        "AGENT",
        "Active",
      ],
    ];

    for (const u of users) {
      await conn.query(
        `INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role), status=VALUES(status)`,
        u,
      );
    }

    console.log("SUCCESS: 'users' table seeded in XAMPP MySQL database!");
    const [rowsUsers] = await conn.query("SELECT id, name, email, role, status FROM users");
    console.log("XAMPP MySQL 'users' table count:", rowsUsers.length);
    console.log("Sample users:", rowsUsers);
    await conn.end();
  } catch (err) {
    console.error("Seed error:", err.message);
  }
}

seedUsers();
