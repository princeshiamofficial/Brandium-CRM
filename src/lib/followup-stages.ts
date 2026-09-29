import { queryOptions } from "@tanstack/react-query";
import { runMySQLQuery } from "./mysql-api";

export type FollowupStage = {
  id: string;
  name: string;
  color: string;
  position: number;
  is_default: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export const followupStagesQueryOptions = () =>
  queryOptions({
    queryKey: ["followup-stages"],
    queryFn: async () => {
      const res = await runMySQLQuery<FollowupStage[]>(
        `
        SELECT *
        FROM followup_stages
        ORDER BY position ASC, created_at DESC
        `,
        [],
      );
      return (res.data || []) as FollowupStage[];
    },
    staleTime: 1000 * 60 * 5,
  });

export async function getFollowupStages(): Promise<FollowupStage[]> {
  const res = await runMySQLQuery<FollowupStage[]>(
    `
    SELECT *
    FROM followup_stages
    ORDER BY position ASC
    `,
    [],
  );
  return (res.data || []) as FollowupStage[];
}
