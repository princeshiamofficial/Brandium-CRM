"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, format, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Download,
  Settings2,
  Loader2,
  PhoneCall,
  Search,
  TriangleAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { DateRangePicker3 } from "@/components/dashboard/date-range-picker3";
import { useAuth } from "@/lib/auth";
import {
  followUpBoardQueryOptions,
  followUpStageFor,
  followUpStagesQueryOptions,
  useRemoveFollowUp,
  useUpdateFollowUp,
  type FollowUpBoardItem,
  type FollowUpStage,
} from "@/lib/follow-ups";
import { getContrastTextColor } from "@/lib/orders";
import { parseNotesToItems } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { FollowUpCard, formatFollowUpDate } from "./follow-up-card";
import { ManageFollowUpStagesDialog } from "./manage-follow-up-stages-dialog";

type SearchField = "all" | "name" | "phone";

const STAGE_ICONS: Record<string, LucideIcon> = {
  pending: Clock,
  inprogress: PhoneCall,
  completed: CheckCircle2,
  canceled: XCircle,
  cancelled: XCircle,
};

const stageIcon = (name: string) =>
  STAGE_ICONS[name.toLowerCase().replace(/[^a-z]/g, "")] || PhoneCall;

const toCsvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** Clone of ERPAPP `FollowUpKanbanClient.tsx`: one card per prospect, grouped by follow-up status. */
export function FollowUpBoard() {
  const { user, profile, isAdmin } = useAuth();
  const userName = profile?.full_name || "Admin";
  const { data: itemsData, isLoading } = useQuery({
    ...followUpBoardQueryOptions(user?.id, isAdmin),
    enabled: !!user,
    refetchInterval: 30000,
  });
  const { data: stagesData } = useQuery(followUpStagesQueryOptions());
  const items = useMemo(() => itemsData || [], [itemsData]);
  const stages = useMemo(() => stagesData || [], [stagesData]);

  const updateMutation = useUpdateFollowUp();
  const removeMutation = useRemoveFollowUp();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [draggingItem, setDraggingItem] = useState<FollowUpBoardItem | null>(null);
  const [noteTarget, setNoteTarget] = useState<{
    item: FollowUpBoardItem;
    status: string;
  } | null>(null);
  const [timelineItem, setTimelineItem] = useState<FollowUpBoardItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<FollowUpBoardItem | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedDateRange?.from) {
        const start = startOfDay(selectedDateRange.from).getTime();
        const end = endOfDay(selectedDateRange.to || selectedDateRange.from).getTime();
        const t = new Date(item.due_at).getTime();
        if (Number.isNaN(t) || t < start || t > end) return false;
      }
      if (!term) return true;
      const name = `${item.business_name} ${item.contact_name}`.toLowerCase();
      const phone = item.phone.toLowerCase();
      if (searchField === "name") return name.includes(term);
      if (searchField === "phone") return phone.includes(term);
      return (
        name.includes(term) || phone.includes(term) || item.address.toLowerCase().includes(term)
      );
    });
  }, [items, searchTerm, searchField, selectedDateRange]);

  const itemsByStage = useMemo(() => {
    const grouped: Record<string, FollowUpBoardItem[]> = {};
    stages.forEach((s) => (grouped[s.id] = []));
    filteredItems.forEach((item) => {
      const stage = followUpStageFor(item.status, stages);
      if (stage) grouped[stage.id]?.push(item);
    });
    return grouped;
  }, [filteredItems, stages]);

  // Unfiltered: column management must see every card, not only the searched ones
  const itemIdsByStage = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    items.forEach((item) => {
      const stage = followUpStageFor(item.status, stages);
      if (stage) (grouped[stage.id] ||= []).push(item.id);
    });
    return grouped;
  }, [items, stages]);

  const handleDrop = (itemId: string, stage: FollowUpStage) => {
    setDraggingItem(null);
    const item = items.find((i) => i.id === itemId);
    if (!item || followUpStageFor(item.status, stages)?.id === stage.id) return;
    setNoteTarget({ item, status: stage.name });
  };

  const handleConfirmNote = async (notes: string, nextDueAt: string) => {
    if (!noteTarget) return;
    const { item, status } = noteTarget;
    const isStageChange = followUpStageFor(item.status, stages)?.name !== status;
    try {
      await updateMutation.mutateAsync({
        item,
        status,
        notes,
        nextDueAt,
        userId: user?.id,
        userName,
      });
      toast.success(isStageChange ? "Status Updated" : "Update Saved", {
        description: isStageChange
          ? `Record moved to ${status}.`
          : "The activity update has been recorded.",
      });
      setNoteTarget(null);
    } catch (err) {
      toast.error("Update Failed", {
        description: err instanceof Error ? err.message : "Could not save the follow-up.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await removeMutation.mutateAsync(deleteItem.prospect_id);
      toast.success("Deleted", { description: "Follow-up record removed successfully." });
      setDeleteItem(null);
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to delete follow-up.",
      });
    }
  };

  const handleExport = () => {
    if (filteredItems.length === 0) {
      toast("No Data", { description: "No follow-up records to export." });
      return;
    }
    const header = ["Follow-up Date", "Business", "Contact", "Phone", "Address", "Agent", "Status"];
    const lines = filteredItems.map((item) =>
      [
        formatFollowUpDate(item.due_at, "yyyy-MM-dd HH:mm"),
        item.business_name,
        item.contact_name,
        item.phone,
        item.address,
        item.agent_name,
        followUpStageFor(item.status, stages)?.name || item.status,
      ]
        .map(toCsvCell)
        .join(","),
    );
    const csv = [header.map(toCsvCell).join(","), ...lines].join("\n");
    const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "follow_up_records.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Export Successful", { description: "Follow-up records have been downloaded." });
  };

  const noteFromStage = noteTarget ? followUpStageFor(noteTarget.item.status, stages) : undefined;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                searchField === "phone"
                  ? "Search by phone..."
                  : searchField === "name"
                    ? "Search by name..."
                    : "Search records..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border/50 h-10 rounded-xl w-full"
            />
          </div>
          <Select value={searchField} onValueChange={(v) => setSearchField(v as SearchField)}>
            <SelectTrigger className="w-full sm:w-32 h-10 rounded-xl bg-card border-border/50 text-xs font-medium cursor-pointer">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker3
            initialRange={selectedDateRange}
            onDateRangeChange={(range) => setSelectedDateRange(range)}
            align="start"
            className="bg-card border-border/50 rounded-xl h-10"
          />
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsManageOpen(true)}
              className="h-10 px-4 rounded-xl border-dashed border-2 bg-card gap-2 hover:border-[#67B239] hover:text-[#55962e] cursor-pointer"
            >
              <Settings2 className="h-4 w-4" />
              Columns
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isLoading}
              className="h-10 px-4 rounded-xl bg-card border-border/50 gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              Export
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex space-x-4 h-full min-w-max">
          {stages.map((stage) => (
            <FollowUpColumn
              key={stage.id}
              stage={stage}
              items={itemsByStage[stage.id] || []}
              isLoading={isLoading}
              isAdmin={isAdmin}
              draggingItemId={draggingItem?.id || null}
              onDrop={handleDrop}
              onCardDragStart={setDraggingItem}
              onCardDragEnd={() => setDraggingItem(null)}
              onAddUpdate={(item) =>
                setNoteTarget({
                  item,
                  status: followUpStageFor(item.status, stages)?.name || item.status,
                })
              }
              onViewTimeline={setTimelineItem}
              onDelete={setDeleteItem}
            />
          ))}
        </div>
      </div>

      {noteTarget && (
        <FollowUpNoteDialog
          key={`${noteTarget.item.id}-${noteTarget.status}`}
          businessName={noteTarget.item.business_name || noteTarget.item.contact_name}
          fromStatus={noteFromStage?.name || noteTarget.item.status}
          toStatus={noteTarget.status}
          isSaving={updateMutation.isPending}
          onCancel={() => setNoteTarget(null)}
          onConfirm={handleConfirmNote}
        />
      )}

      <FollowUpTimelineDialog item={timelineItem} onClose={() => setTimelineItem(null)} />

      {isAdmin && isManageOpen && (
        <ManageFollowUpStagesDialog
          open={isManageOpen}
          onOpenChange={setIsManageOpen}
          stages={stages}
          itemIdsByStage={itemIdsByStage}
          userId={user?.id}
        />
      )}

      <Dialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && !removeMutation.isPending && setDeleteItem(null)}
      >
        <DialogContent className="w-full max-w-lg bg-[#EEEFF2] dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-800 rounded-2xl p-6 shadow-lg gap-4 text-slate-900 dark:text-slate-100">
          <DialogHeader className="flex flex-col space-y-2 text-left sm:text-left">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2 text-[#0f1729] dark:text-slate-100">
              <TriangleAlert className="h-6 w-6 text-[#dc2626] shrink-0 stroke-2" />
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#94a3b8] dark:text-slate-400 text-left mt-2 leading-5">
              This will remove the follow-up for &quot;
              <span className="font-semibold text-[#94a3b8] dark:text-slate-300">
                {deleteItem?.business_name || deleteItem?.contact_name}
              </span>
              &quot; from this board. The prospect and its stage history are kept.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteItem(null)}
              disabled={removeMutation.isPending}
              className="h-10 px-4 py-2 bg-[#EEEFF2] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700 text-[#0f1729] dark:text-slate-200 hover:bg-[#E1E7EF]/80 dark:hover:bg-slate-700 rounded-[10px] text-sm font-medium shadow-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={removeMutation.isPending}
              className="h-10 px-4 py-2 bg-[#dc2626] hover:bg-[#dc2626]/90 text-[#fafafa] rounded-[10px] text-sm font-medium shadow-none cursor-pointer border-0"
            >
              {removeMutation.isPending ? "Deleting..." : "Yes, delete follow-up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const ITEMS_PER_PAGE = 20;

/** Clone of ERPAPP `FollowUpKanbanColumn.tsx`, using native HTML5 drag-and-drop. */
function FollowUpColumn({
  stage,
  items,
  isLoading,
  isAdmin,
  draggingItemId,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
  onAddUpdate,
  onViewTimeline,
  onDelete,
}: {
  stage: FollowUpStage;
  items: FollowUpBoardItem[];
  isLoading: boolean;
  isAdmin: boolean;
  draggingItemId: string | null;
  onDrop: (itemId: string, stage: FollowUpStage) => void;
  onCardDragStart: (item: FollowUpBoardItem) => void;
  onCardDragEnd: () => void;
  onAddUpdate: (item: FollowUpBoardItem) => void;
  onViewTimeline: (item: FollowUpBoardItem) => void;
  onDelete: (item: FollowUpBoardItem) => void;
}) {
  const [isOver, setIsOver] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const Icon = stageIcon(stage.name);
  const textColor = getContrastTextColor(stage.color);

  return (
    <div
      onDragOver={(e) => {
        if (!draggingItemId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!isOver) setIsOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        const itemId = e.dataTransfer.getData("text/plain") || draggingItemId;
        if (itemId) onDrop(itemId, stage);
      }}
      className={cn(
        "w-72 sm:w-75 shrink-0 flex flex-col bg-muted/30 rounded-lg overflow-hidden transition-all duration-200 ease-in-out h-full border",
        isOver
          ? "border-[#67B239] ring-2 ring-[#67B239] shadow-xl scale-[1.01]"
          : "border-border/30 shadow-xs",
      )}
    >
      <div
        className="px-3 py-2.5 flex items-center justify-between shrink-0"
        style={{ backgroundColor: stage.color, color: textColor }}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/20">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-sm tracking-wide">{stage.name}</h2>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 bg-black/20 rounded-full border border-white/10">
          {isLoading ? <Skeleton className="h-3 w-3 inline-block" /> : items.length}
        </span>
      </div>
      <ScrollArea className="flex-1 min-h-0 w-full">
        <div className="p-3 min-h-full space-y-3 w-full">
          {isLoading && items.length === 0 ? (
            <>
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-48 opacity-50">
              <p className="text-xs font-semibold italic">No lead in this stage.</p>
            </div>
          ) : (
            items
              .slice(0, visibleCount)
              .map((item) => (
                <FollowUpCard
                  key={item.id}
                  followUp={item}
                  statusColor={stage.color}
                  isDragging={draggingItemId === item.id}
                  isAdmin={isAdmin}
                  onDragStart={onCardDragStart}
                  onDragEnd={onCardDragEnd}
                  onAddUpdate={onAddUpdate}
                  onViewTimeline={onViewTimeline}
                  onDelete={onDelete}
                />
              ))
          )}
          {visibleCount < items.length && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
              className="w-full text-xs cursor-pointer"
            >
              Load more ({items.length - visibleCount})
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/** ERPAPP `FollowUpStageChangeDialog` + `FollowUpUpdateDialog`: notes are required. */
function FollowUpNoteDialog({
  businessName,
  fromStatus,
  toStatus,
  isSaving,
  onCancel,
  onConfirm,
}: {
  businessName: string;
  fromStatus: string;
  toStatus: string;
  isSaving: boolean;
  onCancel: () => void;
  onConfirm: (notes: string, nextDueAt: string) => void;
}) {
  const [notes, setNotes] = useState("");
  // Optional; "yyyy-MM-ddTHH:mm" once a date is picked, empty keeps the current follow-up date
  const [nextDueAt, setNextDueAt] = useState("");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const scheduleDate = nextDueAt ? new Date(nextDueAt) : undefined;
  const scheduleTime = nextDueAt.slice(11, 16) || "10:00";
  const isStageChange = fromStatus !== toStatus;

  return (
    <Dialog open onOpenChange={(open) => !open && !isSaving && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isStageChange ? "Reason for Stage Change" : "Add Activity Update"}
          </DialogTitle>
          <DialogDescription>
            {isStageChange ? (
              <>
                Please provide any updates or notes for{" "}
                <span className="font-semibold text-foreground">{businessName}</span> as it moves to{" "}
                <span className="font-semibold text-[#55962e]">{toStatus}</span>.
              </>
            ) : (
              <>
                Recording a new update for{" "}
                <span className="font-semibold text-foreground">{businessName}</span>. This will be
                added to the <span className="font-semibold text-[#55962e]">{toStatus}</span>{" "}
                timeline.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {isStageChange && (
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 text-sm">
              <span className="text-muted-foreground">{fromStatus}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
              <span className="font-bold text-[#55962e]">{toStatus}</span>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="follow-up-next-date" className="text-sm font-medium">
              Next Follow-up Schedule{" "}
              <span className="font-normal text-muted-foreground">(Optional)</span>
            </Label>
            <div className="flex gap-2">
              <Popover open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="follow-up-next-date"
                    variant="outline"
                    className="h-10 flex-1 justify-start text-left font-normal rounded-xl cursor-pointer"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleDate ? format(scheduleDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    defaultMonth={scheduleDate ?? new Date()}
                    onSelect={(date) => {
                      // Clicking the selected day again clears it (the field is optional)
                      setNextDueAt(date ? `${format(date, "yyyy-MM-dd")}T${scheduleTime}` : "");
                      setIsScheduleOpen(false);
                    }}
                    disabled={{ before: new Date() }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                aria-label="Follow-up time"
                value={scheduleDate ? scheduleTime : ""}
                disabled={!scheduleDate}
                onChange={(e) =>
                  scheduleDate &&
                  e.target.value &&
                  setNextDueAt(`${format(scheduleDate, "yyyy-MM-dd")}T${e.target.value}`)
                }
                className="h-10 w-32 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="follow-up-notes" className="text-sm font-medium">
              Activity Notes <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="follow-up-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Please describe the outcome of this follow-up..."
              className="resize-none min-h-30 rounded-xl p-4 text-sm"
              autoFocus
              required
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(notes, nextDueAt)}
            disabled={isSaving || !notes.trim()}
            className="bg-[#67B239] hover:bg-[#5aa030] text-white cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isStageChange ? (
              "Confirm Stage Change"
            ) : (
              "Save Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** ERPAPP card "Activity Timeline": the follow-up's stage-history notes, newest first. */
function FollowUpTimelineDialog({
  item,
  onClose,
}: {
  item: FollowUpBoardItem | null;
  onClose: () => void;
}) {
  const notes = useMemo(
    () =>
      item
        ? parseNotesToItems(item.note, item.changed_at, item.creator_name, item.creator_avatar)
            .slice()
            .reverse()
        : [],
    [item],
  );

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 py-5 border-b border-border/50 bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-foreground/70">
            <span className="h-2 w-2 rounded-full bg-[#67B239] animate-pulse" />
            Activity Timeline
          </DialogTitle>
          <DialogDescription>
            {item?.business_name || item?.contact_name} — follow-up on{" "}
            {item ? formatFollowUpDate(item.due_at, "dd MMM yyyy, h:mm a") : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="h-112.5 w-full overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="p-8 relative">
            {notes.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground italic py-10">
                No activity recorded yet.
              </p>
            ) : (
              <>
                <div className="absolute left-9.25 top-8 bottom-8 w-px bg-border/60" />
                <div className="space-y-8">
                  {notes.map((log, idx) => (
                    <div key={log.id || idx} className="relative flex gap-5">
                      <div className="relative z-10 mt-1.5">
                        <div className="h-2.5 w-2.5 rounded-full border-2 border-background bg-[#67B239] shadow-[0_0_0_4px_rgba(103,178,57,0.15)]" />
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-foreground/90 truncate">
                            {log.createdByName || "System"}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 font-medium shrink-0">
                            {log.createdAt
                              ? formatFollowUpDate(log.createdAt, "h:mm a, MMM dd")
                              : ""}
                          </span>
                        </div>
                        <div className="bg-muted/40 rounded-2xl p-3 border border-border/30 shadow-xs">
                          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap wrap-anywhere">
                            {log.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-border/50 flex justify-center">
          <Button variant="outline" onClick={onClose} className="rounded-2xl px-8 cursor-pointer">
            Close Timeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
