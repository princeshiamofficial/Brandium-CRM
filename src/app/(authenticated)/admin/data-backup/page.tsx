import { redirect } from "next/navigation";

export default function DataBackupRedirect() {
  redirect("/admin/backup");
}
