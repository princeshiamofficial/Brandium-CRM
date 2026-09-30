"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
  Workflow,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
  resolveStageColor,
  resolveStageIcon,
  isSystemStage,
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

const GROUP_STYLES: Record<string, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  won: {
    label: "Won",
    className: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  },
  lost: {
    label: "Lost",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  },
  denied: {
    label: "Denied",
    className: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
  },
};

export default function StageManagementPage() {
  const router = useRouter();
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
      stage_group: "new",
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Workflow className="size-7 text-[#67B239]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Stage Management</h1>
            <p className="text-sm text-muted-foreground">
              Configure pipeline stages, colors, icons and follow-up rules.
            </p>
          </div>
        </div>
        <Button
          className="bg-[#67B239] hover:bg-[#5aa030] text-white gap-1.5 cursor-pointer"
          onClick={() => {
            setEditingStage(null);
            form.reset();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Create Stage
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search stages by name or order..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-8 bg-white dark:bg-card"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <Card className="shadow-xl border bg-card rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-24 font-semibold">Order</TableHead>
                  <TableHead className="min-w-56 font-semibold">Stage</TableHead>
                  <TableHead className="min-w-28 font-semibold">Group</TableHead>
                  <TableHead className="min-w-36 font-semibold">Prospects</TableHead>
                  <TableHead className="min-w-25 font-semibold">Status</TableHead>
                  <TableHead className="pr-6 text-right min-w-20 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stages.isPending ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx}>
                      <TableCell colSpan={6} className="py-4 px-6">
                        <Skeleton className="h-12 w-full rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredStages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      <Layers className="size-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-foreground">No stages found</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Reset your search or create a new stage.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStages.map((stage) => {
                    const brandColor = resolveStageColor(stage.name, stage.color);
                    const iconName = resolveStageIcon(stage.name, stage.icon);
                    const IconComponent =
                      (Icons as unknown as Record<string, LucideIcon>)[iconName] ||
                      (Icons as unknown as Record<string, LucideIcon>)[stage.icon || "Circle"] ||
                      Icons.Circle;
                    const locked = isSystemStage(stage);

                    return (
                      <TableRow
                        key={stage.id}
                        className={cn(
                          "hover:bg-muted/50 transition-colors",
                          !stage.is_active && "opacity-60",
                        )}
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 text-center font-mono text-sm font-semibold text-foreground">
                              {stage.sort_order}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: stage.id,
                                    sort_order: Math.max(0, stage.sort_order - 1),
                                  })
                                }
                                title="Move up"
                              >
                                <ChevronUp className="size-3" />
                              </button>
                              <button
                                type="button"
                                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: stage.id,
                                    sort_order: stage.sort_order + 1,
                                  })
                                }
                                title="Move down"
                              >
                                <ChevronDown className="size-3" />
                              </button>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="size-9 rounded-full flex items-center justify-center shrink-0 shadow-2xs"
                              style={{ backgroundColor: brandColor }}
                            >
                              <IconComponent className="size-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-foreground text-sm truncate">
                                  {stage.name}
                                </span>
                                {locked && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 gap-1 rounded-full text-muted-foreground"
                                  >
                                    <Lock className="size-2.5" /> System
                                  </Badge>
                                )}
                                {stage.is_follow_up && (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] px-1.5 py-0 rounded-full"
                                  >
                                    Follow-up
                                  </Badge>
                                )}
                              </div>
                              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                                <span
                                  className="size-2 rounded-full"
                                  style={{ backgroundColor: brandColor }}
                                />
                                {brandColor.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-semibold px-2.5 py-0.5 rounded-full",
                              GROUP_STYLES[stage.stage_group]?.className ?? "text-muted-foreground",
                            )}
                          >
                            {GROUP_STYLES[stage.stage_group]?.label ?? stage.stage_group}
                          </Badge>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <button
                            type="button"
                            className="group flex items-center gap-2 cursor-pointer"
                            onClick={() =>
                              router.push(`/prospects?search=${encodeURIComponent(stage.name)}`)
                            }
                            title="View prospects in this stage"
                          >
                            <span className="font-mono text-sm font-semibold text-foreground group-hover:text-[#67B239]">
                              {stage.prospect_count}
                            </span>
                            <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                              <span
                                className="block h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, stage.prospect_percentage)}%`,
                                  backgroundColor: brandColor,
                                }}
                              />
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {stage.prospect_percentage}%
                            </span>
                          </button>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          {stage.is_active ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
                            >
                              <CheckCircle2 className="size-3 text-green-600 dark:text-green-400" />{" "}
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full gap-1"
                            >
                              <XCircle className="size-3 text-red-600 dark:text-red-400" /> Inactive
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="pr-6 text-right whitespace-nowrap">
                          {locked ? (
                            <span
                              className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground"
                              title="System stage is protected and cannot be edited or deleted"
                            >
                              <Lock className="size-4" />
                            </span>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 rounded-full"
                                  title="Stage Actions"
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-1 rounded-[10px]">
                                <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold truncate">
                                  Actions for {stage.name}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
                                <DropdownMenuItem
                                  onClick={() => handleEdit(stage)}
                                  className="cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5"
                                >
                                  <Pencil className="mr-2 h-4 w-4" /> Edit Stage
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => toggleActive(stage)}
                                  className={cn(
                                    "cursor-pointer text-sm gap-2 rounded-md px-2 py-1.5",
                                    stage.is_active
                                      ? "text-destructive focus:text-destructive"
                                      : "text-emerald-600 focus:text-emerald-700",
                                  )}
                                >
                                  {stage.is_active ? (
                                    <>
                                      <PowerOff className="mr-2 h-4 w-4 text-destructive" />{" "}
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Power className="mr-2 h-4 w-4 text-emerald-600" /> Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(stage.id)}
                                  className="cursor-pointer text-destructive focus:text-destructive text-sm gap-2 rounded-md px-2 py-1.5"
                                >
                                  <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete Stage
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
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
                          <SelectItem value="in_progress">In Progress</SelectItem>
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
                  className="bg-[#67B239] hover:bg-[#5aa030] text-white"
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
