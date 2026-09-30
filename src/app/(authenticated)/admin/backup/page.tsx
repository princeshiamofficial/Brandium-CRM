"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Database,
  DatabaseBackup,
  Download,
  FileCode,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  RotateCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminRestoreBackupModal } from "@/components/admin-restore-backup-modal";
import {
  backupTableStatusQueryOptions,
  downloadCsvExport,
  downloadJsonBackup,
} from "@/lib/data-backup";

const formatTableName = (name: string) =>
  name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

function ActionCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <Card className="shadow-xl border bg-card rounded-lg">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#67B239]/15 text-[#67B239]">
            <Icon className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <div className="mt-auto">{action}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminBackupPage() {
  const queryClient = useQueryClient();
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [busy, setBusy] = useState<"json" | "csv" | null>(null);
  const [search, setSearch] = useState("");
  const [csvTable, setCsvTable] = useState("prospects");
  const tablesQuery = useQuery(backupTableStatusQueryOptions());

  const tables = tablesQuery.data ?? [];
  const includedTables = tables.filter((t) => t.included);
  const includedRecords = includedTables.reduce((sum, t) => sum + t.records, 0);
  const term = search.toLowerCase().trim();
  const visibleTables = term ? tables.filter((t) => t.table.includes(term)) : tables;

  const runDownload = async (kind: "json" | "csv") => {
    setBusy(kind);
    try {
      if (kind === "json") {
        await downloadJsonBackup();
        toast.success("JSON backup downloaded");
      } else {
        const count = await downloadCsvExport(csvTable);
        toast.success(`${formatTableName(csvTable)} exported (${count} rows)`);
      }
    } catch (err) {
      toast.error(kind === "json" ? "Backup failed" : "CSV export failed", {
        description: (err as Error).message,
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <DatabaseBackup className="size-7 text-[#67B239]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Data Backup</h1>
            <p className="text-sm text-muted-foreground">
              Download or restore CRM data. Passwords are never included.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-1.5 cursor-pointer bg-white dark:bg-card"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-backup-table-status"] })}
        >
          <RotateCw className={tablesQuery.isFetching ? "size-4 animate-spin" : "size-4"} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ActionCard
          icon={FileCode}
          title="JSON Backup"
          description={
            tablesQuery.isLoading
              ? "Counting records..."
              : `${includedTables.length} tables · ${includedRecords.toLocaleString()} records`
          }
          action={
            <Button
              className="w-full bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
              disabled={busy !== null}
              onClick={() => void runDownload("json")}
            >
              {busy === "json" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Download JSON
            </Button>
          }
        />
        <ActionCard
          icon={FileSpreadsheet}
          title="CSV Export"
          description="Download one table as a spreadsheet for Excel or Google Sheets."
          action={
            <div className="flex gap-2">
              <Select value={csvTable} onValueChange={setCsvTable}>
                <SelectTrigger className="min-w-0 flex-1 text-xs">
                  <SelectValue placeholder="Choose table" />
                </SelectTrigger>
                <SelectContent>
                  {includedTables.map((t) => (
                    <SelectItem key={t.table} value={t.table}>
                      {formatTableName(t.table)} ({t.records})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="shrink-0 gap-1.5"
                disabled={busy !== null || !csvTable}
                onClick={() => void runDownload("csv")}
              >
                {busy === "csv" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                CSV
              </Button>
            </div>
          }
        />
        <ActionCard
          icon={RotateCcw}
          title="Restore Backup"
          description="Upload a JSON backup. A safety copy is taken before restoring."
          action={
            <Button
              variant="outline"
              className="w-full gap-1.5"
              onClick={() => setRestoreModalOpen(true)}
            >
              <RotateCcw className="size-4" />
              Restore JSON
            </Button>
          }
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search tables..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-8 bg-white dark:bg-card"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <Card className="shadow-xl border bg-card rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-12.5 font-semibold">SL</TableHead>
                  <TableHead className="min-w-52 font-semibold">Table</TableHead>
                  <TableHead className="text-right min-w-28 font-semibold">Records</TableHead>
                  <TableHead className="min-w-36 font-semibold">In JSON Backup</TableHead>
                  <TableHead className="pr-6 min-w-40 font-semibold">Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tablesQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={5} className="py-4 px-6">
                        <Skeleton className="h-10 w-full rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : visibleTables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      <Database className="size-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-foreground">No tables found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleTables.map((t, index) => (
                    <TableRow key={t.table} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6 text-muted-foreground text-xs font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground text-sm">
                          {formatTableName(t.table)}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">{t.table}</p>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {t.records.toLocaleString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {t.included ? (
                          <Badge
                            variant="outline"
                            className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
                          >
                            <CheckCircle2 className="size-3" /> Included
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
                          >
                            <XCircle className="size-3" /> Not included
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-xs text-muted-foreground">
                        {t.note ? (
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="size-3.5 text-[#67B239]" />
                            {t.note}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AdminRestoreBackupModal open={restoreModalOpen} onOpenChange={setRestoreModalOpen} />
    </div>
  );
}
