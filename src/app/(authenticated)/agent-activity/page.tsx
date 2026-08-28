"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Search,
  FileJson,
  User,
  Clock,
  Users2,
  Target,
  CalendarClock,
  Receipt,
  MessageSquare,
  Lock,
  RotateCcw,
  RefreshCw,
  Layers,
  Users,
  Phone,
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { agentOptionsQueryOptions } from "@/lib/won-sales";
import { StatCard } from "@/components/stat-card";

import { activityLogsQueryOptions, type ActivityLog } from "@/lib/activity-logs";
import { ActivityLogMetadataModal } from "@/components/activity-log-metadata-modal";

export default function AgentActivityPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalState, setModalState] = useState<{
    open: boolean;
    log: ActivityLog | null;
  }>({ open: false, log: null });

  const { data: rawLogs = [], isLoading, refetch } = useQuery(activityLogsQueryOptions());
  const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());

  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const agents = Array.isArray(rawAgents) ? rawAgents : [];

  const totalLogsCount = logs.length;
  const prospectLogsCount = logs.filter(
    (l) => l.entity_type === "prospect" || l.entity_type === "stage",
  ).length;
  const financeLogsCount = logs.filter(
    (l) =>
      l.entity_type === "invoice" || l.entity_type === "payment" || l.entity_type === "billing",
  ).length;
  const tasksMeetingsCount = logs.filter(
    (l) => l.entity_type === "meeting" || l.entity_type === "followup",
  ).length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    void queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const filteredLogs = logs.filter((log) => {
    if (entityFilter !== "all") {
      const ef = entityFilter.toLowerCase();
      const currentEt = log.entity_type.toLowerCase();
      if (ef === "followup" && (currentEt === "followup" || currentEt === "meeting")) {
        // match
      } else if (ef === "invoice" && (currentEt === "invoice" || currentEt === "billing")) {
        // match
      } else if (currentEt !== ef) {
        return false;
      }
    }

    if (agentFilter !== "all") {
      if (log.user_id !== agentFilter) {
        const agentObj = agents.find((a) => a.id === agentFilter);
        if (!agentObj || log.user_name.toLowerCase() !== agentObj.name.toLowerCase()) {
          return false;
        }
      }
    }

    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();
      const prospectName = String(log.metadata_json["prospect_name"] || "").toLowerCase();
      const businessName = String(log.metadata_json["business_name"] || "").toLowerCase();
      const phone = String(log.metadata_json["phone"] || "").toLowerCase();
      return (
        log.action?.toLowerCase().includes(searchLower) ||
        log.user_name?.toLowerCase().includes(searchLower) ||
        log.entity_type?.toLowerCase().includes(searchLower) ||
        prospectName.includes(searchLower) ||
        businessName.includes(searchLower) ||
        phone.includes(searchLower) ||
        JSON.stringify(log.metadata_json)?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getCategoryBadge = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "prospect":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 text-[10px] px-2 py-0.5 gap-1 font-semibold">
            <Users2 className="size-3" />
            Prospect
          </Badge>
        );
      case "stage":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-200 text-[10px] px-2 py-0.5 gap-1 font-semibold">
            <RefreshCw className="size-3" />
            Stage Change
          </Badge>
        );
      case "opportunity":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 text-[10px] px-2 py-0.5 gap-1 font-semibold">
            <Target className="size-3" />
            Opportunity
          </Badge>
        );
      case "meeting":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px] px-2 py-0.5 gap-1 font-semibold">
            <CalendarClock className="size-3" />
            Meeting
          </Badge>
        );
      case "followup":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px] px-2 py-0.5 gap-1 font-semibold">
            <CalendarClock className="size-3" />
            Follow-up
          </Badge>
        );
      case "invoice":
      case "billing":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px] px-2 py-0.5 gap-1 font-semibold">
            <Receipt className="size-3" />
            Invoice
          </Badge>
        );
      case "payment":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px] px-2 py-0.5 gap-1 font-semibold">
            <Receipt className="size-3" />
            Payment
          </Badge>
        );
      case "sms":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 text-[10px] px-2 py-0.5 gap-1 font-semibold">
            <MessageSquare className="size-3" />
            SMS
          </Badge>
        );
      case "user":
        return (
          <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 text-[10px] px-2 py-0.5 gap-1 font-semibold">
            <User className="size-3" />
            User Admin
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
            {entityType}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-7 text-[#67B239]" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Agent Activity & Audit Logs
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time live audit trail of agent actions across prospects, stages, meetings,
            invoices, and payments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="h-9 px-3 text-xs gap-1.5 font-semibold cursor-pointer rounded-xl"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Stream
          </Button>

          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs px-3 py-1.5 font-semibold gap-1.5"
          >
            <Lock className="size-4 text-emerald-600" />
            Live Audit Stream
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Audit Events"
          value={String(totalLogsCount)}
          icon={Activity}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Prospect & Stage Events"
          value={String(prospectLogsCount)}
          icon={Users2}
          colorScheme="pastelTeal"
        />
        <StatCard
          label="Financial & Invoices"
          value={String(financeLogsCount)}
          icon={Receipt}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Meetings & Follow-ups"
          value={String(tasksMeetingsCount)}
          icon={CalendarClock}
          colorScheme="pastelPeach"
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <Select value={agentFilter} onValueChange={(val: string) => setAgentFilter(val)}>
            <SelectTrigger className="w-44 bg-white rounded-xl">
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

          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search action, prospect name, phone, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 bg-white rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-48 bg-white rounded-xl">
              <Layers className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="stage">Stage Transitions</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="prospect">Prospects</SelectItem>
              <SelectItem value="opportunity">Opportunities</SelectItem>
              <SelectItem value="followup">Follow-ups</SelectItem>
              <SelectItem value="invoice">Invoices</SelectItem>
              <SelectItem value="payment">Payments</SelectItem>
              <SelectItem value="sms">SMS Dispatches</SelectItem>
              <SelectItem value="user">User Administration</SelectItem>
            </SelectContent>
          </Select>

          {(search || entityFilter !== "all" || agentFilter !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearch("");
                setEntityFilter("all");
                setAgentFilter("all");
              }}
              className="rounded-xl"
              title="Reset Filters"
            >
              <RotateCcw className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b bg-slate-50/80 dark:bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Action & Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Agent / User</th>
                <th className="py-3.5 px-4">Prospect / Entity</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={6} className="py-4 px-4">
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Activity className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-foreground">
                      No activity logs match your search
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try resetting search filters or selecting "All Categories".
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const prospectName = log.metadata_json["prospect_name"] as string | undefined;
                  const businessName = log.metadata_json["business_name"] as string | undefined;
                  const phone = log.metadata_json["phone"] as string | undefined;

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                          <Activity className="size-3.5 text-[#67B239] shrink-0" />
                          <span>{log.action}</span>
                        </div>
                        {(prospectName || businessName || phone) && (
                          <div className="text-muted-foreground text-[11px] flex items-center gap-2 mt-1 truncate">
                            {prospectName && (
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {prospectName}
                              </span>
                            )}
                            {businessName && (
                              <span className="text-slate-500 truncate flex items-center gap-0.5">
                                <Building2 className="size-3 inline" />
                                {businessName}
                              </span>
                            )}
                            {phone && (
                              <span className="text-slate-400 font-mono text-[10px] flex items-center gap-0.5">
                                <Phone className="size-2.5 inline" />
                                {phone}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getCategoryBadge(log.entity_type)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <div className="size-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {log.user_name.charAt(0).toUpperCase()}
                          </div>
                          <span>{log.user_name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {prospectName || log.entity_id || "System"}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3 text-slate-400" />
                          {new Date(log.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 rounded-lg font-semibold cursor-pointer"
                          onClick={() => setModalState({ open: true, log })}
                        >
                          <FileJson className="size-3.5 text-blue-600" />
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ActivityLogMetadataModal
        open={modalState.open}
        onOpenChange={(open) => setModalState((prev) => ({ ...prev, open }))}
        log={modalState.log}
      />
    </div>
  );
}
