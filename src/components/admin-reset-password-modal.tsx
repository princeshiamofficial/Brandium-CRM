import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";

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

import { CrmUser, resetUserPassword } from "@/lib/admin-users";

type AdminResetPasswordModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: CrmUser | null;
};

export function AdminResetPasswordModal({
  open,
  onOpenChange,
  user,
}: AdminResetPasswordModalProps) {
  const queryClient = useQueryClient();
  const [newPassword, setNewPassword] = useState<string>("");

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user selected.");
      if (!newPassword || newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      return resetUserPassword(user.id, newPassword);
    },
    onSuccess: () => {
      toast.success(`Password for ${user?.name} reset successfully!`);
      setNewPassword("");
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["crm-users"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reset user password.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <KeyRound className="size-5 text-[#67B239]" />
            Reset User Password ({user?.name})
          </DialogTitle>
          <DialogDescription className="text-xs">
            Set a new secure bcrypt password for account <strong>{user?.email}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="reset_new_pass" className="text-xs font-semibold">
              New Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reset_new_pass"
              type="password"
              placeholder="Minimum 6 characters (e.g. Agent@2026!)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="rounded bg-amber-50 dark:bg-amber-950/40 p-2.5 border border-amber-200 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <ShieldAlert className="size-4 shrink-0 text-amber-600" />
            <span>Passwords are hashed automatically with bcrypt before database storage.</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={resetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5"
            onClick={() => resetMutation.mutate()}
            disabled={resetMutation.isPending || !newPassword || newPassword.length < 6}
          >
            <CheckCircle2 className="size-3.5" />
            {resetMutation.isPending ? "Resetting Password..." : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
