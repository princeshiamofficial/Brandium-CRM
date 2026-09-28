"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface OrderDateFieldProps {
  id: string;
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled: boolean;
  /** date-fns pattern for the trigger label */
  displayFormat?: string;
}

/** ERPAPP date popover field (closes on select). */
export function OrderDateField({
  id,
  label,
  value,
  onChange,
  disabled,
  displayFormat = "PP",
}: OrderDateFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1 min-w-0">
      <Label htmlFor={id} className="text-xs sm:text-sm h-5 flex items-center truncate">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal min-w-0 text-xs sm:text-sm h-9 px-2.5",
              !value && "text-muted-foreground",
            )}
            disabled={disabled}
          >
            <CalendarDays className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{value ? format(value, displayFormat) : "Pick a date"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
            initialFocus
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface PriorityStarFieldProps {
  value: number;
  onChange: (value: number) => void;
}

/** ERPAPP 5-star priority input with half-star steps (click cycles half → full → off). */
export function PriorityStarField({ value, onChange }: PriorityStarFieldProps) {
  return (
    <div className="space-y-1 min-w-0">
      <Label className="flex items-center gap-1.5 h-5 cursor-pointer text-xs sm:text-sm truncate">
        <Star
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-all",
            value > 0 ? "fill-amber-500 text-amber-500 scale-110" : "text-muted-foreground",
          )}
        />
        <span className="truncate">Priority Star</span>
      </Label>
      <div className="flex items-center justify-between h-9 px-2 sm:px-3 border rounded-md bg-background">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starIndex) => {
            const isFull = value >= starIndex;
            const isHalf = !isFull && value >= starIndex - 0.5;
            return (
              <button
                key={starIndex}
                type="button"
                aria-label={`${starIndex} star`}
                onClick={() => {
                  if (value === starIndex) onChange(0);
                  else if (value === starIndex - 0.5) onChange(starIndex);
                  else onChange(starIndex - 0.5);
                }}
                className="relative cursor-pointer transition-transform hover:scale-110 active:scale-95 shrink-0 outline-none"
              >
                {isFull ? (
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                ) : isHalf ? (
                  <div className="relative">
                    <Star className="h-5 w-5 text-muted-foreground/30" />
                    <div className="absolute top-0 left-0 overflow-hidden w-1/2 h-full">
                      <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    </div>
                  </div>
                ) : (
                  <Star className="h-5 w-5 text-muted-foreground/30 hover:text-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
