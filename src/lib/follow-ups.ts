import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import { fetchCrmUsers } from "@/lib/admin-users";
import { runMySQLQuery } from "@/lib/mysql-api";
import { addStageNote } from "@/lib/stages";
import { generateUUID, getMySQLTimestamp } from "@/lib/mysql-client";

export const agentsQuery = () =>
  queryOptions({
    queryKey: ["agent-profiles"],
    queryFn: async () => {
      try {
        const users = await fetchCrmUsers();
        if (users && users.length > 0) {
          return users.map((u) => ({
            id: u.id,
            name: `${u.name}${u.role ? ` (${u.role})` : ""}`,
          }));
        }
      } catch {
        // Fallback
      }

      return [
        { id: "usr-admin-1", name: "Admin (Executive)" },
        { id: "usr-agent-1", name: "Tanvir Hasan (Agent)" },
        { id: "usr-agent-2", name: "Nusrat Jahan (Agent)" },
        { id: "usr-agent-3", name: "Rafiqul Islam (Agent)" },
      ];
    },
  });

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      prospect_id: string;
      assigned_to: string;
      created_by: string;
      due_at: string;
      note?: string;
    }) => {
      const now = getMySQLTimestamp();
      const dueLabel = format(new Date(input.due_at), "dd MMM yyyy, hh:mm a");
      const historyId = generateUUID();

      try {
        // Resolve "Follow-up" stage ID from MySQL
        const stageRes = await runMySQLQuery<Record<string, unknown>[]>(
          "SELECT `id` FROM `stages` WHERE LOWER(TRIM(`name`)) LIKE '%follow%' LIMIT 1;",
        );
        const followUpStageId =
          stageRes?.success && stageRes.data?.[0] ? String(stageRes.data[0]["id"]) : "follow-up";

        // Get prospect's current stage for transition history
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
          // ignore
        }

        // Update prospect stage to Follow-up
        await runMySQLQuery(
          "UPDATE `prospects` SET `stage_id` = ?, `updated_at` = ? WHERE `id` = ?;",
          [followUpStageId, now, input.prospect_id],
        );

        // The follow-up itself is stored on this stage history row
        await runMySQLQuery(
          `INSERT INTO \`prospect_stage_history\` (\`id\`, \`prospect_id\`, \`from_stage_id\`, \`to_stage_id\`, \`changed_by\`, \`note\`, \`changed_at\`, \`follow_up_due_at\`, \`follow_up_assigned_to\`, \`follow_up_status\`)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending');`,
          [
            historyId,
            input.prospect_id,
            fromStageId,
            followUpStageId,
            input.created_by,
            `Follow-up scheduled for ${dueLabel}${input.note ? ` — ${input.note}` : ""}`,
            now,
            getMySQLTimestamp(new Date(input.due_at)),
            input.assigned_to,
          ],
        );

        // Activity log
        await runMySQLQuery(
          `INSERT INTO \`activities\` (\`id\`, \`prospect_id\`, \`actor_id\`, \`activity_type\`, \`message\`, \`created_at\`)
           VALUES (?, ?, ?, 'follow_up_created', ?, ?);`,
          [
            generateUUID(),
            input.prospect_id,
            input.created_by,
            `New follow-up task scheduled for ${dueLabel}${input.note ? ` — ${input.note}` : ""}`,
            now,
          ],
        );
      } catch (err) {
        console.warn("useCreateFollowUp MySQL notice:", err);
      }

      return { id: historyId, prospect_id: input.prospect_id };
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      void queryClient.invalidateQueries({ queryKey: ["prospects"] });
      void queryClient.invalidateQueries({ queryKey: ["prospects-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (data?.prospect_id) {
        void queryClient.invalidateQueries({ queryKey: ["stage-history", data.prospect_id] });
      }
    },
  });
}

// -----------------------------------------------------------------------------
// Follow-up board (ERPAPP /follow-up clone). A follow-up is a
// `prospect_stage_history` row with `follow_up_due_at` set; the board shows the
// latest one per prospect, grouped by `follow_up_status` into `followup_stages`.
// -----------------------------------------------------------------------------

export type FollowUpStage = { id: string; name: string; color: string };

export type FollowUpBoardItem = {
  id: string;
  prospect_id: string;
  due_at: string;
  status: string;
  assigned_to: string | null;
  agent_name: string;
  agent_avatar: string | null;
  created_by: string | null;
  creator_name: string;
  creator_avatar: string | null;
  changed_at: string;
  note: string | null;
  contact_name: string;
  business_name: string;
  phone: string;
  address: string;
};

const DEFAULT_FOLLOW_UP_STAGES: FollowUpStage[] = [
  { id: "stage-pending", name: "Pending", color: "#3B82F6" },
  { id: "stage-in-progress", name: "In Progress", color: "#8B5CF6" },
  { id: "stage-completed", name: "Completed", color: "#10B981" },
  { id: "stage-canceled", name: "Canceled", color: "#EF4444" },
];

const normalizeStatus = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace("cancelled", "canceled");

/** Column for a follow-up status; legacy values ("pending", "cancelled") match by name. */
export const followUpStageFor = (status: string, stages: FollowUpStage[]) =>
  stages.find((s) => normalizeStatus(s.name) === normalizeStatus(status || "")) || stages[0];

export const followUpStagesQueryOptions = () =>
  queryOptions({
    queryKey: ["follow-up-stages"],
    queryFn: async (): Promise<FollowUpStage[]> => {
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        "SELECT `id`, `name`, `color` FROM `followup_stages` ORDER BY `position` ASC, `name` ASC;",
      );
      const rows = (res.data || []) as Record<string, unknown>[];
      if (!res.success || rows.length === 0) return DEFAULT_FOLLOW_UP_STAGES;
      return rows.map((r) => ({
        id: String(r["id"]),
        name: String(r["name"]),
        color: String(r["color"] || "#64748B"),
      }));
    },
  });

export const followUpBoardQueryOptions = (userId: string | undefined, isAdmin: boolean) =>
  queryOptions({
    queryKey: ["follow-ups", "board", userId, isAdmin],
    queryFn: async (): Promise<FollowUpBoardItem[]> => {
      const res = await runMySQLQuery<Record<string, unknown>[]>(
        `SELECT h.id, h.prospect_id, h.follow_up_due_at, h.follow_up_status, h.follow_up_assigned_to,
                h.changed_by, h.changed_at, h.note,
                p.contact_name, p.business_name, p.phone, p.address,
                COALESCE(prof.full_name, u.name) AS agent_name,
                COALESCE(prof.avatar_url, u.avatar_url) AS agent_avatar,
                COALESCE(cprof.full_name, c.name) AS creator_name,
                COALESCE(cprof.avatar_url, c.avatar_url) AS creator_avatar
         FROM \`prospect_stage_history\` h
         JOIN \`prospects\` p ON p.id = h.prospect_id
         LEFT JOIN \`users\` u ON u.id = h.follow_up_assigned_to
         LEFT JOIN \`profiles\` prof ON prof.id = h.follow_up_assigned_to
         LEFT JOIN \`users\` c ON c.id = h.changed_by
         LEFT JOIN \`profiles\` cprof ON cprof.id = h.changed_by
         WHERE h.follow_up_due_at IS NOT NULL AND (p.is_active = 1 OR p.is_active IS NULL)
         ORDER BY h.changed_at DESC;`,
      );
      if (!res.success) throw new Error(res.error || "Failed to load follow-ups");

      const seen = new Set<string>();
      const items: FollowUpBoardItem[] = [];
      for (const r of (res.data || []) as Record<string, unknown>[]) {
        const prospectId = String(r["prospect_id"]);
        // Rows are newest first: keep only the latest follow-up per prospect
        if (seen.has(prospectId)) continue;
        seen.add(prospectId);
        const assignedTo = r["follow_up_assigned_to"] ? String(r["follow_up_assigned_to"]) : null;
        const createdBy = r["changed_by"] ? String(r["changed_by"]) : null;
        if (!isAdmin && userId && assignedTo !== userId && createdBy !== userId) continue;
        items.push({
          id: String(r["id"]),
          prospect_id: prospectId,
          due_at: String(r["follow_up_due_at"]),
          status: String(r["follow_up_status"] || "pending"),
          assigned_to: assignedTo,
          agent_name: String(r["agent_name"] || "Unassigned"),
          agent_avatar: r["agent_avatar"] ? String(r["agent_avatar"]) : null,
          created_by: createdBy,
          creator_name: String(r["creator_name"] || "System"),
          creator_avatar: r["creator_avatar"] ? String(r["creator_avatar"]) : null,
          changed_at: String(r["changed_at"] || ""),
          note: r["note"] ? String(r["note"]) : null,
          contact_name: String(r["contact_name"] || ""),
          business_name: String(r["business_name"] || ""),
          phone: String(r["phone"] || ""),
          address: String(r["address"] || ""),
        });
      }
      return items;
    },
  });

/** ERPAPP `updateFollowUpStatusAction`: optional status change plus a timeline note. */
export function useUpdateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      item: FollowUpBoardItem;
      status: string;
      notes: string;
      /** Next follow-up date (`datetime-local` value); unchanged when it matches the current one. */
      nextDueAt?: string | undefined;
      userId: string | undefined;
      userName: string;
    }) => {
      const { item, status, notes, nextDueAt, userId, userName } = input;
      const statusChanged = normalizeStatus(item.status) !== normalizeStatus(status);
      const nextDue = nextDueAt ? new Date(nextDueAt) : null;
      if (nextDue && Number.isNaN(nextDue.getTime())) throw new Error("Invalid follow-up date.");
      const newDueAt = nextDue ? getMySQLTimestamp(nextDue) : null;
      const dueChanged = !!newDueAt && newDueAt.slice(0, 16) !== item.due_at.slice(0, 16);
      if (statusChanged || dueChanged) {
        const res = await runMySQLQuery(
          "UPDATE `prospect_stage_history` SET `follow_up_status` = ?, `follow_up_due_at` = COALESCE(?, `follow_up_due_at`) WHERE `id` = ?;",
          [status, dueChanged ? newDueAt : null, item.id],
        );
        if (!res.success) throw new Error(res.error || "Failed to update follow-up");
      }
      const outcome = [
        statusChanged ? `Status changed to ${status}` : "Activity Updated",
        dueChanged && nextDue ? `next follow-up ${format(nextDue, "dd MMM yyyy, hh:mm a")}` : "",
      ]
        .filter(Boolean)
        .join(", ");
      const saved = await addStageNote({
        prospectId: item.prospect_id,
        historyId: item.id,
        note: notes.trim(),
        userId: userId || null,
        userName,
      });
      if (!saved) throw new Error("Failed to save the note");
      await runMySQLQuery(
        `INSERT INTO \`activities\` (\`id\`, \`prospect_id\`, \`actor_id\`, \`activity_type\`, \`message\`, \`created_at\`)
         VALUES (?, ?, ?, 'follow_up_updated', ?, ?);`,
        [
          generateUUID(),
          item.prospect_id,
          userId || null,
          `${outcome} — ${notes.trim()}`,
          getMySQLTimestamp(),
        ],
      );
    },
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      void queryClient.invalidateQueries({ queryKey: ["activities"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["stage-history", input.item.prospect_id] });
    },
  });
}

/** Removes a prospect from the board; its stage history entries stay. */
export function useRemoveFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prospectId: string) => {
      const res = await runMySQLQuery(
        `UPDATE \`prospect_stage_history\`
         SET \`follow_up_due_at\` = NULL, \`follow_up_assigned_to\` = NULL, \`follow_up_status\` = NULL
         WHERE \`prospect_id\` = ? AND \`follow_up_due_at\` IS NOT NULL;`,
        [prospectId],
      );
      if (!res.success) throw new Error(res.error || "Failed to delete follow-up");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Admin management of the board columns (`followup_stages`).

const invalidateFollowUpStages = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ["follow-up-stages"] });
  void queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
};

const runStageWrite = async (sql: string, params: unknown[]) => {
  const res = await runMySQLQuery(sql, params);
  if (!res.success) {
    throw new Error(
      /duplicate/i.test(res.error || "")
        ? "A column with this name already exists."
        : res.error || "Failed to save column",
    );
  }
};

/** Adds a column, or renames/recolours one; `itemIds` (cards now in it) follow a rename. */
export function useSaveFollowUpStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string | undefined;
      name: string;
      color: string;
      position: number;
      itemIds: string[];
      userId?: string | undefined;
    }) => {
      const name = input.name.trim();
      if (!name) throw new Error("Column name is required.");
      if (!/^#[0-9a-f]{6}$/i.test(input.color)) throw new Error("Pick a valid colour.");
      if (!input.id) {
        await runStageWrite(
          "INSERT INTO `followup_stages` (`id`, `name`, `color`, `position`, `is_default`, `created_by`) VALUES (?, ?, ?, ?, 0, ?);",
          [generateUUID(), name, input.color, input.position, input.userId || null],
        );
        return;
      }
      await runStageWrite("UPDATE `followup_stages` SET `name` = ?, `color` = ? WHERE `id` = ?;", [
        name,
        input.color,
        input.id,
      ]);
      if (input.itemIds.length > 0) {
        await runStageWrite(
          `UPDATE \`prospect_stage_history\` SET \`follow_up_status\` = ?
           WHERE \`id\` IN (${input.itemIds.map(() => "?").join(", ")});`,
          [name, ...input.itemIds],
        );
      }
    },
    onSuccess: () => invalidateFollowUpStages(queryClient),
  });
}

export function useDeleteFollowUpStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      runStageWrite("DELETE FROM `followup_stages` WHERE `id` = ?;", [id]),
    onSuccess: () => invalidateFollowUpStages(queryClient),
  });
}

/** Saves the column order: `position` = index in `orderedIds`. */
export function useReorderFollowUpStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      for (const [position, id] of orderedIds.entries()) {
        await runStageWrite("UPDATE `followup_stages` SET `position` = ? WHERE `id` = ?;", [
          position,
          id,
        ]);
      }
    },
    onSuccess: () => invalidateFollowUpStages(queryClient),
  });
}
