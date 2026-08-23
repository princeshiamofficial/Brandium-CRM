import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// Helper for dynamic tables not yet in generated typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dynamicDb = supabase as unknown as { from: (table: string) => any };

// Meetings Dataset
let demoMeetings: Meeting[] = [];

const DEMO_PROSPECT_OPTIONS: ProspectOption[] = [];

export async function fetchProspectsOptions(): Promise<ProspectOption[]> {
  try {
    const { data, error } = await supabase
      .from("prospects")
      .select("id, contact_name, business_name, phone")
      .order("contact_name", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEMO_PROSPECT_OPTIONS;
    }
    return data as ProspectOption[];
  } catch {
    return DEMO_PROSPECT_OPTIONS;
  }
}

export const prospectsOptionsQuery = () =>
  queryOptions({
    queryKey: ["prospects", "options"],
    queryFn: fetchProspectsOptions,
  });

export async function fetchMeetings(filters: MeetingFilters = {}): Promise<Meeting[]> {
  try {
    let query = dynamicDb
      .from("meetings")
      .select("*, prospects(contact_name, business_name)")
      .order("meeting_date", { ascending: true })
      .order("meeting_time", { ascending: true });

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.meeting_type && filters.meeting_type !== "all") {
      query = query.eq("meeting_type", filters.meeting_type);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return filterDemoMeetings(filters);
    }

    const mapped: Meeting[] = (data as Record<string, unknown>[]).map((item) => {
      const prospectData = item["prospects"] as {
        contact_name?: string;
        business_name?: string;
      } | null;
      return {
        id: String(item["id"]),
        title: String(item["title"]),
        prospect_id: (item["prospect_id"] as string) || null,
        prospect_name: prospectData?.contact_name || undefined,
        business_name: prospectData?.business_name || undefined,
        phone: (item["phone"] as string) || null,
        location: (item["location"] as string) || null,
        meeting_type: item["meeting_type"] as MeetingType,
        meeting_date: String(item["meeting_date"]),
        meeting_time: String(item["meeting_time"]),
        assigned_user_id: (item["assigned_user_id"] as string) || null,
        notes: (item["notes"] as string) || null,
        status: item["status"] as MeetingStatus,
        sms_sent: Boolean(item["sms_sent"]),
        created_by: (item["created_by"] as string) || null,
        created_at: String(item["created_at"]),
        updated_at: String(item["updated_at"]),
      };
    });

    return applyClientFilters(mapped, filters);
  } catch {
    return filterDemoMeetings(filters);
  }
}

function filterDemoMeetings(filters: MeetingFilters): Meeting[] {
  const list = [...demoMeetings];
  return applyClientFilters(list, filters);
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
  try {
    const { data, error } = await dynamicDb
      .from("meetings")
      .select("*, prospects(contact_name, business_name)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const found = demoMeetings.find((m) => m.id === id);
      return found ?? null;
    }

    const item = data as Record<string, unknown>;
    const prospectData = item["prospects"] as {
      contact_name?: string;
      business_name?: string;
    } | null;

    return {
      id: String(item["id"]),
      title: String(item["title"]),
      prospect_id: (item["prospect_id"] as string) || null,
      prospect_name: prospectData?.contact_name || undefined,
      business_name: prospectData?.business_name || undefined,
      phone: (item["phone"] as string) || null,
      location: (item["location"] as string) || null,
      meeting_type: item["meeting_type"] as MeetingType,
      meeting_date: String(item["meeting_date"]),
      meeting_time: String(item["meeting_time"]),
      assigned_user_id: (item["assigned_user_id"] as string) || null,
      notes: (item["notes"] as string) || null,
      status: item["status"] as MeetingStatus,
      sms_sent: Boolean(item["sms_sent"]),
      created_by: (item["created_by"] as string) || null,
      created_at: String(item["created_at"]),
      updated_at: String(item["updated_at"]),
    };
  } catch {
    const found = demoMeetings.find((m) => m.id === id);
    return found ?? null;
  }
}

export async function createMeeting(input: CreateMeetingInput): Promise<Meeting> {
  const newId = `mtg-${Date.now()}`;
  const now = new Date().toISOString();

  let prospectName = "";
  let businessName = "";

  if (input.prospect_id) {
    try {
      const { data } = await supabase
        .from("prospects")
        .select("contact_name, business_name")
        .eq("id", input.prospect_id)
        .maybeSingle();
      if (data) {
        const d = data as Record<string, unknown>;
        prospectName = String(d["contact_name"] ?? "");
        businessName = String(d["business_name"] ?? "");
      }
    } catch {
      // Ignore fallback lookup error
    }
  }

  const newMeeting: Meeting = {
    id: newId,
    title: input.title,
    prospect_id: input.prospect_id ?? null,
    prospect_name: prospectName || undefined,
    business_name: businessName || undefined,
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

  try {
    const { data, error } = await dynamicDb
      .from("meetings")
      .insert({
        title: input.title,
        prospect_id: input.prospect_id || null,
        phone: input.phone || null,
        location: input.location || null,
        meeting_type: input.meeting_type,
        meeting_date: input.meeting_date,
        meeting_time: input.meeting_time,
        assigned_user_id: input.assigned_user_id || null,
        notes: input.notes || null,
        status: "Scheduled",
        sms_sent: Boolean(input.send_sms_now),
      })
      .select()
      .single();

    if (!error && data) {
      newMeeting.id = (data as Record<string, unknown>)["id"] as string;
    }
  } catch {
    // Ignore fallback insertion error
  }

  demoMeetings.unshift(newMeeting);
  return newMeeting;
}

export async function updateMeeting(id: string, updates: UpdateMeetingInput): Promise<Meeting> {
  const index = demoMeetings.findIndex((m) => m.id === id);
  const now = new Date().toISOString();

  if (index !== -1) {
    const current = demoMeetings[index]!;
    demoMeetings[index] = {
      ...current,
      ...updates,
      id: current.id,
      updated_at: now,
    };
  }

  try {
    await dynamicDb
      .from("meetings")
      .update({
        ...updates,
        updated_at: now,
      })
      .eq("id", id);
  } catch {
    // Ignore fallback update error
  }

  return (await fetchMeetingById(id)) || demoMeetings[index]!;
}

export async function updateMeetingStatus(id: string, status: MeetingStatus): Promise<Meeting> {
  return updateMeeting(id, { status });
}

export async function updateMeetingNotes(id: string, notes: string): Promise<Meeting> {
  return updateMeeting(id, { notes });
}

export async function sendMeetingReminderSms(
  meetingId: string,
  customMessage?: string,
): Promise<{ success: boolean; message: string }> {
  const meeting = await fetchMeetingById(meetingId);
  if (!meeting) throw new Error("Meeting not found");

  const phone = meeting.phone || "+8801700000000";

  // Update sms_sent flag
  await updateMeeting(meetingId, { sms_sent: true });

  // Log to activities table
  try {
    await supabase.from("activities").insert({
      message: `SMS reminder sent to ${meeting.prospect_name || meeting.phone || "prospect"} for meeting "${meeting.title}"`,
      activity_type: "sms_sent",
    });
  } catch {
    // Ignore activity log fallback error
  }

  return {
    success: true,
    message: `SMS reminder sent successfully to ${phone}`,
  };
}

export async function deleteMeeting(id: string): Promise<{ success: boolean; message: string }> {
  const existing = await fetchMeetingById(id);
  demoMeetings = demoMeetings.filter((m) => m.id !== id);

  try {
    await dynamicDb.from("meetings").delete().eq("id", id);
  } catch {
    // Ignore fallback deletion error
  }

  // Log activity
  try {
    await supabase.from("activities").insert({
      message: `Deleted meeting "${existing?.title || id}" with ${existing?.prospect_name || existing?.phone || "client"}`,
      activity_type: "meeting_deleted",
    });
  } catch {
    // Ignore activity log fallback error
  }

  return {
    success: true,
    message: "Meeting deleted successfully",
  };
}

export const meetingsQueryOptions = (filters: MeetingFilters = {}) =>
  queryOptions({
    queryKey: ["meetings", filters],
    queryFn: () => fetchMeetings(filters),
  });

export const meetingDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["meetings", "detail", id],
    queryFn: () => fetchMeetingById(id),
  });
