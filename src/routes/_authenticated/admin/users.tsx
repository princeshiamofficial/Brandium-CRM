import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Search,
  Edit,
  Pencil,
  PenLine,
  SquarePen,
  Trash2,
  PowerOff,
  Power,
  KeyRound,
  Lock,
  Filter,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FilterX,
  UserCog,
  UserX,
  UserCheck,
  Calendar,
  X,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getInitials = (name: string) => {
  if (!name) return "??";
  const names = name.trim().split(" ");
  const first = names[0] ?? "";
  const last = names[names.length - 1] ?? "";
  if (names.length === 1) return first.charAt(0).toUpperCase();
  return first.charAt(0).toUpperCase() + last.charAt(0).toUpperCase();
};

import { useAuth } from "@/lib/auth";
import {
  crmUsersQueryOptions,
  CrmUser,
  toggleUserStatus,
  softDeleteCrmUser,
} from "@/lib/admin-users";
import { AdminResetPasswordModal } from "@/components/admin-reset-password-modal";
import { AdminChangeOwnPasswordModal } from "@/components/admin-change-own-password-modal";
import { AdminSetAvatarModal } from "@/components/admin-set-avatar-modal";
import { AdminEditUserInfoModal } from "@/components/admin-edit-user-info-modal";
import { AdminCreateUserModal } from "@/components/admin-create-user-modal";
import { AdminBanUserModal } from "@/components/admin-ban-user-modal";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management | Brandium Telesales CRM" },
      {
        name: "description",
        content: "Admin-only CRM user accounts, roles, and access control management.",
      },
      { property: "og:title", content: "User Management | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Admin-only CRM user accounts, roles, and access control management.",
      },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Inactive">("Active");
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    open: boolean;
    user: CrmUser | null;
  }>({
    open: false,
    user: null,
  });
  const [setAvatarModal, setSetAvatarModal] = useState<{
    open: boolean;
    user: CrmUser | null;
  }>({
    open: false,
    user: null,
  });
  const [editUserInfoModal, setEditUserInfoModal] = useState<{
    open: boolean;
    user: CrmUser | null;
  }>({
    open: false,
    user: null,
  });
  const [createUserModalOpen, setCreateUserModalOpen] = useState<boolean>(false);
  const [changeOwnPasswordOpen, setChangeOwnPasswordOpen] = useState<boolean>(false);
  const [banUserModal, setBanUserModal] = useState<{ open: boolean; user: CrmUser | null }>({
    open: false,
    user: null,
  });

  const { data: users = [], isLoading } = useQuery(crmUsersQueryOptions(search));

  const filteredUsers = users.filter((u) => {
    if (statusFilter === "all") return true;
    return u.status === statusFilter;
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      newStatus,
    }: {
      userId: string;
      newStatus: "Active" | "Inactive";
    }) => {
      return toggleUserStatus(userId, newStatus);
    },
    onSuccess: (_, vars) => {
      toast.success(
        `User ${vars.newStatus === "Active" ? "activated" : "deactivated"} successfully.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["crm-users"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to toggle user status.");
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return softDeleteCrmUser(userId);
    },
    onSuccess: () => {
      toast.success("User account soft-deleted successfully.");
      void queryClient.invalidateQueries({ queryKey: ["crm-users"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete user account.");
    },
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
          >
            <ShieldCheck className="size-3 text-purple-600 dark:text-purple-400" /> ADMIN
          </Badge>
        );
      case "AGENT":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
          >
            <UserCheck className="size-3 text-blue-600 dark:text-blue-400" /> AGENT
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {role}
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Active") {
      return (
        <Badge
          variant="outline"
          className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
        >
          <CheckCircle2 className="size-3 text-green-600 dark:text-green-400" /> Active
        </Badge>
      );
    }
    return (
      <Badge
        variant="destructive"
        className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
      >
        <XCircle className="size-3 text-red-600 dark:text-red-400" /> Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="size-7 text-[#67B239]" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={statusFilter}
            onValueChange={(val: string) => setStatusFilter(val as "all" | "Active" | "Inactive")}
          >
            <SelectTrigger className="w-36 bg-white dark:bg-card gap-2 text-xs">
              <Filter className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="Active">Active Users</SelectItem>
              <SelectItem value="Inactive">Inactive Users</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 cursor-pointer"
            onClick={() => setCreateUserModalOpen(true)}
          >
            <Plus className="size-4" />
            Create New User
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input — left side */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            name="search_query"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Search name, business, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 bg-white [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <Card className="shadow-xl border bg-card rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-12.5 font-semibold">SL</TableHead>
                  <TableHead className="w-15 font-semibold">Avatar</TableHead>
                  <TableHead className="min-w-35 font-semibold">Name</TableHead>
                  <TableHead className="min-w-45 font-semibold">Email</TableHead>
                  <TableHead className="min-w-25 font-semibold">Role</TableHead>
                  <TableHead className="min-w-32.5 font-semibold">Created At</TableHead>
                  <TableHead className="min-w-32.5 font-semibold">Last Updated</TableHead>
                  <TableHead className="min-w-25 font-semibold">Status</TableHead>
                  <TableHead className="pr-6 text-right min-w-20 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={9} className="py-4 px-6">
                        <Skeleton className="h-12 w-full rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      <Users className="size-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-foreground">No users match your filters</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Create a new user account or reset search/status filters.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u, index) => (
                    <TableRow key={u.id} className="hover:bg-muted/50 transition-colors">
                      {/* SL */}
                      <TableCell className="pl-6 text-muted-foreground text-xs font-medium">
                        {index + 1}
                      </TableCell>

                      {/* Avatar */}
                      <TableCell>
                        <Avatar
                          className="h-9 w-9 border border-border/70 shadow-2xs cursor-pointer hover:opacity-80 transition-opacity"
                          title="Click to set avatar"
                          onClick={() => setSetAvatarModal({ open: true, user: u })}
                        >
                          <AvatarImage src={u.avatar_url || undefined} alt={u.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {getInitials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>

                      {/* Name */}
                      <TableCell className="font-medium text-foreground text-sm max-w-48 truncate">
                        {u.name}
                      </TableCell>

                      {/* Email */}
                      <TableCell className="text-muted-foreground text-xs font-mono max-w-60 truncate">
                        {u.email}
                      </TableCell>

                      {/* Role */}
                      <TableCell className="whitespace-nowrap">{getRoleBadge(u.role)}</TableCell>

                      {/* Created At */}
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3 text-slate-400" />
                          {new Date(u.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </TableCell>

                      {/* Updated At */}
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(u.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(u.status)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 rounded-full"
                              title="User Actions"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-60 p-1 rounded-[10px]">
                            <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">
                              Actions for {u.name}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() => setEditUserInfoModal({ open: true, user: u })}
                                className="cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5"
                              >
                                <PenLine className="mr-2 h-4 w-4" /> Edit Info
                              </DropdownMenuItem>
                              {u.id !== user?.id &&
                                u.role !== "ADMIN" &&
                                (u.status === "Active" ? (
                                  <DropdownMenuItem
                                    disabled={toggleStatusMutation.isPending}
                                    onClick={() => setBanUserModal({ open: true, user: u })}
                                    className="cursor-pointer text-destructive focus:text-destructive text-sm gap-2 rounded-md px-2 py-1.5"
                                  >
                                    <UserX className="mr-2 h-4 w-4 text-destructive" /> Ban User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    disabled={toggleStatusMutation.isPending}
                                    onClick={() => setBanUserModal({ open: true, user: u })}
                                    className="cursor-pointer text-emerald-600 focus:text-emerald-700 text-sm gap-2 rounded-md px-2 py-1.5"
                                  >
                                    <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                    Unban User
                                  </DropdownMenuItem>
                                ))}
                              <DropdownMenuItem
                                onClick={() => setSetAvatarModal({ open: true, user: u })}
                                className="cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5"
                              >
                                <UserCog className="mr-2 h-4 w-4" /> Set Avatar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setResetPasswordModal({ open: true, user: u })}
                                className="cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5"
                              >
                                <KeyRound className="mr-2 h-4 w-4" /> Change Password
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
                            <DropdownMenuItem
                              disabled={softDeleteMutation.isPending}
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete account for ${u.name}? They will not be able to log in.`,
                                  )
                                ) {
                                  softDeleteMutation.mutate(u.id);
                                }
                              }}
                              className="cursor-pointer text-destructive focus:text-destructive text-sm gap-2 rounded-md px-2 py-1.5"
                            >
                              <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <AdminCreateUserModal open={createUserModalOpen} onOpenChange={setCreateUserModalOpen} />

      {/* Ban User Modal */}
      <AdminBanUserModal
        open={banUserModal.open}
        onOpenChange={(open) => setBanUserModal((prev) => ({ ...prev, open }))}
        user={banUserModal.user}
      />

      {/* Edit User Info Modal */}
      <AdminEditUserInfoModal
        open={editUserInfoModal.open}
        onOpenChange={(open) => setEditUserInfoModal((prev) => ({ ...prev, open }))}
        user={editUserInfoModal.user}
      />

      {/* Set Avatar Modal */}
      <AdminSetAvatarModal
        open={setAvatarModal.open}
        onOpenChange={(open) => setSetAvatarModal((prev) => ({ ...prev, open }))}
        user={setAvatarModal.user}
      />

      {/* Reset Password Modal */}
      <AdminResetPasswordModal
        open={resetPasswordModal.open}
        onOpenChange={(open) => setResetPasswordModal((prev) => ({ ...prev, open }))}
        user={resetPasswordModal.user}
      />

      {/* Change Own Password Modal */}
      <AdminChangeOwnPasswordModal
        open={changeOwnPasswordOpen}
        onOpenChange={setChangeOwnPasswordOpen}
      />
    </div>
  );
}
