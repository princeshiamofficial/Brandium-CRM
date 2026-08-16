import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MessagesSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  PhoneCall,
  User,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { smsLogsQueryOptions, SmsStatus } from "@/lib/sms";
import { agentOptionsQueryOptions } from "@/lib/won-sales";

export const Route = createFileRoute("/_authenticated/sms/logs")({
  head: () => ({
    meta: [
      { title: "SMS Logs | Brandium Telesales CRM" },
      {
        name: "description",
        content: "Comprehensive audit trail for every SMS attempt in Brandium CRM.",
      },
      { property: "og:title", content: "SMS Logs | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Comprehensive audit trail for every SMS attempt in Brandium CRM.",
      },
    ],
  }),
  component: SmsLogsPage,
});

function SmsLogsPage() {
  const [search, setSearch] = useState<string>("");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<SmsStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: rawSmsLogs = [], isLoading } = useQuery(smsLogsQueryOptions());
  const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());

  const smsLogs = Array.isArray(rawSmsLogs) ? rawSmsLogs : [];
  const agents = Array.isArray(rawAgents) ? rawAgents : [];

  // Filtered List
  const filteredLogs = smsLogs.filter((log) => {
    // Status Filter
    if (statusFilter !== "all" && log.status !== statusFilter) {
      return false;
    }

    // Agent Filter
    if (agentFilter !== "all") {
      const matchAgent = agents.find((a) => a.id === agentFilter);
      if (matchAgent && log.sent_by_name !== matchAgent.name) {
        return false;
      }
    }

    // Date Range Filter
    if (dateRange?.from) {
      const fromStr = format(dateRange.from, "yyyy-MM-dd");
      if (log.created_at.substring(0, 10) < fromStr) return false;
    }
    if (dateRange?.to) {
      const toStr = format(dateRange.to, "yyyy-MM-dd");
      if (log.created_at.substring(0, 10) > toStr) return false;
    }

    // Search Filter
    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      const matchRecipient =
        (log.recipient_name && log.recipient_name.toLowerCase().includes(q)) ||
        (log.prospect_name && log.prospect_name.toLowerCase().includes(q));
      const matchPhone = log.recipient_phone.includes(q);
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchSender = log.sent_by_name.toLowerCase().includes(q);
      const matchRole = log.sender_role ? log.sender_role.toLowerCase().includes(q) : false;
      const matchApiId = log.api_response_id.toLowerCase().includes(q);
      const matchPayload = log.provider_response
        ? log.provider_response.toLowerCase().includes(q)
        : false;

      return (
        matchRecipient ||
        matchPhone ||
        matchMsg ||
        matchSender ||
        matchRole ||
        matchApiId ||
        matchPayload
      );
    }

    return true;
  });

  // Pagination Math
  const totalFilteredCount = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  const getStatusBadge = (status: SmsStatus) => {
    switch (status) {
      case "Sent":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-0.5 gap-1">
            <CheckCircle2 className="size-3" />
            Sent
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-2 py-0.5 gap-1">
            <Clock className="size-3" />
            Pending
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] px-2 py-0.5 gap-1">
            <AlertCircle className="size-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <MessagesSquare className="size-6 text-[#67B239]" />
          SMS Delivery Logs Audit
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Full compliance record of every Single and Bulk SMS attempt dispatched from Brandium CRM.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left-side filters: Agent & Search */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Agent Dropdown Filter */}
          <Select
            value={agentFilter}
            onValueChange={(val: string) => {
              setAgentFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-42.5 bg-white">
              <Users className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((ag) => (
                <SelectItem key={ag.id} value={ag.id}>
                  {ag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search Input */}
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search name, business, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 text-xs bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right-side filters: Status & Date Range */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val: SmsStatus | "all") => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-36 bg-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses ({totalFilteredCount})</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Picker Popover */}
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-white text-xs h-9 justify-start text-left font-normal gap-2"
              >
                <CalendarIcon className="size-3.5 text-muted-foreground" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd")} – {format(dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, yyyy")
                  )
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarPicker
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  setCurrentPage(1);
                  if (range?.to) {
                    setCalOpen(false);
                  }
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
                      setCurrentPage(1);
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

      {/* SMS Logs Table */}
      <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="py-3.5 px-4 border-b bg-slate-50/60 dark:bg-muted/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-sm font-bold text-foreground">
              SMS Attempts Audit Table
            </CardTitle>
            <CardDescription className="text-xs">
              Showing {totalFilteredCount > 0 ? startIndex + 1 : 0}–
              {Math.min(startIndex + pageSize, totalFilteredCount)} of {totalFilteredCount} records
            </CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b bg-slate-50/80 dark:bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">SMS Message Content</th>
                <th className="py-3 px-4">Sender Agent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={6} className="py-4 px-4">
                      <Skeleton className="h-10 w-full rounded" />
                    </td>
                  </tr>
                ))
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <MessagesSquare className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-foreground">No SMS logs match your filters</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try clearing search or changing status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors"
                  >
                    {/* Recipient */}
                    <td className="py-3.5 px-4 max-w-48">
                      <div className="font-semibold text-foreground truncate">
                        {log.recipient_name || log.prospect_name || "Prospect Recipient"}
                      </div>
                      {log.prospect_id && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-[11px] text-[#67B239] hover:underline gap-0.5 mt-0.5"
                          asChild
                        >
                          <Link to="/prospects">
                            <Building2 className="size-3" />
                            View Prospect Profile
                            <ExternalLink className="size-2.5" />
                          </Link>
                        </Button>
                      )}
                    </td>

                    {/* Phone Number */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <a
                        href={`tel:${log.recipient_phone}`}
                        className="font-mono text-slate-700 dark:text-slate-300 hover:text-[#67B239] flex items-center gap-1 font-semibold"
                      >
                        <PhoneCall className="size-3 text-emerald-600" />
                        {log.recipient_phone}
                      </a>
                    </td>

                    {/* Message Content */}
                    <td className="py-3.5 px-4 max-w-64">
                      <p
                        className="line-clamp-2 text-foreground/90 leading-relaxed"
                        title={log.message}
                      >
                        "{log.message}"
                      </p>
                    </td>

                    {/* Sender Agent */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-foreground flex items-center gap-1">
                        <User className="size-3.5 text-blue-600" />
                        {log.sent_by_name}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3 text-slate-400" />
                        {new Date(log.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        {new Date(log.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val: string) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-16 h-7 text-xs">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-muted-foreground">
              Page {validCurrentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
