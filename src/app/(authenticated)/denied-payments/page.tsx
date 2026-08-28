"use client";

import { useState } from "react";
import { Link } from "@/components/navigation-link";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ShieldAlert,
  ArrowRightLeft,
  History,
  Eye,
  PlusCircle,
  FileText,
  CalendarIcon,
  Layers,
  Users,
  X,
  User,
  Phone,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { FollowUpDialog } from "@/components/follow-up-dialog";
import { DeniedPaymentChangeStageModal } from "@/components/denied-payment-change-stage-modal";
import { DeniedPaymentStageHistoryModal } from "@/components/denied-payment-stage-history-modal";
import {
  deniedPaymentsQueryOptions,
  type DeniedPayment,
  type DeniedPaymentFilters,
} from "@/lib/denied-payments";
import { agentOptionsQueryOptions } from "@/lib/won-sales";

export default function DeniedPaymentsPage() {
  const [search, setSearch] = useState<string>("");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);

  const [followUpRecord, setFollowUpRecord] = useState<DeniedPayment | null>(null);
  const [followUpOpen, setFollowUpOpen] = useState<boolean>(false);

  const [changeStageRecord, setChangeStageRecord] = useState<DeniedPayment | null>(null);
  const [changeStageOpen, setChangeStageOpen] = useState<boolean>(false);

  const [historyRecord, setHistoryRecord] = useState<DeniedPayment | null>(null);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);

  const filters: DeniedPaymentFilters = {
    search,
    agent_id: agentFilter,
    current_stage: stageFilter,
    from_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    to_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const { data: rawDeniedPayments = [], isLoading } = useQuery(deniedPaymentsQueryOptions(filters));
  const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());

  const deniedPayments = Array.isArray(rawDeniedPayments) ? rawDeniedPayments : [];
  const agents = Array.isArray(rawAgents) ? rawAgents : [];

  const activeAttentionList = deniedPayments.filter(
    (item) => item.current_stage === "Denied Payment",
  );
  const attentionCount = activeAttentionList.length;

  const handleOpenFollowUp = (record: DeniedPayment) => {
    setFollowUpRecord(record);
    setFollowUpOpen(true);
  };

  const handleOpenChangeStage = (record: DeniedPayment) => {
    setChangeStageRecord(record);
    setChangeStageOpen(true);
  };

  const handleOpenHistory = (record: DeniedPayment) => {
    setHistoryRecord(record);
    setHistoryOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldAlert className="size-6 text-red-600 dark:text-red-500" />
              Denied Payments
            </h1>
            {attentionCount > 0 && (
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                {attentionCount} Action Required
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track, follow up, and transition clients who declined or denied payments.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Select value={agentFilter} onValueChange={(val: string) => setAgentFilter(val)}>
            <SelectTrigger className="w-42.5 bg-white">
              <div className="flex items-center gap-2 truncate">
                <Users className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Agents" />
              </div>
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

          <div className="relative min-w-50 max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search name, business, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8.5 bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={stageFilter} onValueChange={(val: string) => setStageFilter(val)}>
            <SelectTrigger className="w-42.5 bg-white">
              <div className="flex items-center gap-2 truncate">
                <Layers className="size-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Stages" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Denied Payment">Denied Payment</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Follow Up">Follow Up</SelectItem>
              <SelectItem value="Closed Won">Closed Won</SelectItem>
              <SelectItem value="Closed Lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-9 justify-start text-left font-normal bg-white gap-2 text-xs ${
                  !dateRange ? "text-muted-foreground" : "text-foreground font-semibold"
                }`}
              >
                <CalendarIcon className="size-3.5" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <span>
                      {format(dateRange.from, "MMM d")} &ndash;{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </span>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarPicker
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (range?.to) {
                    setCalOpen(false);
                  }
                }}
                numberOfMonths={2}
                initialFocus
              />
              {dateRange?.from && (
                <div className="border-t p-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setDateRange(undefined);
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

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-4 shadow-2xs space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="size-7 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : deniedPayments.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 dark:border-border bg-white dark:bg-card p-12 text-center text-muted-foreground shadow-2xs">
          <ShieldAlert className="size-10 mx-auto text-slate-300 mb-2.5" />
          <p className="font-bold text-foreground text-base">No denied payments found</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            All clients are in good standing or adjust your search terms and filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {deniedPayments.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between select-none"
            >
              <div>
                <div className="p-4 pb-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug truncate group-hover:text-red-600 transition-colors">
                        {item.business_name || item.prospect_name}
                      </h3>
                      <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5 font-mono">
                        ৳{Number(item.amount).toLocaleString()}
                      </p>
                    </div>

                    <div className="size-6 sm:size-7 rounded-full bg-red-600 flex items-center justify-center shrink-0 text-white shadow-2xs">
                      <ShieldAlert className="size-4 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <User className="size-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.prospect_name} {item.service ? `• ${item.service}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="size-4 text-slate-400 shrink-0" />
                      <a
                        href={`tel:${item.phone}`}
                        className="font-mono text-slate-800 dark:text-slate-200 hover:text-red-600 transition-colors"
                      >
                        {item.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FCE8E2] dark:bg-rose-950/40 px-4 py-3 text-xs space-y-2 border-y border-[#F8D4C8] dark:border-rose-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <User className="size-4 text-slate-600 dark:text-slate-400" />
                      <span>Assigned:</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-36">
                      {item.agent_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <ShieldAlert className="size-4 text-slate-600 dark:text-slate-400" />
                      <span>Denied by:</span>
                    </div>
                    <span className="font-bold text-red-700 dark:text-red-300 truncate max-w-36">
                      {item.denied_by}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                      <CalendarIcon className="size-4 text-slate-600 dark:text-slate-400" />
                      <span>Denied on:</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {format(new Date(item.denied_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="p-4 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <FileText className="size-3.5 text-slate-400" />
                      <span>Denial Reason</span>
                    </div>
                    <Badge
                      variant={item.current_stage === "Denied Payment" ? "destructive" : "outline"}
                      className="text-[10px] px-1.5 py-0 font-semibold"
                    >
                      {item.current_stage}
                    </Badge>
                  </div>

                  <div className="bg-[#ECEEF0] dark:bg-slate-800/70 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 min-h-16 flex items-start">
                    <p className="line-clamp-3 leading-relaxed">
                      {item.denial_reason
                        ? `"${item.denial_reason}"`
                        : "No specific denial reason provided."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 pb-3.5 flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-8 bg-[#67B239] hover:bg-[#589c2f] text-white text-xs font-semibold rounded-xl gap-1.5 shadow-xs"
                  onClick={() => handleOpenFollowUp(item)}
                  title="Schedule Follow-up task"
                >
                  <PlusCircle className="size-3.5" />
                  Follow Up
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-100 gap-1 text-xs font-semibold rounded-xl"
                  onClick={() => handleOpenChangeStage(item)}
                  title="Change Stage"
                >
                  <ArrowRightLeft className="size-3.5" />
                  Stage
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="size-8 p-0 text-slate-500 dark:text-slate-400 hover:text-foreground rounded-xl border border-slate-200/80 dark:border-slate-800 shrink-0"
                      title="More actions"
                    >
                      <MoreVertical className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => handleOpenHistory(item)}
                      className="cursor-pointer gap-2 text-xs font-medium"
                    >
                      <History className="size-3.5 text-slate-500" />
                      Stage History
                    </DropdownMenuItem>
                    {item.prospect_id ? (
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer gap-2 text-xs font-medium"
                      >
                        <Link href="/prospects">
                          <Eye className="size-3.5 text-slate-500" />
                          View Prospect
                        </Link>
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <FollowUpDialog
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
        prospectId={followUpRecord?.prospect_id || ""}
        prospectLabel={
          followUpRecord
            ? `${followUpRecord.prospect_name} (${followUpRecord.business_name || followUpRecord.service})`
            : ""
        }
      />

      <DeniedPaymentChangeStageModal
        open={changeStageOpen}
        onOpenChange={setChangeStageOpen}
        record={changeStageRecord}
      />

      <DeniedPaymentStageHistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        record={historyRecord}
      />
    </div>
  );
}
