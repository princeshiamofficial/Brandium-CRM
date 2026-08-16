import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

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

import { changeOwnPassword } from "@/lib/admin-users";
import { useAuth } from "@/lib/auth";

type AdminChangeOwnPasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AdminChangeOwnPasswordModal({
  open,
  onOpenChange,
}: AdminChangeOwnPasswordModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const changeMutation = useMutation({
    mutationFn: async () => {
      const activeUserId = user?.id || "usr-admin-1";
      if (!currentPassword) throw new Error("Please enter your current password.");
      if (!newPassword || newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirmation do not match.");
      }

      return changeOwnPassword(activeUserId, currentPassword, newPassword);
    },
    onSuccess: () => {
      toast.success("Your password has been changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["crm-users"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to change password.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Lock className="size-5 text-[#67B239]" />
            Change My Password ({user?.email})
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update your own account password securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="current_pass" className="text-xs font-semibold">
              Current Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="current_pass"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="new_pass" className="text-xs font-semibold">
              New Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="new_pass"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm_pass" className="text-xs font-semibold">
              Confirm New Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirm_pass"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-xs font-mono"
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-red-500 font-medium pt-0.5">Passwords do not match.</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={changeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
            onClick={() => changeMutation.mutate()}
            disabled={
              changeMutation.isPending ||
              !currentPassword ||
              !newPassword ||
              newPassword.length < 6 ||
              newPassword !== confirmPassword
            }
          >
            <CheckCircle2 className="size-3.5" />
            {changeMutation.isPending ? "Updating Password..." : "Save New Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
