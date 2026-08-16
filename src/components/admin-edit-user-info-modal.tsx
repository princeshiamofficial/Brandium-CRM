import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserCheck, Mail, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCrmUser, type CrmUser } from "@/lib/admin-users";

interface AdminEditUserInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: CrmUser | null;
}

export function AdminEditUserInfoModal({ open, onOpenChange, user }: AdminEditUserInfoModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user selected.");
      if (!name || !name.trim()) throw new Error("Please enter user full name.");
      if (!email || !email.includes("@")) throw new Error("Please enter a valid email address.");

      return updateCrmUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        role: user.role,
        status: user.status,
      });
    },
    onSuccess: (updated) => {
      toast.success(`User ${updated.name} updated successfully!`);
      void queryClient.invalidateQueries({ queryKey: ["crm-users"] });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update user account.");
    },
  });

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCheck className="size-5 text-[#67B239] shrink-0" />
            <DialogTitle className="text-lg font-bold text-foreground">
              Edit User Info — {user.name}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Update full name and email address for this user account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {/* User Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="modal_user_name" className="text-xs font-semibold">
              User Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="modal_user_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="modal_user_email" className="text-xs font-semibold">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="modal_user_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@brandium.com"
                className="pl-9 text-xs font-mono"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="px-5 py-2 h-auto text-xs font-medium border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-foreground rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-5 py-2 h-auto text-xs font-medium bg-[#67B239] hover:bg-[#5aa030] text-white rounded-xl shadow-2xs transition-colors"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
