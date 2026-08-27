import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UserPlus,
  ShieldCheck,
  Mail,
  User,
  KeyRound,
  UploadCloud,
  Eye,
  EyeOff,
} from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCrmUser, type CrmUserRole } from "@/lib/admin-users";

interface AdminCreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCreateUserModal({ open, onOpenChange }: AdminCreateUserModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [role, setRole] = useState<CrmUserRole>("AGENT");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    setRole("AGENT");
    setAvatarUrl("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image file size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name || !name.trim()) throw new Error("Please enter user full name.");
      if (!email || !email.includes("@")) throw new Error("Please enter a valid email address.");
      if (!password || password.length < 6) {
        throw new Error("Initial password must be at least 6 characters long.");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match. Please re-enter.");
      }

      return createCrmUser({
        name: name.trim(),
        email: email.trim(),
        password_hash: password,
        role,
        status: "Active",
        avatar_url: avatarUrl.trim() || null,
      });
    },
    onSuccess: (newUser) => {
      toast.success(`User ${newUser.name} created successfully!`);
      void queryClient.invalidateQueries({ queryKey: ["crm-users"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create user account.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-[#67B239] shrink-0" />
            <DialogTitle className="text-lg font-bold text-foreground">Create New User</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Add a new Admin or Agent account to Brandium CRM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {/* User Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="create_user_name" className="text-xs font-semibold">
              User Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="create_user_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mehan Ahmed"
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="create_user_email" className="text-xs font-semibold">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="create_user_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@brandium.com"
                className="pl-9 text-xs font-mono"
                required
              />
            </div>
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Initial Password */}
            <div className="space-y-1.5">
              <Label htmlFor="create_user_pass" className="text-xs font-semibold">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="create_user_pass"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className="pl-9 pr-8 text-xs font-mono"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="create_user_confirm_pass" className="text-xs font-semibold">
                Confirm <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="create_user_confirm_pass"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter"
                  className={`pl-9 pr-8 text-xs font-mono ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-400 focus-visible:ring-red-400"
                      : confirmPassword && password === confirmPassword
                        ? "border-green-400 focus-visible:ring-green-400"
                        : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[10px] text-red-500">Passwords do not match.</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-[10px] text-green-600">Passwords match ✓</p>
              )}
            </div>
          </div>

          {/* Avatar + Role Row */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="grid grid-cols-2 gap-4 items-end">
            {/* Profile Picture */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Profile Picture</Label>
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar preview" className="size-full object-cover" />
                  ) : (
                    <UserPlus className="size-6 text-[#67B239]/50 dark:text-slate-500" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5 px-2.5 py-1.5 h-auto text-xs font-medium border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground rounded-xl shadow-2xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="size-3.5 text-[#67B239]" />
                    Upload
                  </Button>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                    JPG, PNG — max 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Select Role */}
            <div className="space-y-1.5">
              <Label
                htmlFor="create_user_role"
                className="text-xs font-semibold flex items-center gap-1"
              >
                <ShieldCheck className="size-3.5 text-blue-600" />
                Select Role <span className="text-red-500">*</span>
              </Label>
              <Select value={role} onValueChange={(val: string) => setRole(val as CrmUserRole)}>
                <SelectTrigger id="create_user_role" className="text-xs">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AGENT">AGENT</SelectItem>
                  <SelectItem value="ARTIST">ARTIST</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
