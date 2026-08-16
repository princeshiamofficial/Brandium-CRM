import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Building2, Video, Send, Check } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { createMeeting, prospectsOptionsQuery, type MeetingType } from "@/lib/meetings";
import { agentsQuery } from "@/lib/follow-ups";
import { useAuth } from "@/lib/auth";

export type ScheduleMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProspectId?: string;
  onSuccess?: () => void;
};

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  defaultProspectId,
  onSuccess,
}: ScheduleMeetingDialogProps) {
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
  const [prospectId, setProspectId] = useState(defaultProspectId ?? "");
  const [phone, setPhone] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("10:00");
  const [meetingType, setMeetingType] = useState<MeetingType>("Office");
  const [location, setLocation] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [description, setDescription] = useState("");
  const [sendSms, setSendSms] = useState(true);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setProspectId(defaultProspectId ?? "");
    setMeetingType("Office");
    setLocation("");
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    setMeetingDate(tomorrow || "");
    setMeetingTime("10:00");
    setDescription("");
    setSendSms(true);

    if (defaultProspectId && prospects.data) {
      const found = prospects.data.find((p) => p.id === defaultProspectId);
      if (found?.phone) setPhone(found.phone);
    } else {
      setPhone("");
    }

    if (user?.id) {
      setAssignedUserId(user.id);
    } else if (agentList.length > 0 && agentList[0]) {
      setAssignedUserId(agentList[0].id);
    }
  }, [open, defaultProspectId, user?.id, agentList, prospects.data]);

  const handleProspectSelect = (pId: string) => {
    setProspectId(pId);
    if (pId && pId !== "none" && prospects.data) {
      const found = prospects.data.find((p) => p.id === pId);
      if (found?.phone) setPhone(found.phone);
      if (!title && found?.business_name) {
        setTitle(`Meeting with ${found.business_name}`);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Meeting scheduled successfully!");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to schedule meeting.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a meeting title.");
      return;
    }
    if (!meetingDate) {
      toast.error("Please select a meeting date.");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      prospect_id: prospectId && prospectId !== "none" ? prospectId : null,
      phone: phone.trim() || null,
      meeting_type: meetingType,
      location: location.trim() || null,
      meeting_date: meetingDate,
      meeting_time: meetingTime || "10:00",
      assigned_user_id: assignedUserId && assignedUserId !== "unassigned" ? assignedUserId : null,
      notes: description.trim() || null,
      send_sms_now: sendSms,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Schedule New Meeting
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Plan an appointment, demo, or consultation with client.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Meeting Title */}
          <div className="space-y-1.5">
            <Label htmlFor="meeting-title" className="text-xs font-semibold text-foreground">
              Meeting Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="meeting-title"
              placeholder="Enter Meeting Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
              required
            />
          </div>

          {/* Prospects Select */}
          <div className="space-y-1.5">
            <Label htmlFor="meeting-prospect" className="text-xs font-semibold text-foreground">
              Prospects {prospectCount > 0 && `(${prospectCount} available)`}
            </Label>
            <Select value={prospectId} onValueChange={handleProspectSelect}>
              <SelectTrigger id="meeting-prospect" className="h-10 text-sm rounded-xl">
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

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="meeting-date" className="text-xs font-semibold text-foreground">
                Date <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meeting-time" className="text-xs font-semibold text-foreground">
                Time
              </Label>
              <div className="relative">
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
                />
              </div>
            </div>
          </div>

          {/* Meeting Type Radio Group */}
          <div className="space-y-2 pt-1">
            <RadioGroup
              value={meetingType}
              onValueChange={(v) => setMeetingType(v as MeetingType)}
              className="flex items-center gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Office"
                  id="type-office"
                  className="text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
                />
                <Label htmlFor="type-office" className="text-sm font-medium cursor-pointer">
                  Office
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Online"
                  id="type-online"
                  className="text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
                />
                <Label htmlFor="type-online" className="text-sm font-medium cursor-pointer">
                  Online
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="Client Location"
                  id="type-location"
                  className="text-[#67B239] border-slate-400 data-[state=checked]:border-[#67B239] data-[state=checked]:text-[#67B239]"
                />
                <Label htmlFor="type-location" className="text-sm font-medium cursor-pointer">
                  Location
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Location field (expanded when Client Location or Online or custom) */}
          {(meetingType === "Client Location" || meetingType === "Online") && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-200">
              <Label htmlFor="meeting-location" className="text-xs font-semibold text-foreground">
                {meetingType === "Online"
                  ? "Meeting Link (Google Meet / Zoom)"
                  : "Location Name & Address"}
              </Label>
              <Input
                id="meeting-location"
                placeholder={
                  meetingType === "Online" ? "https://meet.google.com/..." : "Enter Location name"
                }
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 text-sm rounded-xl focus-visible:ring-[#67B239]"
              />
            </div>
          )}

          {/* Assign Agent */}
          <div className="space-y-1.5">
            <Label htmlFor="meeting-agent" className="text-xs font-semibold text-foreground">
              Assign Agent
            </Label>
            <Select value={assignedUserId} onValueChange={setAssignedUserId}>
              <SelectTrigger id="meeting-agent" className="h-10 text-sm rounded-xl">
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

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="meeting-desc" className="text-xs font-semibold text-foreground">
              Description
            </Label>
            <Textarea
              id="meeting-desc"
              rows={3}
              placeholder="Write meeting description here"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none text-sm rounded-xl focus-visible:ring-[#67B239]"
            />
          </div>

          {/* SMS Reminder Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="meeting-sms"
              checked={sendSms}
              onCheckedChange={(c) => setSendSms(Boolean(c))}
              className="data-[state=checked]:bg-[#67B239] data-[state=checked]:border-[#67B239]"
            />
            <Label
              htmlFor="meeting-sms"
              className="text-xs text-muted-foreground font-medium cursor-pointer"
            >
              Send SMS reminder notification to prospect
            </Label>
          </div>

          {/* Action Buttons in Brand Color */}
          <DialogFooter className="gap-2 sm:gap-3 pt-3">
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
              disabled={createMutation.isPending}
              className="h-10 px-6 rounded-xl bg-[#67B239] hover:bg-[#5AA030] text-white font-semibold text-sm shadow-sm transition-all"
            >
              {createMutation.isPending ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
