import mysql from "mysql2/promise";
import { getMySQLConfig } from "./mysql-client";

// Kept on globalThis: `next dev` re-evaluates this module on every hot reload and per route
// bundle, and a module-level variable then opened a new pool each time until MySQL refused
// connections ("Too many connections").
const poolCache = globalThis as typeof globalThis & { __brandiumMySQLPool?: mysql.Pool };

export async function getMySQLPool(): Promise<mysql.Pool> {
  if (poolCache.__brandiumMySQLPool) {
    return poolCache.__brandiumMySQLPool;
  }

  const config = getMySQLConfig();

  const globalPool = mysql.createPool({
    host: config.host === "localhost" ? "127.0.0.1" : config.host,
    port: config.port,
    user: config.user,
    password: config.password ?? "",
    database: config.database,
    waitForConnections: true,
    connectionLimit: config.connectionLimit,
    queueLimit: 0,
    // Close idle connections instead of holding the whole limit open forever
    maxIdle: 5,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    charset: "utf8mb4",
    timezone: config.timezone,
    dateStrings: true,
  });

  try {
    globalPool.on("connection", (connection) => {
      connection.query("SET time_zone = '+06:00';");
    });
  } catch {
    // Ignore
  }

  poolCache.__brandiumMySQLPool = globalPool;
  return globalPool;
}

export async function createSingleMySQLConnection(): Promise<mysql.Connection> {
  const config = getMySQLConfig();
  const conn = await mysql.createConnection({
    host: config.host === "localhost" ? "127.0.0.1" : config.host,
    port: config.port,
    user: config.user,
    password: config.password ?? "",
    database: config.database,
    timezone: config.timezone,
    dateStrings: true,
  });
  try {
    await conn.query("SET time_zone = '+06:00';");
  } catch {
    // Ignore
  }
  return conn;
}
