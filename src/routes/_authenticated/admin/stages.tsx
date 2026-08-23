import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Settings2,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Layers,
  CalendarClock,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Lock,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/placeholder-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Icons from "lucide-react";

import { IconPicker } from "@/components/icon-picker";

import {
  stagesWithCountsQuery,
  stageManagementSummaryQuery,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
  resolveStageColor,
  resolveStageIcon,
  isSystemStage,
  DEFAULT_STAGE_THEMES,
  type Stage,
} from "@/lib/stages";

const stageFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  stage_group: z.string().min(1, "Group is required"),
  sort_order: z.coerce.number().int().min(0),
  is_follow_up: z.boolean(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

type StageFormValues = z.infer<typeof stageFormSchema>;

export const Route = createFileRoute("/_authenticated/admin/stages")({
  head: () => ({
    meta: [
      { title: "Stage Management | Brandium Telesales CRM" },
      { name: "description", content: "Manage available lead stages and pipeline flow." },
      { property: "og:title", content: "Stage Management | Brandium Telesales CRM" },
      { property: "og:description", content: "Manage available lead stages and pipeline flow." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StageManagementPage,
});

function StageManagementPage() {
  const navigate = useNavigate();
  const stages = useQuery(stagesWithCountsQuery());

  const createMutation = useCreateStage();
  const updateMutation = useUpdateStage();
  const deleteMutation = useDeleteStage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [search, setSearch] = useState<string>("");

  const rawStagesList = stages.data ?? [];
  const filteredStages = rawStagesList.filter((s) => {
    if (!search || !search.trim()) return true;
    const q = search.toLowerCase().trim();
    return s.name.toLowerCase().includes(q) || String(s.sort_order).includes(q);
  });

  const form = useForm<z.infer<typeof stageFormSchema>>({
    resolver: zodResolver(stageFormSchema) as Resolver<z.infer<typeof stageFormSchema>>,
    defaultValues: {
      name: "",
      stage_group: "prospect",
      sort_order: (rawStagesList.length ?? 0) + 1,
      is_follow_up: false,
      color: "#2563EB",
      icon: "Circle",
    },
  });

  const onSubmit = (values: z.infer<typeof stageFormSchema>) => {
    const payload = {
      name: values.name,
      stage_group: values.stage_group,
      sort_order: values.sort_order,
      is_follow_up: values.is_follow_up,
      color: values.color ?? null,
      icon: values.icon ?? null,
      is_active: true,
    };

    if (editingStage) {
      updateMutation.mutate(
        { id: editingStage.id, ...payload },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingStage(null);
            form.reset();
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
        },
      });
    }
  };

  const handleEdit = (stage: Stage) => {
    if (isSystemStage(stage)) {
      toast.error("System stage is protected and cannot be edited.");
      return;
    }
    setEditingStage(stage);
    form.reset({
      name: stage.name,
      stage_group: stage.stage_group,
      sort_order: stage.sort_order,
      is_follow_up: stage.is_follow_up,
      color: resolveStageColor(stage.name, stage.color),
      icon: resolveStageIcon(stage.name, stage.icon),
    });
    setIsDialogOpen(true);
  };

  const toggleActive = (stage: Stage) => {
    if (isSystemStage(stage) && stage.is_active) {
      toast.error("System stages are required for core CRM workflows and cannot be deactivated.");
      return;
    }
    updateMutation.mutate({ id: stage.id, is_active: !stage.is_active });
  };

  const handleDelete = (id: string) => {
    const stage = rawStagesList.find((s) => s.id === id);
    if (stage && isSystemStage(stage)) {
      toast.error("System stages cannot be deleted as they are required for CRM workflows.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this stage? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage Management"
        description="Configure your sales pipeline stages, colors, and tracking rules."
      >
        <Button
          onClick={() => {
            setEditingStage(null);
            form.reset();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Create Stage
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Icons.Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search stages by name or order..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8 bg-white dark:bg-card rounded-xl"
          />
        </div>
      </div>

      {/* Main Stages Table */}
      <Card className="bg-white dark:bg-card border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b bg-slate-50/80 dark:bg-muted/50 font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Order</th>
                <th className="py-3.5 px-4">Stage Name & Color</th>
                <th className="py-3.5 px-4">Prospects</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {stages.isPending ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={5} className="py-4 px-4">
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : filteredStages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Icons.Layers className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-foreground">No stages found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Try resetting your search filter or create a new stage.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStages.map((stage) => {
                  const brandColor = resolveStageColor(stage.name, stage.color);
                  const iconName = resolveStageIcon(stage.name, stage.icon);
                  const IconComponent =
                    (Icons as unknown as Record<string, LucideIcon>)[iconName] ||
                    (Icons as unknown as Record<string, LucideIcon>)[stage.icon || "Circle"] ||
                    Icons.Circle;

                  return (
                    <tr
                      key={stage.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-muted/30 transition-colors ${
                        !stage.is_active ? "opacity-60 bg-slate-50/40 dark:bg-muted/10" : ""
                      }`}
                    >
                      {/* Order & Re-order Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                          <span className="w-5 text-center">{stage.sort_order}</span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-0.5"
                              onClick={() =>
                                updateMutation.mutate({
                                  id: stage.id,
                                  sort_order: Math.max(0, stage.sort_order - 1),
                                })
                              }
                              title="Move Up"
                            >
                              <Icons.ChevronUp className="size-3" />
                            </button>
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-0.5"
                              onClick={() =>
                                updateMutation.mutate({
                                  id: stage.id,
                                  sort_order: stage.sort_order + 1,
                                })
                              }
                              title="Move Down"
                            >
                              <Icons.ChevronDown className="size-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Stage Name & Color */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="size-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs transition-transform hover:scale-105"
                            style={{ backgroundColor: brandColor }}
                          >
                            <IconComponent className="size-4.5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                                {stage.name}
                              </span>
                              {isSystemStage(stage) && (
                                <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[9px] px-1.5 py-0 gap-1 font-bold border border-slate-200 dark:border-slate-700">
                                  <Lock className="size-2.5 text-slate-500" />
                                  System
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border"
                                style={{
                                  backgroundColor: `${brandColor}15`,
                                  color: brandColor,
                                  borderColor: `${brandColor}35`,
                                }}
                              >
                                <span
                                  className="size-2 rounded-full inline-block shadow-2xs"
                                  style={{ backgroundColor: brandColor }}
                                />
                                {brandColor.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Prospects Count & Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-bold gap-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() =>
                            navigate({
                              to: "/prospects",
                              search: { search: stage.name },
                            })
                          }
                          title="View prospects in this stage"
                        >
                          <span className="text-foreground">{stage.prospect_count}</span>
                          <span className="text-muted-foreground font-normal">
                            ({stage.prospect_percentage}%)
                          </span>
                          <Icons.ChevronRight className="size-3 text-slate-400" />
                        </Button>
                      </td>

                      {/* Active / Inactive Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleActive(stage)}
                          className={`cursor-pointer ${isSystemStage(stage) ? "cursor-default" : ""}`}
                          title={
                            isSystemStage(stage)
                              ? "System stages remain active"
                              : "Click to toggle status"
                          }
                        >
                          {stage.is_active ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px] px-2 py-0.5 font-semibold gap-1">
                              <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-slate-400 border-slate-200 text-[10px] px-2 py-0.5 font-semibold gap-1"
                            >
                              <span className="size-1.5 rounded-full bg-slate-400 inline-block" />
                              Inactive
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {isSystemStage(stage) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="h-7 px-2 text-xs font-semibold rounded-lg gap-1 opacity-50 cursor-not-allowed bg-slate-50 dark:bg-muted/20 border-slate-200 dark:border-slate-800 text-slate-500"
                              title="System stage is protected and cannot be edited or deleted"
                            >
                              <Lock className="size-3 text-slate-400" />
                              System Locked
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs font-semibold rounded-lg gap-1 cursor-pointer"
                                onClick={() => handleEdit(stage)}
                              >
                                <Icons.Pencil className="size-3 text-blue-600" />
                                Edit
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  >
                                    <MoreVertical className="size-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="rounded-xl shadow-xl border-slate-200 dark:border-slate-800"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(stage)}
                                    className="text-xs font-semibold cursor-pointer rounded-lg"
                                  >
                                    <Pencil className="mr-2 size-3.5 text-blue-500" />
                                    Edit Properties
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => toggleActive(stage)}
                                    className="text-xs font-semibold cursor-pointer rounded-lg"
                                  >
                                    {stage.is_active ? (
                                      <>
                                        <PowerOff className="mr-2 size-3.5 text-rose-500" />{" "}
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Power className="mr-2 size-3.5 text-emerald-500" />{" "}
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive text-xs font-semibold cursor-pointer rounded-lg"
                                    onClick={() => handleDelete(stage.id)}
                                  >
                                    <Trash2 className="mr-2 size-3.5" />
                                    Delete Stage
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStage ? "Edit Stage" : "Create New Stage"}</DialogTitle>
            <DialogDescription>
              Configure the pipeline stage details. Normalized names must be unique.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sales Won" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stage_group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="progress">In Progress</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                          <SelectItem value="denied">Denied</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="p-1 w-12 h-10"
                            {...field}
                            value={field.value ?? ""}
                          />
                          <Input {...field} value={field.value ?? ""} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage Icon</FormLabel>
                      <FormControl>
                        <IconPicker
                          value={field.value}
                          onChange={(iconName, defaultColor) => {
                            field.onChange(iconName);
                            if (defaultColor) {
                              form.setValue("color", defaultColor);
                            }
                          }}
                          color={form.watch("color") || undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_follow_up"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Mark as Follow-up</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Prospects in this stage will appear in follow-up reports.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingStage ? "Save Changes" : "Create Stage"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
