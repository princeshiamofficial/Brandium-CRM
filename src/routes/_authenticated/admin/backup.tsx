import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DatabaseBackup,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Users2,
  CalendarClock,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  FileCode,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  backupSummaryQueryOptions,
  downloadJsonBackup,
  downloadCsvExport,
} from "@/lib/data-backup";
import { AdminRestoreBackupModal } from "@/components/admin-restore-backup-modal";

export const Route = createFileRoute("/_authenticated/admin/backup")({
  head: () => ({
    meta: [
      { title: "Data Backup & Restore | Brandium Telesales CRM" },
      {
        name: "description",
        content: "Admin-only CRM backup exports and 7-stage transactional restore.",
      },
      { property: "og:title", content: "Data Backup & Restore | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Admin-only CRM backup exports and 7-stage transactional restore.",
      },
    ],
  }),
  component: AdminBackupPage,
});

function AdminBackupPage() {
  const [restoreModalOpen, setRestoreModalOpen] = useState<boolean>(false);
  const { data: metrics, isLoading } = useQuery(backupSummaryQueryOptions());

  const handleDownloadJson = async () => {
    try {
      toast.info("Generating sanitized JSON backup file (passwords/secrets excluded)...");
      await downloadJsonBackup();
      toast.success("JSON backup downloaded successfully!");
    } catch {
      toast.error("Failed to generate JSON backup.");
    }
  };

  const handleDownloadCsv = async () => {
    try {
      toast.info("Generating CSV data bundle export...");
      await downloadCsvExport();
      toast.success("CSV export downloaded successfully!");
    } catch {
      toast.error("Failed to generate CSV export.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DatabaseBackup className="size-7 text-[#67B239]" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Admin — Data Backup & Transactional Restore
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Admin-only backup management. Downloads include all 11 CRM tables with passwords &
            secrets strictly excluded.
          </p>
        </div>

        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-300 text-xs px-3 py-1.5 font-semibold gap-1.5 self-start sm:self-auto"
        >
          <ShieldCheck className="size-4" />
          Admin Access Granted
        </Badge>
      </div>

      {/* Summary KPI Cards (Prospects, Tasks, Bills, Users) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Prospects Records"
          value={isLoading ? "..." : String(metrics?.prospects_count || 0)}
          icon={Users2}
          colorScheme="indigo"
          loading={isLoading}
        />
        <StatCard
          label="Tasks / Meetings"
          value={isLoading ? "..." : String(metrics?.tasks_count || 0)}
          icon={CalendarClock}
          colorScheme="amber"
          loading={isLoading}
        />
        <StatCard
          label="Bills & Invoices"
          value={isLoading ? "..." : String(metrics?.bills_count || 0)}
          icon={Receipt}
          colorScheme="emerald"
          loading={isLoading}
        />
        <StatCard
          label="CRM Users (Sanitized)"
          value={isLoading ? "..." : String(metrics?.users_count || 0)}
          icon={ShieldCheck}
          colorScheme="teal"
          loading={isLoading}
        />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Action 1: Download JSON Backup */}
        <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs flex flex-col justify-between">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-[#67B239] flex items-center justify-center mb-2">
              <FileCode className="size-5" />
            </div>
            <CardTitle className="text-base">Download JSON Backup</CardTitle>
            <CardDescription className="text-xs">
              Full versioned JSON payload including all 11 tables. Passwords and secrets are
              automatically sanitized.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full bg-[#67B239] hover:bg-[#5aa030] text-white gap-2 text-xs"
              onClick={handleDownloadJson}
            >
              <Download className="size-4" />
              Download JSON Backup
            </Button>
          </CardContent>
        </Card>

        {/* Action 2: Download CSV Export */}
        <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs flex flex-col justify-between">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <FileSpreadsheet className="size-5" />
            </div>
            <CardTitle className="text-base">Download CSV Export</CardTitle>
            <CardDescription className="text-xs">
              Formatted CSV spreadsheet data bundle for external auditing and reporting tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              className="w-full border-blue-300 text-blue-700 dark:text-blue-400 hover:bg-blue-50 gap-2 text-xs"
              onClick={handleDownloadCsv}
            >
              <Download className="size-4" />
              Download CSV Bundle
            </Button>
          </CardContent>
        </Card>

        {/* Action 3: Restore JSON Backup */}
        <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs flex flex-col justify-between">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <RotateCcw className="size-5" />
            </div>
            <CardTitle className="text-base">Restore JSON Backup</CardTitle>
            <CardDescription className="text-xs">
              7-stage transactional restore wizard with schema verification, conflict detection, and
              safety snapshots.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="outline"
              className="w-full border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 gap-2 text-xs font-semibold"
              onClick={() => setRestoreModalOpen(true)}
            >
              <RotateCcw className="size-4" />
              Restore JSON Backup
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Backup Scope Checklist Details */}
      <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#67B239]" />
            Included Backup Tables Scope & Security Principles
          </CardTitle>
          <CardDescription className="text-xs">
            The following 11 CRM entities are included in JSON backups:
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>1. Prospects</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>2. Stage History</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>3. Follow-ups</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>4. Opportunities</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>5. Meetings</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>6. Invoices</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>7. Payments</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>8. Services</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>9. SMS Logs</span>
            </div>
            <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
              <ShieldAlert className="size-3.5 text-amber-600 shrink-0" />
              <span>10. Users (No Passwords)</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border flex items-center gap-2 col-span-2 sm:col-span-1">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>11. Activity Logs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7-Stage Restore Modal */}
      <AdminRestoreBackupModal open={restoreModalOpen} onOpenChange={setRestoreModalOpen} />
    </div>
  );
}
