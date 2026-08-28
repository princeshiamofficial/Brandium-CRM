import { createServerFn } from "./server-fn";
import { getMySQLConfig, generateUUID, getMySQLTimestamp } from "./mysql-client";
import { getMySQLPool } from "./mysql-server";
import { ensureMySQLTablesExist } from "./auth.functions";

async function ensureBootstrapped() {
  const pool = await getMySQLPool();
  const config = getMySQLConfig();
  const conn = await pool.getConnection();
  try {
    await ensureMySQLTablesExist(
      conn as unknown as import("mysql2/promise").Connection,
      config.database,
    );
  } finally {
    conn.release();
  }
}

// -----------------------------------------------------------------------------
// 1. OPPORTUNITIES
// -----------------------------------------------------------------------------

export type OpportunityRecord = {
  id: string;
  prospect_id: string;
  estimated_value: number;
  assigned_to: string | null;
  created_by: string | null;
  status: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prospect_name?: string;
  prospect_business?: string | null;
  prospect_designation?: string | null;
  prospect_email?: string | null;
  prospect_phone?: string | null;
  agent_name?: string;
  creator_name?: string;
};

export const fetchOpportunitiesFn = createServerFn({ method: "GET" })
  .validator(
    (input?: { search?: string; status?: string; agent?: string; from?: string; to?: string }) =>
      input || {},
  )
  .handler(
    async ({ data }): Promise<{ success: boolean; data: OpportunityRecord[]; error?: string }> => {
      try {
        await ensureBootstrapped();
        const pool = await getMySQLPool();

        const whereClauses: string[] = ["1=1"];
        const params: unknown[] = [];

        if (data?.search && data.search.trim()) {
          const term = `%${data.search.trim()}%`;
          whereClauses.push(
            "(p.contact_name LIKE ? OR p.business_name LIKE ? OR p.email LIKE ? OR p.phone LIKE ? OR o.notes LIKE ?)",
          );
          params.push(term, term, term, term, term);
        }

        if (data?.status && data.status.trim() && data.status !== "all") {
          whereClauses.push("o.stage = ?");
          params.push(data.status.trim());
        }

        if (data?.agent && data.agent.trim() && data.agent !== "all") {
          whereClauses.push("(o.assigned_to = ? OR u_agent.name LIKE ?)");
          params.push(data.agent.trim(), `%${data.agent.trim()}%`);
        }

        if (data?.from && data.from.trim()) {
          whereClauses.push("o.created_at >= ?");
          params.push(`${data.from.trim()} 00:00:00`);
        }

        if (data?.to && data.to.trim()) {
          whereClauses.push("o.created_at <= ?");
          params.push(`${data.to.trim()} 23:59:59`);
        }

        const sql = `
        SELECT 
          o.id,
          o.prospect_id,
          CAST(o.value AS DOUBLE) AS estimated_value,
          o.stage AS status,
          o.expected_close_date,
          o.created_at,
          o.created_at AS updated_at,
          p.contact_name AS prospect_name,
          p.business_name AS prospect_business,
          p.designation AS prospect_designation,
          p.email AS prospect_email,
          p.phone AS prospect_phone,
          p.assigned_to,
          p.created_by,
          p.notes,
          1 AS is_active,
          COALESCE(u_agent.name, 'Unassigned') AS agent_name,
          COALESCE(u_creator.name, 'System') AS creator_name
        FROM opportunities o
        LEFT JOIN prospects p ON o.prospect_id = p.id
        LEFT JOIN users u_agent ON p.assigned_to = u_agent.id
        LEFT JOIN users u_creator ON p.created_by = u_creator.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY o.created_at DESC;
      `;

        const [rows] = await pool.query(sql, params);
        const opps = (rows as Array<Record<string, unknown>>).map((r) => ({
          id: String(r["id"]),
          prospect_id: String(r["prospect_id"]),
          estimated_value: Number(r["estimated_value"]) || 0,
          assigned_to: r["assigned_to"] ? String(r["assigned_to"]) : null,
          created_by: r["created_by"] ? String(r["created_by"]) : null,
          status: String(r["status"] || "Opportunity Created"),
          notes: r["notes"] ? String(r["notes"]) : null,
          is_active: true,
          created_at: String(r["created_at"] || new Date().toISOString()),
          updated_at: String(r["updated_at"] || new Date().toISOString()),
          prospect_name: r["prospect_name"] ? String(r["prospect_name"]) : "Unknown Prospect",
          prospect_business: r["prospect_business"] ? String(r["prospect_business"]) : null,
          prospect_designation: r["prospect_designation"]
            ? String(r["prospect_designation"])
            : null,
          prospect_email: r["prospect_email"] ? String(r["prospect_email"]) : null,
          prospect_phone: r["prospect_phone"] ? String(r["prospect_phone"]) : null,
          agent_name: r["agent_name"] ? String(r["agent_name"]) : "Unassigned",
          creator_name: r["creator_name"] ? String(r["creator_name"]) : "System",
        }));

        return { success: true, data: opps };
      } catch (err: unknown) {
        const errObj = err as { message?: string };
        console.error("fetchOpportunitiesFn error:", errObj?.message);
        return {
          success: false,
          data: [],
          error: errObj?.message || "Failed to fetch opportunities",
        };
      }
    },
  );

export const saveOpportunityFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      prospect_id: string;
      estimated_value: number;
      status: string;
      notes?: string | null;
      expected_close_date?: string | null;
    }) => input,
  )
  .handler(async ({ data }): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      const oppId = data.id?.trim() || generateUUID();
      const now = getMySQLTimestamp();

      await pool.query(
        `INSERT INTO opportunities (id, prospect_id, value, stage, expected_close_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           value = VALUES(value),
           stage = VALUES(stage),
           expected_close_date = VALUES(expected_close_date);`,
        [
          oppId,
          data.prospect_id,
          data.estimated_value || 0,
          data.status || "Opportunity Created",
          data.expected_close_date || null,
          now,
        ],
      );

      // Also log activity
      await pool.query(
        `INSERT INTO activities (id, prospect_id, activity_type, message, created_at)
         VALUES (?, ?, 'opportunity_update', ?, ?);`,
        [
          generateUUID(),
          data.prospect_id,
          `Opportunity updated: Stage '${data.status}', Value ৳${data.estimated_value}`,
          now,
        ],
      );

      return { success: true, id: oppId };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to save opportunity" };
    }
  });

export const deleteOpportunityFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      await pool.query("DELETE FROM opportunities WHERE id = ?;", [data.id]);
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to delete opportunity" };
    }
  });

// -----------------------------------------------------------------------------
// 2. MEETINGS
// -----------------------------------------------------------------------------

export type MeetingRecord = {
  id: string;
  prospect_id: string;
  assigned_to: string | null;
  title: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  created_at: string;
  prospect_name?: string;
  prospect_business?: string | null;
  agent_name?: string;
};

export const fetchMeetingsFn = createServerFn({ method: "GET" })
  .validator(
    (input?: { search?: string; status?: string; agent?: string; from?: string; to?: string }) =>
      input || {},
  )
  .handler(
    async ({ data }): Promise<{ success: boolean; data: MeetingRecord[]; error?: string }> => {
      try {
        await ensureBootstrapped();
        const pool = await getMySQLPool();

        const whereClauses: string[] = ["1=1"];
        const params: unknown[] = [];

        if (data?.search && data.search.trim()) {
          const term = `%${data.search.trim()}%`;
          whereClauses.push(
            "(m.title LIKE ? OR p.contact_name LIKE ? OR p.business_name LIKE ? OR m.notes LIKE ?)",
          );
          params.push(term, term, term, term);
        }

        if (data?.status && data.status.trim() && data.status !== "all") {
          whereClauses.push("m.status = ?");
          params.push(data.status.trim());
        }

        if (data?.agent && data.agent.trim() && data.agent !== "all") {
          whereClauses.push("(m.assigned_to = ? OR u.name LIKE ?)");
          params.push(data.agent.trim(), `%${data.agent.trim()}%`);
        }

        if (data?.from && data.from.trim()) {
          whereClauses.push("m.scheduled_at >= ?");
          params.push(`${data.from.trim()} 00:00:00`);
        }

        if (data?.to && data.to.trim()) {
          whereClauses.push("m.scheduled_at <= ?");
          params.push(`${data.to.trim()} 23:59:59`);
        }

        const sql = `
        SELECT 
          m.id,
          m.prospect_id,
          m.assigned_to,
          m.title,
          m.scheduled_at,
          m.status,
          m.notes,
          m.created_at,
          COALESCE(p.contact_name, 'Unknown') AS prospect_name,
          p.business_name AS prospect_business,
          COALESCE(u.name, 'Unassigned') AS agent_name
        FROM meetings m
        LEFT JOIN prospects p ON m.prospect_id = p.id
        LEFT JOIN users u ON m.assigned_to = u.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY m.scheduled_at DESC;
      `;

        const [rows] = await pool.query(sql, params);
        const meetings = (rows as Array<Record<string, unknown>>).map((r) => ({
          id: String(r["id"]),
          prospect_id: String(r["prospect_id"]),
          assigned_to: r["assigned_to"] ? String(r["assigned_to"]) : null,
          title: String(r["title"]),
          scheduled_at: String(r["scheduled_at"]),
          status: String(r["status"] || "scheduled"),
          notes: r["notes"] ? String(r["notes"]) : null,
          created_at: String(r["created_at"] || new Date().toISOString()),
          prospect_name: String(r["prospect_name"] || "Unknown"),
          prospect_business: r["prospect_business"] ? String(r["prospect_business"]) : null,
          agent_name: String(r["agent_name"] || "Unassigned"),
        }));

        return { success: true, data: meetings };
      } catch (err: unknown) {
        const errObj = err as { message?: string };
        console.error("fetchMeetingsFn error:", errObj?.message);
        return { success: false, data: [], error: errObj?.message || "Failed to fetch meetings" };
      }
    },
  );

export const saveMeetingFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      prospect_id: string;
      assigned_to?: string | null;
      title: string;
      scheduled_at: string;
      status?: string;
      notes?: string | null;
    }) => input,
  )
  .handler(async ({ data }): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      const meetingId = data.id?.trim() || generateUUID();
      const now = getMySQLTimestamp();

      await pool.query(
        `INSERT INTO meetings (id, prospect_id, assigned_to, title, scheduled_at, status, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           assigned_to = VALUES(assigned_to),
           title = VALUES(title),
           scheduled_at = VALUES(scheduled_at),
           status = VALUES(status),
           notes = VALUES(notes);`,
        [
          meetingId,
          data.prospect_id,
          data.assigned_to || null,
          data.title,
          data.scheduled_at,
          data.status || "scheduled",
          data.notes || null,
          now,
        ],
      );

      // Also log activity
      await pool.query(
        `INSERT INTO activities (id, prospect_id, activity_type, message, created_at)
         VALUES (?, ?, 'meeting_scheduled', ?, ?);`,
        [
          generateUUID(),
          data.prospect_id,
          `Meeting '${data.title}' scheduled for ${data.scheduled_at}`,
          now,
        ],
      );

      return { success: true, id: meetingId };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to save meeting" };
    }
  });

export const deleteMeetingFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      await pool.query("DELETE FROM meetings WHERE id = ?;", [data.id]);
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to delete meeting" };
    }
  });

// -----------------------------------------------------------------------------
// 3. FOLLOW-UPS
// -----------------------------------------------------------------------------

export type FollowUpRecord = {
  id: string;
  prospect_id: string;
  assigned_to: string | null;
  created_by: string | null;
  due_at: string;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  prospect_name?: string;
  prospect_business?: string | null;
  agent_name?: string;
  creator_name?: string;
};

export const fetchFollowUpsFn = createServerFn({ method: "GET" })
  .validator(
    (input?: { search?: string; status?: string; agent?: string; from?: string; to?: string }) =>
      input || {},
  )
  .handler(
    async ({ data }): Promise<{ success: boolean; data: FollowUpRecord[]; error?: string }> => {
      try {
        await ensureBootstrapped();
        const pool = await getMySQLPool();

        const whereClauses: string[] = ["1=1"];
        const params: unknown[] = [];

        if (data?.search && data.search.trim()) {
          const term = `%${data.search.trim()}%`;
          whereClauses.push("(p.contact_name LIKE ? OR p.business_name LIKE ? OR f.note LIKE ?)");
          params.push(term, term, term);
        }

        if (data?.status && data.status.trim() && data.status !== "all") {
          whereClauses.push("f.status = ?");
          params.push(data.status.trim());
        }

        if (data?.agent && data.agent.trim() && data.agent !== "all") {
          whereClauses.push("(f.assigned_to = ? OR u.name LIKE ?)");
          params.push(data.agent.trim(), `%${data.agent.trim()}%`);
        }

        if (data?.from && data.from.trim()) {
          whereClauses.push("f.due_at >= ?");
          params.push(`${data.from.trim()} 00:00:00`);
        }

        if (data?.to && data.to.trim()) {
          whereClauses.push("f.due_at <= ?");
          params.push(`${data.to.trim()} 23:59:59`);
        }

        const sql = `
        SELECT 
          f.id,
          f.prospect_id,
          f.assigned_to,
          f.created_by,
          f.due_at,
          f.status,
          f.note,
          f.created_at,
          f.updated_at,
          COALESCE(p.contact_name, 'Unknown') AS prospect_name,
          p.business_name AS prospect_business,
          COALESCE(u.name, 'Unassigned') AS agent_name,
          COALESCE(c.name, 'System') AS creator_name
        FROM follow_ups f
        LEFT JOIN prospects p ON f.prospect_id = p.id
        LEFT JOIN users u ON f.assigned_to = u.id
        LEFT JOIN users c ON f.created_by = c.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY f.due_at ASC;
      `;

        const [rows] = await pool.query(sql, params);
        const followUps = (rows as Array<Record<string, unknown>>).map((r) => ({
          id: String(r["id"]),
          prospect_id: String(r["prospect_id"]),
          assigned_to: r["assigned_to"] ? String(r["assigned_to"]) : null,
          created_by: r["created_by"] ? String(r["created_by"]) : null,
          due_at: String(r["due_at"]),
          status: String(r["status"] || "pending"),
          note: r["note"] ? String(r["note"]) : null,
          created_at: String(r["created_at"] || new Date().toISOString()),
          updated_at: String(r["updated_at"] || new Date().toISOString()),
          prospect_name: String(r["prospect_name"] || "Unknown"),
          prospect_business: r["prospect_business"] ? String(r["prospect_business"]) : null,
          agent_name: String(r["agent_name"] || "Unassigned"),
          creator_name: String(r["creator_name"] || "System"),
        }));

        return { success: true, data: followUps };
      } catch (err: unknown) {
        const errObj = err as { message?: string };
        console.error("fetchFollowUpsFn error:", errObj?.message);
        return { success: false, data: [], error: errObj?.message || "Failed to fetch follow-ups" };
      }
    },
  );

export const saveFollowUpFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      prospect_id: string;
      assigned_to?: string | null;
      created_by?: string | null;
      due_at: string;
      status?: string;
      note?: string | null;
    }) => input,
  )
  .handler(async ({ data }): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      const followUpId = data.id?.trim() || generateUUID();
      const now = getMySQLTimestamp();

      await pool.query(
        `INSERT INTO follow_ups (id, prospect_id, assigned_to, created_by, due_at, status, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           assigned_to = VALUES(assigned_to),
           due_at = VALUES(due_at),
           status = VALUES(status),
           note = VALUES(note),
           updated_at = VALUES(updated_at);`,
        [
          followUpId,
          data.prospect_id,
          data.assigned_to || null,
          data.created_by || null,
          data.due_at,
          data.status || "pending",
          data.note || null,
          now,
          now,
        ],
      );

      return { success: true, id: followUpId };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to save follow-up" };
    }
  });

export const deleteFollowUpFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      await pool.query("DELETE FROM follow_ups WHERE id = ?;", [data.id]);
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to delete follow-up" };
    }
  });

// -----------------------------------------------------------------------------
// 4. BILLING & INVOICES
// -----------------------------------------------------------------------------

export type InvoiceRecord = {
  id: string;
  invoice_number: string;
  prospect_id: string;
  prospect_name: string;
  business_name?: string | undefined;
  client_email?: string | undefined;
  client_phone?: string | undefined;
  description: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  bill_date: string;
  due_date: string;
  status: "Pending" | "Partially Paid" | "Paid" | "Cancelled";
  notes: string | null;
  created_by: string | null;
  created_by_name: string;
  created_at: string;
  updated_at: string;
};

export const fetchInvoicesFn = createServerFn({ method: "GET" })
  .validator(
    (input?: { search?: string; status?: string; from_date?: string; to_date?: string }) =>
      input || {},
  )
  .handler(
    async ({ data }): Promise<{ success: boolean; data: InvoiceRecord[]; error?: string }> => {
      try {
        await ensureBootstrapped();
        const pool = await getMySQLPool();

        const whereClauses: string[] = ["1=1"];
        const params: unknown[] = [];

        if (data?.search && data.search.trim()) {
          const term = `%${data.search.trim()}%`;
          whereClauses.push(
            "(i.invoice_number LIKE ? OR p.contact_name LIKE ? OR p.business_name LIKE ?)",
          );
          params.push(term, term, term);
        }

        if (data?.status && data.status.trim() && data.status !== "all") {
          whereClauses.push("i.status = ?");
          params.push(data.status.trim());
        }

        if (data?.from_date && data.from_date.trim()) {
          whereClauses.push("i.created_at >= ?");
          params.push(`${data.from_date.trim()} 00:00:00`);
        }

        if (data?.to_date && data.to_date.trim()) {
          whereClauses.push("i.created_at <= ?");
          params.push(`${data.to_date.trim()} 23:59:59`);
        }

        const sql = `
        SELECT 
          i.id,
          i.invoice_number,
          i.prospect_id,
          CAST(i.total_amount AS DOUBLE) AS total_amount,
          CAST(i.paid_amount AS DOUBLE) AS paid_amount,
          i.status,
          i.created_by,
          i.created_at,
          i.updated_at,
          COALESCE(p.contact_name, 'Unknown Client') AS prospect_name,
          p.business_name,
          p.email AS client_email,
          p.phone AS client_phone,
          COALESCE(u.name, 'Admin') AS created_by_name
        FROM invoices i
        LEFT JOIN prospects p ON i.prospect_id = p.id
        LEFT JOIN users u ON i.created_by = u.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY i.created_at DESC;
      `;

        const [rows] = await pool.query(sql, params);
        const invoices = (rows as Array<Record<string, unknown>>).map((r) => {
          const total = Number(r["total_amount"]) || 0;
          const paid = Number(r["paid_amount"]) || 0;
          const due = Math.max(0, total - paid);
          let status: "Pending" | "Partially Paid" | "Paid" | "Cancelled" = "Pending";
          if (paid >= total && total > 0) status = "Paid";
          else if (paid > 0) status = "Partially Paid";
          else if (String(r["status"]).toLowerCase() === "cancelled") status = "Cancelled";

          return {
            id: String(r["id"]),
            invoice_number: String(r["invoice_number"]),
            prospect_id: String(r["prospect_id"] || ""),
            prospect_name: String(r["prospect_name"]),
            business_name: r["business_name"] ? String(r["business_name"]) : undefined,
            client_email: r["client_email"] ? String(r["client_email"]) : undefined,
            client_phone: r["client_phone"] ? String(r["client_phone"]) : undefined,
            description: `Services Invoice #${r["invoice_number"]}`,
            total_amount: total,
            paid_amount: paid,
            due_amount: due,
            bill_date: String(r["created_at"]).slice(0, 10),
            due_date: String(r["created_at"]).slice(0, 10),
            status,
            notes: null,
            created_by: r["created_by"] ? String(r["created_by"]) : null,
            created_by_name: String(r["created_by_name"]),
            created_at: String(r["created_at"]),
            updated_at: String(r["updated_at"]),
          };
        });

        return { success: true, data: invoices };
      } catch (err: unknown) {
        const errObj = err as { message?: string };
        console.error("fetchInvoicesFn error:", errObj?.message);
        return { success: false, data: [], error: errObj?.message || "Failed to fetch invoices" };
      }
    },
  );

export const saveInvoiceFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id?: string;
      prospect_id: string;
      total_amount: number;
      description?: string;
      status?: string;
      created_by?: string | null;
    }) => input,
  )
  .handler(
    async ({
      data,
    }): Promise<{ success: boolean; id?: string; invoice_number?: string; error?: string }> => {
      try {
        await ensureBootstrapped();
        const pool = await getMySQLPool();
        const invId = data.id?.trim() || generateUUID();
        const now = getMySQLTimestamp();
        const invNumber = `INV-${Date.now().toString().slice(-6)}`;

        await pool.query(
          `INSERT INTO invoices (id, prospect_id, invoice_number, total_amount, paid_amount, status, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0.00, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           total_amount = VALUES(total_amount),
           status = VALUES(status),
           updated_at = VALUES(updated_at);`,
          [
            invId,
            data.prospect_id,
            invNumber,
            data.total_amount,
            data.status || "pending",
            data.created_by || null,
            now,
            now,
          ],
        );

        return { success: true, id: invId, invoice_number: invNumber };
      } catch (err: unknown) {
        const errObj = err as { message?: string };
        return { success: false, error: errObj?.message || "Failed to save invoice" };
      }
    },
  );

export const recordInvoicePaymentFn = createServerFn({ method: "POST" })
  .validator(
    (input: {
      invoice_id: string;
      prospect_id?: string;
      amount: number;
      payment_method: string;
      recorded_by?: string | null;
    }) => input,
  )
  .handler(async ({ data }): Promise<{ success: boolean; payment_id?: string; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      const paymentId = generateUUID();
      const now = getMySQLTimestamp();

      // 1. Insert into payments table
      await pool.query(
        `INSERT INTO payments (id, invoice_id, prospect_id, amount, payment_method, recorded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          paymentId,
          data.invoice_id,
          data.prospect_id || null,
          data.amount,
          data.payment_method || "Bank Transfer",
          data.recorded_by || null,
          now,
        ],
      );

      // 2. Update invoice paid_amount
      await pool.query(
        `UPDATE invoices 
         SET paid_amount = paid_amount + ?,
             status = CASE WHEN paid_amount + ? >= total_amount THEN 'paid' ELSE 'partially_paid' END,
             updated_at = ?
         WHERE id = ?;`,
        [data.amount, data.amount, now, data.invoice_id],
      );

      return { success: true, payment_id: paymentId };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to record payment" };
    }
  });

// -----------------------------------------------------------------------------
// 5. SERVICES
// -----------------------------------------------------------------------------

export type ServiceRecord = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const fetchServicesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: ServiceRecord[]; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      const [rows] = await pool.query("SELECT * FROM services ORDER BY name ASC;");
      const services = (rows as Array<Record<string, unknown>>).map((r) => ({
        id: String(r["id"]),
        name: String(r["name"]),
        description: r["description"] ? String(r["description"]) : null,
        is_active: Boolean(r["is_active"] === 1 || r["is_active"] === true),
        created_at: String(r["created_at"]),
        updated_at: String(r["updated_at"]),
      }));
      return { success: true, data: services };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, data: [], error: errObj?.message || "Failed to fetch services" };
    }
  },
);

export const saveServiceFn = createServerFn({ method: "POST" })
  .validator(
    (input: { id?: string; name: string; description?: string | null; is_active?: boolean }) =>
      input,
  )
  .handler(async ({ data }): Promise<{ success: boolean; id?: string; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      const sId = data.id?.trim() || generateUUID();
      const now = getMySQLTimestamp();

      await pool.query(
        `INSERT INTO services (id, name, description, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           is_active = VALUES(is_active),
           updated_at = VALUES(updated_at);`,
        [
          sId,
          data.name.trim(),
          data.description || null,
          (data.is_active ?? true) ? 1 : 0,
          now,
          now,
        ],
      );

      return { success: true, id: sId };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to save service" };
    }
  });

export const deleteServiceFn = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      await pool.query("DELETE FROM services WHERE id = ?;", [data.id]);
      return { success: true };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      return { success: false, error: errObj?.message || "Failed to delete service" };
    }
  });

// -----------------------------------------------------------------------------
// 6. DASHBOARD & KPI ANALYTICS
// -----------------------------------------------------------------------------

export type DashboardMetrics = {
  totalProspects: number;
  activeOpportunities: number;
  totalWonSales: number;
  totalRevenue: number;
  pendingFollowUps: number;
  scheduledMeetings: number;
  totalInvoiced: number;
  totalCollected: number;
  conversionRate: number;
};

export const fetchDashboardMetricsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ success: boolean; data: DashboardMetrics; error?: string }> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();

      const [[prospectCount]] = (await pool.query(
        "SELECT COUNT(*) AS count FROM prospects WHERE is_active = 1;",
      )) as unknown as [[{ count: number }]];
      const [[oppCount]] = (await pool.query(
        "SELECT COUNT(*) AS count, COALESCE(SUM(value), 0) AS total_val FROM opportunities;",
      )) as unknown as [[{ count: number; total_val: number }]];
      const [[salesData]] = (await pool.query(
        "SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total_revenue FROM sales;",
      )) as unknown as [[{ count: number; total_revenue: number }]];
      const [[followUpCount]] = (await pool.query(
        "SELECT COUNT(*) AS count FROM follow_ups WHERE status = 'pending';",
      )) as unknown as [[{ count: number }]];
      const [[meetingCount]] = (await pool.query(
        "SELECT COUNT(*) AS count FROM meetings WHERE status = 'scheduled';",
      )) as unknown as [[{ count: number }]];
      const [[billingData]] = (await pool.query(
        "SELECT COALESCE(SUM(total_amount), 0) AS invoiced, COALESCE(SUM(paid_amount), 0) AS collected FROM invoices;",
      )) as unknown as [[{ invoiced: number; collected: number }]];

      const totalP = Number(prospectCount?.count) || 0;
      const totalS = Number(salesData?.count) || 0;
      const rate = totalP > 0 ? (totalS / totalP) * 100 : 0;

      return {
        success: true,
        data: {
          totalProspects: totalP,
          activeOpportunities: Number(oppCount?.count) || 0,
          totalWonSales: totalS,
          totalRevenue: Number(salesData?.total_revenue) || 0,
          pendingFollowUps: Number(followUpCount?.count) || 0,
          scheduledMeetings: Number(meetingCount?.count) || 0,
          totalInvoiced: Number(billingData?.invoiced) || 0,
          totalCollected: Number(billingData?.collected) || 0,
          conversionRate: Math.round(rate * 10) / 10,
        },
      };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("fetchDashboardMetricsFn error:", errObj?.message);
      return {
        success: false,
        data: {
          totalProspects: 0,
          activeOpportunities: 0,
          totalWonSales: 0,
          totalRevenue: 0,
          pendingFollowUps: 0,
          scheduledMeetings: 0,
          totalInvoiced: 0,
          totalCollected: 0,
          conversionRate: 0,
        },
        error: errObj?.message || "Failed to load dashboard metrics",
      };
    }
  },
);

export type UniversalQueryResultRow = Record<string, string | number | boolean | null>;

export type UniversalQueryResponse = {
  success: boolean;
  data?: UniversalQueryResultRow[] | undefined;
  error?: string | undefined;
};

function inferColumnType(columnName: string): string {
  const col = columnName.toLowerCase();
  if (
    col.startsWith("is_") ||
    col.endsWith("_sent") ||
    col === "sms_sent" ||
    col === "is_deleted" ||
    col === "is_valid" ||
    col === "is_active"
  ) {
    return "TINYINT(1) NOT NULL DEFAULT 0";
  }
  if (
    col.endsWith("_id") ||
    col.endsWith("_to") ||
    col.endsWith("_by") ||
    col === "id" ||
    col === "prospect_id" ||
    col === "assigned_artist_id" ||
    col === "assigned_user_id" ||
    col === "assigned_agent_id"
  ) {
    return "VARCHAR(36) NULL";
  }
  if (
    col.endsWith("_at") ||
    col.endsWith("_date_time") ||
    col === "last_activity" ||
    col === "scheduled_at" ||
    col === "deleted_at" ||
    col === "payment_date"
  ) {
    return "DATETIME NULL";
  }
  if (
    col.endsWith("_date") ||
    col === "bill_date" ||
    col === "due_date" ||
    col === "deadline" ||
    col === "expected_close_date"
  ) {
    return "VARCHAR(20) NULL";
  }
  if (
    col.endsWith("_amount") ||
    col.endsWith("_value") ||
    col === "amount" ||
    col === "value" ||
    col === "budget" ||
    col === "total_amount" ||
    col === "paid_amount" ||
    col === "due_amount" ||
    col === "estimated_value"
  ) {
    return "DECIMAL(12, 2) NOT NULL DEFAULT 0.00";
  }
  if (
    col.endsWith("_score") ||
    col.endsWith("_count") ||
    col === "lead_score" ||
    col === "progress" ||
    col === "attempts"
  ) {
    return "INT NOT NULL DEFAULT 0";
  }
  if (
    col === "notes" ||
    col === "address" ||
    col === "tags" ||
    col === "description" ||
    col === "logo_url" ||
    col === "avatar_url" ||
    col.endsWith("_url")
  ) {
    return "TEXT NULL";
  }
  return "VARCHAR(255) NULL";
}

function extractTableNameFromSql(sql: string): string | null {
  const insertMatch = sql.match(/INSERT\s+INTO\s+[`'"]?([a-zA-Z0-9_]+)[`'"]?/i);
  if (insertMatch && insertMatch[1]) return insertMatch[1];

  const updateMatch = sql.match(/UPDATE\s+[`'"]?([a-zA-Z0-9_]+)[`'"]?/i);
  if (updateMatch && updateMatch[1]) return updateMatch[1];

  const fromMatch = sql.match(/FROM\s+[`'"]?([a-zA-Z0-9_]+)[`'"]?/i);
  if (fromMatch && fromMatch[1]) return fromMatch[1];

  return null;
}

export const executeMySQLQueryFn = createServerFn({ method: "POST" })
  .validator((input: { sql: string; params?: (string | number | boolean | null)[] }) => input)
  .handler(async ({ data }): Promise<UniversalQueryResponse> => {
    try {
      await ensureBootstrapped();
      const pool = await getMySQLPool();
      let rows: unknown;

      try {
        const [result] = await pool.query(data.sql, data.params || []);
        rows = result;
      } catch (queryErr: unknown) {
        const errMsg = String((queryErr as { message?: string })?.message || queryErr);
        const colMatch = errMsg.match(/Unknown column '([^']+)'/i);
        const targetTable = extractTableNameFromSql(data.sql);

        if (colMatch && colMatch[1] && targetTable) {
          const missingCol = colMatch[1];
          const colType = inferColumnType(missingCol);
          console.warn(
            `[Self-Healing Schema] Auto-migrating missing column ${targetTable}.${missingCol} as ${colType}`,
          );

          try {
            await pool.query(
              `ALTER TABLE \`${targetTable}\` ADD COLUMN \`${missingCol}\` ${colType}`,
            );
            const [retryResult] = await pool.query(data.sql, data.params || []);
            rows = retryResult;
          } catch (alterErr) {
            console.error(
              `[Self-Healing Schema] Auto-migration failed for ${targetTable}.${missingCol}:`,
              alterErr,
            );
            throw queryErr;
          }
        } else {
          throw queryErr;
        }
      }

      if (Array.isArray(rows)) {
        const plainRows: UniversalQueryResultRow[] = rows.map((r) => {
          const plain: UniversalQueryResultRow = {};
          if (r && typeof r === "object") {
            for (const key of Object.keys(r)) {
              const val = (r as Record<string, unknown>)[key];
              if (val === null || val === undefined) {
                plain[key] = null;
              } else if (val instanceof Date) {
                plain[key] = val.toISOString().slice(0, 19).replace("T", " ");
              } else if (
                typeof val === "number" ||
                typeof val === "boolean" ||
                typeof val === "string"
              ) {
                plain[key] = val;
              } else {
                plain[key] = String(val);
              }
            }
          }
          return plain;
        });
        return { success: true, data: plainRows };
      }

      const ok = (rows ?? {}) as { affectedRows?: number; insertId?: number };
      return {
        success: true,
        data: [
          {
            affectedRows: typeof ok.affectedRows === "number" ? ok.affectedRows : 0,
            insertId: typeof ok.insertId === "number" ? ok.insertId : 0,
          },
        ],
      };
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      console.error("executeMySQLQueryFn error:", errObj?.message);
      return { success: false, error: errObj?.message || "Database query failed" };
    }
  });
