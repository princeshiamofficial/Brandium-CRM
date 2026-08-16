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

import {
  stagesWithCountsQuery,
  stageManagementSummaryQuery,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
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

function StatCard({
  label,
  value,
  icon: Icon,
  colorScheme,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme: "pastelPurple" | "pastelTeal" | "pastelEmerald" | "pastelPeach" | "pastelYellow";
}) {
  const styles = {
    pastelPurple: {
      cardBg: "bg-[#F1E8FF] border-[#E3D5FF] dark:bg-purple-950/40 dark:border-purple-800/60",
      iconText: "text-[#8B5CF6] dark:text-purple-400",
    },
    pastelTeal: {
      cardBg: "bg-[#E1F1F0] border-[#C8E7E4] dark:bg-teal-950/40 dark:border-teal-800/60",
      iconText: "text-[#0D9488] dark:text-teal-400",
    },
    pastelEmerald: {
      cardBg: "bg-[#E3F2E1] border-[#CDE9C9] dark:bg-emerald-950/40 dark:border-emerald-800/60",
      iconText: "text-[#059669] dark:text-emerald-400",
    },
    pastelPeach: {
      cardBg: "bg-[#FCE8E2] border-[#F8D4C8] dark:bg-rose-950/40 dark:border-rose-800/60",
      iconText: "text-[#EA580C] dark:text-orange-400",
    },
    pastelYellow: {
      cardBg: "bg-[#FBF3D5] border-[#F5E6B5] dark:bg-amber-950/40 dark:border-amber-800/60",
      iconText: "text-[#D97706] dark:text-amber-400",
    },
  }[colorScheme];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-4.5 shadow-md shadow-slate-200/60 dark:shadow-none hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${styles.cardBg}`}
    >
      <div className="relative z-10 flex items-center gap-3.5">
        <div className="size-10 sm:size-11 rounded-full bg-white dark:bg-card shadow-sm flex items-center justify-center shrink-0 border border-black/5">
          <Icon className={`size-5 sm:size-5.5 ${styles.iconText}`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {label}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight mt-0.5 tracking-tight truncate">
            {value}
          </p>
        </div>
      </div>

      <div className="absolute -right-3 -bottom-3 opacity-[0.07] pointer-events-none transform rotate-12 scale-125 transition-transform group-hover:scale-135">
        <Icon className={`size-16 ${styles.iconText}`} />
      </div>
    </div>
  );
}

function StageManagementPage() {
  const navigate = useNavigate();
  const summary = useQuery(stageManagementSummaryQuery());
  const stages = useQuery(stagesWithCountsQuery());

  const createMutation = useCreateStage();
  const updateMutation = useUpdateStage();
  const deleteMutation = useDeleteStage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  const form = useForm<StageFormValues>({
    resolver: zodResolver(stageFormSchema) as Resolver<StageFormValues>,
    defaultValues: {
      name: "",
      stage_group: "new",
      sort_order: 0,
      is_follow_up: false,
      color: "#94a3b8",
      icon: "Circle",
    },
  });

  const onSubmit = (values: StageFormValues) => {
    const payload = {
      ...values,
      color: values.color ?? null,
      icon: values.icon ?? null,
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
    setEditingStage(stage);
    form.reset({
      name: stage.name,
      stage_group: stage.stage_group,
      sort_order: stage.sort_order,
      is_follow_up: stage.is_follow_up,
      color: stage.color || "#94a3b8",
      icon: stage.icon || "Circle",
    });
    setIsDialogOpen(true);
  };

  const toggleActive = (stage: Stage) => {
    updateMutation.mutate({ id: stage.id, is_active: !stage.is_active });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this stage? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Prospects"
          value={summary.data?.total_prospects ?? 0}
          icon={TrendingUp}
          colorScheme="pastelPurple"
        />
        <StatCard
          label="Active Stages"
          value={summary.data?.active_stages ?? 0}
          icon={Layers}
          colorScheme="pastelEmerald"
        />
        <StatCard
          label="Follow-up Count"
          value={summary.data?.follow_up_prospects ?? 0}
          icon={CalendarClock}
          colorScheme="pastelPeach"
        />
        <StatCard
          label="Top Stage"
          value={summary.data?.top_stage ?? "None"}
          icon={Settings2}
          colorScheme="pastelYellow"
        />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {stages.isPending
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 h-48"
              >
                <div className="h-10 bg-slate-100 rounded-xl mb-4" />
                <div className="h-20 bg-slate-50 rounded-xl" />
              </div>
            ))
          : stages.data?.map((stage) => {
              const IconComponent =
                (Icons as unknown as Record<string, LucideIcon>)[stage.icon || "Circle"] ||
                Icons.Circle;
              const brandColor = stage.color || "#0a2e5c";

              return (
                <div
                  key={stage.id}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-card p-4.5 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 ${
                    !stage.is_active ? "opacity-60 bg-slate-50/50 dark:bg-muted/10" : ""
                  }`}
                >
                  {/* Top Brand Color Line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                    style={{ backgroundColor: brandColor }}
                  />

                  {/* Header */}
                  <div className="flex items-center justify-between gap-2.5 mb-3 pt-0.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="size-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs transition-transform group-hover:scale-105"
                        style={{ backgroundColor: brandColor }}
                      >
                        <IconComponent className="size-4.5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
                          {stage.name}
                        </h3>
                        <span
                          className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md mt-0.5"
                          style={{
                            backgroundColor: `${brandColor}18`,
                            color: brandColor,
                          }}
                        >
                          {stage.stage_group.replace("_", " ")}
                        </span>
                      </div>
                    </div>

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
                        <DropdownMenuLabel className="text-xs font-bold">Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEdit(stage)}
                          className="text-xs font-semibold cursor-pointer rounded-lg"
                        >
                          <Pencil className="mr-2 size-3.5 text-blue-500" />
                          Edit Properties
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateMutation.mutate({
                              id: stage.id,
                              sort_order: Math.max(0, stage.sort_order - 1),
                            })
                          }
                          className="text-xs font-semibold cursor-pointer rounded-lg"
                        >
                          <ArrowUp className="mr-2 size-3.5 text-emerald-500" />
                          Move Up
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateMutation.mutate({
                              id: stage.id,
                              sort_order: stage.sort_order + 1,
                            })
                          }
                          className="text-xs font-semibold cursor-pointer rounded-lg"
                        >
                          <ArrowDown className="mr-2 size-3.5 text-amber-500" />
                          Move Down
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleActive(stage)}
                          className="text-xs font-semibold cursor-pointer rounded-lg"
                        >
                          {stage.is_active ? (
                            <>
                              <PowerOff className="mr-2 size-3.5 text-rose-500" /> Deactivate
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 size-3.5 text-emerald-500" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        {!stage.is_system && (
                          <DropdownMenuItem
                            className="text-destructive text-xs font-semibold cursor-pointer rounded-lg"
                            onClick={() => handleDelete(stage.id)}
                          >
                            <Trash2 className="mr-2 size-3.5" />
                            Delete Stage
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Metrics & Content */}
                  <div className="space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          {stage.prospect_count}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 ml-1.5">
                          prospects
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className="inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${brandColor}18`,
                            color: brandColor,
                          }}
                        >
                          {stage.prospect_percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className="h-1.5 w-full rounded-full overflow-hidden"
                      style={{ backgroundColor: `${brandColor}18` }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${stage.prospect_percentage}%`,
                          backgroundColor: brandColor,
                        }}
                      />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {stage.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400">
                          Inactive
                        </span>
                      )}
                      {stage.is_follow_up && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
                          Follow-up
                        </span>
                      )}
                      {stage.is_system && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60">
                          System Core
                        </span>
                      )}
                    </div>

                    {/* Footer Link */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                      <button
                        type="button"
                        className="w-full text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        onClick={() =>
                          navigate({
                            to: "/prospects",
                            search: { search: stage.name },
                          })
                        }
                      >
                        View Prospects
                        <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

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
                      <FormLabel>Icon (Lucide)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Circle, Trophy, etc."
                          {...field}
                          value={field.value ?? ""}
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
