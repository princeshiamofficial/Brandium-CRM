import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserCog, UploadCloud } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateUserAvatar, type CrmUser } from "@/lib/admin-users";

interface AdminSetAvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: CrmUser | null;
}

export function AdminSetAvatarModal({ open, onOpenChange, user }: AdminSetAvatarModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  const updateAvatarMutation = useMutation({
    mutationFn: async (newUrl: string) => {
      if (!user) throw new Error("No user selected.");
      return updateUserAvatar(user.id, newUrl);
    },
    onSuccess: () => {
      toast.success("User avatar updated successfully!");
      void queryClient.invalidateQueries({ queryKey: ["crm-users"] });
      void queryClient.invalidateQueries({ queryKey: ["crm-user-detail"] });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update user avatar.");
    },
  });

  if (!user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAvatarMutation.mutate(avatarUrl.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <UserCog className="size-5 text-[#67B239] shrink-0" />
            <DialogTitle className="text-lg font-bold text-foreground">
              Set Avatar for {user.name}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Manage the profile picture for {user.email}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Profile Picture Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">Profile Picture</Label>

            <div className="flex items-center gap-5">
              {/* Circular Avatar Preview */}
              <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="size-full object-cover" />
                ) : (
                  <UserCog className="size-9 text-[#67B239]/60 dark:text-slate-500" />
                )}
              </div>

              {/* Upload Image Button */}
              <Button
                type="button"
                variant="outline"
                className="gap-2 px-4 py-2.5 h-auto text-sm font-medium border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground rounded-xl shadow-2xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="size-4 text-[#67B239]" />
                Upload Image
              </Button>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
              Upload an image (JPG, PNG, GIF). Max 2MB.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="px-5 py-2 h-auto text-sm font-medium border-slate-200 dark:border-slate-700 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-foreground rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-5 py-2 h-auto text-sm font-medium bg-[#67B239] hover:bg-[#5aa030] text-white rounded-xl shadow-2xs transition-colors"
              disabled={updateAvatarMutation.isPending}
            >
              {updateAvatarMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
