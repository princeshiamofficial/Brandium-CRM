import { useState } from "react";
import { Link } from "@/components/navigation-link";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Clock3,
  ExternalLink,
  FileText,
  HelpCircle,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Send,
  User,
  Video,
  XCircle,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { type Meeting, type MeetingStatus, type MeetingType } from "@/lib/meetings";

export interface MeetingDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
  onStatusChange?: (id: string, status: MeetingStatus) => void;
  onOpenSmsModal?: (meeting: Meeting) => void;
  onOpenNotesModal?: (meeting: Meeting) => void;
  onEditMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meeting: Meeting) => void;
}

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

export function MeetingDetailModal({
  open,
  onOpenChange,
  meeting,
  onStatusChange,
  onOpenSmsModal,
  onOpenNotesModal,
  onEditMeeting,
  onDeleteMeeting,
}: MeetingDetailModalProps) {
  if (!meeting) return null;

  const TypeIcon = getTypeIcon(meeting.meeting_type);
  const isUrlLocation =
    meeting.location &&
    (meeting.location.startsWith("http://") ||
      meeting.location.startsWith("https://") ||
      meeting.location.includes("zoom.us") ||
      meeting.location.includes("meet.google.com"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-card max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1 text-xs font-semibold border-slate-300 dark:border-border"
              >
                <TypeIcon className="size-3.5 text-[#67B239]" /> {meeting.meeting_type}
              </Badge>
              {getStatusBadge(meeting.status)}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              ID: {meeting.id.substring(0, 10)}
            </span>
          </div>

          <DialogTitle className="text-xl font-bold text-foreground leading-tight pt-1">
            {meeting.title}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span>Prospect:</span>
            <strong className="text-foreground font-semibold">
              {meeting.business_name
                ? `${meeting.business_name} (${meeting.prospect_name || "Direct"})`
                : meeting.prospect_name || "Direct Client"}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
            {/* Date & Time */}
            <div className="space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                <Calendar className="size-3.5 text-slate-400" /> Date & Schedule
              </span>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {meeting.meeting_date} at {meeting.meeting_time}
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                <Phone className="size-3.5 text-slate-400" /> Contact Phone
              </span>
              {meeting.phone ? (
                <a
                  href={`tel:${meeting.phone}`}
                  className="font-semibold font-mono text-[#0B3364] dark:text-teal-400 hover:underline block"
                >
                  {meeting.phone}
                </a>
              ) : (
                <div className="text-muted-foreground">Not specified</div>
              )}
            </div>

            {/* Location / Link */}
            <div className="space-y-1 sm:col-span-2">
              <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                <MapPin className="size-3.5 text-slate-400" /> Location / Meeting Link
              </span>
              {isUrlLocation ? (
                <a
                  href={meeting.location!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 break-all"
                >
                  {meeting.location}
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              ) : (
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {meeting.location || "Brandium HQ / To be determined"}
                </div>
              )}
            </div>

            {/* Assigned Agent */}
            <div className="space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                <User className="size-3.5 text-slate-400" /> Assigned Agent
              </span>
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {meeting.assigned_user_name || "Assigned Team Member"}
              </div>
            </div>

            {/* SMS Reminder */}
            <div className="space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
                <Send className="size-3.5 text-slate-400" /> Reminder Status
              </span>
              <div>
                {meeting.sms_sent ? (
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
              </div>
            </div>
          </div>

          {/* Notes & Agenda */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-0.5">
              <span className="flex items-center gap-1.5">
                <FileText className="size-3.5 text-slate-400" /> Meeting Notes & Agenda
              </span>
              {onOpenNotesModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onOpenNotesModal(meeting);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  <Pencil className="size-3" /> Edit Notes
                </button>
              )}
            </div>

            <div className="sawtooth-cut bg-amber-100 dark:bg-amber-950/80 p-3.5 text-xs text-amber-950 dark:text-amber-100 font-medium leading-relaxed rounded min-h-16">
              {meeting.notes?.trim() || "No notes or agenda recorded for this meeting yet."}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t">
          {/* Left Side: Status & Delete Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onStatusChange && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-white">
                    <span>Status: {meeting.status}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onStatusChange(meeting.id, "Scheduled")}>
                    <Clock3 className="size-3.5 text-amber-500 mr-2" /> Mark Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(meeting.id, "Completed")}>
                    <CheckCircle2 className="size-3.5 text-[#67B239] mr-2" /> Mark Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(meeting.id, "Cancelled")}
                    className="text-destructive"
                  >
                    <XCircle className="size-3.5 text-destructive mr-2" /> Mark Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {onDeleteMeeting && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs bg-white dark:bg-card border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                onClick={() => {
                  onOpenChange(false);
                  onDeleteMeeting(meeting);
                }}
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            )}
          </div>

          {/* Right Side: Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onOpenSmsModal && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs bg-white text-[#67B239] border-[#67B239]/40 hover:bg-[#67B239]/10"
                onClick={() => {
                  onOpenChange(false);
                  onOpenSmsModal(meeting);
                }}
              >
                <Send className="size-3.5" /> Send Reminder SMS
              </Button>
            )}
            {onEditMeeting && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs bg-white dark:bg-card border-blue-200 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                onClick={() => {
                  onOpenChange(false);
                  onEditMeeting(meeting);
                }}
              >
                <Pencil className="size-3.5" /> Edit Meeting
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-4 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
