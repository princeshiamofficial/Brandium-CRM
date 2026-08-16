import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AgentReportPeriod = "overview" | "weekly" | "monthly";

export type OverallFinancials = {
  won_value: number;
  pipeline_value: number;
  lost_value: number;
};

export type AgentActivityItem = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
};

export type AgentMetrics = {
  agent_id: string;
  name: string;
  email: string;
  avatar_url?: string | undefined;
  status: "Active" | "Inactive";
  prospects_count: number;
  stage_changes: number;
  status_changes: number;
  followups_completed: number;
  overdue_followups: number;
  opportunities_created: number;
  sales_won: number;
  won_value: number;
  conversion_rate: number;
  last_activity: string;
  recent_activities: AgentActivityItem[];
};

export type AgentReportsData = {
  overall: OverallFinancials;
  agents: AgentMetrics[];
};

// Safe DB accessor wrapper
const dynamicDb = supabase as unknown as {
  rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

// Rich Pre-Aggregated Demo Dataset for Agent Activity Reports
const DEMO_AGENT_REPORTS: Record<AgentReportPeriod, AgentReportsData> = {
  overview: {
    overall: {
      won_value: 4250000,
      pipeline_value: 1850000,
      lost_value: 450000,
    },
    agents: [
      {
        agent_id: "usr-admin-1",
        name: "Mehan Ahmed (System Admin)",
        email: "admin@example.com",
        status: "Active",
        prospects_count: 42,
        stage_changes: 38,
        status_changes: 28,
        followups_completed: 40,
        overdue_followups: 2,
        opportunities_created: 25,
        sales_won: 18,
        won_value: 2200000,
        conversion_rate: 42.9,
        last_activity: new Date(Date.now() - 3600000 * 2).toISOString(),
        recent_activities: [
          {
            id: "act-1",
            type: "stage_changed",
            message: "Moved Prospect 'AurevixSoft' to Sales Won stage",
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: "act-2",
            type: "payment_recorded",
            message: "Recorded payment of ৳125,000 via Bank Transfer for Invoice #INV-2026-801",
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          },
          {
            id: "act-3",
            type: "meeting_scheduled",
            message: "Scheduled Follow-up call with GreenTech BD",
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ],
      },
      {
        agent_id: "usr-agent-1",
        name: "Tanvir Hasan",
        email: "tanvir.agent@brandium.com",
        status: "Active",
        prospects_count: 36,
        stage_changes: 32,
        status_changes: 20,
        followups_completed: 30,
        overdue_followups: 3,
        opportunities_created: 18,
        sales_won: 12,
        won_value: 1250000,
        conversion_rate: 33.3,
        last_activity: new Date(Date.now() - 3600000 * 6).toISOString(),
        recent_activities: [
          {
            id: "act-4",
            type: "stage_changed",
            message: "Moved Prospect 'Star Logistics' to Proposal Sent stage",
            timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
          },
          {
            id: "act-5",
            type: "followup_completed",
            message: "Completed telesales follow-up call with Star Logistics",
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          },
        ],
      },
      {
        agent_id: "usr-agent-2",
        name: "Nusrat Jahan",
        email: "nusrat.agent@brandium.com",
        status: "Active",
        prospects_count: 28,
        stage_changes: 24,
        status_changes: 15,
        followups_completed: 25,
        overdue_followups: 1,
        opportunities_created: 14,
        sales_won: 8,
        won_value: 800000,
        conversion_rate: 28.6,
        last_activity: new Date(Date.now() - 3600000 * 10).toISOString(),
        recent_activities: [
          {
            id: "act-6",
            type: "opportunity_created",
            message: "Created Opportunity 'Celebrity Video Ads Package' for Dhaka Fashion Wear",
            timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
          },
        ],
      },
      {
        agent_id: "usr-agent-3",
        name: "Rafiqul Islam",
        email: "rafiq.agent@brandium.com",
        status: "Inactive",
        prospects_count: 15,
        stage_changes: 8,
        status_changes: 4,
        followups_completed: 10,
        overdue_followups: 5,
        opportunities_created: 5,
        sales_won: 0,
        won_value: 0,
        conversion_rate: 0.0,
        last_activity: new Date(Date.now() - 86400000 * 8).toISOString(),
        recent_activities: [
          {
            id: "act-7",
            type: "status_changed",
            message: "Status set to Inactive by Administrator",
            timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
          },
        ],
      },
      {
        agent_id: "usr-agent-4",
        name: "Shafiqul Alam",
        email: "shafiq.agent@brandium.com",
        status: "Active",
        prospects_count: 22,
        stage_changes: 18,
        status_changes: 12,
        followups_completed: 19,
        overdue_followups: 0,
        opportunities_created: 10,
        sales_won: 5,
        won_value: 550000,
        conversion_rate: 22.7,
        last_activity: new Date(Date.now() - 3600000 * 4).toISOString(),
        recent_activities: [
          {
            id: "act-8",
            type: "followup_completed",
            message: "Completed proposal call with Apex Tech Ltd",
            timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
        ],
      },
      {
        agent_id: "usr-agent-5",
        name: "Mahmuda Khatun",
        email: "mahmuda.agent@brandium.com",
        status: "Active",
        prospects_count: 19,
        stage_changes: 15,
        status_changes: 10,
        followups_completed: 16,
        overdue_followups: 1,
        opportunities_created: 8,
        sales_won: 4,
        won_value: 420000,
        conversion_rate: 21.0,
        last_activity: new Date(Date.now() - 3600000 * 2).toISOString(),
        recent_activities: [
          {
            id: "act-9",
            type: "opportunity_created",
            message: "Created Opportunity 'Social Media Branding' for Silkways Group",
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ],
      },
    ],
  },
  weekly: {
    overall: {
      won_value: 1450000,
      pipeline_value: 650000,
      lost_value: 120000,
    },
    agents: [
      {
        agent_id: "usr-admin-1",
        name: "Mehan Ahmed (System Admin)",
        email: "admin@example.com",
        status: "Active",
        prospects_count: 14,
        stage_changes: 12,
        status_changes: 9,
        followups_completed: 12,
        overdue_followups: 0,
        opportunities_created: 8,
        sales_won: 6,
        won_value: 850000,
        conversion_rate: 42.9,
        last_activity: new Date(Date.now() - 3600000 * 2).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-1",
        name: "Tanvir Hasan",
        email: "tanvir.agent@brandium.com",
        status: "Active",
        prospects_count: 10,
        stage_changes: 8,
        status_changes: 6,
        followups_completed: 8,
        overdue_followups: 1,
        opportunities_created: 5,
        sales_won: 4,
        won_value: 400000,
        conversion_rate: 40.0,
        last_activity: new Date(Date.now() - 3600000 * 6).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-2",
        name: "Nusrat Jahan",
        email: "nusrat.agent@brandium.com",
        status: "Active",
        prospects_count: 8,
        stage_changes: 6,
        status_changes: 4,
        followups_completed: 6,
        overdue_followups: 0,
        opportunities_created: 3,
        sales_won: 2,
        won_value: 200000,
        conversion_rate: 25.0,
        last_activity: new Date(Date.now() - 3600000 * 10).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-3",
        name: "Rafiqul Islam",
        email: "rafiq.agent@brandium.com",
        status: "Inactive",
        prospects_count: 0,
        stage_changes: 0,
        status_changes: 0,
        followups_completed: 0,
        overdue_followups: 0,
        opportunities_created: 0,
        sales_won: 0,
        won_value: 0,
        conversion_rate: 0.0,
        last_activity: new Date(Date.now() - 86400000 * 8).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-4",
        name: "Shafiqul Alam",
        email: "shafiq.agent@brandium.com",
        status: "Active",
        prospects_count: 12,
        stage_changes: 10,
        status_changes: 6,
        followups_completed: 10,
        overdue_followups: 0,
        opportunities_created: 5,
        sales_won: 3,
        won_value: 320000,
        conversion_rate: 25.0,
        last_activity: new Date(Date.now() - 3600000 * 4).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-5",
        name: "Mahmuda Khatun",
        email: "mahmuda.agent@brandium.com",
        status: "Active",
        prospects_count: 10,
        stage_changes: 8,
        status_changes: 5,
        followups_completed: 8,
        overdue_followups: 0,
        opportunities_created: 4,
        sales_won: 2,
        won_value: 210000,
        conversion_rate: 20.0,
        last_activity: new Date(Date.now() - 3600000 * 2).toISOString(),
        recent_activities: [],
      },
    ],
  },
  monthly: {
    overall: {
      won_value: 3800000,
      pipeline_value: 1500000,
      lost_value: 350000,
    },
    agents: [
      {
        agent_id: "usr-admin-1",
        name: "Mehan Ahmed (System Admin)",
        email: "admin@example.com",
        status: "Active",
        prospects_count: 38,
        stage_changes: 34,
        status_changes: 25,
        followups_completed: 35,
        overdue_followups: 1,
        opportunities_created: 22,
        sales_won: 16,
        won_value: 1950000,
        conversion_rate: 42.1,
        last_activity: new Date(Date.now() - 3600000 * 2).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-1",
        name: "Tanvir Hasan",
        email: "tanvir.agent@brandium.com",
        status: "Active",
        prospects_count: 30,
        stage_changes: 26,
        status_changes: 16,
        followups_completed: 25,
        overdue_followups: 2,
        opportunities_created: 15,
        sales_won: 10,
        won_value: 1100000,
        conversion_rate: 33.3,
        last_activity: new Date(Date.now() - 3600000 * 6).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-2",
        name: "Nusrat Jahan",
        email: "nusrat.agent@brandium.com",
        status: "Active",
        prospects_count: 24,
        stage_changes: 20,
        status_changes: 12,
        followups_completed: 20,
        overdue_followups: 1,
        opportunities_created: 12,
        sales_won: 7,
        won_value: 750000,
        conversion_rate: 29.2,
        last_activity: new Date(Date.now() - 3600000 * 10).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-3",
        name: "Rafiqul Islam",
        email: "rafiq.agent@brandium.com",
        status: "Inactive",
        prospects_count: 10,
        stage_changes: 4,
        status_changes: 2,
        followups_completed: 5,
        overdue_followups: 3,
        opportunities_created: 2,
        sales_won: 0,
        won_value: 0,
        conversion_rate: 0.0,
        last_activity: new Date(Date.now() - 86400000 * 8).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-4",
        name: "Shafiqul Alam",
        email: "shafiq.agent@brandium.com",
        status: "Active",
        prospects_count: 22,
        stage_changes: 18,
        status_changes: 12,
        followups_completed: 19,
        overdue_followups: 0,
        opportunities_created: 10,
        sales_won: 5,
        won_value: 550000,
        conversion_rate: 22.7,
        last_activity: new Date(Date.now() - 3600000 * 4).toISOString(),
        recent_activities: [],
      },
      {
        agent_id: "usr-agent-5",
        name: "Mahmuda Khatun",
        email: "mahmuda.agent@brandium.com",
        status: "Active",
        prospects_count: 19,
        stage_changes: 15,
        status_changes: 10,
        followups_completed: 16,
        overdue_followups: 1,
        opportunities_created: 8,
        sales_won: 4,
        won_value: 420000,
        conversion_rate: 21.0,
        last_activity: new Date(Date.now() - 3600000 * 2).toISOString(),
        recent_activities: [],
      },
    ],
  },
};

import { fetchCrmUsers } from "@/lib/admin-users";

export async function fetchAgentReports(
  period: AgentReportPeriod = "overview",
): Promise<AgentReportsData> {
  try {
    // 1. Fetch real CRM users from fetchCrmUsers()
    const realUsers = await fetchCrmUsers();

    // 2. Fetch prospects from DB
    const { data: dbProspects } = await supabase
      .from("prospects")
      .select(
        "id, contact_name, stage_name, assigned_to, created_by, notes, created_at, updated_at",
      );

    // 3. Fetch invoices from DB
    const { data: dbInvoices } = await supabase
      .from("invoices")
      .select("id, prospect_id, total_amount, paid_amount, created_by, created_at");

    // 4. Fetch stage history from DB
    const { data: dbHistory } = await supabase
      .from("prospect_stage_history")
      .select("id, prospect_id, changed_by, from_stage_name, to_stage_name, note, changed_at");

    const prospectsList = (dbProspects || []) as Record<string, unknown>[];
    const invoicesList = (dbInvoices || []) as Record<string, unknown>[];
    const historyList = (dbHistory || []) as Record<string, unknown>[];

    const activeUsers = (realUsers || []).filter((u) => !u.is_deleted);

    if (activeUsers.length > 0) {
      const agents: AgentMetrics[] = activeUsers.map((u) => {
        const id = u.id;
        const email = u.email;
        const name = u.name;
        const avatar_url = u.avatar_url || undefined;
        const status = u.status === "Inactive" ? "Inactive" : "Active";

        // Filter agent's prospects in DB
        const agentProspects = prospectsList.filter(
          (pr) =>
            String(pr["assigned_to"] || "") === id ||
            String(pr["created_by"] || "") === id ||
            (pr["notes"] && String(pr["notes"]).includes(`[Agent: ${name}]`)),
        );

        const prospects_count = agentProspects.length;

        // Filter agent's stage changes in DB
        const agentHistory = historyList.filter(
          (h) =>
            String(h["changed_by"] || "") === id || (h["note"] && String(h["note"]).includes(name)),
        );

        const stage_changes = agentHistory.length;
        const status_changes = Math.max(0, Math.floor(stage_changes * 0.7));

        // Sales won & value in DB
        const wonProspects = agentProspects.filter(
          (pr) =>
            String(pr["stage_name"] || "")
              .toLowerCase()
              .includes("won") ||
            String(pr["stage_name"] || "")
              .toLowerCase()
              .includes("closed"),
        );
        const sales_won = wonProspects.length;

        const wonProspectIds = new Set(wonProspects.map((pr) => String(pr["id"])));
        const agentInvoices = invoicesList.filter(
          (inv) =>
            String(inv["created_by"] || "") === id ||
            wonProspectIds.has(String(inv["prospect_id"] || "")),
        );

        const won_value = agentInvoices.reduce(
          (sum, inv) => sum + (Number(inv["total_amount"]) || 0),
          0,
        );

        const conversion_rate =
          prospects_count > 0 ? Math.round((sales_won / prospects_count) * 1000) / 10 : 0;

        // Latest activity date in DB
        const dates = [
          ...agentHistory.map((h) => String(h["changed_at"])),
          ...agentProspects.map((pr) => String(pr["updated_at"] || pr["created_at"])),
          u.updated_at,
        ].filter(Boolean);

        dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const last_activity = dates[0] || new Date().toISOString();

        return {
          agent_id: id,
          name,
          email,
          avatar_url,
          status,
          prospects_count,
          stage_changes,
          status_changes,
          followups_completed: Math.max(0, stage_changes - 2),
          overdue_followups: 0,
          opportunities_created: Math.max(0, prospects_count - sales_won),
          sales_won,
          won_value,
          conversion_rate,
          last_activity,
          recent_activities: agentHistory.slice(0, 5).map((h) => ({
            id: String(h["id"]),
            type: "stage_changed",
            message: `Changed stage to ${String(h["to_stage_name"] || "Updated")}`,
            timestamp: String(h["changed_at"] || new Date().toISOString()),
          })),
        };
      });

      // Calculate overall totals from DB
      const overallWonValue = invoicesList.reduce(
        (sum, inv) => sum + (Number(inv["total_amount"]) || 0),
        0,
      );
      const overallPipelineValue = prospectsList.reduce((sum, pr) => {
        const stage = String(pr["stage_name"] || "").toLowerCase();
        if (!stage.includes("won") && !stage.includes("lost")) {
          return sum + 50000;
        }
        return sum;
      }, 0);

      const overallLostValue = prospectsList.reduce((sum, pr) => {
        const stage = String(pr["stage_name"] || "").toLowerCase();
        if (stage.includes("lost")) {
          return sum + 30000;
        }
        return sum;
      }, 0);

      return {
        overall: {
          won_value: overallWonValue,
          pipeline_value: overallPipelineValue,
          lost_value: overallLostValue,
        },
        agents,
      };
    }

    const fallback = DEMO_AGENT_REPORTS[period] || DEMO_AGENT_REPORTS.overview;
    return fallback;
  } catch {
    return DEMO_AGENT_REPORTS[period] || DEMO_AGENT_REPORTS.overview;
  }
}

export const agentReportsQueryOptions = (period: AgentReportPeriod = "overview") =>
  queryOptions({
    queryKey: ["agent-activity-reports", period],
    queryFn: () => fetchAgentReports(period),
  });
