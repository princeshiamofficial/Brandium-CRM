import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";
import { getMySQLTimestamp } from "@/lib/mysql-client";

export type DeniedPayment = {
  id: string;
  prospect_id: string | null;
  prospect_name: string;
  business_name?: string | undefined;
  agent_id: string | null;
  agent_name: string;
  phone: string;
  service: string;
  denial_reason: string;
  denied_by: string;
  denied_at: string;
  amount: number;
  current_stage: string;
  notes?: string | undefined;
  created_at: string;
  updated_at: string;
};

export type DeniedPaymentFilters = {
  search?: string | undefined;
  agent_id?: string | "all" | undefined;
  current_stage?: string | "all" | undefined;
  from_date?: string | undefined;
  to_date?: string | undefined;
};

export type CreateDeniedPaymentInput = {
  prospect_id?: string | null;
  prospect_name: string;
  business_name?: string;
  agent_id?: string | null;
  agent_name: string;
  phone: string;
  service: string;
  denial_reason: string;
  denied_by: string;
  amount: number;
  notes?: string;
};

export type ChangeStageInput = {
  deniedPaymentId: string;
  prospectId?: string | null | undefined;
  newStage: string;
  note: string;
  changedByUserId?: string | null | undefined;
  changedByUserName?: string | undefined;
};

export type StageHistoryRecord = {
  id: string;
  prospect_id: string;
  from_stage_name: string;
  to_stage_name: string;
  note: string;
  changed_by_name: string;
  changed_at: string;
};

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function fetchDeniedPayments(
  filters: DeniedPaymentFilters = {},
): Promise<DeniedPayment[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        COALESCE(o.id, p.id) AS id,
        p.id AS prospect_id,
        p.contact_name AS prospect_name,
        p.business_name,
        COALESCE(o.assigned_to, p.assigned_to) AS agent_id,
        u.name AS agent_name,
        p.phone,
        COALESCE(s.name, 'Software License') AS service,
        COALESCE(o.notes, p.notes, 'Payment declined or disputed') AS denial_reason,
        'Client Accounts' AS denied_by,
        COALESCE(o.updated_at, p.updated_at) AS denied_at,
        COALESCE(o.estimated_value, SUM(i.total_amount), 0) AS amount,
        COALESCE(o.status, st.name, 'Denied Payment') AS current_stage,
        COALESCE(o.notes, p.notes) AS notes,
        p.created_at,
        COALESCE(o.updated_at, p.updated_at) AS updated_at
      FROM \`prospects\` p
      LEFT JOIN \`opportunities\` o ON p.id = o.prospect_id AND (LOWER(o.status) LIKE '%denied%' OR LOWER(o.status) LIKE '%lost%' OR LOWER(o.status) LIKE '%reject%')
      LEFT JOIN \`users\` u ON COALESCE(o.assigned_to, p.assigned_to) = u.id
      LEFT JOIN \`services\` s ON p.service_id = s.id
      LEFT JOIN \`stages\` st ON p.stage_id = st.id
      LEFT JOIN \`invoices\` i ON p.id = i.prospect_id
      WHERE (
        LOWER(COALESCE(o.status, '')) LIKE '%denied%' 
        OR LOWER(COALESCE(o.status, '')) LIKE '%lost%' 
        OR LOWER(COALESCE(o.status, '')) LIKE '%reject%'
        OR LOWER(COALESCE(st.name, '')) LIKE '%denied%' 
        OR LOWER(COALESCE(st.name, '')) LIKE '%lost%' 
        OR LOWER(COALESCE(st.name, '')) LIKE '%reject%'
      )
      AND p.is_active = 1
      GROUP BY p.id, o.id, p.contact_name, p.business_name, o.assigned_to, p.assigned_to, u.name, p.phone, s.name, o.notes, p.notes, o.updated_at, p.updated_at, o.status, st.name, p.created_at, o.estimated_value
      ORDER BY updated_at DESC;`,
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    const mapped: DeniedPayment[] = res.data.map((item) => ({
      id: String(item["id"]),
      prospect_id: String(item["prospect_id"] || item["id"]),
      prospect_name: String(item["prospect_name"] || "Client"),
      business_name: (item["business_name"] as string) || undefined,
      agent_id: (item["agent_id"] as string) || null,
      agent_name: String(item["agent_name"] || "Agent"),
      phone: String(item["phone"] || ""),
      service: String(item["service"] || "Software Services"),
      denial_reason: String(item["denial_reason"] || "Client requested review"),
      denied_by: String(item["denied_by"] || "Finance"),
      denied_at: String(item["denied_at"] || new Date().toISOString()),
      amount: Number(item["amount"] || 0),
      current_stage: String(item["current_stage"] || "Denied Payment"),
      notes: (item["notes"] as string) || undefined,
      created_at: String(item["created_at"] || new Date().toISOString()),
      updated_at: String(item["updated_at"] || new Date().toISOString()),
    }));

    return applyClientFilters(mapped, filters);
  } catch (err) {
    console.warn("fetchDeniedPayments MySQL error:", err);
    return [];
  }
}

function applyClientFilters(list: DeniedPayment[], filters: DeniedPaymentFilters): DeniedPayment[] {
  let result = list;

  if (filters.agent_id && filters.agent_id !== "all") {
    result = result.filter((item) => item.agent_id === filters.agent_id);
  }

  if (filters.current_stage && filters.current_stage !== "all") {
    result = result.filter((item) => item.current_stage === filters.current_stage);
  }

  if (filters.from_date) {
    result = result.filter((item) => item.denied_at.substring(0, 10) >= filters.from_date!);
  }

  if (filters.to_date) {
    result = result.filter((item) => item.denied_at.substring(0, 10) <= filters.to_date!);
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.prospect_name.toLowerCase().includes(q) ||
        (item.business_name && item.business_name.toLowerCase().includes(q)) ||
        item.agent_name.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q) ||
        item.denial_reason.toLowerCase().includes(q) ||
        item.phone.includes(q),
    );
  }

  return result;
}

export async function fetchDeniedPaymentById(id: string): Promise<DeniedPayment | null> {
  const list = await fetchDeniedPayments();
  return list.find((item) => item.id === id) || null;
}

export async function fetchStageHistoryForProspect(
  prospectId: string,
): Promise<StageHistoryRecord[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        sh.id,
        sh.prospect_id,
        COALESCE(s_from.name, 'Previous Stage') AS from_stage_name,
        COALESCE(s_to.name, 'Current Stage') AS to_stage_name,
        sh.notes AS note,
        COALESCE(u.name, 'System Agent') AS changed_by_name,
        sh.created_at AS changed_at
      FROM \`prospect_stage_history\` sh
      LEFT JOIN \`stages\` s_from ON sh.from_stage_id = s_from.id
      LEFT JOIN \`stages\` s_to ON sh.to_stage_id = s_to.id
      LEFT JOIN \`users\` u ON sh.changed_by = u.id
      WHERE sh.prospect_id = ?
      ORDER BY sh.created_at DESC;`,
      [prospectId],
    );

    if (res.success && Array.isArray(res.data)) {
      return res.data.map((row) => ({
        id: String(row["id"]),
        prospect_id: String(row["prospect_id"]),
        from_stage_name: String(row["from_stage_name"]),
        to_stage_name: String(row["to_stage_name"]),
        note: String(row["note"] || ""),
        changed_by_name: String(row["changed_by_name"]),
        changed_at: String(row["changed_at"] || new Date().toISOString()),
      }));
    }
  } catch (err) {
    console.warn("fetchStageHistoryForProspect MySQL error:", err);
  }

  return [];
}

export type CreateDeniedPaymentRecordInput = {
  prospectId: string;
  denialReason: string;
  deniedBy: string;
  amount?: number | undefined;
  notes?: string | undefined;
  agentId?: string | null | undefined;
};

export async function createDeniedPaymentRecord(
  input: CreateDeniedPaymentRecordInput,
): Promise<void> {
  const now = getMySQLTimestamp();

  // Resolve "Denied Payment" stage ID from MySQL
  const stageRes = await runMySQLQuery<Record<string, unknown>[]>(
    "SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) LIKE '%denied%' LIMIT 1;",
  );
  const deniedStageId =
    stageRes?.success && stageRes.data?.[0] ? String(stageRes.data[0]["id"]) : "denied-payment";

  // Get current stage for history
  let fromStageId: string | null = null;
  try {
    const currRes = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT `stage_id` FROM `prospects` WHERE `id` = ? LIMIT 1;",
      [input.prospectId],
    );
    if (currRes?.success && currRes.data?.[0]) {
      fromStageId = String(currRes.data[0]["stage_id"] || "") || null;
    }
  } catch {
    // ignore
  }

  // Update prospect stage to Denied Payment
  await runMySQLQuery("UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;", [
    deniedStageId,
    now,
    input.prospectId,
  ]);

  // Write stage history
  await runMySQLQuery(
    `INSERT INTO \`prospect_stage_history\`
       (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_at\`)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      generateUUID(),
      input.prospectId,
      fromStageId,
      deniedStageId,
      `Denied by ${input.deniedBy}: ${input.denialReason}`,
      now,
    ],
  );

  // Create an opportunity record to surface denial details on the Denied Payments page
  try {
    await runMySQLQuery(
      `INSERT INTO \`opportunities\`
         (\`id\`, \`prospect_id\`, \`status\`, \`estimated_value\`, \`notes\`, \`assigned_to\`, \`created_at\`, \`updated_at\`)
       VALUES (?, ?, 'Denied Payment', ?, ?, ?, ?, ?);`,
      [
        generateUUID(),
        input.prospectId,
        input.amount ?? 0,
        input.denialReason + (input.notes ? `\n${input.notes}` : ""),
        input.agentId || null,
        now,
        now,
      ],
    );
  } catch (err) {
    console.warn("Opportunity record notice (denied payment):", err);
  }
}

export async function changeDeniedPaymentStage(input: ChangeStageInput): Promise<DeniedPayment> {
  const now = getMySQLTimestamp();
  const prospectId = input.prospectId || input.deniedPaymentId;

  // Find target stage
  const stageRes = await runMySQLQuery<Record<string, unknown>[]>(
    "SELECT id, name FROM `stages` WHERE LOWER(name) LIKE LOWER(?) LIMIT 1;",
    [`%${input.newStage}%`],
  );
  const targetStageId = stageRes?.data?.[0]?.["id"] as string | undefined;

  if (prospectId) {
    if (targetStageId) {
      await runMySQLQuery(
        "UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;",
        [targetStageId, now, prospectId],
      );
    }

    // Also update any matching opportunity record
    try {
      await runMySQLQuery(
        "UPDATE `opportunities` SET `status` = ?, `updated_at` = ? WHERE `prospect_id` = ? OR `id` = ?;",
        [input.newStage, now, prospectId, input.deniedPaymentId],
      );
    } catch {
      // ignore
    }

    // Record stage history
    await runMySQLQuery(
      `INSERT INTO \`prospect_stage_history\` (\`id\`, \`prospect_id\`, \`to_stage_id\`, \`notes\`, \`changed_by\`, \`created_at\`)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        generateUUID(),
        prospectId,
        targetStageId,
        input.note || `Stage updated to ${input.newStage}`,
        input.changedByUserId || null,
        now,
      ],
    );

    // Log Activity
    await runMySQLQuery(
      `INSERT INTO \`activities\` (\`id\`, \`actor_id\`, \`prospect_id\`, \`activity_type\`, \`message\`, \`created_at\`)
       VALUES (?, ?, ?, 'stage_change', ?, ?);`,
      [
        generateUUID(),
        input.changedByUserId || null,
        prospectId,
        `Changed stage to "${input.newStage}": ${input.note}`,
        now,
      ],
    );
  }

  const updated = await fetchDeniedPaymentById(input.deniedPaymentId);
  if (!updated) {
    return {
      id: input.deniedPaymentId,
      prospect_id: prospectId,
      prospect_name: "Prospect",
      agent_id: input.changedByUserId || null,
      agent_name: input.changedByUserName || "Agent",
      phone: "",
      service: "Software License",
      denial_reason: input.note,
      denied_by: "Client",
      denied_at: now,
      amount: 0,
      current_stage: input.newStage,
      notes: input.note,
      created_at: now,
      updated_at: now,
    };
  }
  return updated;
}

export const deniedPaymentsQueryOptions = (filters: DeniedPaymentFilters = {}) =>
  queryOptions({
    queryKey: ["denied-payments", filters],
    queryFn: () => fetchDeniedPayments(filters),
  });

export const stageHistoryForProspectQueryOptions = (prospectId: string) =>
  queryOptions({
    queryKey: ["stage-history-prospect", prospectId],
    queryFn: () => fetchStageHistoryForProspect(prospectId),
    enabled: Boolean(prospectId),
  });
