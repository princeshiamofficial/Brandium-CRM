import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Layers, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

import { CrmService, createService, updateService, ServiceStatus } from "@/lib/services";

type AdminServiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: CrmService | null;
};

const SERVICE_ICONS = [
  "Camera",
  "Palette",
  "Calendar",
  "Globe",
  "Video",
  "Tv",
  "PlayCircle",
  "Mic",
  "Film",
  "Star",
  "Sparkles",
  "Brush",
  "Layers",
];

export function AdminServiceModal({ open, onOpenChange, service }: AdminServiceModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [icon, setIcon] = useState<string>("Layers");
  const [status, setStatus] = useState<ServiceStatus>("Active");

  const isEditing = !!service;

  useEffect(() => {
    if (service) {
      setName(service.name || "");
      setDescription(service.description || "");
      setIcon(service.icon || "Layers");
      setStatus(service.status || "Active");
    } else {
      setName("");
      setDescription("");
      setIcon("Layers");
      setStatus("Active");
    }
  }, [service, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name || !name.trim()) throw new Error("Service name is required.");

      if (isEditing && service) {
        return updateService(service.id, {
          name: name.trim(),
          description: description.trim() || null,
          icon,
          status,
        });
      } else {
        return createService({
          name: name.trim(),
          description: description.trim() || null,
          icon,
          status,
        });
      }
    },
    onSuccess: (res) => {
      toast.success(`Service "${res.name}" ${isEditing ? "updated" : "created"} successfully!`);
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["crm-services"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save service.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Layers className="size-5 text-[#67B239]" />
            {isEditing ? `Edit Service (${service?.name})` : "Add New Service Offering"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Configure sales service offerings and descriptions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Service Name */}
          <div className="space-y-1.5">
            <Label htmlFor="srv_name" className="text-xs font-semibold">
              Service Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="srv_name"
              placeholder="e.g. Celebrity Video Ads"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="srv_desc" className="text-xs font-semibold">
              Description / Offer Package Scope
            </Label>
            <Textarea
              id="srv_desc"
              placeholder="Describe deliverables, video production scope, or features..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs leading-relaxed"
            />
          </div>

          {/* Icon Selector & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="srv_icon" className="text-xs font-semibold">
                Icon Category <span className="text-red-500">*</span>
              </Label>
              <Select value={icon} onValueChange={setIcon}>
                <SelectTrigger id="srv_icon" className="text-xs">
                  <SelectValue placeholder="Select Icon" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_ICONS.map((ic) => (
                    <SelectItem key={ic} value={ic} className="text-xs">
                      {ic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="srv_status" className="text-xs font-semibold">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={status}
                onValueChange={(val: string) => setStatus(val as ServiceStatus)}
              >
                <SelectTrigger id="srv_status" className="text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !name}
          >
            <CheckCircle2 className="size-3.5" />
            {saveMutation.isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
