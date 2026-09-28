"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { CrmUser } from "@/lib/admin-users";
import { resolveOrderStatus, type CrmOrder } from "@/lib/orders";

interface AssignStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: CrmOrder;
  /** Assignable stage the order is moving into (or re-assigning). */
  statusId: string;
  users: CrmUser[];
  onAssign: (assignee: CrmUser) => Promise<void>;
  isSaving: boolean;
}

export const getInitials = (name: string | null | undefined): string => {
  const parts = (name || "").split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return (parts[0] as string).charAt(0).toUpperCase();
  return (
    (parts[0] as string).charAt(0) + (parts[parts.length - 1] as string).charAt(0)
  ).toUpperCase();
};

/** Based on ERPAPP `assign-dr-dialog.tsx`: picks the user responsible for an assignable stage. */
export function AssignStageDialog({
  open,
  onOpenChange,
  order,
  statusId,
  users,
  onAssign,
  isSaving,
}: AssignStageDialogProps) {
  const stage = resolveOrderStatus(statusId);
  const isReassign = resolveOrderStatus(order.status).id === stage.id;
  const [selectedDrId, setSelectedDrId] = useState(isReassign ? order.designer_id || "" : "");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const designerReps = useMemo(
    () => users.filter((u) => !u.is_deleted && (u.status || "Active") !== "Deleted"),
    [users],
  );
  const selected = designerReps.find((dr) => dr.id === selectedDrId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) await onAssign(selected);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign {stage.name}</DialogTitle>
          <DialogDescription>
            Choose who handles the <span className="font-semibold">{stage.name}</span> stage for
            order <span className="font-semibold">{order.order_number}</span> (
            <span className="font-semibold">{order.company_name}</span>). The order status will be
            set to: <span className="font-semibold">{stage.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label>Assign To</Label>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={isPopoverOpen}
                    className="w-full justify-between"
                    disabled={designerReps.length === 0}
                  >
                    <span className="truncate">
                      {selected ? selected.name : "Select a user..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                  <Command>
                    <CommandInput placeholder="Search user..." />
                    <CommandList>
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {designerReps.map((dr) => (
                          <CommandItem
                            key={dr.id}
                            value={dr.name}
                            onSelect={() => {
                              setSelectedDrId(dr.id);
                              setIsPopoverOpen(false);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Check
                              className={cn(
                                "h-4 w-4",
                                selectedDrId === dr.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={dr.avatar_url || undefined} alt={dr.name} />
                              <AvatarFallback className="text-xs">
                                {getInitials(dr.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{dr.name}</span>
                            <span className="ms-auto text-xs text-muted-foreground capitalize">
                              {(dr.role || "").toLowerCase()}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !selected}
              className="bg-[#67B239] hover:bg-[#5aa030] text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
