// features/dashboard/admin/clinic-timeline-row.tsx

"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";

import type { Clinic } from "@/features/dashboard/admin/api/dashboard-api";
import { useDashboardTimeline } from "@/features/dashboard/admin/hooks/use-dashboard-timeline";
import {
  computeAppointmentLayout,
  getStatusClasses,
  parseTimeToMinutes,
} from "@/features/dashboard/admin/timeline-utils";
import { cn } from "@/lib/utils";

const LANE_HEIGHT_PX_BASE = 96;
const MIN_CARD_WIDTH_PX_BASE = 190;
const CARD_GAP_PX_BASE = 8;

type ClinicTimelineRowProps = {
  clinic: Clinic;
  date: string;
  visibleStart: number;
  pxPerHour: number;
  /** Scales row height/card sizing up on large displays; see timeline-by-appointment.tsx. */
  scale: number;
  /**
   * The parent lays out all clinic rows in a flex column and wants them to
   * flex-grow to fill available space when there are only a couple - but it
   * has no way to know this row's real minimum height (which depends on
   * this clinic's own overlapping-appointment count) without this callback.
   */
  onRowHeightChange?: (clinicId: number, height: number) => void;
};

export function ClinicTimelineRow({
  clinic,
  date,
  visibleStart,
  pxPerHour,
  scale,
  onRowHeightChange,
}: ClinicTimelineRowProps) {
  const timelineQuery = useDashboardTimeline({
    clinicId: clinic.id,
    date,
  });

  const appointments = timelineQuery.data ?? [];

  const laneHeightPx = LANE_HEIGHT_PX_BASE * scale;
  const minCardWidthPx = MIN_CARD_WIDTH_PX_BASE * scale;
  const cardGapPx = CARD_GAP_PX_BASE * scale;

  const layout = useMemo(() => {
    const sorted = [...appointments].sort(
      (first, second) =>
        parseTimeToMinutes(first.time) -
        parseTimeToMinutes(second.time),
    );

    return computeAppointmentLayout(sorted);
  }, [appointments]);

  const laneCount = layout.reduce(
    (max, entry) => Math.max(max, entry.laneCount),
    1,
  );
  const rowHeight = laneCount * laneHeightPx;

  useEffect(() => {
    onRowHeightChange?.(clinic.id, rowHeight);
  }, [clinic.id, rowHeight, onRowHeightChange]);

  if (timelineQuery.isError) {
    return (
      <div
        className="flex h-full items-center px-3 text-xs font-semibold text-[#cc3333] 3xl:text-sm"
        style={{ minHeight: laneHeightPx }}
      >
        Unable to load {clinic.name}&apos;s appointments.
      </div>
    );
  }

  if (timelineQuery.isLoading) {
    return (
      <div
        className="flex h-full items-center px-3 text-xs text-[#777777] 3xl:text-sm"
        style={{ minHeight: laneHeightPx }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      className="relative h-full"
      style={{ minHeight: rowHeight }}
    >
      {layout.map(({ appointment, laneIndex }) => {
        const classes = getStatusClasses(appointment.tone);
        const isCheckedIn = appointment.status === "Checked In";

        const leftPx =
          ((parseTimeToMinutes(appointment.time) -
            visibleStart * 60) /
            60) *
          pxPerHour;

        const widthPx = Math.max(
          minCardWidthPx,
          (appointment.durationMinutes / 60) * pxPerHour,
        );

        return (
          <Link
            key={appointment.id}
            href={`/admin/patients/${encodeURIComponent(appointment.id)}`}
            className={cn(
              "absolute block overflow-hidden rounded-xl border shadow-md transition hover:z-30 hover:-translate-y-0.5 hover:shadow-lg",
              isCheckedIn
                ? "border-[#16a34a]/40 bg-[#e6f7ed]"
                : "border-[#d9d1c4] bg-white",
            )}
            style={{
              left: leftPx + cardGapPx / 2,
              top: laneIndex * laneHeightPx + cardGapPx / 2,
              width: widthPx - cardGapPx,
              height: laneHeightPx - cardGapPx,
            }}
          >
            <div className="flex h-full">
              <div
                className={cn("w-1.5 shrink-0 3xl:w-2", classes.bar)}
              />

              <div className="min-w-0 flex-1 overflow-hidden p-3 3xl:p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="truncate font-bold text-[#2d2d2d] 3xl:text-base 5xl:text-lg">
                    {appointment.patient}
                  </h4>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase 3xl:px-2.5 3xl:text-xs 5xl:text-sm",
                      classes.badge,
                    )}
                  >
                    {appointment.status}
                  </span>
                </div>

                <p className="mt-2 truncate text-xs text-[#777777] 3xl:text-sm 5xl:text-base">
                  <span className="font-bold text-[#2d2d2d]">
                    Exam:
                  </span>{" "}
                  {appointment.exam}
                </p>

                <p className="truncate text-xs text-[#777777] 3xl:text-sm 5xl:text-base">
                  <span className="font-bold text-[#2d2d2d]">
                    Time:
                  </span>{" "}
                  {appointment.time}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
