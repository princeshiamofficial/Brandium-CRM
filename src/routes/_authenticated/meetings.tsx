import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Building2,
  Video,
  MapPin,
  HelpCircle,
  Phone,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  Plus,
  Filter,
  Eye,
  MoreVertical,
  Check,
  CalendarDays,
  FileText,
  CalendarIcon,
  Layers,
  ListFilter,
  X,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { MeetingDetailModal } from "@/components/meeting-detail-modal";
import { ScheduleMeetingDialog } from "@/components/schedule-meeting-dialog";
import { EditMeetingDialog } from "@/components/edit-meeting-dialog";
import { DeleteMeetingDialog } from "@/components/delete-meeting-dialog";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

import {
  meetingsQueryOptions,
  updateMeetingStatus,
  updateMeetingNotes,
  sendMeetingReminderSms,
  deleteMeeting,
  type Meeting,
  type MeetingStatus,
  type MeetingType,
  type MeetingFilters,
} from "@/lib/meetings";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings | Brandium Telesales CRM" },
      { name: "description", content: "Schedule, track and manage client meetings." },
      { property: "og:title", content: "Meetings | Brandium Telesales CRM" },
      { property: "og:description", content: "Schedule, track and manage client meetings." },
    ],
  }),
  component: MeetingsPage,
});

function getTypeIcon(type: MeetingType) {
  switch (type) {
    case "Office":
      return Building2;
    case "Online":
      return Video;
    case "Client Location":
      return MapPin;
    default:
      return HelpCircle;
  }
}

function getStatusBadge(status: MeetingStatus) {
  switch (status) {
    case "Completed":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5"
        >
          <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" /> Completed
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge
          variant="destructive"
          className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5"
        >
          <XCircle className="size-3.5 text-red-600 dark:text-red-400" /> Cancelled
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5"
        >
          <Clock3 className="size-3.5 text-amber-600 dark:text-amber-400" /> Scheduled
        </Badge>
      );
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  colorScheme,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme: "pastelPurple" | "pastelTeal" | "pastelEmerald" | "pastelPeach" | "pastelYellow";
}) {
  const styles = {
    pastelPurple: {
      cardBg: "bg-[#F1E8FF] dark:bg-purple-950/40",
      iconText: "text-[#8B5CF6] dark:text-purple-400",
    },
    pastelTeal: {
      cardBg: "bg-[#E1F1F0] dark:bg-teal-950/40",
      iconText: "text-[#0D9488] dark:text-teal-400",
    },
    pastelEmerald: {
      cardBg: "bg-[#E3F2E1] dark:bg-emerald-950/40",
      iconText: "text-[#059669] dark:text-emerald-400",
    },
    pastelPeach: {
      cardBg: "bg-[#FCE8E2] dark:bg-rose-950/40",
      iconText: "text-[#EA580C] dark:text-orange-400",
    },
    pastelYellow: {
      cardBg: "bg-[#FBF3D5] dark:bg-amber-950/40",
      iconText: "text-[#D97706] dark:text-amber-400",
    },
  }[colorScheme];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-4 sm:p-4.5 shadow-md hover:shadow-lg transition-all duration-200 select-none ${styles.cardBg}`}
    >
      <div className="relative z-10 flex items-center gap-3.5">
        {/* Left Circular White Badge */}
        <div className="size-10 sm:size-11 rounded-full bg-white dark:bg-card shadow-2xs flex items-center justify-center shrink-0">
          <Icon className={`size-5 sm:size-5.5 ${styles.iconText}`} />
        </div>

        {/* Right Label & Value */}
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight mt-0.5 tracking-tight truncate">
            {value}
          </p>
        </div>
      </div>

      {/* Faint Watermark Icon Background */}
      <div className="absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transform rotate-12 scale-125 transition-transform group-hover:scale-135">
        <Icon className={`size-16 ${styles.iconText}`} />
      </div>
    </div>
  );
}

function MeetingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  // Filter state
  const [search, setSearch] = useState("");
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<MeetingType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [calOpen, setCalOpen] = useState(false);

  const filters: MeetingFilters = {
    search,
    meeting_type: meetingTypeFilter,
    status: statusFilter,
    start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const meetingsQuery = useQuery(meetingsQueryOptions(filters, user?.id, isAdmin));
  const meetings = meetingsQuery.data ?? [];

  // Metrics calculations
  const totalCount = meetings.length;
  const scheduledCount = meetings.filter((m) => m.status === "Scheduled").length;
  const completedCount = meetings.filter((m) => m.status === "Completed").length;
  const cancelledCount = meetings.filter((m) => m.status === "Cancelled").length;
  const smsSentCount = meetings.filter((m) => m.sms_sent).length;

  // SMS Modal State
  const [activeSmsMeeting, setActiveSmsMeeting] = useState<Meeting | null>(null);
  const [smsMessageText, setSmsMessageText] = useState("");
  const [smsResultText, setSmsResultText] = useState("");

  // Notes Modal State
  const [activeNotesMeeting, setActiveNotesMeeting] = useState<Meeting | null>(null);
  const [editingNotesText, setEditingNotesText] = useState("");

  // View Details Modal State
  const [viewDetailMeeting, setViewDetailMeeting] = useState<Meeting | null>(null);

  // Schedule New Meeting Modal State
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Edit Meeting Modal State
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MeetingStatus }) =>
      updateMeetingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });

  // Notes Mutation
  const notesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => updateMeetingNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setActiveNotesMeeting(null);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete meeting");
    },
  });

  // SMS Mutation
  const smsMutation = useMutation({
    mutationFn: ({ id, msg }: { id: string; msg: string }) => sendMeetingReminderSms(id, msg),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setSmsResultText(res.message);
      setTimeout(() => {
        setActiveSmsMeeting(null);
        setSmsResultText("");
      }, 1500);
    },
  });

  const handleOpenDeleteModal = (m: Meeting) => {
    setDeleteTarget(m);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenSmsModal = (m: Meeting) => {
    setActiveSmsMeeting(m);
    setSmsMessageText(
      `Reminder: You have a ${m.meeting_type} meeting "${m.title}" scheduled for ${m.meeting_date} at ${m.meeting_time}. Location/Link: ${m.location || "N/A"}. Brandium CRM.`,
    );
  };

  const handleOpenNotesModal = (m: Meeting) => {
    setActiveNotesMeeting(m);
    setEditingNotesText(m.notes || "");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Main Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Meetings{" "}
            <Badge className="bg-[#67B239] text-white border-0 text-xs">{totalCount}</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule, track, and manage client meetings, demos, and follow-up discussions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsScheduleDialogOpen(true)}
            className="bg-[#67B239] hover:bg-[#589c2f] text-white font-semibold shadow-xs gap-1.5 px-4"
          >
            <Plus className="size-4" /> Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          label="Total Meetings"
          value={totalCount}
          icon={CalendarDays}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Scheduled"
          value={scheduledCount}
          icon={Clock3}
          colorScheme="pastelYellow"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Cancelled"
          value={cancelledCount}
          icon={XCircle}
          colorScheme="pastelPeach"
        />
        <StatCard label="SMS Reminders" value={smsSentCount} icon={Send} colorScheme="pastelTeal" />
      </div>

      {/* Search & Multi-filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input — left side */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Search name, business, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 bg-white [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Right-side filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <Select
            value={meetingTypeFilter}
            onValueChange={(val: string) => setMeetingTypeFilter(val as MeetingType | "all")}
          >
            <SelectTrigger className="w-42.5 bg-white">
              <Layers className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Client Location">Client Location</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val: string) => setStatusFilter(val as MeetingStatus | "all")}
          >
            <SelectTrigger className="w-42.5 bg-white">
              <ListFilter className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`bg-white gap-2 text-xs font-normal ${
                  dateRange?.from ? "text-foreground" : "text-muted-foreground"
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

      {/* Meetings Table List */}
      <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50/80 dark:bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Prospect</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Location / Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">SMS Badge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {meetings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Calendar className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-foreground">No meetings found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try resetting search filters or schedule a new meeting.
                    </p>
                  </td>
                </tr>
              ) : (
                meetings.map((m) => {
                  const TypeIcon = getTypeIcon(m.meeting_type);
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors"
                    >
                      {/* Title */}
                      <td className="py-3.5 px-4 max-w-56">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setViewDetailMeeting(m)}
                            className="font-semibold text-foreground hover:text-[#67B239] transition-colors truncate block text-left cursor-pointer"
                          >
                            {m.title}
                          </button>
                          <Badge
                            variant="outline"
                            className="gap-1 text-[10px] px-1.5 py-0 border-slate-300 dark:border-border font-normal text-muted-foreground"
                          >
                            <TypeIcon className="size-2.5 text-[#67B239]" /> {m.meeting_type}
                          </Badge>
                        </div>
                      </td>

                      {/* Prospect */}
                      <td className="py-3.5 px-4 max-w-56 text-xs">
                        <p className="font-medium text-foreground truncate">
                          {m.business_name || m.prospect_name || "Direct Client"}
                        </p>
                        <p className="text-muted-foreground truncate">
                          {m.business_name && m.prospect_name ? `${m.prospect_name}` : ""}
                          {m.phone && (
                            <span className="font-mono">
                              {m.business_name && m.prospect_name ? " · " : ""}
                              {m.phone}
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <div className="font-medium text-foreground">{m.meeting_date}</div>
                        <div className="text-muted-foreground">{m.meeting_time}</div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 max-w-50 text-xs">
                        <p
                          className="truncate text-muted-foreground"
                          title={m.location || undefined}
                        >
                          {m.location || "N/A"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(m.status)}</td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-52 text-xs">
                        {m.notes ? (
                          <button
                            type="button"
                            onClick={() => handleOpenNotesModal(m)}
                            className="group text-left flex items-start gap-1.5 text-slate-700 dark:text-slate-300 hover:text-[#67B239] dark:hover:text-[#67B239] transition-colors cursor-pointer"
                            title="Click to view/edit notes"
                          >
                            <FileText className="size-3.5 text-slate-400 group-hover:text-[#67B239] shrink-0 mt-0.5" />
                            <span className="line-clamp-2 text-xs leading-snug">{m.notes}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenNotesModal(m)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[#67B239] transition-colors cursor-pointer"
                            title="Add notes"
                          >
                            <Plus className="size-3 text-slate-400" />
                            <span>Add Note</span>
                          </button>
                        )}
                      </td>

                      {/* SMS Sent Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {m.sms_sent ? (
                          <Badge
                            variant="outline"
                            className="bg-[#67B239]/15 text-[#468026] dark:text-[#7AC142] border-[#67B239]/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5"
                          >
                            <Check className="size-3.5 text-[#67B239] stroke-[2.5]" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
                          >
                            Pending
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-accent transition-colors cursor-pointer"
                              >
                                <MoreVertical className="size-4" />
                                <span className="sr-only">Open actions menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem
                                onClick={() => setViewDetailMeeting(m)}
                                className="cursor-pointer font-medium text-xs py-2"
                              >
                                <Eye className="size-3.5 text-slate-500 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingMeeting(m)}
                                className="cursor-pointer font-medium text-xs py-2"
                              >
                                <Pencil className="size-3.5 text-blue-600 mr-2" /> Edit Meeting
                                Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenSmsModal(m)}
                                className="cursor-pointer font-medium text-xs py-2 text-[#468026] dark:text-[#7AC142]"
                              >
                                <MessageSquare className="size-3.5 text-[#67B239] mr-2" /> Send SMS
                                Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenNotesModal(m)}
                                className="cursor-pointer font-medium text-xs py-2"
                              >
                                <FileText className="size-3.5 text-slate-500 mr-2" /> Meeting Notes
                                & Agenda
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() =>
                                  statusMutation.mutate({ id: m.id, status: "Scheduled" })
                                }
                                className="cursor-pointer font-medium text-xs py-2"
                              >
                                <Clock3 className="size-3.5 text-amber-500 mr-2" /> Mark Scheduled
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  statusMutation.mutate({ id: m.id, status: "Completed" })
                                }
                                className="cursor-pointer font-medium text-xs py-2 text-green-600 dark:text-green-400"
                              >
                                <CheckCircle2 className="size-3.5 text-[#67B239] mr-2" /> Mark
                                Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  statusMutation.mutate({ id: m.id, status: "Cancelled" })
                                }
                                className="cursor-pointer font-medium text-xs py-2 text-rose-600 dark:text-rose-400"
                              >
                                <XCircle className="size-3.5 text-rose-500 mr-2" /> Mark Cancelled
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => handleOpenDeleteModal(m)}
                                className="cursor-pointer font-semibold text-xs py-2 text-destructive focus:text-destructive focus:bg-rose-50 dark:focus:bg-rose-950/40"
                              >
                                <Trash2 className="size-3.5 text-destructive mr-2" /> Delete Meeting
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SMS Reminder Modal */}
      <Dialog
        open={Boolean(activeSmsMeeting)}
        onOpenChange={(open) => !open && setActiveSmsMeeting(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Send className="size-4 text-[#67B239]" /> Send Meeting SMS Reminder
            </DialogTitle>
            <DialogDescription className="text-xs">
              Send SMS reminder for "{activeSmsMeeting?.title}" to{" "}
              {activeSmsMeeting?.phone || "client"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {smsResultText && (
              <div className="p-3 rounded-lg bg-[#67B239]/10 border border-[#67B239]/30 text-[#0B3364] dark:text-foreground text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="size-4 text-[#67B239]" /> {smsResultText}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-medium">SMS Message</Label>
              <Textarea
                rows={4}
                value={smsMessageText}
                onChange={(e) => setSmsMessageText(e.target.value)}
                className="bg-white dark:bg-background text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSmsMeeting(null)}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={smsMutation.isPending || !smsMessageText.trim()}
              onClick={() =>
                activeSmsMeeting &&
                smsMutation.mutate({ id: activeSmsMeeting.id, msg: smsMessageText })
              }
              className="bg-[#67B239] text-white gap-1.5"
            >
              <Send className="size-3.5" />
              {smsMutation.isPending ? "Sending..." : "Send Reminder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notes Modal */}
      <Dialog
        open={Boolean(activeNotesMeeting)}
        onOpenChange={(open) => !open && setActiveNotesMeeting(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-[#67B239]" /> Meeting Notes & Agenda
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update discussion points or notes for "{activeNotesMeeting?.title}".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Textarea
              rows={5}
              value={editingNotesText}
              onChange={(e) => setEditingNotesText(e.target.value)}
              placeholder="Enter meeting notes..."
              className="bg-white dark:bg-background text-sm"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveNotesMeeting(null)}
              className="bg-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={notesMutation.isPending}
              onClick={() =>
                activeNotesMeeting &&
                notesMutation.mutate({ id: activeNotesMeeting.id, notes: editingNotesText })
              }
              className="bg-[#67B239] text-white gap-1.5"
            >
              {notesMutation.isPending ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        open={Boolean(viewDetailMeeting)}
        onOpenChange={(open) => !open && setViewDetailMeeting(null)}
        meeting={viewDetailMeeting}
        onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        onOpenSmsModal={(m) => handleOpenSmsModal(m)}
        onOpenNotesModal={(m) => handleOpenNotesModal(m)}
        onEditMeeting={(m) => {
          setViewDetailMeeting(null);
          setEditingMeeting(m);
        }}
        onDeleteMeeting={(m) => {
          setViewDetailMeeting(null);
          handleOpenDeleteModal(m);
        }}
      />

      {/* Schedule New Meeting Dialog */}
      <ScheduleMeetingDialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen} />

      {/* Edit Meeting Dialog */}
      <EditMeetingDialog
        open={Boolean(editingMeeting)}
        onOpenChange={(open) => !open && setEditingMeeting(null)}
        meeting={editingMeeting}
        onDeleteMeeting={(m) => {
          setEditingMeeting(null);
          handleOpenDeleteModal(m);
        }}
      />

      {/* Delete Meeting Dialog */}
      <DeleteMeetingDialog
        meeting={deleteTarget}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
