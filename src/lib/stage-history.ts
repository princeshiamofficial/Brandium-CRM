import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StageHistoryDetail = {
  id: string;
  prospect_id: string;
  from_stage_id: string | null;
  to_stage_id: string;
  note: string | null;
  changed_by: string | null;
  changed_at: string;
  prospect_name: string;
  prospect_business: string | null;
  from_stage_name: string | null;
  to_stage_name: string;
  changer_name: string | null;
  changer_email: string | null;
};

export type StageHistoryFilters = {
  page: number;
  search?: string | undefined;
  agent?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
  prospectId?: string | undefined;
};

export const stageHistoryDetailsQuery = (filters: StageHistoryFilters) =>
  queryOptions({
    queryKey: ["stage-history-details", filters],
    queryFn: async () => {
      const pageSize = 15;
      const from = (filters.page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from("prospect_stage_history_details").select("*", { count: "exact" });

      if (filters.prospectId) {
        query = query.eq("prospect_id", filters.prospectId);
      }

      if (filters.search) {
        query = query.or(
          `prospect_name.ilike.%${filters.search}%,prospect_business.ilike.%${filters.search}%,note.ilike.%${filters.search}%`,
        );
      }

      if (filters.agent) {
        query = query.eq("changed_by", filters.agent);
      }

      if (filters.from) {
        query = query.gte("changed_at", filters.from);
      }

      if (filters.to) {
        query = query.lte("changed_at", filters.to);
      }

      const { data, count, error } = await query
        .order("changed_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: (data || []) as StageHistoryDetail[],
        count: count || 0,
        pageCount: Math.ceil((count || 0) / pageSize),
      };
    },
  });
