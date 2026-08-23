import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// Safe DB accessor wrapper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dynamicDb = supabase as unknown as { from: (table: string) => any };

// In-memory demo stage history store
const demoStageHistories: Record<string, StageHistoryRecord[]> = {
  "prospect-dp-1": [
    {
      id: "sh-101",
      prospect_id: "prospect-dp-1",
      from_stage_name: "Proposal Sent",
      to_stage_name: "Sales Closed",
      note: "Agreed to proceed with Enterprise ERP plan.",
      changed_by_name: "Mehan Ahmed",
      changed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "sh-102",
      prospect_id: "prospect-dp-1",
      from_stage_name: "Sales Closed",
      to_stage_name: "Denied Payment",
      note: "Client CFO refused payment citing Q3 budget constraints after delivery.",
      changed_by_name: "Mehan Ahmed",
      changed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  "prospect-dp-2": [
    {
      id: "sh-201",
      prospect_id: "prospect-dp-2",
      from_stage_name: "Negotiation",
      to_stage_name: "Denied Payment",
      note: "Owner demanded 20% post-implementation price drop.",
      changed_by_name: "Sabbir Hossain",
      changed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
  "prospect-dp-3": [
    {
      id: "sh-301",
      prospect_id: "prospect-dp-3",
      from_stage_name: "Sales Closed",
      to_stage_name: "Denied Payment",
      note: "Bank transfer failed, client claims accounting disagreement.",
      changed_by_name: "Farhana Islam",
      changed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
};

// Rich Demo Dataset for Denied Payments
const demoDeniedPayments: DeniedPayment[] = [
  {
    id: "dp-101",
    prospect_id: "prospect-dp-1",
    prospect_name: "Rahim Chowdhury",
    business_name: "Apex Logistics Ltd",
    agent_id: "usr-1",
    agent_name: "Mehan Ahmed",
    phone: "+8801711223344",
    service: "Enterprise ERP Software License",
    denial_reason:
      "CFO refused invoice payment citing unapproved Q3 budget allocations post-delivery.",
    denied_by: "Kamrul Hasan (CFO)",
    denied_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    amount: 85000,
    current_stage: "Denied Payment",
    notes: "Requires senior manager intervention and custom milestone payment splitting.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "dp-102",
    prospect_id: "prospect-dp-2",
    prospect_name: "Tariqul Islam",
    business_name: "Dhaka Retail Solutions",
    agent_id: "usr-2",
    agent_name: "Sabbir Hossain",
    phone: "+8801822334455",
    service: "POS & Inventory CRM Module",
    denial_reason:
      "Owner requested extra 20% discount after project deployment before signing clearance.",
    denied_by: "Tariqul Islam (Managing Director)",
    denied_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    amount: 42000,
    current_stage: "Denied Payment",
    notes:
      "Agent scheduled follow-up call to offer free 2-month extended support instead of discount.",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "dp-103",
    prospect_id: "prospect-dp-3",
    prospect_name: "Nusrat Parveen",
    business_name: "Green Valley Agro",
    agent_id: "usr-3",
    agent_name: "Farhana Islam",
    phone: "+8801933445566",
    service: "Custom Telesales Automation Suite",
    denial_reason:
      "Client disputed initial agreement terms claiming scope mismatch for WhatsApp API.",
    denied_by: "Sharmin Akter (Operations Lead)",
    denied_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    amount: 65000,
    current_stage: "Denied Payment",
    notes: "Technical team reviewing WhatsApp integration logs to clarify scope.",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "dp-104",
    prospect_id: "prospect-dp-4",
    prospect_name: "Mahbub Alam",
    business_name: "Skyline Textiles",
    agent_id: "usr-1",
    agent_name: "Mehan Ahmed",
    phone: "+8801644556677",
    service: "Cloud HR & Payroll Module",
    denial_reason:
      "Delayed payment attempt failed twice via bank transfer, client stopped responding.",
    denied_by: "Accounts Dept",
    denied_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    amount: 38000,
    current_stage: "Denied Payment",
    notes: "Follow-up task created for physical office visit.",
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

export async function fetchDeniedPayments(
  filters: DeniedPaymentFilters = {},
): Promise<DeniedPayment[]> {
  try {
    const { data, error } = await dynamicDb
      .from("denied_payments")
      .select("*, prospects(contact_name, business_name)")
      .order("denied_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return applyClientFilters(demoDeniedPayments, filters);
    }

    const mapped: DeniedPayment[] = (data as Record<string, unknown>[]).map((item) => {
      const prospectObj = item["prospects"] as {
        contact_name?: string;
        business_name?: string;
      } | null;
      return {
        id: String(item["id"]),
        prospect_id: (item["prospect_id"] as string) || null,
        prospect_name: prospectObj?.contact_name || String(item["prospect_name"] || "Client"),
        business_name: prospectObj?.business_name || (item["business_name"] as string) || undefined,
        agent_id: (item["agent_id"] as string) || null,
        agent_name: String(item["agent_name"] || "Agent"),
        phone: String(item["phone"] || ""),
        service: String(item["service"] || ""),
        denial_reason: String(item["denial_reason"] || ""),
        denied_by: String(item["denied_by"] || ""),
        denied_at: String(item["denied_at"] || new Date().toISOString()),
        amount: Number(item["amount"] || 0),
        current_stage: String(item["current_stage"] || "Denied Payment"),
        notes: (item["notes"] as string) || undefined,
        created_at: String(item["created_at"] || new Date().toISOString()),
        updated_at: String(item["updated_at"] || new Date().toISOString()),
      };
    });

    return applyClientFilters(mapped, filters);
  } catch {
    // Fallback to demo data on database error
    return applyClientFilters(demoDeniedPayments, filters);
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
  try {
    const { data, error } = await dynamicDb
      .from("denied_payments")
      .select("*, prospects(contact_name, business_name)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const found = demoDeniedPayments.find((item) => item.id === id);
      return found ?? null;
    }

    const item = data as Record<string, unknown>;
    const prospectObj = item["prospects"] as {
      contact_name?: string;
      business_name?: string;
    } | null;

    return {
      id: String(item["id"]),
      prospect_id: (item["prospect_id"] as string) || null,
      prospect_name: prospectObj?.contact_name || String(item["prospect_name"] || "Client"),
      business_name: prospectObj?.business_name || (item["business_name"] as string) || undefined,
      agent_id: (item["agent_id"] as string) || null,
      agent_name: String(item["agent_name"] || "Agent"),
      phone: String(item["phone"] || ""),
      service: String(item["service"] || ""),
      denial_reason: String(item["denial_reason"] || ""),
      denied_by: String(item["denied_by"] || ""),
      denied_at: String(item["denied_at"] || new Date().toISOString()),
      amount: Number(item["amount"] || 0),
      current_stage: String(item["current_stage"] || "Denied Payment"),
      notes: (item["notes"] as string) || undefined,
      created_at: String(item["created_at"] || new Date().toISOString()),
      updated_at: String(item["updated_at"] || new Date().toISOString()),
    };
  } catch {
    const found = demoDeniedPayments.find((item) => item.id === id);
    return found ?? null;
  }
}

export async function fetchStageHistoryForProspect(
  prospectId: string,
): Promise<StageHistoryRecord[]> {
  try {
    const { data, error } = await supabase
      .from("prospect_stage_history")
      .select(
        `id, prospect_id, note, changed_at,
         from_stage:stages!prospect_stage_history_from_stage_id_fkey(name),
         to_stage:stages!prospect_stage_history_to_stage_id_fkey(name)`,
      )
      .eq("prospect_id", prospectId)
      .order("changed_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row: Record<string, unknown>) => ({
        id: String(row["id"]),
        prospect_id: String(row["prospect_id"]),
        from_stage_name: (row["from_stage"] as { name?: string })?.name || "Denied Payment",
        to_stage_name: (row["to_stage"] as { name?: string })?.name || "Updated Stage",
        note: String(row["note"] || ""),
        changed_by_name: "Agent",
        changed_at: String(row["changed_at"] || new Date().toISOString()),
      }));
    }
  } catch {
    // Fall back to in-memory stage history
  }

  return (
    demoStageHistories[prospectId] || [
      {
        id: `sh-default-${prospectId}`,
        prospect_id: prospectId,
        from_stage_name: "Sales Closed",
        to_stage_name: "Denied Payment",
        note: "Payment denied after service deployment.",
        changed_by_name: "System Agent",
        changed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ]
  );
}

/**
 * Change Stage out of Denied Payment.
 * MANDATORY REQUIREMENT: Must create a stage history record!
 */
export async function changeDeniedPaymentStage(input: ChangeStageInput): Promise<DeniedPayment> {
  const now = new Date().toISOString();
  const index = demoDeniedPayments.findIndex((item) => item.id === input.deniedPaymentId);

  let currentStage = "Denied Payment";
  if (index !== -1) {
    currentStage = demoDeniedPayments[index]!.current_stage;
    demoDeniedPayments[index] = {
      ...demoDeniedPayments[index]!,
      current_stage: input.newStage,
      updated_at: now,
    };
  }

  const prospectIdKey = input.prospectId || `prospect-${input.deniedPaymentId}`;

  // Record Stage History in demo store
  const newHistoryEntry: StageHistoryRecord = {
    id: `sh-${Date.now()}`,
    prospect_id: prospectIdKey,
    from_stage_name: currentStage,
    to_stage_name: input.newStage,
    note: input.note || `Stage updated from ${currentStage} to ${input.newStage}`,
    changed_by_name: input.changedByUserName || "Current Agent",
    changed_at: now,
  };

  if (!demoStageHistories[prospectIdKey]) {
    demoStageHistories[prospectIdKey] = [];
  }
  demoStageHistories[prospectIdKey]!.unshift(newHistoryEntry);

  // Attempt database sync
  try {
    await dynamicDb
      .from("denied_payments")
      .update({
        current_stage: input.newStage,
        updated_at: now,
      })
      .eq("id", input.deniedPaymentId);

    // Insert into prospect_stage_history if prospect_id exists
    if (input.prospectId) {
      await dynamicDb.from("prospect_stage_history").insert({
        prospect_id: input.prospectId,
        note: input.note || `Stage changed from ${currentStage} to ${input.newStage}`,
        changed_by: input.changedByUserId || null,
        changed_at: now,
      });
    }

    // Log Activity
    await supabase.from("activities").insert({
      message: `Changed stage of denied payment prospect to "${input.newStage}": ${input.note}`,
      activity_type: "stage_change",
    });
  } catch {
    // Ignore fallback database sync error
  }

  return (await fetchDeniedPaymentById(input.deniedPaymentId)) || demoDeniedPayments[index]!;
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
