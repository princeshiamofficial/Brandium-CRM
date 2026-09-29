"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { followUpsQuery } from "@/lib/follow-ups";
import { useAuth } from "@/lib/auth";
import { FollowUpsKanban } from "@/components/follow-ups-kanban";

/** Follow-ups Kanban board: every follow-up as a card, grouped by stage. */
export default function FollowUpsPage() {
  const { user, isAdmin } = useAuth();

  const { data: followUpsResult } = useQuery(
    followUpsQuery(
      {
        search: "",
        searchField: "all",
        status: "all",
        agent: "all",
        from: "",
        to: "",
      },
      user?.id || "",
      isAdmin,
    ),
  );

  const followUpItems = useMemo(() => followUpsResult?.data || [], [followUpsResult]);

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      <FollowUpsKanban followUps={followUpItems} />
    </div>
  );
}
