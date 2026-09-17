"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Pencil,
  Phone,
  Clock,
  User,
  Users2,
  Trophy,
  TrendingUp,
  CalendarIcon,
  Mail,
  MapPin,
  FileText,
  PhoneCall,
  MessageSquare,
  Globe,
  Building2,
  UserCheck,
  CheckCircle2,
  CalendarClock,
  DollarSign,
  Flame,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useDebounce } from "use-debounce";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { formatCrmDateTime } from "@/lib/mysql-client";
import { agentsQuery } from "@/lib/follow-ups";
import { servicesQueryOptions } from "@/lib/services";
import {
  qualifiedLeadsQuery,
  qualifiedLeadsSummaryQuery,
  useDisqualifyProspectMutation,
  type QualifiedLead,
} from "@/lib/qualified-leads";
import { getProspectCleanNotes, deleteProspect, type Prospect } from "@/lib/prospects";
import { AddProspectDialog } from "@/components/add-prospect-dialog";
import { EditProspectDialog } from "@/components/edit-prospect-dialog";
import { DeleteProspectDialog } from "@/components/delete-prospect-dialog";
import { ScheduleMeetingDialog } from "@/components/schedule-meeting-dialog";
import { FollowUpDialog } from "@/components/follow-up-dialog";
import { formatCurrencyBdt } from "@/lib/expenses";

function StatCard({
  label,
  value,
  icon: Icon,
  colorScheme,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme: "pastelPurple" | "pastelTeal" | "pastelEmerald" | "pastelPeach";
}) {
  const schemeStyles = {
    pastelPurple: {
      bg: "bg-[#F3E8FF] dark:bg-purple-950/40",
      iconText: "text-purple-600 dark:text-purple-300",
      watermark: "text-purple-600/12 dark:text-purple-400/12",
    },
    pastelTeal: {
      bg: "bg-[#E6F7F5] dark:bg-teal-950/40",
      iconText: "text-teal-600 dark:text-teal-300",
      watermark: "text-teal-600/12 dark:text-teal-400/12",
    },
    pastelEmerald: {
      bg: "bg-[#EBF7E7] dark:bg-emerald-950/40",
      iconText: "text-emerald-600 dark:text-emerald-300",
      watermark: "text-emerald-600/12 dark:text-emerald-400/12",
    },
    pastelPeach: {
      bg: "bg-[#FFF4ED] dark:bg-orange-950/40",
      iconText: "text-orange-600 dark:text-orange-300",
      watermark: "text-orange-600/12 dark:text-orange-400/12",
    },
  }[colorScheme];

  return (
    <Card className="border-border/60 bg-card shadow-xs overflow-hidden relative">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
        </div>
        <div className={`p-3 rounded-xl ${schemeStyles.bg} ${schemeStyles.iconText}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function QualifiedLeadsContent() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 300);
  const [selectedService, setSelectedService] = useState("all");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editLead, setEditLead] = useState<Prospect | null>(null);
  const [deleteLead, setDeleteLead] = useState<{ id: string; name: string } | null>(null);
  const [scheduleMeetingLead, setScheduleMeetingLead] = useState<QualifiedLead | null>(null);
  const [followUpLead, setFollowUpLead] = useState<QualifiedLead | null>(null);

  const { data, isLoading } = useQuery(
    qualifiedLeadsQuery({
      search: debouncedSearch,
      service: selectedService,
      agent: selectedAgent,
      page,
      pageSize,
    }),
  );

  const { data: summary, isLoading: isSummaryLoading } = useQuery(qualifiedLeadsSummaryQuery());
  const { data: services = [] } = useQuery(servicesQueryOptions());
  const { data: agents = [] } = useQuery(agentsQuery());

  const disqualifyMutation = useDisqualifyProspectMutation();

  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize) || 1;

  return (
    <div className="space-y-6 pb-12 font-['Golos_Text',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-[#67B239]" />
            Qualified Leads
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            High-intent vetted prospects ready for proposals, meetings, and project conversion.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-[#67B239] hover:bg-[#5aa030] text-white font-medium shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Prospect / Lead
          </Button>
        </div>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Qualified"
          value={isSummaryLoading ? "..." : (summary?.totalQualified ?? 0)}
          icon={UserCheck}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Hot / High Priority"
          value={isSummaryLoading ? "..." : (summary?.highPriorityCount ?? 0)}
          icon={Flame}
          colorScheme="pastelPeach"
        />
        <StatCard
          label="Pipeline Value"
          value={isSummaryLoading ? "..." : formatCurrencyBdt(summary?.pipelineValue ?? 0)}
          icon={DollarSign}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Converted to Projects"
          value={isSummaryLoading ? "..." : (summary?.convertedCount ?? 0)}
          icon={Trophy}
          colorScheme="pastelTeal"
        />
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-card border border-border/60 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search contact, business name, phone, email..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Service Filter */}
          <div>
            <Select
              value={selectedService}
              onValueChange={(val) => {
                setSelectedService(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((srv) => (
                  <SelectItem key={srv.id} value={srv.name}>
                    {srv.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agent Filter */}
          <div className="flex items-center gap-2">
            <Select
              value={selectedAgent}
              onValueChange={(val) => {
                setSelectedAgent(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm flex-1">
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

            {(search || selectedService !== "all" || selectedAgent !== "all") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("");
                  setSelectedService("all");
                  setSelectedAgent("all");
                  setPage(1);
                }}
                title="Reset filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card key={idx} className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-32" />
            </Card>
          ))}
        </div>
      ) : data?.items?.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/60 rounded-xl">
          <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-semibold text-foreground">No Qualified Leads Found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            No leads currently match this qualification criteria or filter. Qualify prospects from
            the main Prospects page or add a new qualified lead.
          </p>
          <div className="mt-4">
            <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-[#67B239] hover:bg-[#5aa030] text-white"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add New Lead
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.items?.map((lead) => {
            const cleanNote = getProspectCleanNotes(lead.notes);
            const creatorName = lead.creator_name || "Admin";
            const creatorAvatar = lead.creator_avatar;

            // Formatted as Prospect type for edit modal
            const prospectForModal: Prospect = {
              id: lead.id,
              contact_name: lead.contact_name,
              business_name: lead.business_name,
              designation: lead.designation,
              phone: lead.phone,
              alternative_phone: lead.alternative_phone,
              email: lead.email,
              address: lead.address,
              website_url: lead.website_url,
              logo_url: lead.logo_url,
              service_id: lead.service_id,
              stage_id: lead.stage_id,
              assigned_to: lead.assigned_to,
              assigned_artist_id: lead.assigned_artist_id ?? null,
              created_by: lead.created_by,
              notes: lead.notes,
              created_at: lead.created_at,
              updated_at: lead.updated_at,
              service_name: lead.service_name,
              stage_name: lead.stage_name,
              stage_color: lead.stage_color,
              stage_icon: lead.stage_icon,
              assigned_agent_name: lead.assigned_agent_name,
              assigned_agent_avatar: lead.assigned_agent_avatar,
              assigned_artist_name: lead.assigned_artist_name,
              assigned_artist_avatar: lead.assigned_artist_avatar,
              creator_name: lead.creator_name,
              creator_avatar: lead.creator_avatar,
            };

            return (
              <Card
                key={lead.id}
                className="p-5 border border-slate-200/90 dark:border-slate-800 rounded-[12px] shadow-[0_4px_4px_0_rgba(219,219,219,0.25)] hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Top Row: Avatar, Names, 3-dots Menu */}
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-[#67B239]/10 text-[#67B239] border border-[#67B239]/30 flex items-center justify-center font-bold text-sm shrink-0">
                        {lead.contact_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className="font-semibold text-[14px] text-foreground truncate"
                          title={lead.contact_name}
                        >
                          {lead.contact_name}
                        </h3>
                        <p
                          className="text-[12px] text-muted-foreground truncate"
                          title={lead.business_name || lead.designation || "No business"}
                        >
                          {lead.business_name || lead.designation || "Individual Lead"}
                        </p>
                      </div>
                    </div>

                    {/* Action Dropdown Menu (160px width spec per AGENTS.md) */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[160px] min-w-[160px] rounded-[5px] p-1 shadow-[0_4px_4px_0_rgba(219,219,219,0.25)]"
                      >
                        <DropdownMenuItem
                          onClick={() => setEditLead(prospectForModal)}
                          className="px-[15px] py-[6.4px] rounded-[6px] text-[14px] font-normal leading-[21px] text-[#707070] cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-2 text-[#1B84FF]" />
                          Edit Lead
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setScheduleMeetingLead(lead)}
                          className="px-[15px] py-[6.4px] rounded-[6px] text-[14px] font-normal leading-[21px] text-[#707070] cursor-pointer"
                        >
                          <CalendarClock className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                          Meeting
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setFollowUpLead(lead)}
                          className="px-[15px] py-[6.4px] rounded-[6px] text-[14px] font-normal leading-[21px] text-[#707070] cursor-pointer"
                        >
                          <Clock className="h-3.5 w-3.5 mr-2 text-amber-500" />
                          Follow Up
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => disqualifyMutation.mutate(lead.id)}
                          className="px-[15px] py-[6.4px] rounded-[6px] text-[14px] font-normal leading-[21px] text-[#707070] cursor-pointer"
                        >
                          <User className="h-3.5 w-3.5 mr-2 text-slate-500" />
                          Disqualify
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteLead({ id: lead.id, name: lead.contact_name })}
                          className="px-[15px] py-[6.4px] rounded-[6px] text-[14px] font-normal leading-[21px] text-[#dc2626] focus:text-[#dc2626] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Metadata Rows: Email, Phone, Location */}
                  <div className="space-y-1.5 text-[12px] text-muted-foreground mb-3">
                    {lead.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                        <span className="text-foreground">{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                    {lead.address && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                        <span className="truncate">{lead.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 pt-0.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0" />
                      <span>{formatCrmDateTime(lead.created_at)}</span>
                    </div>
                  </div>

                  {/* Torn Paper / Sticky Note Requirement Banner */}
                  {cleanNote ? (
                    <div
                      className="mb-3 p-2 bg-[#FEFCE8] dark:bg-[#1e1a0e] border border-[#FDE68A]/60 dark:border-[#4a3f1d] rounded-md text-[11px] text-amber-900 dark:text-amber-200 line-clamp-2"
                      title={cleanNote}
                    >
                      <span className="font-semibold text-amber-800 dark:text-amber-300">
                        Note:{" "}
                      </span>
                      {cleanNote}
                    </div>
                  ) : (
                    <div className="mb-3 p-1.5 bg-muted/40 rounded-md text-[11px] text-muted-foreground italic">
                      No notes recorded
                    </div>
                  )}

                  {/* Soft Badges Row: Service & Stage & Budget */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200"
                    >
                      {lead.service_name || "General Service"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[11px] font-medium"
                      style={{
                        backgroundColor: `${lead.stage_color || "#67B239"}15`,
                        color: lead.stage_color || "#67B239",
                        borderColor: `${lead.stage_color || "#67B239"}30`,
                      }}
                    >
                      {lead.stage_name}
                    </Badge>
                    {lead.estimated_budget ? (
                      <Badge className="text-[11px] font-bold bg-[#67B239]/15 text-[#55962e] dark:bg-[#67B239]/25 dark:text-[#7ac142] border-[#67B239]/30">
                        {formatCurrencyBdt(lead.estimated_budget)}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {/* Bottom Footer: Communication Actions + Creator / Assignee */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {/* Quick Action Circle Links */}
                  <div className="flex items-center gap-1">
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-[#67B239] hover:text-white transition-colors"
                        title="Call"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {lead.phone && (
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="WhatsApp"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        title="Email"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Creator / Assignee Info */}
                  <div className="flex items-center gap-1.5 text-right">
                    <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
                      {lead.assigned_agent_name || creatorName}
                    </span>
                    <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300 overflow-hidden shrink-0">
                      {creatorAvatar ? (
                        <img src={creatorAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (lead.assigned_agent_name || creatorName).slice(0, 1).toUpperCase()
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dynamic Pagination Bar (per AGENTS.md) */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card border border-border/60 rounded-xl gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Show:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-18 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="36">36</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
          <span>per page • Total {data?.totalCount || 0} leads</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 px-3 text-xs"
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 px-3 text-xs"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add Prospect Drawer */}
      <AddProspectDialog open={isAddOpen} onOpenChange={setIsAddOpen} />

      {/* Edit Prospect Drawer */}
      {editLead && (
        <EditProspectDialog
          key={editLead.id}
          prospectId={editLead.id}
          prospect={editLead}
          open={!!editLead}
          onOpenChange={(open) => {
            if (!open) setEditLead(null);
          }}
        />
      )}

      {/* Delete Prospect Modal */}
      {deleteLead && (
        <DeleteProspectDialog
          open={!!deleteLead}
          onOpenChange={(open) => {
            if (!open) setDeleteLead(null);
          }}
          prospect={deleteLead}
          onConfirm={async () => {
            await deleteProspect(deleteLead.id);
            setDeleteLead(null);
          }}
        />
      )}

      {/* Schedule Meeting Modal */}
      {scheduleMeetingLead && (
        <ScheduleMeetingDialog
          open={!!scheduleMeetingLead}
          onOpenChange={(open) => {
            if (!open) setScheduleMeetingLead(null);
          }}
          defaultProspectId={scheduleMeetingLead.id}
        />
      )}

      {/* Follow Up Dialog */}
      {followUpLead && (
        <FollowUpDialog
          open={!!followUpLead}
          onOpenChange={(open) => {
            if (!open) setFollowUpLead(null);
          }}
          prospectId={followUpLead.id}
          prospectLabel={followUpLead.contact_name}
        />
      )}
    </div>
  );
}

export default function QualifiedLeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">Loading qualified leads...</div>
      }
    >
      <QualifiedLeadsContent />
    </Suspense>
  );
}
