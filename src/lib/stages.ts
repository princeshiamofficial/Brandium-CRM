import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { changeProspectStage, createStage, updateStage, deleteStage } from "@/lib/stages.functions";
import { runMySQLQuery } from "@/lib/mysql-api";
import { generateUUID } from "@/lib/mysql-client";

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
};

export const FALLBACK_STAGES: Stage[] = [
  {
    id: "prospect",
    name: "Prospect",
    stage_group: "new",
    sort_order: 1,
    is_follow_up: false,
    is_active: true,
  },
  {
    id: "follow-up",
    name: "Follow-up",
    stage_group: "in_progress",
    sort_order: 2,
    is_follow_up: true,
    is_active: true,
  },
  {
    id: "opportunity-created",
    name: "Opportunity Created",
    stage_group: "in_progress",
    sort_order: 3,
    is_follow_up: false,
    is_active: true,
  },
  {
    id: "sales-won",
    name: "Sales won",
    stage_group: "won",
    sort_order: 4,
    is_follow_up: false,
    is_active: true,
  },
  {
    id: "dnp",
    name: "DNP (Did Not Pick)",
    stage_group: "unreachable",
    sort_order: 5,
    is_follow_up: false,
    is_active: true,
  },
  {
    id: "switched-off",
    name: "Switched Off",
    stage_group: "unreachable",
    sort_order: 6,
    is_follow_up: false,
    is_active: true,
  },
  {
    id: "invalid-number",
    name: "Invalid Number",
    stage_group: "unreachable",
    sort_order: 7,
    is_follow_up: false,
    is_active: true,
  },
  {
    id: "meeting-scheduled",
    name: "Meeting Scheduled",
    stage_group: "in_progress",
    sort_order: 8,
    is_follow_up: true,
    is_active: true,
  },
  {
    id: "quotation-sent",
    name: "Quotation Sent",
    stage_group: "in_progress",
    sort_order: 9,
    is_follow_up: false,
    is_active: true,
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
            color: (s["color"] as string) || null,
            icon: (s["icon"] as string) || null,
            is_system: Boolean(s["is_system"]),
          }));
        }
      } catch (err) {
        console.warn("stagesQuery MySQL notice:", err);
      }

      try {
        const { data, error } = await supabase
          .from("stages")
          .select(
            "id, name, stage_group, sort_order, is_follow_up, is_active, color, icon, is_system",
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        if (error || !data || data.length === 0) return FALLBACK_STAGES;
        return data as Stage[];
      } catch {
        return FALLBACK_STAGES;
      }
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
          `SELECT psh.*, st.name AS to_stage_name 
           FROM \`prospect_stage_history\` psh 
           LEFT JOIN \`stages\` st ON psh.to_stage_id = st.id 
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

      // 2. Fallback to Supabase if MySQL yielded no rows
      if (rows.length === 0) {
        try {
          const { data, error } = await supabase
            .from("prospect_stage_history")
            .select("id, prospect_id, from_stage_id, to_stage_id, note, changed_by, changed_at")
            .eq("prospect_id", prospectId)
            .order("changed_at", { ascending: false });

          if (!error && data) {
            rows = data as Record<string, unknown>[];
          }
        } catch (err) {
          console.warn("stageHistoryQuery Supabase notice:", err);
        }
      }

      // Fetch stages list to resolve stage UUIDs to human names
      const stageMap = new Map<string, string>();
      try {
        const { data: stagesList } = await supabase.from("stages").select("id, name");
        const list = (stagesList || []) as Array<Record<string, unknown>>;
        list.forEach((s) => {
          const sId = (s["id"] as string) || "";
          const sName = (s["name"] as string) || "";
          if (sId && sName) stageMap.set(sId, sName);
        });
      } catch {
        // Ignore
      }

      // changed_by references auth.users, so names come from profiles separately
      const actorIds = Array.from(
        new Set(
          rows.map((row: Record<string, unknown>) => row["changed_by"]).filter(Boolean) as string[],
        ),
      );
      const nameById = new Map<string, string>();
      if (actorIds.length > 0) {
        try {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", actorIds);
          for (const profile of (profiles as Record<string, unknown>[] | null) ?? []) {
            const id = String(profile["id"] ?? "");
            const fullName = profile["full_name"] as string | null;
            const email = profile["email"] as string | null;
            nameById.set(id, fullName || email || "Unknown");
          }
        } catch {
          // Ignore
        }
      }

      const rawEntries = rows.map((row: Record<string, unknown>) => {
        const fromStageId = (row["from_stage_id"] as string) ?? null;
        const toStageId = (row["to_stage_id"] as string) ?? null;
        const changedBy = row["changed_by"] as string | undefined;

        const resolvedFrom = fromStageId
          ? stageMap.get(fromStageId) || formatStageSlugOrName(fromStageId)
          : null;
        const resolvedTo = toStageId
          ? stageMap.get(toStageId) || formatStageSlugOrName(toStageId)
          : null;

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
          changed_by_name: changedBy ? nameById.get(changedBy) : undefined,
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
  const changeStage = useServerFn(changeProspectStage);

  return useMutation({
    mutationFn: async (input: {
      prospectId: string;
      stageId: string;
      note?: string;
      stageName?: string;
    }) => {
      const isValidUuid = (val: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      if (isValidUuid(input.prospectId) && isValidUuid(input.stageId)) {
        try {
          const res = await changeStage({
            data: {
              prospectId: input.prospectId,
              stageId: input.stageId,
              ...(input.note ? { note: input.note } : {}),
            },
          });
          if (res) return res;
        } catch (err) {
          console.warn("Server changeProspectStage notice, applying direct update fallback:", err);
        }
      }

      // Direct MySQL & Supabase sync
      let resolvedStageName =
        input.stageName || formatStageSlugOrName(input.stageId) || "Stage Update";
      let realStageId: string = input.stageId;

      try {
        const { data: allStages } = await supabase.from("stages").select("id, name");
        if (allStages && allStages.length > 0) {
          const normalize = (str: string) => str.toLowerCase().replace(/[-_]/g, " ").trim();
          const targetNorm = normalize(input.stageName || input.stageId);
          const match = (allStages as Array<Record<string, unknown>>).find(
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
      } catch {
        // Ignore
      }

      // Always update MySQL database `brandium_crm` directly
      if (input.prospectId) {
        try {
          const nowStr = new Date().toISOString().slice(0, 19).replace("T", " ");

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

        // Also try Supabase update if cloud Supabase is active
        try {
          const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
            stage_name: resolvedStageName,
            stage_id: realStageId,
          };
          await supabase.from("prospects").update(updatePayload).eq("id", input.prospectId);
          await supabase.from("prospect_stage_history").insert({
            prospect_id: input.prospectId,
            to_stage_id: realStageId,
            note: input.note || null,
            changed_at: new Date().toISOString(),
          });
        } catch {
          // ignore
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
           LEFT JOIN \`prospects\` p ON (p.stage_id = st.id OR p.stage_name = st.name) AND p.is_active = 1
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

      // 2. Fallback to Supabase RPC
      try {
        const { data, error } = await supabase.rpc("get_stage_management_summary");
        if (!error && data) {
          return data as {
            total_prospects: number;
            active_stages: number;
            follow_up_prospects: number;
            top_stage: string | null;
          };
        }
      } catch {
        // ignore
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
           LEFT JOIN \`prospects\` p ON (p.stage_id = st.id OR p.stage_name = st.name) AND p.is_active = 1
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
              color: (s["color"] as string) || null,
              icon: (s["icon"] as string) || null,
              is_system: Boolean(s["is_system"]),
              prospect_count: count,
              prospect_percentage: percentage,
            };
          });
        }
      } catch (err) {
        console.warn("stagesWithCountsQuery MySQL notice:", err);
      }

      // 2. Fallback to Supabase RPC
      try {
        const { data, error } = await supabase.rpc("get_stages_with_counts");
        const rpcData = data as unknown as unknown[];
        if (!error && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
          return rpcData as (Stage & { prospect_count: number; prospect_percentage: number })[];
        }
      } catch {
        // ignore
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
  const createStageFn = useServerFn(createStage);

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
      try {
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
      } catch (err) {
        console.warn("Direct MySQL stage creation notice:", err);
      }
      try {
        await createStageFn({ data: input });
      } catch {
        // ignore
      }
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
  const updateStageFn = useServerFn(updateStage);

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
      try {
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
      } catch (err) {
        console.warn("Direct MySQL stage update notice:", err);
      }
      try {
        await updateStageFn({ data: input });
      } catch {
        // ignore
      }
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Stage updated successfully");
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      queryClient.invalidateQueries({ queryKey: ["stages-with-counts"] });
      queryClient.invalidateQueries({ queryKey: ["stage-management-summary"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not update stage");
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();
  const deleteStageFn = useServerFn(deleteStage);

  return useMutation({
    mutationFn: async (stageId: string) => {
      try {
        await runMySQLQuery(`DELETE FROM \`stages\` WHERE \`id\` = ?;`, [stageId]);
      } catch (err) {
        console.warn("Direct MySQL stage delete notice:", err);
      }
      try {
        const res = await deleteStageFn({ data: { id: stageId } });
        if (res) return res;
      } catch (err) {
        console.warn("Server deleteStage notice, trying direct client delete:", err);
      }

      // Direct fallback delete from stages table
      const { error } = await supabase.from("stages").delete().eq("id", stageId);
      if (error) {
        // If foreign key constraint or system stage, deactivate it instead
        await supabase.from("stages").update({ is_active: false }).eq("id", stageId);
      }
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Stage deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["stages"] });
      queryClient.invalidateQueries({ queryKey: ["stages-with-counts"] });
      queryClient.invalidateQueries({ queryKey: ["stage-management-summary"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not delete stage");
    },
  });
}

export async function deleteStageHistoryEntry(
  historyId: string,
  prospectId: string,
): Promise<boolean> {
  if (!historyId) return false;

  try {
    const { error } = await supabase.from("prospect_stage_history").delete().eq("id", historyId);
    if (error && !isNaN(Number(historyId))) {
      await supabase.from("prospect_stage_history").delete().eq("id", Number(historyId));
    }
  } catch (err) {
    console.warn("deleteStageHistoryEntry notice:", err);
  }

  // Update prospect's current stage to latest remaining history stage if needed
  if (prospectId) {
    try {
      const { data: remaining } = await supabase
        .from("prospect_stage_history")
        .select("to_stage_id, changed_at")
        .eq("prospect_id", prospectId)
        .order("changed_at", { ascending: false })
        .limit(1);

      const remList = (remaining || []) as Array<Record<string, unknown>>;
      const firstRem = remList[0];
      if (firstRem && firstRem["to_stage_id"]) {
        const latestStageId = String(firstRem["to_stage_id"]);
        const { data: stg } = await supabase
          .from("stages")
          .select("name")
          .eq("id", latestStageId)
          .maybeSingle();
        const stgObj = stg as Record<string, unknown> | null;
        await supabase
          .from("prospects")
          .update({
            stage_id: latestStageId,
            stage_name: (stgObj?.["name"] as string) || "Prospect",
            updated_at: new Date().toISOString(),
          })
          .eq("id", prospectId);
      } else {
        await supabase
          .from("prospects")
          .update({
            stage_name: "Prospect",
            updated_at: new Date().toISOString(),
          })
          .eq("id", prospectId);
      }
    } catch {
      // Ignore
    }
  }

  return true;
}
