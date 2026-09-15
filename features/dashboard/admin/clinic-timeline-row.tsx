// features/dashboard/admin/clinic-timeline-row.tsx

"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";

import type { Clinic } from "@/features/dashboard/admin/api/dashboard-api";
import { useDashboardTimeline } from "@/features/dashboard/admin/hooks/use-dashboard-timeline";
import {
  CHECKED_IN_ACCENT_HEX,
  computeAppointmentLayout,
  formatTime12Hour,
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
        // The "Paid" status color already communicates payment on its own;
        // for every other paid appointment (Confirmed, Checked In, ...) show
        // the small dollar marker instead.
        const showPaidMarker =
          appointment.paid && appointment.status !== "Paid";

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
            href={`/patients/${encodeURIComponent(appointment.id)}`}
            className={cn(
              "absolute block overflow-hidden rounded-xl shadow-md transition hover:z-30 hover:-translate-y-0.5 hover:shadow-lg",
              classes.card,
            )}
            style={{
              left: leftPx + cardGapPx / 2,
              top: laneIndex * laneHeightPx + cardGapPx / 2,
              width: widthPx - cardGapPx,
              height: laneHeightPx - cardGapPx,
            }}
          >
            <div className="relative h-full min-w-0 overflow-hidden p-3 3xl:p-4">
              <div className="flex items-start justify-between gap-2">
                <h4
                  className={cn(
                    "truncate font-bold 3xl:text-base 5xl:text-lg",
                    classes.text,
                  )}
                >
                  {appointment.patient}
                </h4>

                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase 3xl:px-2.5 3xl:text-xs 5xl:text-sm",
                    classes.cardBadge,
                  )}
                >
                  {appointment.status}
                </span>
              </div>

              <p
                className={cn(
                  "mt-2 truncate text-xs 3xl:text-sm 5xl:text-base",
                  classes.mutedText,
                )}
              >
                <span className={cn("font-bold", classes.text)}>
                  Exam:
                </span>{" "}
                {appointment.exam}
              </p>

              <p
                className={cn(
                  "truncate text-xs 3xl:text-sm 5xl:text-base",
                  classes.mutedText,
                )}
              >
                <span className={cn("font-bold", classes.text)}>
                  Time:
                </span>{" "}
                {formatTime12Hour(appointment.time)}
              </p>

              {showPaidMarker && (
                <span
                  className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-extrabold shadow 3xl:h-6 3xl:w-6 3xl:text-sm"
                  style={{ color: CHECKED_IN_ACCENT_HEX }}
                  title="Paid"
                >
                  $
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
