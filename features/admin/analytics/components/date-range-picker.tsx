"use client";

import { format, isValid, parseISO } from "date-fns";
import { LucideCalendar, LucideX } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  from: string | null;
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
};

function toDate(s: string | null): Date | undefined {
  if (!s) return undefined;
  const d = parseISO(s);
  return isValid(d) ? d : undefined;
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const fromDate = toDate(from);
  const toDate_ = toDate(to);

  const selected: DateRange | undefined =
    fromDate ? { from: fromDate, to: toDate_ } : undefined;

  function handleSelect(range: DateRange | undefined) {
    if (!range) {
      onChange(null, null);
      return;
    }
    const f = range.from ? format(range.from, "yyyy-MM-dd") : null;
    const t = range.to ? format(range.to, "yyyy-MM-dd") : null;
    if (f && t) onChange(f, t);
  }

  const label =
    fromDate && toDate_
      ? `${format(fromDate, "MMM d, yyyy")} – ${format(toDate_, "MMM d, yyyy")}`
      : fromDate
        ? `${format(fromDate, "MMM d, yyyy")} – ...`
        : "Pick a date range";

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start gap-2 text-left font-normal",
              !fromDate && "text-muted-foreground",
            )}
          >
            <LucideCalendar className="size-4" />
            <span>{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
      {(fromDate || toDate_) && (
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => onChange(null, null)}
        >
          <LucideX className="size-4" />
        </Button>
      )}
    </div>
  );
}
