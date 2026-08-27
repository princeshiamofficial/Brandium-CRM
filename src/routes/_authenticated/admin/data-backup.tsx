import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/data-backup")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/backup" });
  },
});
