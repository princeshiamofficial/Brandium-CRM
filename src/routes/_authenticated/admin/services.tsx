import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Search,
  Edit,
  PowerOff,
  Power,
  Trash2,
  CheckCircle2,
  XCircle,
  Camera,
  Palette,
  Calendar,
  Clock,
  ShieldCheck,
  Globe,
  Video,
  Tv,
  PlayCircle,
  Mic,
  Film,
  Star,
  Sparkles,
  Brush,
  type LucideIcon,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";

import {
  servicesQueryOptions,
  CrmService,
  toggleServiceStatus,
  softDeleteService,
} from "@/lib/services";
import { AdminServiceModal } from "@/components/admin-service-modal";

export const Route = createFileRoute("/_authenticated/admin/services")({
  head: () => ({
    meta: [
      { title: "Service Management | Brandium Telesales CRM" },
      {
        name: "description",
        content: "Configure sales service offerings and soft-delete protections.",
      },
      { property: "og:title", content: "Service Management | Brandium Telesales CRM" },
      {
        property: "og:description",
        content: "Configure sales service offerings and soft-delete protections.",
      },
    ],
  }),
  component: AdminServicesPage,
});

const ICON_MAP: Record<string, LucideIcon> = {
  Camera: Star,
  Palette: Palette,
  Calendar: Calendar,
  Globe: Globe,
  Video,
  Tv,
  PlayCircle,
  Mic,
  Film,
  Star,
  Sparkles,
  Brush,
  Layers,
};

function renderServiceIcon(iconName: string) {
  const IconComp = ICON_MAP[iconName] || Layers;
  return <IconComp className="size-4 text-[#67B239]" />;
}

function AdminServicesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState<string>("");
  const [modalState, setModalState] = useState<{
    open: boolean;
    service: CrmService | null;
  }>({ open: false, service: null });

  const { data: services = [], isLoading } = useQuery(servicesQueryOptions(search));

  const totalServicesCount = services.length;
  const activeCount = services.filter((s) => s.status === "Active").length;
  const inactiveCount = services.filter((s) => s.status === "Inactive").length;

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "Active" | "Inactive" }) => {
      return toggleServiceStatus(id, status);
    },
    onSuccess: (_, vars) => {
      toast.success(`Service status set to ${vars.status}.`);
      void queryClient.invalidateQueries({ queryKey: ["crm-services"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to toggle service status.");
    },
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return softDeleteService(id);
    },
    onSuccess: () => {
      toast.success("Service set to Inactive to preserve historical record integrity.");
      void queryClient.invalidateQueries({ queryKey: ["crm-services"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to set service inactive.");
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="size-7 text-[#67B239]" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Service Management
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure CRM service offerings. Historical services are soft-deleted/set inactive to
            maintain audit history.
          </p>
        </div>

        <Button
          className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 self-start sm:self-auto"
          onClick={() => setModalState({ open: true, service: null })}
        >
          <Plus className="size-4" />
          Add New Service
        </Button>
      </div>

      {/* Summary KPI Cards (Total Services, Active Services, Inactive Services) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Services"
          value={String(totalServicesCount)}
          icon={Layers}
          colorScheme="indigo"
        />
        <StatCard
          label="Active Services"
          value={String(activeCount)}
          icon={CheckCircle2}
          colorScheme="emerald"
        />
        <StatCard
          label="Inactive Services"
          value={String(inactiveCount)}
          icon={XCircle}
          colorScheme="amber"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input — left side */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name, business, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 bg-white"
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

      {/* Services Table */}
      <Card className="bg-white dark:bg-card border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b bg-slate-50/80 dark:bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Icon & Service Name</th>
                <th className="py-3.5 px-4">Description Scope</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created At</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={6} className="py-4 px-4">
                      <Skeleton className="h-10 w-full rounded" />
                    </td>
                  </tr>
                ))
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Layers className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-foreground">No services match your search</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add a service or clear your search terms.
                    </p>
                  </td>
                </tr>
              ) : (
                services.map((srv) => (
                  <tr
                    key={srv.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors"
                  >
                    {/* Name & Icon */}
                    <td className="py-3.5 px-4 max-w-56">
                      <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                        <div className="h-7 w-7 rounded bg-[#67B239]/10 flex items-center justify-center shrink-0">
                          {renderServiceIcon(srv.icon)}
                        </div>
                        <span>{srv.name}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-72">
                      <p
                        className="text-muted-foreground line-clamp-2"
                        title={srv.description || ""}
                      >
                        {srv.description || "No detailed description provided."}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {srv.status === "Active" ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] px-2 py-0.5 gap-1">
                          <CheckCircle2 className="size-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-slate-500 border-slate-300 text-[10px] px-2 py-0.5 gap-1"
                        >
                          <XCircle className="size-3 text-slate-400" />
                          Inactive
                        </Badge>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {new Date(srv.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Updated At */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {new Date(srv.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => setModalState({ open: true, service: srv })}
                        >
                          <Edit className="size-3.5 text-blue-600" />
                          Edit
                        </Button>

                        {/* Activate / Deactivate Toggle */}
                        {srv.status === "Active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50"
                            title="Deactivate Service"
                            disabled={toggleMutation.isPending}
                            onClick={() => {
                              toggleMutation.mutate({ id: srv.id, status: "Inactive" });
                            }}
                          >
                            <PowerOff className="size-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                            title="Activate Service"
                            disabled={toggleMutation.isPending}
                            onClick={() => {
                              toggleMutation.mutate({ id: srv.id, status: "Active" });
                            }}
                          >
                            <Power className="size-3.5" />
                          </Button>
                        )}

                        {/* Soft Delete Safeguard Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Soft-delete (Set Inactive to protect history)"
                          disabled={softDeleteMutation.isPending}
                          onClick={() => {
                            if (
                              confirm(
                                `Set "${srv.name}" to inactive? Historical invoices and deals referencing this service will be preserved.`,
                              )
                            ) {
                              softDeleteMutation.mutate(srv.id);
                            }
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Service Create/Edit Modal */}
      <AdminServiceModal
        open={modalState.open}
        onOpenChange={(open) => setModalState((prev) => ({ ...prev, open }))}
        service={modalState.service}
      />
    </div>
  );
}
