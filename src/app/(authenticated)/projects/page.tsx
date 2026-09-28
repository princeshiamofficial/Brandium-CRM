"use client";

import { ProjectsKanbanBoard } from "@/components/projects/projects-kanban-board";

/** ERPAPP-style projects board: every order as a card, grouped by production stage. */
export default function ProjectsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      <ProjectsKanbanBoard />
    </div>
  );
}
