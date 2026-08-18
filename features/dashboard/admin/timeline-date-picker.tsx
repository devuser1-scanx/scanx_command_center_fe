// features/dashboard/admin/timeline-date-picker.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

import { cn } from "@/lib/utils";

type TimelineDatePickerProps = {
  /** ISO calendar date (yyyy-MM-dd). */
  value: string;
  onChange: (isoDate: string) => void;
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function TimelineDatePicker({
  value,
  onChange,
}: TimelineDatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedDate = parseISO(value);
  const [visibleMonth, setVisibleMonth] = useState(
    () => selectedDate,
  );

  useEffect(() => {
    if (open) {
      setVisibleMonth(selectedDate);
    }
    // Only re-sync the visible month when the popover opens, not on
    // every keystroke of month navigation inside it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, [open]);

  const gridStart = startOfWeek(startOfMonth(visibleMonth));
  const gridEnd = endOfWeek(endOfMonth(visibleMonth));
  const days = eachDayOfInterval({
    start: gridStart,
    end: gridEnd,
  });

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-md border border-[#e4ddd0] bg-[#fbfaf7] px-3 py-1.5 text-xs font-bold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] 3xl:px-4 3xl:py-2 3xl:text-sm"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {format(selectedDate, "EEE, MMM d, yyyy")}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-[#e4ddd0] bg-white p-3 shadow-lg 3xl:w-72">
          <div className="flex items-center justify-between pb-2">
            <button
              type="button"
              onClick={() =>
                setVisibleMonth((current) =>
                  subMonths(current, 1),
                )
              }
              className="inline-flex size-7 items-center justify-center rounded text-[#2d2d2d] hover:bg-[#fbfaf7]"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="text-sm font-bold text-[#2d2d2d]">
              {format(visibleMonth, "MMMM yyyy")}
            </span>

            <button
              type="button"
              onClick={() =>
                setVisibleMonth((current) =>
                  addMonths(current, 1),
                )
              }
              className="inline-flex size-7 items-center justify-center rounded text-[#2d2d2d] hover:bg-[#fbfaf7]"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 pb-1">
            {WEEKDAY_LABELS.map((label, index) => (
              <span
                key={index}
                className="flex h-6 items-center justify-center text-[10px] font-bold uppercase text-[#777777]"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const selected = isSameDay(day, selectedDate);
              const inCurrentMonth = isSameMonth(
                day,
                visibleMonth,
              );

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    onChange(format(day, "yyyy-MM-dd"));
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-8 items-center justify-center rounded-full text-xs font-semibold transition",
                    selected
                      ? "bg-[#8b6f47] text-white"
                      : "text-[#2d2d2d] hover:bg-[#fbfaf7]",
                    !selected &&
                      !inCurrentMonth &&
                      "text-[#c4bcae]",
                    !selected &&
                      isToday(day) &&
                      "ring-1 ring-inset ring-[#8b6f47]",
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(format(new Date(), "yyyy-MM-dd"));
              setOpen(false);
            }}
            className="mt-2 w-full rounded-md border border-[#e4ddd0] bg-[#fbfaf7] py-1.5 text-xs font-bold text-[#6f5636] hover:border-[#8b6f47] hover:text-[#8b6f47]"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}
