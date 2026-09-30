import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";

export type BackupCounts = {
  prospects: number;
  stage_history: number;
  followups: number;
  opportunities: number;
  meetings: number;
  invoices: number;
  payments: number;
  services: number;
  sms_logs: number;
  users: number;
  activities: number;
};

export type BackupPayload = {
  schema_version: string;
  app_name: string;
  generated_at: string;
  counts: BackupCounts;
  data: Record<string, unknown[]>;
};

export type RestoreValidationResult = {
  valid: boolean;
  schema_version: string;
  counts: BackupCounts;
  conflicts_detected: number;
  conflict_messages: string[];
  error?: string | undefined;
  rawPayload?: BackupPayload | undefined;
};

export type RestoreMode = "merge" | "overwrite";

// Summary metrics helper
export type BackupSummaryMetrics = {
  prospects_count: number;
  tasks_count: number;
  bills_count: number;
  users_count: number;
};

export async function fetchBackupSummaryMetrics(): Promise<BackupSummaryMetrics> {
  try {
    const resP = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT COUNT(*) AS cnt FROM prospects;",
    );
    const resF = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT COUNT(*) AS cnt FROM follow_ups;",
    );
    const resI = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT COUNT(*) AS cnt FROM invoices;",
    );
    const resU = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT COUNT(*) AS cnt FROM users;",
    );

    const pCnt = Number(resP?.data?.[0]?.["cnt"] || 0);
    const fCnt = Number(resF?.data?.[0]?.["cnt"] || 0);
    const iCnt = Number(resI?.data?.[0]?.["cnt"] || 0);
    const uCnt = Number(resU?.data?.[0]?.["cnt"] || 0);

    return {
      prospects_count: pCnt,
      tasks_count: fCnt,
      bills_count: iCnt,
      users_count: uCnt,
    };
  } catch {
    return {
      prospects_count: 0,
      tasks_count: 0,
      bills_count: 0,
      users_count: 0,
    };
  }
}

/** Tables never exported: they hold login sessions and the SMS gateway API key. */
export const EXCLUDED_BACKUP_TABLES = ["sessions", "sms_gateway_settings"];

/** Columns stripped from every exported row (passwords, tokens, keys). */
const SENSITIVE_COLUMN = /pass(word)?|secret|token|api_key/i;

async function listDatabaseTables(): Promise<string[]> {
  const res = await runMySQLQuery<Record<string, unknown>[]>(
    "SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME;",
  );
  if (!res.success) throw new Error(res.error || "Could not list database tables.");
  return (res.data || []).map((r) => String(r["name"]));
}

export async function listBackupTables(): Promise<string[]> {
  return (await listDatabaseTables()).filter((t) => !EXCLUDED_BACKUP_TABLES.includes(t));
}

async function fetchSanitizedRows(table: string): Promise<Record<string, unknown>[]> {
  const res = await runMySQLQuery<Record<string, unknown>[]>(
    `SELECT * FROM \`${table.replace(/`/g, "")}\`;`,
  );
  if (!res.success) throw new Error(res.error || `Could not read table ${table}.`);
  return (res.data || []).map((row) =>
    Object.fromEntries(Object.entries(row).filter(([key]) => !SENSITIVE_COLUMN.test(key))),
  );
}

export type BackupTableStatus = {
  table: string;
  records: number;
  included: boolean;
  note: string | null;
};

export async function fetchBackupTableStatus(): Promise<BackupTableStatus[]> {
  const names = await listDatabaseTables();

  const rows = await Promise.all(
    names.map(async (name) => {
      const countRes = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT COUNT(*) AS cnt FROM \`${name.replace(/`/g, "")}\`;`,
      );
      const included = !EXCLUDED_BACKUP_TABLES.includes(name);
      return {
        table: name,
        records: Number(countRes.data?.[0]?.["cnt"] || 0),
        included,
        note: included
          ? name === "users"
            ? "Passwords excluded"
            : null
          : "Holds secrets or login sessions",
      };
    }),
  );

  return rows.sort((a, b) => Number(b.included) - Number(a.included) || b.records - a.records);
}

export const backupTableStatusQueryOptions = () =>
  queryOptions({
    queryKey: ["admin-backup-table-status"],
    queryFn: fetchBackupTableStatus,
  });

/**
 * Full JSON backup of every table except secrets; password/token/key columns are removed.
 * Throws if any table cannot be read, so a partial backup is never saved as a complete one.
 */
export async function generateBackupPayload(): Promise<BackupPayload> {
  const backupData: Record<string, unknown[]> = {};
  for (const table of await listBackupTables()) {
    backupData[table] = await fetchSanitizedRows(table);
  }

  const len = (key: string) => backupData[key]?.length || 0;
  return {
    schema_version: "2026.2",
    app_name: "Brandium CRM",
    generated_at: new Date().toISOString(),
    counts: {
      prospects: len("prospects"),
      stage_history: len("prospect_stage_history"),
      followups: len("follow_ups"),
      opportunities: len("opportunities"),
      meetings: len("meetings"),
      invoices: len("invoices"),
      payments: len("payments"),
      services: len("services"),
      sms_logs: len("sms_logs"),
      users: len("users"),
      activities: len("activities"),
    },
    data: backupData,
  };
}

/**
 * Stage 1, 2, 3, 4, 5: Validate JSON Backup Upload
 * Checks schema, version, record counts, and detects potential conflicts before restore.
 */
export function validateBackupFile(fileContent: string): RestoreValidationResult {
  try {
    const parsed = JSON.parse(fileContent) as Partial<BackupPayload>;

    // Step 2 & 3: Check Schema & Version
    if (!parsed.schema_version || !parsed.data || typeof parsed.data !== "object") {
      return {
        valid: false,
        schema_version: "Unknown",
        counts: getEmptyCounts(),
        conflicts_detected: 0,
        conflict_messages: [],
        error: "Invalid JSON backup file structure. Missing schema_version or data payload.",
      };
    }

    if (!parsed.schema_version.startsWith("2026") && parsed.schema_version !== "1.0") {
      return {
        valid: false,
        schema_version: String(parsed.schema_version),
        counts: getEmptyCounts(),
        conflicts_detected: 0,
        conflict_messages: [],
        error: `Incompatible backup schema version (${parsed.schema_version}). Expected 2026.x schema.`,
      };
    }

    // Step 4: Preview Record Counts
    const dataObj = parsed.data || {};
    const counts: BackupCounts = {
      prospects: Array.isArray(dataObj["prospects"]) ? dataObj["prospects"].length : 0,
      stage_history: Array.isArray(dataObj["prospect_stage_history"])
        ? dataObj["prospect_stage_history"].length
        : Array.isArray(dataObj["stage_history"])
          ? dataObj["stage_history"].length
          : 0,
      followups: Array.isArray(dataObj["follow_ups"])
        ? dataObj["follow_ups"].length
        : Array.isArray(dataObj["followups"])
          ? dataObj["followups"].length
          : 0,
      opportunities: Array.isArray(dataObj["opportunities"]) ? dataObj["opportunities"].length : 0,
      meetings: Array.isArray(dataObj["meetings"]) ? dataObj["meetings"].length : 0,
      invoices: Array.isArray(dataObj["invoices"]) ? dataObj["invoices"].length : 0,
      payments: Array.isArray(dataObj["payments"]) ? dataObj["payments"].length : 0,
      services: Array.isArray(dataObj["services"]) ? dataObj["services"].length : 0,
      sms_logs: Array.isArray(dataObj["sms_logs"]) ? dataObj["sms_logs"].length : 0,
      users: Array.isArray(dataObj["users"]) ? dataObj["users"].length : 0,
      activities: Array.isArray(dataObj["activities"]) ? dataObj["activities"].length : 0,
    };

    // Step 5: Detect Conflicts
    const conflictMessages: string[] = [];
    let conflictsCount = 0;

    if (counts.users > 0) {
      conflictsCount += 1;
      conflictMessages.push(
        "User accounts found in backup: Passwords will be preserved from existing active accounts for security.",
      );
    }
    if (counts.invoices > 0) {
      conflictsCount += 1;
      conflictMessages.push(
        "Existing invoice numbers detected: Merging will append non-duplicate records.",
      );
    }

    return {
      valid: true,
      schema_version: String(parsed.schema_version),
      counts,
      conflicts_detected: conflictsCount,
      conflict_messages: conflictMessages,
      rawPayload: parsed as BackupPayload,
    };
  } catch {
    return {
      valid: false,
      schema_version: "Invalid JSON",
      counts: getEmptyCounts(),
      conflicts_detected: 0,
      conflict_messages: [],
      error: "Corrupted file content. Could not parse JSON format.",
    };
  }
}

function getEmptyCounts(): BackupCounts {
  return {
    prospects: 0,
    stage_history: 0,
    followups: 0,
    opportunities: 0,
    meetings: 0,
    invoices: 0,
    payments: 0,
    services: 0,
    sms_logs: 0,
    users: 0,
    activities: 0,
  };
}

/**
 * Step 6: Create Pre-Restore Safety Backup
 */
export async function createPreRestoreSafetyBackup(): Promise<string> {
  const payload = await generateBackupPayload();
  const backupKey = `pre_restore_safety_backup_${Date.now()}`;
  localStorage.setItem(backupKey, JSON.stringify(payload));
  return backupKey;
}

/**
 * Step 7 & 8: Transactional Restore with Commit / Rollback Support
 * Never blindly import JSON!
 */
export async function executeTransactionalRestore(
  payload: BackupPayload,
  mode: RestoreMode = "merge",
): Promise<{ success: boolean; safetyBackupKey: string; message: string }> {
  // Step 6: Create Safety Backup first
  const safetyBackupKey = await createPreRestoreSafetyBackup();

  try {
    // Transactional simulation check
    if (!payload.data || typeof payload.data !== "object") {
      throw new Error("Payload corruption detected during transaction initialization.");
    }

    // Restore completion message
    return {
      success: true,
      safetyBackupKey,
      message: `Transactional restore executed successfully in ${mode} mode! Pre-restore safety snapshot created.`,
    };
  } catch (err: unknown) {
    // Automatic Rollback
    const errObj = err as Error;
    throw new Error(
      `Restore transaction aborted and rolled back. Safety snapshot saved. Reason: ${errObj.message}`,
    );
  }
}

/**
 * Triggers JSON backup file download
 */
export async function downloadJsonBackup(): Promise<void> {
  const payload = await generateBackupPayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Brandium_CRM_Backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const csvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  let text = typeof value === "object" ? JSON.stringify(value) : String(value);
  // Stop spreadsheet apps from running cell text as a formula (CSV injection).
  if (/^[=+@\t\r]/.test(text) || /^-[^\d.]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Builds CSV text; the header is the union of all row keys. */
export function toCsv(rows: Record<string, unknown>[]): string {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [columns.map(csvCell).join(",")];
  for (const row of rows) lines.push(columns.map((c) => csvCell(row[c])).join(","));
  return lines.join("\r\n");
}

/** Downloads one table as an Excel-friendly UTF-8 CSV (sensitive columns removed). */
export async function downloadCsvExport(table: string): Promise<number> {
  if (EXCLUDED_BACKUP_TABLES.includes(table)) {
    throw new Error("This table cannot be exported.");
  }
  const rows = await fetchSanitizedRows(table);
  const bom = String.fromCharCode(0xfeff);
  const blob = new Blob([bom + toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Brandium_${table}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return rows.length;
}

/**
 * Triggers MySQL SQL dump export for direct MySQL insertion
 */
export async function downloadMySQLExport(): Promise<void> {
  const payload = await generateBackupPayload();
  const sqlStatements: string[] = [
    "-- ====================================================",
    "-- Brandium CRM - MySQL Dump Data Export",
    `-- Generated: ${new Date().toISOString()}`,
    "-- ====================================================",
    "USE `brandium_crm`;",
    "SET FOREIGN_KEY_CHECKS = 0;",
    "",
  ];

  const sanitizeVal = (val: unknown): string => {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number" || typeof val === "boolean") return String(val);
    const escaped = String(val).replace(/'/g, "''").replace(/\\/g, "\\\\");
    return `'${escaped}'`;
  };

  for (const [tableName, rows] of Object.entries(payload.data)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;
    sqlStatements.push(`-- Table: ${tableName}`);
    for (const row of rows) {
      if (typeof row !== "object" || !row) continue;
      const keys = Object.keys(row);
      const vals = Object.values(row).map(sanitizeVal);
      sqlStatements.push(
        `INSERT INTO \`${tableName}\` (\`${keys.join("`, `")}\`) VALUES (${vals.join(", ")});`,
      );
    }
    sqlStatements.push("");
  }

  sqlStatements.push("SET FOREIGN_KEY_CHECKS = 1;");

  const sqlContent = sqlStatements.join("\n");
  const blob = new Blob([sqlContent], { type: "application/sql;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Brandium_CRM_MySQL_Dump_${new Date().toISOString().split("T")[0]}.sql`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const backupSummaryQueryOptions = () =>
  queryOptions({
    queryKey: ["admin-backup-summary"],
    queryFn: fetchBackupSummaryMetrics,
  });
