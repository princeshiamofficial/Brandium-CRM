"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Building2,
  Video,
  MapPin,
  HelpCircle,
  Send,
  CheckCircle2,
  XCircle,
  Clock3,
  Search,
  Plus,
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenuGroup,
  DropdownMenuLabel,
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
        <div className="size-10 sm:size-11 rounded-full bg-white dark:bg-card shadow-2xs flex items-center justify-center shrink-0">
          <Icon className={`size-5 sm:size-5.5 ${styles.iconText}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight mt-0.5 tracking-tight truncate">
            {value}
          </p>
        </div>
      </div>

      <div className="absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transform rotate-12 scale-125 transition-transform group-hover:scale-135">
        <Icon className={`size-16 ${styles.iconText}`} />
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

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

  const totalCount = meetings.length;
  const scheduledCount = meetings.filter((m) => m.status === "Scheduled").length;
  const completedCount = meetings.filter((m) => m.status === "Completed").length;
  const cancelledCount = meetings.filter((m) => m.status === "Cancelled").length;
  const smsSentCount = meetings.filter((m) => m.sms_sent).length;

  const [activeSmsMeeting, setActiveSmsMeeting] = useState<Meeting | null>(null);
  const [smsMessageText, setSmsMessageText] = useState("");
  const [smsResultText, setSmsResultText] = useState("");

  const [activeNotesMeeting, setActiveNotesMeeting] = useState<Meeting | null>(null);
  const [editingNotesText, setEditingNotesText] = useState("");

  const [viewDetailMeeting, setViewDetailMeeting] = useState<Meeting | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MeetingStatus }) =>
      updateMeetingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });

  const notesMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => updateMeetingNotes(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setActiveNotesMeeting(null);
    },
  });

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
    onError: (err: Error) => toast.error("SMS not sent", { description: err.message }),
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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

        <div className="flex flex-wrap items-center gap-2">
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

      <Card className="shadow-xl border bg-card rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-12.5 font-semibold">SL</TableHead>
                  <TableHead className="min-w-45 font-semibold">Title</TableHead>
                  <TableHead className="min-w-45 font-semibold">Prospect</TableHead>
                  <TableHead className="min-w-32.5 font-semibold">Date & Time</TableHead>
                  <TableHead className="min-w-40 font-semibold">Location / Link</TableHead>
                  <TableHead className="min-w-25 font-semibold">Status</TableHead>
                  <TableHead className="min-w-40 font-semibold">Notes</TableHead>
                  <TableHead className="min-w-25 font-semibold">SMS</TableHead>
                  <TableHead className="pr-6 text-right min-w-20 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetingsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={9} className="py-4 px-6">
                        <Skeleton className="h-12 w-full rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : meetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      <Calendar className="size-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-foreground">No meetings found</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Try resetting search filters or schedule a new meeting.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  meetings.map((m, index) => {
                    const TypeIcon = getTypeIcon(m.meeting_type);
                    return (
                      <TableRow key={m.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="pl-6 text-muted-foreground text-xs font-medium">
                          {index + 1}
                        </TableCell>

                        <TableCell className="max-w-56">
                          <button
                            type="button"
                            onClick={() => setViewDetailMeeting(m)}
                            className="font-medium text-foreground text-sm hover:text-[#67B239] transition-colors truncate block max-w-full text-left cursor-pointer"
                          >
                            {m.title}
                          </button>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <TypeIcon className="size-3 text-[#67B239]" /> {m.meeting_type}
                          </span>
                        </TableCell>

                        <TableCell className="max-w-56">
                          <p className="font-medium text-foreground text-sm truncate">
                            {m.business_name || m.prospect_name || "Direct Client"}
                          </p>
                          <p className="text-muted-foreground text-xs font-mono truncate">
                            {m.phone || (m.business_name ? m.prospect_name : "")}
                          </p>
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3 text-slate-400" />
                            {m.meeting_date}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock3 className="size-3 text-slate-400" />
                            {m.meeting_time}
                          </div>
                        </TableCell>

                        <TableCell className="text-muted-foreground text-xs max-w-50 truncate">
                          <span title={m.location || undefined}>{m.location || "N/A"}</span>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          {getStatusBadge(m.status)}
                        </TableCell>

                        <TableCell className="max-w-52 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenNotesModal(m)}
                            className="text-left flex items-start gap-1.5 text-muted-foreground hover:text-[#67B239] transition-colors cursor-pointer"
                            title={m.notes ? "Click to view/edit notes" : "Add notes"}
                          >
                            {m.notes ? (
                              <>
                                <FileText className="size-3.5 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-snug">{m.notes}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="size-3.5 shrink-0" />
                                <span>Add Note</span>
                              </>
                            )}
                          </button>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          {m.sms_sent ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
                            >
                              <Check className="size-3 text-green-600 dark:text-green-400" /> Sent
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            >
                              Pending
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="pr-6 text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 rounded-full"
                                title="Meeting Actions"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60 p-1 rounded-[10px]">
                              <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold truncate">
                                Actions for {m.title}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() => setViewDetailMeeting(m)}
                                  className="cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5"
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setEditingMeeting(m)}
                                  className="cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5"
                                >
                                  <Pencil className="mr-2 h-4 w-4" /> Edit Meeting
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenSmsModal(m)}
                                  className="cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5"
                                >
                                  <Send className="mr-2 h-4 w-4" /> Send SMS Reminder
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenNotesModal(m)}
                                  className="cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5"
                                >
                                  <FileText className="mr-2 h-4 w-4" /> Notes & Agenda
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() =>
                                    statusMutation.mutate({ id: m.id, status: "Scheduled" })
                                  }
                                  className="cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5"
                                >
                                  <Clock3 className="mr-2 h-4 w-4 text-amber-600" /> Mark Scheduled
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    statusMutation.mutate({ id: m.id, status: "Completed" })
                                  }
                                  className="cursor-pointer text-emerald-600 focus:text-emerald-700 text-sm gap-2 rounded-md px-2 py-1.5"
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Mark
                                  Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    statusMutation.mutate({ id: m.id, status: "Cancelled" })
                                  }
                                  className="cursor-pointer text-destructive focus:text-destructive text-sm gap-2 rounded-md px-2 py-1.5"
                                >
                                  <XCircle className="mr-2 h-4 w-4 text-destructive" /> Mark
                                  Cancelled
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
                              <DropdownMenuItem
                                onClick={() => handleOpenDeleteModal(m)}
                                className="cursor-pointer text-destructive focus:text-destructive text-sm gap-2 rounded-md px-2 py-1.5"
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete Meeting
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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

      <ScheduleMeetingDialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen} />

      <EditMeetingDialog
        open={Boolean(editingMeeting)}
        onOpenChange={(open) => !open && setEditingMeeting(null)}
        meeting={editingMeeting}
        onDeleteMeeting={(m) => {
          setEditingMeeting(null);
          handleOpenDeleteModal(m);
        }}
      />

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
