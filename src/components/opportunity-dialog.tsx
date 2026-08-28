import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { useAuth } from "@/lib/auth";
import { agentsQuery } from "@/lib/follow-ups";
import { runMySQLQuery } from "@/lib/mysql-api";
import { PIPELINE_STAGES, useCreateOpportunity, type OpportunityStatus } from "@/lib/opportunities";

const prospectOptionsQuery = () =>
  queryOptions({
    queryKey: ["prospect-options"],
    queryFn: async () => {
      const res = await runMySQLQuery<
        { id: string; contact_name: string; business_name: string | null }[]
      >(
        "SELECT id, contact_name, business_name FROM prospects WHERE is_active = 1 ORDER BY created_at DESC LIMIT 200;",
      );
      return Array.isArray(res.data) ? res.data : [];
    },
  });

export type OpportunityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProspectId?: string;
};

export function OpportunityDialog({
  open,
  onOpenChange,
  defaultProspectId,
}: OpportunityDialogProps) {
  const { user, profile, isAdmin } = useAuth();
  const createMutation = useCreateOpportunity();

  const prospects = useQuery({ ...prospectOptionsQuery(), enabled: open });
  const agents = useQuery({ ...agentsQuery(), enabled: open });

  const agentList = useMemo(() => {
    const rawAgents = (agents.data as { id: string; name: string }[]) ?? [];
    return [
      ...(user
        ? [{ id: user.id, name: `${profile?.full_name || user.email || "Current User"} (Me)` }]
        : []),
      ...rawAgents,
    ].filter((v, i, self) => i === self.findIndex((t) => t.id === v.id));
  }, [user, profile?.full_name, agents.data]);

  const [prospectId, setProspectId] = useState(defaultProspectId ?? "");
  const [estimatedValue, setEstimatedValue] = useState("50000");
  const [assignedTo, setAssignedTo] = useState(user?.id ?? "");
  const [status, setStatus] = useState<OpportunityStatus>("Opportunity Created");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setProspectId(defaultProspectId ?? "");
    setEstimatedValue("50000");
    setStatus("Opportunity Created");
    setNotes("");
    if (user?.id) {
      setAssignedTo(user.id);
    } else if (agentList.length > 0 && agentList[0]) {
      setAssignedTo(agentList[0].id);
    }
  }, [open, defaultProspectId, user?.id, agentList]);

  const submit = () => {
    if (!prospectId) {
      toast.error("Please select a prospect.");
      return;
    }
    const val = parseFloat(estimatedValue);
    if (isNaN(val) || val < 0) {
      toast.error("Enter a valid estimated monetary value.");
      return;
    }
    if (!user?.id) {
      toast.error("User session missing.");
      return;
    }

    createMutation.mutate(
      {
        prospect_id: prospectId,
        estimated_value: val,
        assigned_to: assignedTo || user.id,
        created_by: user.id,
        status,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Opportunity created successfully!");
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
          <DialogTitle>Create Opportunity</DialogTitle>
          <DialogDescription>
            Identify and track a new sales deal in your pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Prospect Selection */}
          <div className="space-y-2">
            <Label htmlFor="opp-prospect">Prospect</Label>
            <Select value={prospectId} onValueChange={setProspectId}>
              <SelectTrigger id="opp-prospect">
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

          {/* Estimated Value */}
          <div className="space-y-2">
            <Label htmlFor="opp-value">Estimated Value (৳)</Label>
            <Input
              id="opp-value"
              type="number"
              min="0"
              step="500"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="e.g. 50000"
            />
          </div>

          {/* Assigned Agent */}
          <div className="space-y-2">
            <Label>Assigned Agent</Label>
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

          {/* Initial Status */}
          <div className="space-y-2">
            <Label>Initial Pipeline Stage</Label>
            <Select
              value={status}
              onValueChange={(val: string) => setStatus(val as OpportunityStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.slice(0, 4).map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="opp-notes">Notes / Deal Context</Label>
            <Textarea
              id="opp-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What service or package is this prospect interested in?"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Opportunity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
