import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toggleUserStatus, type CrmUser } from "@/lib/admin-users";

interface AdminBanUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: CrmUser | null;
}

export function AdminBanUserModal({ open, onOpenChange, user }: AdminBanUserModalProps) {
  const queryClient = useQueryClient();

  const isBanned = user?.status === "Inactive";

  const banMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user selected.");
      return toggleUserStatus(user.id, isBanned ? "Active" : "Inactive");
    },
    onSuccess: () => {
      toast.success(
        isBanned ? `${user?.name} has been unbanned.` : `${user?.name} has been banned.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["crm-users"] });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update user status.");
    },
  });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert
              className={`h-6 w-6 ${isBanned ? "text-green-600" : "text-amber-500"}`}
            />
            Are you sure?
          </DialogTitle>
          <DialogDescription>
            {isBanned ? (
              <>
                You are about to unban the user &quot;
                <span className="font-semibold">{user.name}</span>&quot;. They will be able to log
                in again.
              </>
            ) : (
              <>
                You are about to ban the user &quot;
                <span className="font-semibold">{user.name}</span>&quot;. They will not be able to
                log in.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={banMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={
              isBanned
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }
            onClick={() => banMutation.mutate()}
            disabled={banMutation.isPending}
          >
            {banMutation.isPending
              ? isBanned
                ? "Unbanning..."
                : "Banning..."
              : isBanned
                ? "Yes, Unban User"
                : "Yes, Ban User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
