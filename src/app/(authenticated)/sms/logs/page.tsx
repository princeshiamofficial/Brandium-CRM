"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessagesSquare,
  PhoneCall,
  Search,
  Users,
  X,
} from "lucide-react";

import { Link } from "@/components/navigation-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { formatCrmDateTime } from "@/lib/mysql-client";
import { smsLogsQueryOptions, type SmsStatus } from "@/lib/sms";
import { agentOptionsQueryOptions } from "@/lib/won-sales";

function StatusBadge({ status }: { status: SmsStatus }) {
  if (status === "Sent") {
    return (
      <Badge
        variant="outline"
        className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
      >
        <CheckCircle2 className="size-3 text-green-600 dark:text-green-400" /> Sent
      </Badge>
    );
  }
  if (status === "Failed") {
    return (
      <Badge
        variant="outline"
        className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
      >
        <AlertCircle className="size-3 text-red-600 dark:text-red-400" /> Failed
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
    >
      <Clock className="size-3 text-amber-600 dark:text-amber-400" /> Pending
    </Badge>
  );
}

export default function SmsLogsPage() {
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<SmsStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: smsLogs = [], isLoading } = useQuery(smsLogsQueryOptions());
  const { data: agents = [] } = useQuery(agentOptionsQueryOptions());

  const term = search.toLowerCase().trim();
  const fromStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const toStr = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : fromStr;

  const filteredLogs = smsLogs.filter((log) => {
    if (statusFilter !== "all" && log.status !== statusFilter) return false;
    if (agentFilter !== "all" && log.sent_by !== agentFilter) return false;
    const day = log.created_at.substring(0, 10);
    if (fromStr && day < fromStr) return false;
    if (toStr && day > toStr) return false;
    if (!term) return true;
    return [
      log.recipient_name,
      log.prospect_name,
      log.recipient_phone,
      log.message,
      log.sent_by_name,
      log.provider_response,
    ].some((v) => v?.toLowerCase().includes(term));
  });

  const totalCount = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * pageSize;
  const pageLogs = filteredLogs.slice(startIndex, startIndex + pageSize);
  const sentCount = smsLogs.filter((l) => l.status === "Sent").length;
  const failedCount = smsLogs.filter((l) => l.status === "Failed").length;

  const resetPage = () => setCurrentPage(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <MessagesSquare className="size-7 text-[#67B239]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">SMS Logs</h1>
            <p className="text-sm text-muted-foreground">
              Every SMS attempt sent through the gateway, with the provider reply.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge
            variant="outline"
            className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 rounded-full px-2.5"
          >
            {sentCount} Sent
          </Badge>
          <Badge
            variant="outline"
            className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 rounded-full px-2.5"
          >
            {failedCount} Failed
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className="pl-9 pr-8 bg-white dark:bg-card"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                resetPage();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={agentFilter}
            onValueChange={(val: string) => {
              setAgentFilter(val);
              resetPage();
            }}
          >
            <SelectTrigger className="w-44 bg-white dark:bg-card gap-2 text-xs">
              <Users className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Senders" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Senders</SelectItem>
              {agents.map((ag) => (
                <SelectItem key={ag.id} value={ag.id}>
                  {ag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val: string) => {
              setStatusFilter(val as SmsStatus | "all");
              resetPage();
            }}
          >
            <SelectTrigger className="w-36 bg-white dark:bg-card text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-white dark:bg-card text-xs h-9 justify-start font-normal gap-2"
              >
                <CalendarIcon className="size-3.5 text-muted-foreground" />
                {dateRange?.from
                  ? dateRange.to
                    ? `${format(dateRange.from, "LLL dd")} – ${format(dateRange.to, "LLL dd")}`
                    : format(dateRange.from, "LLL dd, yyyy")
                  : "Date Range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarPicker
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  resetPage();
                  if (range?.to) setCalOpen(false);
                }}
                numberOfMonths={2}
              />
              {dateRange && (
                <div className="border-t p-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setDateRange(undefined);
                      resetPage();
                      setCalOpen(false);
                    }}
                  >
                    Clear dates
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card className="shadow-xl border bg-card rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-12.5 font-semibold">SL</TableHead>
                  <TableHead className="min-w-40 font-semibold">Recipient</TableHead>
                  <TableHead className="min-w-36 font-semibold">Phone</TableHead>
                  <TableHead className="min-w-64 font-semibold">Message</TableHead>
                  <TableHead className="min-w-32 font-semibold">Sent By</TableHead>
                  <TableHead className="min-w-25 font-semibold">Status</TableHead>
                  <TableHead className="min-w-48 font-semibold">Gateway Reply</TableHead>
                  <TableHead className="pr-6 min-w-40 font-semibold">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={8} className="py-4 px-6">
                        <Skeleton className="h-12 w-full rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : pageLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      <MessagesSquare className="size-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-foreground">No SMS logs found</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {smsLogs.length === 0
                          ? "Messages sent from Send SMS or meeting reminders will appear here."
                          : "Try clearing search or filters."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageLogs.map((log, index) => (
                    <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6 text-muted-foreground text-xs font-medium">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="max-w-48">
                        <p className="font-medium text-foreground text-sm truncate">
                          {log.recipient_name || "Unknown recipient"}
                        </p>
                        {log.prospect_id && (
                          <Link
                            href="/prospects"
                            className="text-xs text-[#67B239] hover:underline"
                          >
                            View prospect
                          </Link>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <a
                          href={`tel:${log.recipient_phone}`}
                          className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-[#67B239]"
                        >
                          <PhoneCall className="size-3 text-[#67B239]" />
                          {log.recipient_phone}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-72">
                        <p className="line-clamp-2 text-xs text-foreground/90" title={log.message}>
                          {log.message}
                        </p>
                        {log.mode === "Bulk" && (
                          <span className="text-[11px] text-muted-foreground">Bulk</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {log.sent_by_name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={log.status} />
                      </TableCell>
                      <TableCell className="max-w-56">
                        <p
                          className="truncate font-mono text-xs text-muted-foreground"
                          title={log.provider_response}
                        >
                          {log.provider_response || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="pr-6 whitespace-nowrap text-xs text-muted-foreground">
                        {formatCrmDateTime(log.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t px-6 py-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>
                Showing {totalCount ? startIndex + 1 : 0}–
                {Math.min(startIndex + pageSize, totalCount)} of {totalCount}
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(val: string) => {
                  setPageSize(Number(val));
                  resetPage();
                }}
              >
                <SelectTrigger className="w-18 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={page <= 1}
                onClick={() => setCurrentPage(page - 1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={page >= totalPages}
                onClick={() => setCurrentPage(page + 1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
