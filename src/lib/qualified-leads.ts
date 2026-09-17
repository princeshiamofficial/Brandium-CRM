import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { runMySQLQuery } from "@/lib/mysql-api";
import { generateUUID, getMySQLTimestamp } from "@/lib/mysql-client";
import { resolveStageColor, resolveStageIcon } from "@/lib/stages";

export type QualifiedLead = {
  id: string;
  contact_name: string;
  business_name: string | null;
  designation: string | null;
  phone: string | null;
  alternative_phone: string | null;
  email: string | null;
  address: string | null;
  website_url: string | null;
  logo_url: string | null;
  service_id: string | null;
  service_name?: string | undefined;
  stage_id: string | null;
  stage_name?: string | undefined;
  stage_color?: string | null | undefined;
  stage_icon?: string | null | undefined;
  is_qualified: boolean;
  estimated_budget: number | null;
  qualification_notes: string | null;
  assigned_to: string | null;
  assigned_agent_name?: string | undefined;
  assigned_agent_avatar?: string | null | undefined;
  assigned_artist_id?: string | null | undefined;
  assigned_artist_name?: string | undefined;
  assigned_artist_avatar?: string | null | undefined;
  created_by: string | null;
  creator_name?: string | undefined;
  creator_avatar?: string | null | undefined;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type QualifiedLeadsSummary = {
  totalQualified: number;
  highPriorityCount: number;
  pipelineValue: number;
  convertedCount: number;
};

export type QualifiedLeadFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  service?: string;
  agent?: string;
  from?: string;
  to?: string;
};

export const qualifiedLeadsQuery = (filters: QualifiedLeadFilters = {}) =>
  queryOptions({
    queryKey: ["qualified-leads-list", filters],
    queryFn: async (): Promise<{ items: QualifiedLead[]; totalCount: number }> => {
      const page = Math.max(1, Number(filters.page || 1));
      const pageSize = Math.max(1, Number(filters.pageSize || 12));
      const offset = (page - 1) * pageSize;

      // Qualified condition: is_qualified = 1 OR stage matches qualified/opportunity/meeting
      const conditions: string[] = [
        "(p.is_qualified = 1 OR LOWER(COALESCE(st.name, p.stage_id, '')) LIKE '%qualif%' OR LOWER(COALESCE(st.name, p.stage_id, '')) LIKE '%opportunity%' OR LOWER(COALESCE(st.name, p.stage_id, '')) LIKE '%meeting%')",
        "p.is_active = 1",
      ];
      const params: (string | number)[] = [];

      if (filters.search && filters.search.trim()) {
        conditions.push(
          "(p.contact_name LIKE ? OR p.business_name LIKE ? OR p.phone LIKE ? OR p.email LIKE ? OR p.notes LIKE ?)",
        );
        const searchPattern = `%${filters.search.trim()}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (filters.service && filters.service !== "all") {
        conditions.push("(p.service_id = ? OR srv.name = ?)");
        params.push(filters.service, filters.service);
      }

      if (filters.agent && filters.agent !== "all") {
        conditions.push("p.assigned_to = ?");
        params.push(filters.agent);
      }

      if (filters.from) {
        conditions.push("p.created_at >= ?");
        params.push(`${filters.from} 00:00:00`);
      }

      if (filters.to) {
        conditions.push("p.created_at <= ?");
        params.push(`${filters.to} 23:59:59`);
      }

      const whereClause = conditions.join(" AND ");

      const countSql = `
        SELECT COUNT(*) AS total 
        FROM \`prospects\` p
        LEFT JOIN \`stages\` st ON (p.stage_id = st.id OR p.stage_id = REPLACE(st.id, '-', '_') OR p.stage_id = st.name)
        LEFT JOIN \`services\` srv ON (p.service_id = srv.id OR p.service_id = srv.name)
        WHERE ${whereClause}
      `;
      const countResult = await runMySQLQuery<Record<string, unknown>[]>(countSql, params);
      const totalCount = Number(countResult.data?.[0]?.["total"] ?? 0);

      const itemsSql = `
        SELECT 
          p.*,
          COALESCE(srv.name, p.service_id) AS service_name,
          COALESCE(st.name, p.stage_id, 'Qualified Lead') AS stage_name,
          st.color AS stage_color,
          st.icon AS stage_icon,
          COALESCE(prof_assign.full_name, u_assign.name) AS assigned_agent_name,
          COALESCE(prof_assign.avatar_url, u_assign.avatar_url) AS assigned_agent_avatar,
          COALESCE(prof_artist.full_name, u_artist.name) AS assigned_artist_name,
          COALESCE(prof_artist.avatar_url, u_artist.avatar_url) AS assigned_artist_avatar,
          COALESCE(prof_create.full_name, u_create.name, prof_assign.full_name, u_assign.name) AS creator_name,
          COALESCE(prof_create.avatar_url, u_create.avatar_url, prof_assign.avatar_url, u_assign.avatar_url) AS creator_avatar
        FROM \`prospects\` p
        LEFT JOIN \`stages\` st ON (p.stage_id = st.id OR p.stage_id = REPLACE(st.id, '-', '_') OR p.stage_id = st.name)
        LEFT JOIN \`services\` srv ON (p.service_id = srv.id OR p.service_id = srv.name)
        LEFT JOIN \`users\` u_assign ON p.assigned_to = u_assign.id
        LEFT JOIN \`profiles\` prof_assign ON p.assigned_to = prof_assign.id
        LEFT JOIN \`users\` u_artist ON p.assigned_artist_id = u_artist.id
        LEFT JOIN \`profiles\` prof_artist ON p.assigned_artist_id = prof_artist.id
        LEFT JOIN \`users\` u_create ON p.created_by = u_create.id
        LEFT JOIN \`profiles\` prof_create ON p.created_by = prof_create.id
        WHERE ${whereClause}
        ORDER BY p.updated_at DESC, p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      const queryParams = [...params, pageSize, offset];
      const rowsRes = await runMySQLQuery<Record<string, unknown>[]>(itemsSql, queryParams);
      const rows = (rowsRes.data || []) as Record<string, unknown>[];

      const items: QualifiedLead[] = rows.map((r) => {
        const stageName = String(r["stage_name"] || "Qualified Lead");
        const rawStageColor = r["stage_color"] ? String(r["stage_color"]) : null;
        const rawStageIcon = r["stage_icon"] ? String(r["stage_icon"]) : null;
        const isQualifiedVal = Number(r["is_qualified"] ?? 1) === 1;

        return {
          id: String(r["id"] || ""),
          contact_name: String(r["contact_name"] || ""),
          business_name: r["business_name"] ? String(r["business_name"]) : null,
          designation: r["designation"] ? String(r["designation"]) : null,
          phone: r["phone"] ? String(r["phone"]) : null,
          alternative_phone: r["alternative_phone"] ? String(r["alternative_phone"]) : null,
          email: r["email"] ? String(r["email"]) : null,
          address: r["address"] ? String(r["address"]) : null,
          website_url: r["website_url"] ? String(r["website_url"]) : null,
          logo_url: r["logo_url"] ? String(r["logo_url"]) : null,
          service_id: r["service_id"] ? String(r["service_id"]) : null,
          service_name: r["service_name"] ? String(r["service_name"]) : undefined,
          stage_id: r["stage_id"] ? String(r["stage_id"]) : null,
          stage_name: stageName,
          stage_color: resolveStageColor(stageName, rawStageColor),
          stage_icon: resolveStageIcon(stageName, rawStageIcon),
          is_qualified: isQualifiedVal,
          estimated_budget: r["estimated_budget"] != null ? Number(r["estimated_budget"]) : null,
          qualification_notes: r["qualification_notes"] ? String(r["qualification_notes"]) : null,
          assigned_to: r["assigned_to"] ? String(r["assigned_to"]) : null,
          assigned_agent_name: r["assigned_agent_name"]
            ? String(r["assigned_agent_name"])
            : undefined,
          assigned_agent_avatar: r["assigned_agent_avatar"]
            ? String(r["assigned_agent_avatar"])
            : null,
          assigned_artist_id: r["assigned_artist_id"] ? String(r["assigned_artist_id"]) : null,
          assigned_artist_name: r["assigned_artist_name"]
            ? String(r["assigned_artist_name"])
            : undefined,
          assigned_artist_avatar: r["assigned_artist_avatar"]
            ? String(r["assigned_artist_avatar"])
            : null,
          created_by: r["created_by"] ? String(r["created_by"]) : null,
          creator_name: r["creator_name"] ? String(r["creator_name"]) : undefined,
          creator_avatar: r["creator_avatar"] ? String(r["creator_avatar"]) : null,
          notes: r["notes"] ? String(r["notes"]) : null,
          created_at: String(r["created_at"] || ""),
          updated_at: String(r["updated_at"] || ""),
        };
      });

      return { items, totalCount };
    },
  });

export const qualifiedLeadsSummaryQuery = () =>
  queryOptions({
    queryKey: ["qualified-leads-summary"],
    queryFn: async (): Promise<QualifiedLeadsSummary> => {
      try {
        const sql = `
          SELECT 
            COUNT(*) AS total_qualified,
            COALESCE(SUM(CASE WHEN estimated_budget > 0 THEN estimated_budget ELSE COALESCE(budget, 0) END), 0) AS pipeline_value,
            COUNT(CASE WHEN LOWER(notes) LIKE '%high%' OR LOWER(notes) LIKE '%urgent%' OR estimated_budget >= 50000 THEN 1 END) AS high_priority_count
          FROM \`prospects\` p
          LEFT JOIN \`stages\` st ON (p.stage_id = st.id OR p.stage_id = REPLACE(st.id, '-', '_') OR p.stage_id = st.name)
          WHERE (p.is_qualified = 1 OR LOWER(COALESCE(st.name, p.stage_id, '')) LIKE '%qualif%' OR LOWER(COALESCE(st.name, p.stage_id, '')) LIKE '%opportunity%' OR LOWER(COALESCE(st.name, p.stage_id, '')) LIKE '%meeting%')
            AND p.is_active = 1
        `;
        const result = await runMySQLQuery<Record<string, unknown>[]>(sql);
        const totalQualified = Number(result.data?.[0]?.["total_qualified"] || 0);
        const pipelineValue = Number(result.data?.[0]?.["pipeline_value"] || 0);
        const highPriorityCount = Number(result.data?.[0]?.["high_priority_count"] || 0);

        // Count converted to projects
        const convSql = `
          SELECT COUNT(*) AS total_converted
          FROM \`projects\` pr
          INNER JOIN \`prospects\` p ON pr.prospect_id = p.id
        `;
        const convResult = await runMySQLQuery<Record<string, unknown>[]>(convSql);
        const convertedCount = Number(convResult.data?.[0]?.["total_converted"] || 0);

        return {
          totalQualified,
          highPriorityCount,
          pipelineValue,
          convertedCount,
        };
      } catch (err) {
        console.error("Failed to fetch qualified leads summary:", err);
        return {
          totalQualified: 0,
          highPriorityCount: 0,
          pipelineValue: 0,
          convertedCount: 0,
        };
      }
    },
  });

export function useQualifyProspectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      prospect_id: string;
      estimated_budget?: number | null;
      qualification_notes?: string | null;
    }) => {
      const now = getMySQLTimestamp();
      const sql = `
        UPDATE \`prospects\`
        SET 
          \`is_qualified\` = 1,
          \`estimated_budget\` = COALESCE(?, \`estimated_budget\`),
          \`qualification_notes\` = COALESCE(?, \`qualification_notes\`),
          \`updated_at\` = ?
        WHERE \`id\` = ?
      `;
      await runMySQLQuery(sql, [
        payload.estimated_budget ?? null,
        payload.qualification_notes ?? null,
        now,
        payload.prospect_id,
      ]);
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Lead marked as Qualified.");
      queryClient.invalidateQueries({ queryKey: ["qualified-leads-list"] });
      queryClient.invalidateQueries({ queryKey: ["qualified-leads-summary"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to qualify lead: ${err.message}`);
    },
  });
}

export function useDisqualifyProspectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prospect_id: string) => {
      const now = getMySQLTimestamp();
      const sql = `
        UPDATE \`prospects\`
        SET \`is_qualified\` = 0, \`updated_at\` = ?
        WHERE \`id\` = ?
      `;
      await runMySQLQuery(sql, [now, prospect_id]);
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Lead removed from Qualified list.");
      queryClient.invalidateQueries({ queryKey: ["qualified-leads-list"] });
      queryClient.invalidateQueries({ queryKey: ["qualified-leads-summary"] });
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to update lead: ${err.message}`);
    },
  });
}
