import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "@/lib/mysql-api";
import { getMySQLTimestamp } from "@/lib/mysql-client";

export type MeetingType = "Office" | "Online" | "Client Location" | "Other";
export type MeetingStatus = "Scheduled" | "Completed" | "Cancelled";

export type Meeting = {
  id: string;
  title: string;
  prospect_id: string | null;
  prospect_name?: string | undefined;
  business_name?: string | undefined;
  phone: string | null;
  location: string | null;
  meeting_type: MeetingType;
  meeting_date: string;
  meeting_time: string;
  assigned_user_id: string | null;
  assigned_user_name?: string | undefined;
  notes: string | null;
  status: MeetingStatus;
  sms_sent: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateMeetingInput = {
  title: string;
  prospect_id?: string | null;
  phone?: string | null;
  location?: string | null;
  meeting_type: MeetingType;
  meeting_date: string;
  meeting_time: string;
  assigned_user_id?: string | null;
  notes?: string | null;
  send_sms_now?: boolean;
};

export type UpdateMeetingInput = Partial<CreateMeetingInput> & {
  status?: MeetingStatus;
  sms_sent?: boolean;
};

export type MeetingFilters = {
  search?: string | undefined;
  meeting_type?: MeetingType | "all" | undefined;
  status?: MeetingStatus | "all" | undefined;
  date_range?: "all" | "today" | "next_7_days" | "this_month" | "custom" | undefined;
  start_date?: string | undefined;
  end_date?: string | undefined;
};

export type ProspectOption = {
  id: string;
  contact_name: string;
  business_name: string | null;
  phone: string | null;
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

export async function fetchProspectsOptions(): Promise<ProspectOption[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      "SELECT id, contact_name, business_name, phone FROM `prospects` WHERE is_active = 1 ORDER BY contact_name ASC;",
    );
    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }
    return res.data.map((p) => ({
      id: String(p["id"]),
      contact_name: String(p["contact_name"] || "Prospect"),
      business_name: (p["business_name"] as string) || null,
      phone: (p["phone"] as string) || null,
    }));
  } catch (err) {
    console.warn("fetchProspectsOptions MySQL error:", err);
    return [];
  }
}

export const prospectsOptionsQuery = () =>
  queryOptions({
    queryKey: ["prospects", "options"],
    queryFn: fetchProspectsOptions,
  });

export async function fetchMeetings(
  filters: MeetingFilters = {},
  userId?: string,
  isAdmin: boolean = false,
): Promise<Meeting[]> {
  try {
    const res = await runMySQLQuery<Record<string, unknown>[]>(
      `SELECT 
        m.*,
        p.contact_name AS prospect_name,
        p.business_name,
        u.name AS assigned_user_name
      FROM \`meetings\` m
      LEFT JOIN \`prospects\` p ON m.prospect_id = p.id
      LEFT JOIN \`users\` u ON m.assigned_user_id = u.id
      ORDER BY m.created_at DESC, m.meeting_date DESC, m.meeting_time DESC;`,
    );

    if (!res.success || !Array.isArray(res.data)) {
      return [];
    }

    let mapped: Meeting[] = res.data.map((item) => ({
      id: String(item["id"]),
      title: String(item["title"] || "Meeting"),
      prospect_id: (item["prospect_id"] as string) || null,
      prospect_name: (item["prospect_name"] as string) || undefined,
      business_name: (item["business_name"] as string) || undefined,
      phone: (item["phone"] as string) || null,
      location: (item["location"] as string) || null,
      meeting_type: (item["meeting_type"] as MeetingType) || "Office",
      meeting_date: String(item["meeting_date"] || new Date().toISOString().split("T")[0]),
      meeting_time: String(item["meeting_time"] || "10:00:00"),
      assigned_user_id: (item["assigned_user_id"] as string) || null,
      assigned_user_name: (item["assigned_user_name"] as string) || undefined,
      notes: (item["notes"] as string) || null,
      status: (item["status"] as MeetingStatus) || "Scheduled",
      sms_sent: Boolean(Number(item["sms_sent"] ?? 0)),
      created_by: (item["created_by"] as string) || null,
      created_at: String(item["created_at"] || new Date().toISOString()),
      updated_at: String(item["updated_at"] || new Date().toISOString()),
    }));

    if (!isAdmin && userId) {
      mapped = mapped.filter((m) => m.assigned_user_id === userId || m.created_by === userId);
    }

    return applyClientFilters(mapped, filters);
  } catch (err) {
    console.warn("fetchMeetings MySQL error:", err);
    return [];
  }
}

function applyClientFilters(list: Meeting[], filters: MeetingFilters): Meeting[] {
  let filtered = list;

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((m) => m.status === filters.status);
  }

  if (filters.meeting_type && filters.meeting_type !== "all") {
    filtered = filtered.filter((m) => m.meeting_type === filters.meeting_type);
  }

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.prospect_name && m.prospect_name.toLowerCase().includes(q)) ||
        (m.business_name && m.business_name.toLowerCase().includes(q)) ||
        (m.phone && m.phone.includes(q)) ||
        (m.location && m.location.toLowerCase().includes(q)),
    );
  }

  if (filters.date_range && filters.date_range !== "all") {
    const todayStr = new Date().toISOString().split("T")[0]!;
    if (filters.date_range === "today") {
      filtered = filtered.filter((m) => m.meeting_date === todayStr);
    } else if (filters.date_range === "next_7_days") {
      const next7 = new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]!;
      filtered = filtered.filter((m) => m.meeting_date >= todayStr && m.meeting_date <= next7);
    } else if (filters.date_range === "this_month") {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]!;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0]!;
      filtered = filtered.filter((m) => m.meeting_date >= firstDay && m.meeting_date <= lastDay);
    }
  }

  if (filters.start_date) {
    filtered = filtered.filter((m) => m.meeting_date >= filters.start_date!);
  }

  if (filters.end_date) {
    filtered = filtered.filter((m) => m.meeting_date <= filters.end_date!);
  }

  return filtered;
}

export async function fetchMeetingById(id: string): Promise<Meeting | null> {
  const meetings = await fetchMeetings();
  return meetings.find((m) => m.id === id) || null;
}

export async function createMeeting(input: CreateMeetingInput): Promise<Meeting> {
  const newId = generateUUID();
  const now = getMySQLTimestamp();
  const timeStr = input.meeting_time
    ? input.meeting_time.length === 5
      ? `${input.meeting_time}:00`
      : input.meeting_time
    : "10:00:00";
  const scheduledAt = input.meeting_date ? `${input.meeting_date} ${timeStr}` : now;

  const res = await runMySQLQuery(
    `INSERT INTO \`meetings\` (
      \`id\`, \`title\`, \`prospect_id\`, \`phone\`, \`location\`,
      \`meeting_type\`, \`meeting_date\`, \`meeting_time\`, \`scheduled_at\`, \`assigned_user_id\`,
      \`notes\`, \`status\`, \`sms_sent\`, \`created_at\`, \`updated_at\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?);`,
    [
      newId,
      input.title,
      input.prospect_id || null,
      input.phone || null,
      input.location || null,
      input.meeting_type,
      input.meeting_date,
      input.meeting_time,
      scheduledAt,
      input.assigned_user_id || null,
      input.notes || null,
      input.send_sms_now ? 1 : 0,
      now,
      now,
    ],
  );

  if (!res.success) {
    throw new Error(res.error || "Failed to create meeting in database.");
  }

  // Auto-update prospect stage to "Meeting Scheduled" when a meeting is created for them
  if (input.prospect_id) {
    try {
      const nowStr = getMySQLTimestamp();

      // Resolve the "Meeting Scheduled" stage ID from MySQL
      const stageRes = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) = 'meeting scheduled' LIMIT 1;",
      );
      const meetingStageId =
        stageRes?.success && stageRes.data?.[0]
          ? String(stageRes.data[0]["id"])
          : "meeting-scheduled";

      // Get the prospect's current stage for history
      let fromStageId: string | null = null;
      try {
        const currRes = await runMySQLQuery<Record<string, unknown>[]>(
          "SELECT `stage_id` FROM `prospects` WHERE `id` = ? LIMIT 1;",
          [input.prospect_id],
        );
        if (currRes?.success && currRes.data?.[0]) {
          fromStageId = String(currRes.data[0]["stage_id"] || "") || null;
        }
      } catch {
        // ignore — history from_stage is optional
      }

      // Update prospect stage
      await runMySQLQuery(
        "UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;",
        [meetingStageId, nowStr, input.prospect_id],
      );

      // Write stage history record
      const historyId = generateUUID();
      await runMySQLQuery(
        `INSERT INTO \`prospect_stage_history\`
           (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_at\`)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          historyId,
          input.prospect_id,
          fromStageId,
          meetingStageId,
          "Stage auto-updated when meeting was scheduled",
          nowStr,
        ],
      );
    } catch (err) {
      console.warn("Auto stage-to-meeting-scheduled notice:", err);
    }
  }

  const meeting = await fetchMeetingById(newId);
  if (!meeting) {
    return {
      id: newId,
      title: input.title,
      prospect_id: input.prospect_id ?? null,
      phone: input.phone ?? null,
      location: input.location ?? null,
      meeting_type: input.meeting_type,
      meeting_date: input.meeting_date,
      meeting_time: input.meeting_time,
      assigned_user_id: input.assigned_user_id ?? null,
      notes: input.notes ?? null,
      status: "Scheduled",
      sms_sent: Boolean(input.send_sms_now),
      created_by: null,
      created_at: now,
      updated_at: now,
    };
  }
  return meeting;
}

export async function updateMeeting(id: string, updates: UpdateMeetingInput): Promise<Meeting> {
  const now = getMySQLTimestamp();
  const sets: string[] = ["`updated_at` = ?"];
  const params: (string | number | null)[] = [now];

  if (updates.title !== undefined) {
    sets.push("`title` = ?");
    params.push(updates.title);
  }
  if (updates.prospect_id !== undefined) {
    sets.push("`prospect_id` = ?");
    params.push(updates.prospect_id);
  }
  if (updates.phone !== undefined) {
    sets.push("`phone` = ?");
    params.push(updates.phone);
  }
  if (updates.location !== undefined) {
    sets.push("`location` = ?");
    params.push(updates.location);
  }
  if (updates.meeting_type !== undefined) {
    sets.push("`meeting_type` = ?");
    params.push(updates.meeting_type);
  }
  if (updates.meeting_date !== undefined) {
    sets.push("`meeting_date` = ?");
    params.push(updates.meeting_date);
  }
  if (updates.meeting_time !== undefined) {
    sets.push("`meeting_time` = ?");
    params.push(updates.meeting_time);
  }
  if (updates.assigned_user_id !== undefined) {
    sets.push("`assigned_user_id` = ?");
    params.push(updates.assigned_user_id);
  }
  if (updates.notes !== undefined) {
    sets.push("`notes` = ?");
    params.push(updates.notes);
  }
  if (updates.status !== undefined) {
    sets.push("`status` = ?");
    params.push(updates.status);
  }
  if (updates.sms_sent !== undefined) {
    sets.push("`sms_sent` = ?");
    params.push(updates.sms_sent ? 1 : 0);
  }

  params.push(id);
  const sql = `UPDATE \`meetings\` SET ${sets.join(", ")} WHERE \`id\` = ?;`;
  await runMySQLQuery(sql, params);

  const updated = await fetchMeetingById(id);
  if (!updated) throw new Error("Meeting not found");
  return updated;
}

export async function updateMeetingStatus(id: string, status: MeetingStatus): Promise<Meeting> {
  return updateMeeting(id, { status });
}

export async function updateMeetingNotes(id: string, notes: string): Promise<Meeting> {
  return updateMeeting(id, { notes });
}

export async function sendMeetingReminderSms(
  meetingId: string,
  _customMessage?: string,
): Promise<{ success: boolean; message: string }> {
  const meeting = await fetchMeetingById(meetingId);
  if (!meeting) throw new Error("Meeting not found");

  const phone = meeting.phone || "+8801700000000";
  await updateMeeting(meetingId, { sms_sent: true });

  const now = getMySQLTimestamp();
  await runMySQLQuery(
    `INSERT INTO \`activities\` (\`id\`, \`message\`, \`activity_type\`, \`created_at\`)
     VALUES (?, ?, 'sms_sent', ?);`,
    [
      generateUUID(),
      `SMS reminder sent to ${meeting.prospect_name || meeting.phone || "prospect"} for meeting "${meeting.title}"`,
      now,
    ],
  );

  return {
    success: true,
    message: `SMS reminder sent successfully to ${phone}`,
  };
}

export async function deleteMeeting(id: string): Promise<{ success: boolean; message: string }> {
  const existing = await fetchMeetingById(id);
  await runMySQLQuery("DELETE FROM `meetings` WHERE `id` = ?;", [id]);

  const now = getMySQLTimestamp();
  await runMySQLQuery(
    `INSERT INTO \`activities\` (\`id\`, \`message\`, \`activity_type\`, \`created_at\`)
     VALUES (?, ?, 'meeting_deleted', ?);`,
    [
      generateUUID(),
      `Deleted meeting "${existing?.title || id}" with ${existing?.prospect_name || existing?.phone || "client"}`,
      now,
    ],
  );

  return {
    success: true,
    message: "Meeting deleted successfully",
  };
}

export const meetingsQueryOptions = (
  filters: MeetingFilters = {},
  userId?: string,
  isAdmin: boolean = false,
) =>
  queryOptions({
    queryKey: ["meetings", filters, userId, isAdmin],
    queryFn: () => fetchMeetings(filters, userId, isAdmin),
  });

export const meetingDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["meetings", "detail", id],
    queryFn: () => fetchMeetingById(id),
  });
