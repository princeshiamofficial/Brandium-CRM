import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { runMySQLQuery } from "@/lib/mysql-api";
import { generateUUID, getMySQLTimestamp } from "@/lib/mysql-client";

export type Stage = {
  id: string;
  name: string;
  stage_group: string;
  sort_order: number;
  is_follow_up: boolean;
  is_active: boolean;
  color?: string | null;
  icon?: string | null;
  is_system?: boolean;
};

export type StageHistoryEntry = {
  id: string;
  prospect_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  note: string | null;
  changed_by: string | null;
  changed_at: string;
  from_stage_name: string | null;
  to_stage_name: string | null;
  changed_by_name: string | null;
  changed_by_avatar?: string | null;
};

export const DEFAULT_STAGE_THEMES: Record<string, { color: string; icon: string }> = {
  prospect: { color: "#2563EB", icon: "UserPlus" },
  "follow-up": { color: "#D97706", icon: "CalendarClock" },
  "opportunity-created": { color: "#8B5CF6", icon: "Sparkles" },
  "sales-won": { color: "#16A34A", icon: "Trophy" },
  dnp: { color: "#EA580C", icon: "PhoneMissed" },
  "switched-off": { color: "#E11D48", icon: "PowerOff" },
  "invalid-number": { color: "#DC2626", icon: "PhoneOff" },
  "meeting-scheduled": { color: "#4F46E5", icon: "CalendarCheck" },
  "quotation-sent": { color: "#0891B2", icon: "FileText" },
  "denied-payment": { color: "#9333EA", icon: "ShieldAlert" },
  "not-interested": { color: "#64748B", icon: "UserX" },
};

export function resolveStageColor(name?: string | null, customColor?: string | null): string {
  if (customColor && customColor.trim() && customColor !== "#0a2e5c" && customColor !== "#94a3b8") {
    return customColor;
  }
  const norm = (name || "").toLowerCase().replace(/[-_\s()]/g, "");
  if (norm.includes("delivered") || norm.includes("won") || norm.includes("sale")) return "#16A34A";
  if (
    norm.includes("videographycomplete") ||
    norm.includes("videographycompleted") ||
    (norm.includes("video") && norm.includes("complete"))
  )
    return "#10B981";
  if (norm.includes("projectstart") || norm.includes("started") || norm.includes("start"))
    return "#3B82F6";
  if (norm.includes("script") || norm.includes("writer")) return "#8B5CF6";
  if (norm.includes("content") || norm.includes("planner")) return "#EC4899";
  if (norm.includes("videographer") || norm.includes("videography")) return "#F59E0B";
  if (norm.includes("videoeditor") || norm.includes("editor")) return "#6366F1";
  if (norm.includes("market") || norm.includes("marketing")) return "#06B6D4";
  if (norm.includes("developer") || norm.includes("dev")) return "#0284C7";
  if (norm.includes("prospect") || norm.includes("lead")) return "#2563EB";
  if (norm.includes("follow")) return "#D97706";
  if (norm.includes("opportunity")) return "#8B5CF6";
  if (norm.includes("dnp") || norm.includes("didnotpick")) return "#EA580C";
  if (norm.includes("switchedoff") || norm.includes("switchoff")) return "#E11D48";
  if (norm.includes("invalid") || norm.includes("wrong")) return "#DC2626";
  if (norm.includes("meeting")) return "#4F46E5";
  if (norm.includes("quotation") || norm.includes("quote")) return "#0891B2";
  if (norm.includes("denied")) return "#9333EA";
  if (norm.includes("notinterested")) return "#64748B";
  return customColor || "#2563EB";
}

export function resolveStageIcon(name?: string | null, customIcon?: string | null): string {
  if (customIcon && customIcon.trim() && customIcon !== "Circle") {
    return customIcon;
  }
  const norm = (name || "").toLowerCase().replace(/[-_\s()]/g, "");
  if (norm.includes("delivered") || norm.includes("won") || norm.includes("sale")) return "Trophy";
  if (
    norm.includes("videographycomplete") ||
    norm.includes("videographycompleted") ||
    (norm.includes("video") && norm.includes("complete"))
  )
    return "CheckCircle2";
  if (norm.includes("projectstart") || norm.includes("started") || norm.includes("start"))
    return "PlayCircle";
  if (norm.includes("script") || norm.includes("writer")) return "FileText";
  if (norm.includes("content") || norm.includes("planner")) return "Calendar";
  if (norm.includes("videographer") || norm.includes("videography")) return "Video";
  if (norm.includes("videoeditor") || norm.includes("editor")) return "Film";
  if (norm.includes("market") || norm.includes("marketing")) return "Megaphone";
  if (norm.includes("developer") || norm.includes("dev")) return "Code";
  if (norm.includes("prospect") || norm.includes("lead")) return "UserPlus";
  if (norm.includes("follow")) return "CalendarClock";
  if (norm.includes("opportunity")) return "Sparkles";
  if (norm.includes("dnp") || norm.includes("didnotpick")) return "PhoneMissed";
  if (norm.includes("switchedoff") || norm.includes("switchoff")) return "PowerOff";
  if (norm.includes("invalid") || norm.includes("wrong")) return "PhoneOff";
  if (norm.includes("meeting")) return "CalendarCheck";
  if (norm.includes("quotation") || norm.includes("quote")) return "FileText";
  if (norm.includes("denied")) return "ShieldAlert";
  if (norm.includes("notinterested")) return "UserX";
  return customIcon || "Circle";
}

export function isSystemStage(stage: {
  is_system?: boolean | number | null | undefined;
  name?: string | null | undefined;
  id?: string | null | undefined;
}): boolean {
  if (stage.is_system) return true;
  const normName = (stage.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normId = (stage.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  const SYSTEM_KEYS = [
    "prospect",
    "followup",
    "opportunitycreated",
    "saleswon",
    "won",
    "dnp",
    "dnpdidnotpick",
    "switchedoff",
    "invalidnumber",
    "meetingscheduled",
    "quotationsent",
    "deniedpayment",
    "notinterested",
  ];

  return SYSTEM_KEYS.includes(normName) || SYSTEM_KEYS.includes(normId);
}

export const FALLBACK_STAGES: Stage[] = [
  {
    id: "prospect",
    name: "Prospect",
    stage_group: "new",
    sort_order: 1,
    is_follow_up: false,
    is_active: true,
    color: "#2563EB",
    icon: "UserPlus",
  },
  {
    id: "follow-up",
    name: "Follow-up",
    stage_group: "in_progress",
    sort_order: 2,
    is_follow_up: true,
    is_active: true,
    color: "#D97706",
    icon: "CalendarClock",
  },
  {
    id: "opportunity-created",
    name: "Opportunity Created",
    stage_group: "in_progress",
    sort_order: 3,
    is_follow_up: false,
    is_active: true,
    color: "#8B5CF6",
    icon: "Sparkles",
  },
  {
    id: "sales-won",
    name: "Sales won",
    stage_group: "won",
    sort_order: 4,
    is_follow_up: false,
    is_active: true,
    color: "#16A34A",
    icon: "Trophy",
  },
  {
    id: "dnp",
    name: "DNP (Did Not Pick)",
    stage_group: "unreachable",
    sort_order: 5,
    is_follow_up: false,
    is_active: true,
    color: "#EA580C",
    icon: "PhoneMissed",
  },
  {
    id: "switched-off",
    name: "Switched Off",
    stage_group: "unreachable",
    sort_order: 6,
    is_follow_up: false,
    is_active: true,
    color: "#E11D48",
    icon: "PowerOff",
  },
  {
    id: "invalid-number",
    name: "Invalid Number",
    stage_group: "unreachable",
    sort_order: 7,
    is_follow_up: false,
    is_active: true,
    color: "#DC2626",
    icon: "PhoneOff",
  },
  {
    id: "meeting-scheduled",
    name: "Meeting Scheduled",
    stage_group: "in_progress",
    sort_order: 8,
    is_follow_up: true,
    is_active: true,
    color: "#4F46E5",
    icon: "CalendarCheck",
  },
  {
    id: "quotation-sent",
    name: "Quotation Sent",
    stage_group: "in_progress",
    sort_order: 9,
    is_follow_up: false,
    is_active: true,
    color: "#0891B2",
    icon: "FileText",
  },
];

export const stagesQuery = () =>
  queryOptions({
    queryKey: ["stages"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Stage[]> => {
      // 1. Direct query from local MySQL database `brandium_crm`
      try {
        const mysqlRes = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT id, name, stage_group, sort_order, is_follow_up, is_active, color, icon, is_system
           FROM \`stages\`
           ORDER BY sort_order ASC;`,
        );
        if (mysqlRes?.success && Array.isArray(mysqlRes.data) && mysqlRes.data.length > 0) {
          return mysqlRes.data.map((s) => ({
            id: String(s["id"]),
            name: String(s["name"]),
            stage_group: String(s["stage_group"] || "new"),
            sort_order: Number(s["sort_order"] || 0),
            is_follow_up: Boolean(s["is_follow_up"]),
            is_active: Boolean(s["is_active"]),
            color: resolveStageColor(String(s["name"]), (s["color"] as string) || null),
            icon: resolveStageIcon(String(s["name"]), (s["icon"] as string) || null),
            is_system: isSystemStage({
              is_system: s["is_system"] ? Boolean(s["is_system"]) : false,
              name: String(s["name"]),
              id: String(s["id"]),
            }),
          }));
        }
      } catch (err) {
        console.warn("stagesQuery MySQL notice:", err);
      }

      return FALLBACK_STAGES;
    },
  });

export function formatStageSlugOrName(str?: string | null): string {
  if (!str) return "";
  const lower = str.toLowerCase().trim();
  if (lower === "prospect" || lower === "new lead" || lower === "new_lead") return "Prospect";
  if (lower === "follow_up" || lower === "follow-up" || lower === "followup") return "Follow-up";
  if (
    lower === "opportunity_created" ||
    lower === "opportunity-created" ||
    lower === "opportunity created"
  )
    return "Opportunity Created";
  if (lower === "sales_won" || lower === "sales-won" || lower === "sales won") return "Sales won";
  if (lower === "denied_payment" || lower === "denied-payment" || lower === "denied payment")
    return "Denied Payment";
  if (lower === "dnp" || lower.includes("dnp") || lower.includes("did not pick")) return "DNP";
  if (lower === "switched_off" || lower === "switched-off" || lower.includes("switched off"))
    return "Switched Off";
  if (lower === "invalid_number" || lower === "invalid-number" || lower.includes("invalid number"))
    return "Invalid Number";
  if (lower === "not_interested" || lower === "not-interested" || lower.includes("not interested"))
    return "Not Interested";

  return str.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const stageHistoryQuery = (prospectId: string) =>
  queryOptions({
    queryKey: ["stage-history", prospectId],
    queryFn: async (): Promise<StageHistoryEntry[]> => {
      let rows: Record<string, unknown>[] = [];

      // 1. Direct query from local MySQL database `brandium_crm.prospect_stage_history`
      try {
        const mysqlRes = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
            psh.*, 
            st.name AS to_stage_name,
            st_from.name AS from_stage_name,
            COALESCE(prof.full_name, u.name) AS changed_by_name,
            COALESCE(prof.avatar_url, u.avatar_url) AS changed_by_avatar
           FROM \`prospect_stage_history\` psh 
           LEFT JOIN \`stages\` st ON (psh.to_stage_id = st.id OR psh.to_stage_id = REPLACE(st.id, '-', '_') OR psh.to_stage_id = st.name)
           LEFT JOIN \`stages\` st_from ON (psh.from_stage_id = st_from.id OR psh.from_stage_id = REPLACE(st_from.id, '-', '_') OR psh.from_stage_id = st_from.name)
           LEFT JOIN \`users\` u ON psh.changed_by = u.id
           LEFT JOIN \`profiles\` prof ON psh.changed_by = prof.id
           WHERE psh.prospect_id = ? 
           ORDER BY psh.changed_at DESC;`,
          [prospectId],
        );
        if (mysqlRes?.success && Array.isArray(mysqlRes.data)) {
          rows = mysqlRes.data;
        }
      } catch (err) {
        console.warn("stageHistoryQuery MySQL notice:", err);
      }

      const stageMap = new Map<string, string>();
      const nameById = new Map<string, string>();

      const rawEntries = rows.map((row: Record<string, unknown>) => {
        const fromStageId = (row["from_stage_id"] as string) ?? null;
        const toStageId = (row["to_stage_id"] as string) ?? null;
        const changedBy = row["changed_by"] as string | undefined;

        const resolvedFrom =
          (row["from_stage_name"] as string) ||
          (fromStageId ? stageMap.get(fromStageId) || formatStageSlugOrName(fromStageId) : null);
        const resolvedTo =
          (row["to_stage_name"] as string) ||
          (toStageId ? stageMap.get(toStageId) || formatStageSlugOrName(toStageId) : null);
        const changedByName =
          (row["changed_by_name"] as string) ||
          (changedBy ? nameById.get(changedBy) : null) ||
          null;
        const changedByAvatar = (row["changed_by_avatar"] as string) || null;

        return {
          id: String(row["id"]),
          prospect_id: String(row["prospect_id"]),
          from_stage_id: fromStageId,
          to_stage_id: toStageId,
          note: (row["note"] as string) ?? null,
          changed_by: (row["changed_by"] as string) ?? null,
          changed_at: String(row["changed_at"] ?? new Date().toISOString()),
          from_stage_name: resolvedFrom ?? null,
          to_stage_name: resolvedTo ?? null,
          changed_by_name: changedByName,
          changed_by_avatar: changedByAvatar,
        };
      }) as StageHistoryEntry[];

      // Normalize stage names and deduplicate simultaneous twin entries (e.g. DNP vs DNP (Did Not Pick))
      const seen = new Set<string>();
      const finalEntries: StageHistoryEntry[] = [];

      for (const entry of rawEntries) {
        const normStageName = formatStageSlugOrName(entry.to_stage_name || entry.to_stage_id);
        entry.to_stage_name = normStageName;

        const timeSec = Math.floor(new Date(entry.changed_at).getTime() / 10000);
        const key = `${entry.prospect_id}-${normStageName}-${entry.note || ""}-${timeSec}`;

        if (!seen.has(key)) {
          seen.add(key);
          finalEntries.push(entry);
        }
      }

      finalEntries.sort(
        (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime(),
      );

      return finalEntries;
    },
  });

export const stageBadgeVariant = (group?: string | null) => {
  switch (group?.toLowerCase()) {
    case "won":
      return "default" as const;
    case "lost":
      return "destructive" as const;
    case "new":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

export const stageBadgeClass = (group?: string | null) => {
  switch (group?.toLowerCase()) {
    case "won":
      return "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30 text-xs font-semibold px-2.5 py-0.5";
    case "lost":
      return "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 text-xs font-semibold px-2.5 py-0.5";
    case "new":
      return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-semibold px-2.5 py-0.5";
    default:
      return "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold px-2.5 py-0.5";
  }
};

/** Shared mutation wrapper around the stage engine server function. */
export function useChangeProspectStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      prospectId: string;
      stageId: string;
      note?: string;
      stageName?: string;
    }) => {
      // Direct MySQL sync
      let resolvedStageName =
        input.stageName || formatStageSlugOrName(input.stageId) || "Stage Update";
      let realStageId: string = input.stageId;

      try {
        const mysqlStages = await runMySQLQuery<Record<string, unknown>[]>(
          "SELECT id, name FROM `stages` ORDER BY sort_order ASC;",
        );
        if (
          mysqlStages?.success &&
          Array.isArray(mysqlStages.data) &&
          mysqlStages.data.length > 0
        ) {
          const normalize = (str: string) => str.toLowerCase().replace(/[-_]/g, " ").trim();
          const targetNorm = normalize(input.stageName || input.stageId);
          const match = mysqlStages.data.find(
            (s) =>
              (s["id"] as string) === input.stageId ||
              normalize((s["name"] as string) || "") === targetNorm ||
              normalize((s["id"] as string) || "") === targetNorm,
          );
          if (match) {
            realStageId = (match["id"] as string) || realStageId;
            resolvedStageName = (match["name"] as string) || resolvedStageName;
          }
        }
      } catch (err) {
        console.warn("stage lookup MySQL notice:", err);
      }

      // Always update MySQL database `brandium_crm` directly
      if (input.prospectId) {
        try {
          const nowStr = getMySQLTimestamp();

          let fromStageId: string | null = null;
          try {
            const currRes = await runMySQLQuery<Record<string, unknown>[]>(
              `SELECT stage_id FROM \`prospects\` WHERE \`id\` = ? LIMIT 1;`,
              [input.prospectId],
            );
            if (currRes?.success && currRes.data?.[0]) {
              fromStageId = (currRes.data[0]["stage_id"] as string) || null;
            }
          } catch {
            // ignore
          }

          // 1. Update stage_id in MySQL prospects table
          await runMySQLQuery(
            `UPDATE \`prospects\` SET \`stage_id\` = ?, \`updated_at\` = ? WHERE \`id\` = ?;`,
            [realStageId, nowStr, input.prospectId],
          );

          // 2. Insert record into MySQL prospect_stage_history table
          const historyId = generateUUID();
          await runMySQLQuery(
            `INSERT INTO \`prospect_stage_history\` (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_at\`)
             VALUES (?, ?, ?, ?, ?, ?);`,
            [historyId, input.prospectId, fromStageId, realStageId, input.note || null, nowStr],
          );
        } catch (err) {
          console.warn("Direct MySQL stage update notice:", err);
        }
      }

      return { changed: true, stage_name: resolvedStageName };
    },
    onSuccess: (result, input) => {
      if (result?.changed) {
        toast.success(`Stage updated to ${result.stage_name || "new stage"}`);
      } else {
        toast.info("Prospect stage updated");
      }
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["stage-history", input.prospectId] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not update the stage");
    },
  });
}

export const stageManagementSummaryQuery = () =>
  queryOptions({
    queryKey: ["stage-management-summary"],
    queryFn: async () => {
      // 1. Direct query from local MySQL database `brandium_crm`
      try {
        const stagesRes = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
             st.name,
             st.stage_group,
             st.is_active,
             COUNT(p.id) AS prospect_count
           FROM \`stages\` st
           LEFT JOIN \`prospects\` p ON p.stage_id = st.id AND p.is_active = 1
           GROUP BY st.id;`,
        );

        if (stagesRes?.success && Array.isArray(stagesRes.data)) {
          let totalProspects = 0;
          let activeStages = 0;
          let followUpProspects = 0;
          let topStage: string | null = null;
          let maxCount = -1;

          for (const s of stagesRes.data) {
            const cnt = Number(s["prospect_count"] || 0);
            totalProspects += cnt;
            if (s["is_active"]) activeStages++;
            if (s["stage_group"] === "in_progress" || s["name"] === "Follow-up") {
              followUpProspects += cnt;
            }
            if (cnt > maxCount) {
              maxCount = cnt;
              topStage = String(s["name"] || "");
            }
          }

          return {
            total_prospects: totalProspects,
            active_stages: activeStages,
            follow_up_prospects: followUpProspects,
            top_stage: topStage || "Prospect",
          };
        }
      } catch (err) {
        console.warn("stageManagementSummaryQuery MySQL notice:", err);
      }

      return {
        total_prospects: 0,
        active_stages: FALLBACK_STAGES.length,
        follow_up_prospects: 0,
        top_stage: "Prospect",
      };
    },
  });

export const stagesWithCountsQuery = () =>
  queryOptions({
    queryKey: ["stages-with-counts"],
    queryFn: async () => {
      // 1. Direct query from local MySQL database `brandium_crm`
      try {
        const mysqlRes = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT 
             st.*,
             COUNT(p.id) AS prospect_count
           FROM \`stages\` st
           LEFT JOIN \`prospects\` p ON p.stage_id = st.id AND p.is_active = 1
           GROUP BY st.id
           ORDER BY st.sort_order ASC;`,
        );

        if (mysqlRes?.success && Array.isArray(mysqlRes.data) && mysqlRes.data.length > 0) {
          const totalProspects = mysqlRes.data.reduce(
            (acc, row) => acc + Number(row["prospect_count"] || 0),
            0,
          );

          return mysqlRes.data.map((s) => {
            const count = Number(s["prospect_count"] || 0);
            const percentage = totalProspects > 0 ? Math.round((count / totalProspects) * 100) : 0;
            return {
              id: String(s["id"]),
              name: String(s["name"]),
              stage_group: String(s["stage_group"] || "new"),
              sort_order: Number(s["sort_order"] || 0),
              is_follow_up: Boolean(s["is_follow_up"]),
              is_active: Boolean(s["is_active"]),
              color: resolveStageColor(String(s["name"]), (s["color"] as string) || null),
              icon: resolveStageIcon(String(s["name"]), (s["icon"] as string) || null),
              is_system: isSystemStage({
                is_system: s["is_system"] ? Boolean(s["is_system"]) : false,
                name: String(s["name"]),
                id: String(s["id"]),
              }),
              prospect_count: count,
              prospect_percentage: percentage,
            };
          });
        }
      } catch (err) {
        console.warn("stagesWithCountsQuery MySQL notice:", err);
      }

      return FALLBACK_STAGES.map((stg) => ({
        ...stg,
        prospect_count: 0,
        prospect_percentage: 0,
      }));
    },
  });

export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      stage_group: string;
      sort_order: number;
      is_follow_up: boolean;
      color?: string | null;
      icon?: string | null;
    }) => {
      const newId = generateUUID();
      await runMySQLQuery(
        `INSERT INTO \`stages\` (\`id\`, \`name\`, \`stage_group\`, \`sort_order\`, \`is_follow_up\`, \`color\`, \`icon\`, \`is_active\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1);`,
        [
          newId,
          input.name,
          input.stage_group,
          input.sort_order,
          input.is_follow_up ? 1 : 0,
          input.color || null,
          input.icon || null,
        ],
      );
      return { id: newId, name: input.name };
    },
    onSuccess: () => {
      toast.success("Stage created successfully");
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      queryClient.invalidateQueries({ queryKey: ["stages-with-counts"] });
      queryClient.invalidateQueries({ queryKey: ["stage-management-summary"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not create stage");
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      stage_group?: string;
      sort_order?: number;
      is_follow_up?: boolean;
      is_active?: boolean;
      color?: string | null;
      icon?: string | null;
    }) => {
      const fields: string[] = [];
      const values: unknown[] = [];
      if (input.name !== undefined) {
        fields.push("`name` = ?");
        values.push(input.name);
      }
      if (input.stage_group !== undefined) {
        fields.push("`stage_group` = ?");
        values.push(input.stage_group);
      }
      if (input.sort_order !== undefined) {
        fields.push("`sort_order` = ?");
        values.push(input.sort_order);
      }
      if (input.is_follow_up !== undefined) {
        fields.push("`is_follow_up` = ?");
        values.push(input.is_follow_up ? 1 : 0);
      }
      if (input.is_active !== undefined) {
        fields.push("`is_active` = ?");
        values.push(input.is_active ? 1 : 0);
      }
      if (input.color !== undefined) {
        fields.push("`color` = ?");
        values.push(input.color);
      }
      if (input.icon !== undefined) {
        fields.push("`icon` = ?");
        values.push(input.icon);
      }

      if (fields.length > 0) {
        values.push(input.id);
        await runMySQLQuery(
          `UPDATE \`stages\` SET ${fields.join(", ")}, \`updated_at\` = NOW() WHERE \`id\` = ?;`,
          values,
        );
      }
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Stage updated successfully");
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      queryClient.invalidateQueries({ queryKey: ["stages-with-counts"] });
      queryClient.invalidateQueries({ queryKey: ["stage-management-summary"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not update stage");
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stageId: string) => {
      await runMySQLQuery(`DELETE FROM \`stages\` WHERE \`id\` = ?;`, [stageId]);
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Stage deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      queryClient.invalidateQueries({ queryKey: ["stages-with-counts"] });
      queryClient.invalidateQueries({ queryKey: ["stage-management-summary"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not delete stage");
    },
  });
}

export type StageNoteItem = {
  id?: string;
  text: string;
  createdAt?: string | null;
  createdByName?: string | null;
  createdByAvatar?: string | null;
};

export function parseNotesToItems(
  notes?: string | null,
  fallbackDate?: string | null,
  fallbackAuthor?: string | null,
  fallbackAvatar?: string | null,
): StageNoteItem[] {
  if (!notes || typeof notes !== "string") return [];

  const cleaned = notes
    .replace(/\[Artist:\s*[^\]]+\]/gi, "")
    .replace(/\[Agent:\s*[^\]]+\]/gi, "")
    .trim();

  if (!cleaned) return [];

  // If JSON array string e.g. [{"text": "...", "createdAt": "..."}, ...] OR ["item 1", "item 2"]
  if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        const items: StageNoteItem[] = parsed
          .map((item) => {
            if (typeof item === "object" && item !== null) {
              const text = String(item["text"] || item["note"] || "").trim();
              if (!text) return null;
              return {
                id: item["id"] ? String(item["id"]) : undefined,
                text,
                createdAt:
                  (item["createdAt"] as string) ||
                  (item["created_at"] as string) ||
                  fallbackDate ||
                  null,
                createdByName:
                  (item["createdByName"] as string) ||
                  (item["author"] as string) ||
                  fallbackAuthor ||
                  null,
                createdByAvatar:
                  (item["createdByAvatar"] as string) || fallbackAvatar || null,
              };
            }
            if (typeof item === "string" && item.trim()) {
              return {
                text: item.trim(),
                createdAt: fallbackDate || null,
                createdByName: fallbackAuthor || null,
                createdByAvatar: fallbackAvatar || null,
              };
            }
            return null;
          })
          .filter((item): item is StageNoteItem => item !== null);

        if (items.length > 0) return items;
      }
    } catch {
      // Fallback to text parsing
    }
  }

  // Split by newlines or semicolon / bullet lists
  const lines = cleaned
    .split(/\r?\n+/)
    .map((line) => line.replace(/^[\s*•\-–—\d.)]+/, "").trim())
    .filter(Boolean);

  if (lines.length > 0) {
    return lines.map((line) => ({
      text: line,
      createdAt: fallbackDate || null,
      createdByName: fallbackAuthor || null,
      createdByAvatar: fallbackAvatar || null,
    }));
  }

  return [
    {
      text: cleaned,
      createdAt: fallbackDate || null,
      createdByName: fallbackAuthor || null,
      createdByAvatar: fallbackAvatar || null,
    },
  ];
}

export function parseNotesToArray(notes?: string | null): string[] {
  return parseNotesToItems(notes).map((item) => item.text);
}

export async function addStageNote(params: {
  prospectId: string;
  historyId?: string | null;
  stageId?: string | null;
  note: string;
  userId?: string | null;
  userName?: string | null;
  userAvatar?: string | null;
}): Promise<boolean> {
  const { prospectId, historyId, stageId, note, userId, userName, userAvatar } = params;
  if (!prospectId || !note.trim()) return false;

  const nowStr = getMySQLTimestamp();
  const trimmedNote = note.trim();

  const newNoteItem: StageNoteItem = {
    id: generateUUID(),
    text: trimmedNote,
    createdAt: nowStr,
    createdByName: userName || null,
    createdByAvatar: userAvatar || null,
  };

  try {
    // If a specific historyId is provided and it's not the virtual 'initial-' item:
    if (historyId && !historyId.startsWith("initial-")) {
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT note FROM \`prospect_stage_history\` WHERE \`id\` = ? LIMIT 1;`,
        [historyId],
      );
      const existingRawNote = (res.data?.[0]?.["note"] as string) || null;
      const currentItems = parseNotesToItems(existingRawNote);
      const updatedItems = [...currentItems, newNoteItem];
      const newNotePayload = JSON.stringify(updatedItems);

      await runMySQLQuery(
        `UPDATE \`prospect_stage_history\` SET \`note\` = ?, \`changed_at\` = ? WHERE \`id\` = ?;`,
        [newNotePayload, nowStr, historyId],
      );
    } else {
      // Check if history has any entry for this prospect
      const histRes = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT id, note FROM \`prospect_stage_history\` WHERE \`prospect_id\` = ? ORDER BY \`changed_at\` DESC LIMIT 1;`,
        [prospectId],
      );

      if (histRes?.success && histRes.data?.[0]?.["id"] && !historyId?.startsWith("initial-")) {
        const targetId = String(histRes.data[0]["id"]);
        const existingRawNote = (histRes.data[0]["note"] as string) || null;
        const currentItems = parseNotesToItems(existingRawNote);
        const updatedItems = [...currentItems, newNoteItem];
        const newNotePayload = JSON.stringify(updatedItems);

        await runMySQLQuery(
          `UPDATE \`prospect_stage_history\` SET \`note\` = ?, \`changed_at\` = ? WHERE \`id\` = ?;`,
          [newNotePayload, nowStr, targetId],
        );
      } else {
        // Append to prospects.notes
        const pRes = await runMySQLQuery<Record<string, unknown>[]>(
          `SELECT notes, stage_id FROM \`prospects\` WHERE \`id\` = ? LIMIT 1;`,
          [prospectId],
        );
        const existingNotes = (pRes.data?.[0]?.["notes"] as string) || null;
        const currentItems = parseNotesToItems(existingNotes);
        const updatedItems = [...currentItems, newNoteItem];
        const newNotePayload = JSON.stringify(updatedItems);

        await runMySQLQuery(
          `UPDATE \`prospects\` SET \`notes\` = ?, \`updated_at\` = ? WHERE \`id\` = ?;`,
          [newNotePayload, nowStr, prospectId],
        );

        // Also insert into prospect_stage_history for full timeline tracking
        const currentStageId = String(stageId || pRes.data?.[0]?.["stage_id"] || "prospect");
        const newHistId = generateUUID();
        await runMySQLQuery(
          `INSERT INTO \`prospect_stage_history\` (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`note\`, \`changed_by\`, \`changed_at\`)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            newHistId,
            prospectId,
            currentStageId,
            currentStageId,
            newNotePayload,
            userId || null,
            nowStr,
          ],
        );
      }
    }

    // Keep prospects updated_at and notes in sync
    await runMySQLQuery(
      `UPDATE \`prospects\` SET \`updated_at\` = ? WHERE \`id\` = ?;`,
      [nowStr, prospectId],
    );

    return true;
  } catch (err) {
    console.error("addStageNote error:", err);
    return false;
  }
}

export async function deleteStageNote(params: {
  prospectId: string;
  historyId?: string | null;
  noteIndex: number;
}): Promise<boolean> {
  const { prospectId, historyId, noteIndex } = params;
  if (!prospectId) return false;

  const nowStr = getMySQLTimestamp();

  try {
    if (historyId && !historyId.startsWith("initial-")) {
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT note FROM \`prospect_stage_history\` WHERE \`id\` = ? LIMIT 1;`,
        [historyId],
      );
      const existingRawNote = (res.data?.[0]?.["note"] as string) || null;
      const currentItems = parseNotesToItems(existingRawNote);
      const updatedItems = currentItems.filter((_, idx) => idx !== noteIndex);
      const newNotePayload = updatedItems.length > 0 ? JSON.stringify(updatedItems) : null;

      await runMySQLQuery(
        `UPDATE \`prospect_stage_history\` SET \`note\` = ?, \`changed_at\` = ? WHERE \`id\` = ?;`,
        [newNotePayload, nowStr, historyId],
      );
    } else {
      const pRes = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT notes FROM \`prospects\` WHERE \`id\` = ? LIMIT 1;`,
        [prospectId],
      );
      const existingNotes = (pRes.data?.[0]?.["notes"] as string) || null;
      const currentItems = parseNotesToItems(existingNotes);
      const updatedItems = currentItems.filter((_, idx) => idx !== noteIndex);
      const newNotePayload = updatedItems.length > 0 ? JSON.stringify(updatedItems) : null;

      await runMySQLQuery(
        `UPDATE \`prospects\` SET \`notes\` = ?, \`updated_at\` = ? WHERE \`id\` = ?;`,
        [newNotePayload, nowStr, prospectId],
      );
    }

    return true;
  } catch (err) {
    console.error("deleteStageNote error:", err);
    return false;
  }
}

export async function deleteStageHistoryEntry(
  historyId: string,
  prospectId: string,
): Promise<boolean> {
  if (!historyId) return false;

  try {
    await runMySQLQuery("DELETE FROM `prospect_stage_history` WHERE `id` = ?;", [historyId]);

    if (prospectId) {
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT to_stage_id FROM `prospect_stage_history` WHERE `prospect_id` = ? ORDER BY `changed_at` DESC LIMIT 1;",
        [prospectId],
      );
      const latestStageId = String(res.data?.[0]?.["to_stage_id"] || "prospect");
      await runMySQLQuery(
        "UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;",
        [latestStageId, getMySQLTimestamp(), prospectId],
      );
    }
  } catch (err) {
    console.warn("deleteStageHistoryEntry notice:", err);
  }

  return true;
}
