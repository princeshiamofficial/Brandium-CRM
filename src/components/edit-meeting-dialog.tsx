import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Video,
  Send,
  CheckCircle2,
  XCircle,
  Clock3,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  updateMeeting,
  prospectsOptionsQuery,
  type Meeting,
  type MeetingStatus,
  type MeetingType,
  type UpdateMeetingInput,
} from "@/lib/meetings";
import { agentsQuery } from "@/lib/follow-ups";
import { useAuth } from "@/lib/auth";

export type EditMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
  onSuccess?: () => void;
  onDeleteMeeting?: (meeting: Meeting) => void;
};

export function EditMeetingDialog({
  open,
  onOpenChange,
  meeting,
  onSuccess,
  onDeleteMeeting,
}: EditMeetingDialogProps) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const prospects = useQuery({ ...prospectsOptionsQuery(), enabled: open });
  const agents = useQuery({ ...agentsQuery(), enabled: open });

  const prospectList = prospects.data ?? [];
  const prospectCount = prospectList.length;

  const agentList = useMemo(() => {
    const rawAgents = (agents.data as { id: string; name: string }[]) ?? [];
    return [
      ...(user
        ? [{ id: user.id, name: `${profile?.full_name || user.email || "Current User"} (Me)` }]
        : []),
      ...rawAgents,
    ].filter((v, i, self) => i === self.findIndex((t) => t.id === v.id));
  }, [user, profile?.full_name, agents.data]);

  const [title, setTitle] = useState("");
  const [prospectId, setProspectId] = useState("");
  const [phone, setPhone] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("10:00");
  const [meetingType, setMeetingType] = useState<MeetingType>("Office");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<MeetingStatus>("Scheduled");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!meeting || !open) return;
    setTitle(meeting.title || "");
    setProspectId(meeting.prospect_id || "none");
    setPhone(meeting.phone || "");
    setMeetingDate(meeting.meeting_date || "");
    setMeetingTime(meeting.meeting_time || "10:00");
    setMeetingType(meeting.meeting_type || "Office");
    setLocation(meeting.location || "");
    setStatus(meeting.status || "Scheduled");
    setAssignedUserId(meeting.assigned_user_id || "unassigned");
    setNotes(meeting.notes || "");
  }, [meeting, open]);

  const handleProspectSelect = (pId: string) => {
    setProspectId(pId);
    if (pId && pId !== "none" && prospects.data) {
      const found = prospects.data.find((p) => p.id === pId);
      if (found?.phone && !phone) {
        setPhone(found.phone);
      }
    }
  };

  const updateMutation = useMutation({
    mutationFn: (updates: UpdateMeetingInput) => {
      if (!meeting) throw new Error("No meeting selected");
      return updateMeeting(meeting.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      if (meeting) {
        queryClient.invalidateQueries({ queryKey: ["meeting", meeting.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Meeting updated successfully!");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update meeting.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting) return;

    if (!title.trim()) {
      toast.error("Please enter a meeting title.");
      return;
    }
    if (!meetingDate) {
      toast.error("Please select a meeting date.");
      return;
    }

    updateMutation.mutate({
      title: title.trim(),
      prospect_id: prospectId && prospectId !== "none" ? prospectId : null,
      phone: phone.trim() || null,
      meeting_type: meetingType,
      location: location.trim() || null,
      meeting_date: meetingDate,
      meeting_time: meetingTime || "10:00",
      status: status,
      assigned_user_id: assignedUserId && assignedUserId !== "unassigned" ? assignedUserId : null,
      notes: notes.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center justify-between gap-2">
            <span>Edit Meeting</span>
            {meeting && (
              <span className="text-xs font-mono font-normal text-muted-foreground">
                ID: {meeting.id}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update schedule, attendee details, location, and meeting agenda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Meeting Title */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-meeting-title" className="text-xs font-semibold text-foreground">
              Meeting Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-meeting-title"
              placeholder="Enter Meeting Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
              required
            />
          </div>

          {/* Prospects Select & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-meeting-prospect"
                className="text-xs font-semibold text-foreground"
              >
                Prospect {prospectCount > 0 && `(${prospectCount})`}
              </Label>
              <Select value={prospectId} onValueChange={handleProspectSelect}>
                <SelectTrigger id="edit-meeting-prospect" className="h-10 text-sm rounded-xl">
                  <SelectValue placeholder="Select a Prospect" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="none">-- No specific prospect --</SelectItem>
                  {prospectList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.business_name ? `${p.business_name} (${p.contact_name})` : p.contact_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-meeting-phone" className="text-xs font-semibold text-foreground">
                Contact Phone
              </Label>
              <Input
                id="edit-meeting-phone"
                placeholder="+880 1..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
              />
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-meeting-date" className="text-xs font-semibold text-foreground">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-meeting-date"
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-meeting-time" className="text-xs font-semibold text-foreground">
                Time
              </Label>
              <Input
                id="edit-meeting-time"
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
              />
            </div>
          </div>

          {/* Status & Assigned Agent Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-meeting-status"
                className="text-xs font-semibold text-foreground"
              >
                Meeting Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as MeetingStatus)}>
                <SelectTrigger id="edit-meeting-status" className="h-10 text-sm rounded-xl">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="size-3.5 text-amber-500" /> Scheduled
                    </span>
                  </SelectItem>
                  <SelectItem value="Completed">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-[#67B239]" /> Completed
                    </span>
                  </SelectItem>
                  <SelectItem value="Cancelled">
                    <span className="flex items-center gap-1.5">
                      <XCircle className="size-3.5 text-destructive" /> Cancelled
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-meeting-agent" className="text-xs font-semibold text-foreground">
                Assign Agent
              </Label>
              <Select value={assignedUserId} onValueChange={setAssignedUserId}>
                <SelectTrigger id="edit-meeting-agent" className="h-10 text-sm rounded-xl">
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                  {agentList.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting Type Radio Group */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-foreground">Meeting Type</Label>
            <RadioGroup
              value={meetingType}
              onValueChange={(v) => setMeetingType(v as MeetingType)}
              className="flex items-center gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Office"
                  id="edit-type-office"
                  className="text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
                />
                <Label htmlFor="edit-type-office" className="text-sm font-medium cursor-pointer">
                  Office
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Online"
                  id="edit-type-online"
                  className="text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
                />
                <Label htmlFor="edit-type-online" className="text-sm font-medium cursor-pointer">
                  Online
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Client Location"
                  id="edit-type-location"
                  className="text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
                />
                <Label htmlFor="edit-type-location" className="text-sm font-medium cursor-pointer">
                  Location
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Location field */}
          {(meetingType === "Client Location" || meetingType === "Online") && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-200">
              <Label
                htmlFor="edit-meeting-location"
                className="text-xs font-semibold text-foreground"
              >
                {meetingType === "Online"
                  ? "Meeting Link (Google Meet / Zoom)"
                  : "Location Name & Address"}
              </Label>
              <Input
                id="edit-meeting-location"
                placeholder={
                  meetingType === "Online" ? "https://meet.google.com/..." : "Enter Location name"
                }
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
              />
            </div>
          )}

          {/* Notes & Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-meeting-desc" className="text-xs font-semibold text-foreground">
              Notes & Agenda Description
            </Label>
            <Textarea
              id="edit-meeting-desc"
              rows={3}
              placeholder="Write meeting description or agenda here"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none text-sm rounded-xl focus-visible:ring-[#67B239]"
            />
          </div>

          {/* Action Buttons */}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-3">
            {onDeleteMeeting && meeting ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onDeleteMeeting(meeting);
                }}
                className="h-10 px-4 rounded-xl border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium text-sm gap-1.5"
              >
                <Trash2 className="size-4" /> Delete Meeting
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-10 px-5 rounded-xl border-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:border-border text-slate-700 dark:text-foreground font-medium text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-10 px-6 rounded-xl bg-[#67B239] hover:bg-[#5AA030] text-white font-semibold text-sm shadow-sm transition-all"
              >
                {updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
