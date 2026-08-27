import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Shield,
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Lock,
  Sparkles,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Key,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatCrmDate } from "@/lib/mysql-client";
import {
  rolesQueryOptions,
  permissionsQueryOptions,
  useSaveRoleMutation,
  useDeleteRoleMutation,
  type CrmRoleItem,
  type RolePermissionItem,
} from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  head: () => ({
    meta: [
      { title: "Role Management | Brandium Telesales CRM" },
      {
        name: "description",
        content: "Admin role & permission matrix management for Brandium CRM.",
      },
      { property: "og:title", content: "Role Management | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Admin role & permission matrix management for Brandium CRM.",
      },
    ],
  }),
  component: AdminRolesPage,
});

function AdminRolesPage() {
  const [search, setSearch] = useState("");
  const [roleModal, setRoleModal] = useState<{
    open: boolean;
    role: CrmRoleItem | null;
  }>({
    open: false,
    role: null,
  });
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    role: CrmRoleItem | null;
  }>({
    open: false,
    role: null,
  });

  const { data: roles = [], isLoading: isRolesLoading } = useQuery(rolesQueryOptions());
  const { data: permissions = [], isLoading: isPermsLoading } = useQuery(permissionsQueryOptions());

  const saveRoleMutation = useSaveRoleMutation();
  const deleteRoleMutation = useDeleteRoleMutation();

  // Filter roles based on search
  const filteredRoles = useMemo(() => {
    if (!search.trim()) return roles;
    const q = search.toLowerCase().trim();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)),
    );
  }, [roles, search]);

  const getRoleIcon = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin"))
      return <ShieldCheck className="size-4 text-purple-600 dark:text-purple-400" />;
    if (name.includes("artist"))
      return <Sparkles className="size-4 text-amber-600 dark:text-amber-400" />;
    if (name.includes("agent"))
      return <UserCheck className="size-4 text-blue-600 dark:text-blue-400" />;
    return <Shield className="size-4 text-[#67B239]" />;
  };

  const getRoleBadgeVariant = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes("admin"))
      return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30";
    if (name.includes("artist"))
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    if (name.includes("agent"))
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";
    return "bg-[#67B239]/15 text-[#67B239] border-[#67B239]/30";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="size-6 text-[#67B239]" />
            Role & Permission Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure system roles (Admin, Agent, Artist), access controls, and custom permission
            matrices.
          </p>
        </div>

        <Button
          onClick={() => setRoleModal({ open: true, role: null })}
          className="gap-2 text-xs font-semibold bg-[#67B239] hover:bg-[#5aa030] text-white shadow-xs rounded-xl self-start sm:self-auto"
        >
          <Plus className="size-4" /> Add New Role
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border border-border/80 shadow-2xs overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Roles & Access Matrix</CardTitle>
              <CardDescription className="text-xs">
                Manage role definitions, granular resource privileges, and user memberships.
              </CardDescription>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 text-xs">
                <TableRow>
                  <TableHead className="pl-6 w-12 font-semibold">SL</TableHead>
                  <TableHead className="min-w-44 font-semibold">Role Name</TableHead>
                  <TableHead className="min-w-56 font-semibold">Description</TableHead>
                  <TableHead className="min-w-28 font-semibold">Type</TableHead>
                  <TableHead className="min-w-24 font-semibold">Users</TableHead>
                  <TableHead className="min-w-64 font-semibold">Assigned Permissions</TableHead>
                  <TableHead className="min-w-32 font-semibold">Last Updated</TableHead>
                  <TableHead className="pr-6 text-right min-w-24 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isRolesLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={8} className="py-4 px-6">
                        <Skeleton className="h-12 w-full rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      <Shield className="size-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-foreground">No roles found</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Create a custom role or adjust your search filter.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role, idx) => (
                    <TableRow key={role.id} className="hover:bg-muted/50 transition-colors">
                      {/* SL */}
                      <TableCell className="pl-6 text-muted-foreground text-xs font-medium">
                        {idx + 1}
                      </TableCell>

                      {/* Role Name */}
                      <TableCell className="font-semibold text-sm">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1.5 ${getRoleBadgeVariant(
                              role.name,
                            )}`}
                          >
                            {getRoleIcon(role.name)}
                            {role.name.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Description */}
                      <TableCell className="text-xs text-muted-foreground max-w-64 truncate">
                        {role.description || "No description provided."}
                      </TableCell>

                      {/* Type */}
                      <TableCell className="whitespace-nowrap">
                        {role.is_system ? (
                          <Badge variant="secondary" className="text-[11px] font-medium gap-1">
                            <Lock className="size-3 text-purple-600" /> System Default
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[11px] font-medium text-[#67B239] border-[#67B239]/40"
                          >
                            Custom Role
                          </Badge>
                        )}
                      </TableCell>

                      {/* Users Count */}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span>{role.user_count} active user(s)</span>
                        </div>
                      </TableCell>

                      {/* Assigned Permissions */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-72">
                          {role.permissions.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">
                              No permissions assigned
                            </span>
                          ) : (
                            role.permissions.slice(0, 3).map((p) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {p.resource}:{p.action}
                              </span>
                            ))
                          )}
                          {role.permissions.length > 3 && (
                            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Last Updated */}
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatCrmDate(role.updated_at)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Edit Role & Permissions"
                            onClick={() => setRoleModal({ open: true, role })}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          {!role.is_system && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              title="Delete Role"
                              onClick={() => setDeleteModal({ open: true, role })}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Role Modal */}
      {roleModal.open && (
        <RoleFormModal
          open={roleModal.open}
          onOpenChange={(open) => setRoleModal({ open, role: null })}
          role={roleModal.role}
          allPermissions={permissions}
          isPermsLoading={isPermsLoading}
          onSave={async (data) => {
            await saveRoleMutation.mutateAsync(data);
            setRoleModal({ open: false, role: null });
          }}
          isSaving={saveRoleMutation.isPending}
        />
      )}

      {/* Delete Role Dialog */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(open: boolean) => setDeleteModal({ open, role: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-5" /> Delete Role
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Are you sure you want to delete role{" "}
              <strong className="text-foreground">"{deleteModal.role?.name}"</strong>? This action
              cannot be undone. All assigned permissions for this role will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              onClick={async () => {
                if (deleteModal.role) {
                  await deleteRoleMutation.mutateAsync(deleteModal.role.id);
                  setDeleteModal({ open: false, role: null });
                }
              }}
            >
              {deleteRoleMutation.isPending ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --------------------------------------------------------------------------
// Sub-component: Role Form Modal (Create / Edit)
// --------------------------------------------------------------------------
interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: CrmRoleItem | null;
  allPermissions: RolePermissionItem[];
  isPermsLoading: boolean;
  onSave: (payload: {
    id?: string | null;
    name: string;
    description?: string | null;
    permission_ids: string[];
  }) => Promise<void>;
  isSaving: boolean;
}

function RoleFormModal({
  open,
  onOpenChange,
  role,
  allPermissions,
  isPermsLoading,
  onSave,
  isSaving,
}: RoleFormModalProps) {
  const [name, setName] = useState(role?.name || "");
  const [description, setDescription] = useState(role?.description || "");
  const [selectedPermIds, setSelectedPermIds] = useState<string[]>(role?.permission_ids || []);

  // Group permissions by category/resource
  const groupedPermissions = useMemo(() => {
    const map = new Map<string, RolePermissionItem[]>();
    for (const p of allPermissions) {
      const cat = p.resource.toUpperCase();
      const list = map.get(cat) || [];
      list.push(p);
      map.set(cat, list);
    }
    return Array.from(map.entries());
  }, [allPermissions]);

  const togglePermission = (id: string) => {
    setSelectedPermIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedPermIds(allPermissions.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedPermIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave({
      id: role?.id || null,
      name: name.trim(),
      description: description.trim() || null,
      permission_ids: selectedPermIds,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border/60">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <ShieldCheck className="size-5 text-[#67B239]" />
            {role ? `Edit Role: ${role.name}` : "Create New Role"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Define role name, description, and configure granular resource access privileges.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-xs">
            {/* Role Name */}
            <div className="space-y-1.5">
              <Label htmlFor="role_name_input" className="text-xs font-semibold">
                Role Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="role_name_input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Artist, Video Editor, Telesales Specialist"
                className="text-xs"
                required
                disabled={role?.is_system}
              />
              {role?.is_system && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Lock className="size-3" /> System role name cannot be modified.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="role_desc_input" className="text-xs font-semibold">
                Description
              </Label>
              <Textarea
                id="role_desc_input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe responsibilities and access scope for this role..."
                rows={2}
                className="text-xs resize-none"
              />
            </div>

            {/* Permissions Matrix */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Key className="size-3.5 text-[#67B239]" />
                  Privileges & Permissions Matrix ({selectedPermIds.length}/{allPermissions.length}{" "}
                  selected)
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-[#67B239] hover:bg-[#67B239]/10"
                    onClick={selectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-muted-foreground hover:bg-muted"
                    onClick={deselectAll}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              {isPermsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedPermissions.map(([resource, perms]) => (
                    <div
                      key={resource}
                      className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                        <span className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-[#67B239]" />
                          {resource}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {perms.filter((p) => selectedPermIds.includes(p.id)).length} of{" "}
                          {perms.length} granted
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {perms.map((p) => {
                          const isChecked = selectedPermIds.includes(p.id);
                          return (
                            <label
                              key={p.id}
                              className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer ${
                                isChecked
                                  ? "bg-[#67B239]/10 border-[#67B239]/40 text-foreground"
                                  : "bg-background border-border/50 text-muted-foreground hover:bg-muted/50"
                              }`}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => togglePermission(p.id)}
                                className="mt-0.5 data-[state=checked]:bg-[#67B239] data-[state=checked]:border-[#67B239]"
                              />
                              <div className="space-y-0.5">
                                <p className="font-medium text-xs text-foreground leading-none">
                                  {p.action.toUpperCase()}
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-tight">
                                  {p.description || `Permission for ${p.resource} ${p.action}`}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/10 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="text-xs h-9 px-4 rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="text-xs h-9 px-5 font-semibold bg-[#67B239] hover:bg-[#5aa030] text-white rounded-xl shadow-xs"
            >
              {isSaving ? "Saving..." : role ? "Update Role" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
