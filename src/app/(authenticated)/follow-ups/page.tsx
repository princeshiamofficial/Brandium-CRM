"use client";

import { FollowUpBoard } from "@/components/follow-ups/follow-up-board";

/** ERPAPP-style follow-up board: one card per prospect, grouped by follow-up status. */
export default function FollowUpsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      <FollowUpBoard />
    </div>
  );
}
