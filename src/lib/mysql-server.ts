import mysql from "mysql2/promise";
import { getMySQLConfig } from "./mysql-client";

let globalPool: mysql.Pool | null = null;

export async function getMySQLPool(): Promise<mysql.Pool> {
  if (globalPool) {
    return globalPool;
  }

  const config = getMySQLConfig();

  globalPool = mysql.createPool({
    host: config.host === "localhost" ? "127.0.0.1" : config.host,
    port: config.port,
    user: config.user,
    password: config.password ?? "",
    database: config.database,
    waitForConnections: true,
    connectionLimit: config.connectionLimit,
    queueLimit: 0,
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
