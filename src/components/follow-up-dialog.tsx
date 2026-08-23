import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { agentsQuery, useCreateFollowUp } from "@/lib/follow-ups";

import { runMySQLQuery } from "@/lib/mysql-api";

function prospectOptionsQuery() {
  return queryOptions({
    queryKey: ["prospect-options-follow-up"],
    queryFn: async () => {
      try {
        const res = await runMySQLQuery<Record<string, unknown>[]>(
          "SELECT id, contact_name, business_name FROM `prospects` WHERE is_active = 1 ORDER BY contact_name ASC;",
        );
        if (res.success && Array.isArray(res.data)) {
          return res.data;
        }
      } catch (err) {
        console.warn("prospectOptionsQuery MySQL notice:", err);
      }
      return [];
    },
  });
}

function defaultDueAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export type FollowUpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prospectId?: string | undefined;
  prospectLabel?: string | undefined;
};

export function FollowUpDialog({
  open,
  onOpenChange,
  prospectId,
  prospectLabel,
}: FollowUpDialogProps) {
  const { user, profile, isAdmin } = useAuth();
  const createMutation = useCreateFollowUp();
  const prospects = useQuery({ ...prospectOptionsQuery(), enabled: open && !prospectId });
  const agents = useQuery({ ...agentsQuery(), enabled: open });

  const agentList = useMemo(() => {
    const rawAgents = (Array.isArray(agents.data) ? agents.data : []) as {
      id: string;
      name: string;
    }[];
    return [
      ...(user
        ? [{ id: user.id, name: `${profile?.full_name || user.email || "Current User"} (Me)` }]
        : []),
      ...rawAgents,
    ].filter((v, i, self) => i === self.findIndex((t) => t.id === v.id));
  }, [user, profile?.full_name, agents.data]);

  const [selectedProspect, setSelectedProspect] = useState(prospectId ?? "");
  const [assignedTo, setAssignedTo] = useState(user?.id ?? "");
  const [dueAt, setDueAt] = useState(defaultDueAt());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedProspect(prospectId ?? "");
    setDueAt(defaultDueAt());
    setNote("");
    if (user?.id) {
      setAssignedTo(user.id);
    } else if (agentList.length > 0 && agentList[0]) {
      setAssignedTo(agentList[0].id);
    }
  }, [open, prospectId, user?.id, agentList]);

  const submit = () => {
    if (!selectedProspect) {
      toast.error("Select a prospect first");
      return;
    }
    if (!user?.id) return;
    createMutation.mutate(
      {
        prospect_id: selectedProspect,
        assigned_to: assignedTo || user.id,
        created_by: user.id,
        due_at: new Date(dueAt).toISOString(),
        ...(note.trim() ? { note: note.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Follow-up scheduled");
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule follow-up</DialogTitle>
          <DialogDescription>
            {prospectLabel
              ? `Add the next follow-up for ${prospectLabel}.`
              : "Pick a prospect, a date and time, and add a note for context."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!prospectId && (
            <div className="space-y-2">
              <Label>Prospect</Label>
              <Select value={selectedProspect} onValueChange={setSelectedProspect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select prospect" />
                </SelectTrigger>
                <SelectContent>
                  {((prospects.data as Record<string, unknown>[]) ?? []).map((p) => (
                    <SelectItem key={String(p["id"])} value={String(p["id"])}>
                      {p["business_name"]
                        ? `${String(p["contact_name"])} — ${String(p["business_name"])}`
                        : String(p["contact_name"] ?? "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Assigned agent</Label>
            <Select value={assignedTo || (agentList[0]?.id ?? "")} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {agentList.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow-up-due">Date &amp; time to schedule</Label>
            <Input
              id="follow-up-due"
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow-up-note">Note</Label>
            <Textarea
              id="follow-up-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What should be discussed on this call?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Schedule follow-up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
