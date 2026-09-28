"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type PredefinedRange =
  | "allTime"
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear";

type RangeSelection = PredefinedRange | "custom";

interface DateRangePicker3Props {
  initialRange?: DateRange | undefined;
  onDateRangeChange: (
    range: DateRange | undefined,
    displayLabel: string,
    predefinedValue: RangeSelection | null,
  ) => void;
  align?: "start" | "center" | "end";
  className?: string;
  /** Icon-only trigger below the `sm` breakpoint. */
  compactOnMobile?: boolean;
}

const PREDEFINED_RANGES_CONFIG: { label: string; value: PredefinedRange }[] = [
  { label: "All Time", value: "allTime" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7Days" },
  { label: "Last 30 Days", value: "last30Days" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "Last Year", value: "lastYear" },
];

export function getDateRangeForPredefined(value: PredefinedRange): DateRange | undefined {
  const now = new Date();
  switch (value) {
    case "allTime":
      return undefined;
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const yesterday = subDays(now, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    }
    case "last7Days":
      return { from: subDays(now, 6), to: now };
    case "last30Days":
      return { from: subDays(now, 29), to: now };
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth": {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case "thisYear":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "lastYear": {
      const lastYear = subYears(now, 1);
      return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
    }
  }
}

const getDisplayLabel = (range: DateRange | undefined, selection: RangeSelection | null) => {
  if (selection === "custom") {
    if (!range?.from) return "Custom Range";
    if (!range.to) return `${format(range.from, "MMM d")} - Select end date`;
    if (isSameDay(range.from, range.to)) return format(range.from, "MMM d, yyyy");
    if (range.from.getFullYear() !== range.to.getFullYear()) {
      return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`;
    }
    return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`;
  }
  return PREDEFINED_RANGES_CONFIG.find((r) => r.value === selection)?.label || "All Time";
};

/** Detects which preset (if any) an initial range corresponds to. */
const matchPredefined = (range: DateRange | undefined): RangeSelection => {
  if (!range?.from && !range?.to) return "allTime";
  for (const { value } of PREDEFINED_RANGES_CONFIG) {
    const dates = getDateRangeForPredefined(value);
    if (
      dates?.from &&
      dates.to &&
      range.from &&
      range.to &&
      isSameDay(dates.from, range.from) &&
      isSameDay(dates.to, range.to)
    ) {
      return value;
    }
  }
  return "custom";
};

/** Clone of ERPAPP `date-range-picker3.tsx`: preset ranges plus a custom two-month calendar. */
export function DateRangePicker3({
  initialRange,
  onDateRangeChange,
  align = "end",
  className,
  compactOnMobile = false,
}: DateRangePicker3Props) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(initialRange);
  const [selectedPredefined, setSelectedPredefined] = useState<RangeSelection | null>(() =>
    matchPredefined(initialRange),
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomPopoverOpen, setIsCustomPopoverOpen] = useState(false);

  const triggerLabel = useMemo(
    () => getDisplayLabel(selectedRange, selectedPredefined),
    [selectedRange, selectedPredefined],
  );

  const handlePredefinedSelect = (value: PredefinedRange) => {
    const newRange = getDateRangeForPredefined(value);
    setSelectedPredefined(value);
    setSelectedRange(newRange);
    onDateRangeChange(newRange, getDisplayLabel(newRange, value), value);
    setIsCustomPopoverOpen(false);
    setIsDropdownOpen(false);
  };

  const handleApplyCustomRange = () => {
    setIsCustomPopoverOpen(false);
    setIsDropdownOpen(false);
    let finalRange = selectedRange;
    if (selectedRange?.from && !selectedRange.to) {
      finalRange = { from: selectedRange.from, to: selectedRange.from };
      setSelectedRange(finalRange);
    }
    onDateRangeChange(finalRange, getDisplayLabel(finalRange, "custom"), "custom");
  };

  const activeItemClass = "bg-[#67B239]/15 text-[#3f7a1f] dark:text-[#7ac142]";

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal sm:w-auto h-9 sm:h-10 min-w-0 max-w-full overflow-hidden cursor-pointer",
            compactOnMobile &&
              "w-10 sm:w-auto p-0 sm:px-4 justify-center sm:justify-start shrink-0",
            className,
          )}
          title={triggerLabel}
        >
          <CalendarDays className={cn("h-4 w-4 shrink-0", compactOnMobile ? "sm:mr-2" : "mr-2")} />
          <span className={cn("truncate flex-1 min-w-0", compactOnMobile && "hidden sm:inline")}>
            {triggerLabel}
          </span>
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 opacity-70 shrink-0",
              compactOnMobile && "hidden sm:inline",
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PREDEFINED_RANGES_CONFIG.map((range) => (
          <DropdownMenuItem
            key={range.value}
            onSelect={() => handlePredefinedSelect(range.value)}
            className={cn("cursor-pointer", selectedPredefined === range.value && activeItemClass)}
          >
            {range.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuSub open={isCustomPopoverOpen} onOpenChange={setIsCustomPopoverOpen}>
          <DropdownMenuSubTrigger
            className={cn("cursor-pointer", selectedPredefined === "custom" && activeItemClass)}
          >
            Custom Range
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-auto p-0" sideOffset={8}>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selectedRange?.from || new Date()}
              selected={selectedRange}
              onSelect={(range) => {
                setSelectedRange(range);
                if (range?.from) setSelectedPredefined("custom");
              }}
              numberOfMonths={2}
            />
            <div className="p-3 border-t border-border flex justify-end">
              <Button
                size="sm"
                onClick={handleApplyCustomRange}
                className="bg-[#67B239] hover:bg-[#5aa030] text-white cursor-pointer"
              >
                Apply
              </Button>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
