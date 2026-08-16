import { createFileRoute } from "@tanstack/react-router";
import { AdminBackupPage } from "./backup";

export const Route = createFileRoute("/_authenticated/admin/data-backup")({
  head: () => ({
    meta: [
      { title: "Data Backup | Brandium Telesales CRM" },
      { name: "description", content: "Export and back up your CRM data." },
      { property: "og:title", content: "Data Backup | Brandium Telesales CRM" },
      { property: "og:description", content: "Export and back up your CRM data." },
    ],
  }),
  component: AdminBackupPage,
});
