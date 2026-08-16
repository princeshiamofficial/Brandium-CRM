import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Search,
  ShieldCheck,
  ShieldAlert,
  FileJson,
  User,
  Clock,
  FilterX,
  Users2,
  Target,
  CalendarClock,
  Receipt,
  MessageSquare,
  Lock,
  Eye,
  RotateCcw,
  Layers,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

import { activityLogsQueryOptions, ActivityLogFilters, ActivityLog } from "@/lib/activity-logs";
import { ActivityLogMetadataModal } from "@/components/activity-log-metadata-modal";

export const Route = createFileRoute("/_authenticated/agent-activity")({
  head: () => ({
    meta: [
      { title: "Agent Activity Logs | Brandium Telesales CRM" },
      {
        name: "description",
        content: "Immutable real-time audit logs across prospects, deals, payments, and users.",
      },
      { property: "og:title", content: "Agent Activity Logs | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Immutable real-time audit logs across prospects, deals, payments, and users.",
      },
    ],
  }),
  component: AgentActivityPage,
});

function AgentActivityPage() {
  const [search, setSearch] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [modalState, setModalState] = useState<{
    open: boolean;
    log: ActivityLog | null;
  }>({ open: false, log: null });

  const { data: rawLogs = [], isLoading } = useQuery(activityLogsQueryOptions());
  const { data: rawAgents = [] } = useQuery(agentOptionsQueryOptions());

  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const agents = Array.isArray(rawAgents) ? rawAgents : [];

  const totalLogsCount = logs.length;
  const prospectLogsCount = logs.filter((l) => l.entity_type === "prospect").length;
  const financeLogsCount = logs.filter(
    (l) => l.entity_type === "invoice" || l.entity_type === "payment",
  ).length;
  const smsLogsCount = logs.filter((l) => l.entity_type === "sms").length;

  const filteredLogs = logs.filter((log) => {
    if (entityFilter !== "all" && log.entity_type !== entityFilter) {
      return false;
    }

    if (agentFilter !== "all") {
      const agentObj = agents.find((a) => a.id === agentFilter);
      if (agentObj && log.user_name !== agentObj.name) {
        return false;
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      return (
        log.action?.toLowerCase().includes(searchLower) ||
        log.user_name?.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.metadata_json)?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getCategoryBadge = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case "prospect":
        return (
          <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 text-[10px] px-2 py-0.5 gap-1">
            <Users2 className="size-3" />
            Prospect
          </Badge>
        );
      case "opportunity":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 text-[10px] px-2 py-0.5 gap-1">
            <Target className="size-3" />
            Opportunity
          </Badge>
        );
      case "followup":
      case "meeting":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 text-[10px] px-2 py-0.5 gap-1">
            <CalendarClock className="size-3" />
            Task/Meeting
          </Badge>
        );
      case "invoice":
      case "payment":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 text-[10px] px-2 py-0.5 gap-1">
            <Receipt className="size-3" />
            Billing/Pay
          </Badge>
        );
      case "sms":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 text-[10px] px-2 py-0.5 gap-1">
            <MessageSquare className="size-3" />
            SMS
          </Badge>
        );
      case "user":
        return (
          <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200 text-[10px] px-2 py-0.5 gap-1">
            <User className="size-3" />
            User Admin
          </Badge>
        );
      default:
        return <Badge variant="outline">{entityType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-7 text-[#67B239]" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Activity & Audit Logs Stream
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Immutable audit record stream for 9 lifecycle categories. Normal agents are strictly
            prohibited from editing audit logs.
          </p>
        </div>

        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs px-3 py-1.5 font-semibold gap-1.5 self-start sm:self-auto"
        >
          <Lock className="size-4 text-emerald-600" />
          Immutable Audit Trail Active
        </Badge>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Audit Events"
          value={String(totalLogsCount)}
          icon={Activity}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Prospect Events"
          value={String(prospectLogsCount)}
          icon={Users2}
          colorScheme="pastelTeal"
        />
        <StatCard
          label="Financial & Payments"
          value={String(financeLogsCount)}
          icon={Receipt}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="SMS Communications"
          value={String(smsLogsCount)}
          icon={MessageSquare}
          colorScheme="pastelPeach"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left-side filters: Agent & Search */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Agent Selector */}
          <Select value={agentFilter} onValueChange={(val: string) => setAgentFilter(val)}>
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
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 bg-white"
            />
          </div>
        </div>

        {/* Right-side filters: Category */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-42.5 bg-white">
              <Layers className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="prospect">Prospects</SelectItem>
              <SelectItem value="opportunity">Opportunities</SelectItem>
              <SelectItem value="followup">Follow-ups & Meetings</SelectItem>
              <SelectItem value="invoice">Invoices & Bills</SelectItem>
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
            >
              <RotateCcw className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Audit Log Stream Table */}
      <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b bg-slate-50/80 dark:bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Action & Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Logged By User</th>
                <th className="py-3.5 px-4">Entity ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Payload</th>
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
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Activity className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-foreground">No audit logs match your search</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try resetting search filters or category selections.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors"
                  >
                    {/* Action & Description */}
                    <td className="py-3.5 px-4 max-w-72">
                      <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <Activity className="size-3.5 text-[#67B239] shrink-0" />
                        <span>{log.action}</span>
                      </div>
                      <p
                        className="text-muted-foreground text-[11px] truncate mt-0.5"
                        title={JSON.stringify(log.metadata_json)}
                      >
                        {log.metadata_json["message"] ||
                        log.metadata_json["title"] ||
                        log.metadata_json["client_name"]
                          ? String(
                              log.metadata_json["message"] ||
                                log.metadata_json["title"] ||
                                log.metadata_json["client_name"],
                            )
                          : `Recorded ${log.action}`}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCategoryBadge(log.entity_type)}
                    </td>

                    {/* Logged By User */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-foreground">
                      <div className="flex items-center gap-1">
                        <User className="size-3 text-slate-400" />
                        {log.user_name}
                      </div>
                    </td>

                    {/* Entity ID */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {log.entity_id || "N/A"}
                    </td>

                    {/* Timestamp */}
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

                    {/* Payload Metadata Inspector */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs gap-1"
                        onClick={() => setModalState({ open: true, log })}
                      >
                        <FileJson className="size-3.5 text-blue-600" />
                        Inspect JSON
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payload Metadata Inspector Modal */}
      <ActivityLogMetadataModal
        open={modalState.open}
        onOpenChange={(open) => setModalState((prev) => ({ ...prev, open }))}
        log={modalState.log}
      />
    </div>
  );
}
