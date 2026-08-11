// features/dashboard/admin/timeline-by-appointment.tsx

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

import type { Clinic } from "@/features/dashboard/admin/api/dashboard-api";
import { ClinicTimelineRow } from "@/features/dashboard/admin/clinic-timeline-row";

export type {
  TimelineAppointment,
  AppointmentLayout,
} from "@/features/dashboard/admin/timeline-utils";
export {
  computeAppointmentLayout,
  getStatusClasses,
  parseTimeToMinutes,
} from "@/features/dashboard/admin/timeline-utils";

type TimelineByAppointmentProps = {
  clinics: Clinic[];
  date: string;
};

const MIN_HOUR = 0;
const MAX_HOUR = 24;
const DEFAULT_START_HOUR = 7;
const DEFAULT_END_HOUR = 18;
const DEFAULT_HOUR_SPAN = DEFAULT_END_HOUR - DEFAULT_START_HOUR;
const GUTTER_WIDTH_BASE = 180;
const HOUR_AXIS_HEIGHT_BASE = 44;
/** Used only before the container's real width has been measured. */
const FALLBACK_PX_PER_HOUR = 200;
const ZOOM_DEFAULT = 1;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.2;
/** Never let zoom-out density fall below this - past it hour labels overlap and become illegible. */
const MIN_READABLE_PX_PER_HOUR = 44;
/** Safety floor so zoomMin never computes to something absurd on a huge screen. */
const ABSOLUTE_ZOOM_MIN_FLOOR = 0.08;
/** Matches the backend's own fallback (app/services/dashboard.py). */
const FALLBACK_TIME_ZONE = "America/Chicago";
/** Fallback row height used only before a clinic has reported its real one. */
const FALLBACK_ROW_HEIGHT_PX = 96;

/**
 * The minimum usable zoom depends on how much width is actually available -
 * on a laptop, zooming out to see the full 24h day can cram hour labels
 * into unreadable slivers; on a 75" wall display there's room to spare.
 * Solved so that pxPerHour at zoomMin never drops below
 * MIN_READABLE_PX_PER_HOUR, since pxPerHour = (availableContentWidth /
 * DEFAULT_HOUR_SPAN) * zoom regardless of how wide the visible hour range
 * currently is.
 */
function getZoomMin(availableContentWidth: number): number {
  const solved =
    (MIN_READABLE_PX_PER_HOUR * DEFAULT_HOUR_SPAN) /
    availableContentWidth;

  return Math.min(
    ZOOM_DEFAULT,
    Math.max(ABSOLUTE_ZOOM_MIN_FLOOR, solved),
  );
}

/**
 * Scales the grid's fixed-pixel dimensions (row height, gutter width, hour
 * axis height, card text) up on very large displays - a 96px-tall card row
 * that reads fine on a laptop is a thin, hard-to-read sliver on a
 * wall-mounted 75" 4K panel. Tied to the same measured container width
 * used for the horizontal fill-to-width layout below.
 */
function getScaleForContainerWidth(width: number): number {
  if (width >= 3200) {
    return 1.5;
  }

  if (width >= 2400) {
    return 1.3;
  }

  if (width >= 1800) {
    return 1.15;
  }

  return 1;
}

/**
 * The grid's time axis represents each appointment's own clinic-local
 * time (the backend converts appointment_datetime into clinic.timezone
 * before sending it), not the visitor's browser timezone. The "now" line
 * has to be computed the same way, or it drifts out of alignment with the
 * cards whenever the browser isn't in the clinics' timezone.
 */
function getMinutesSinceMidnightInTimeZone(
  date: Date,
  timeZone: string,
): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(
    parts.find((part) => part.type === "hour")?.value ?? "0",
  );
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );

  return hour * 60 + minute;
}

function formatTimeInTimeZone(
  date: Date,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatDateInTimeZone(
  date: Date,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * At zoom >= 1 (default and zoomed in), the visible range stays pinned
 * to the default business-hours window (7 AM – 6 PM). Zooming out below
 * 1x gradually widens that window until, at zoomMin, the full 0–24
 * range is visible.
 */
function getVisibleHourRange(
  zoom: number,
  zoomMin: number,
): {
  start: number;
  end: number;
} {
  if (zoom >= ZOOM_DEFAULT) {
    return { start: DEFAULT_START_HOUR, end: DEFAULT_END_HOUR };
  }

  const expandAmount =
    (ZOOM_DEFAULT - zoom) / (ZOOM_DEFAULT - zoomMin);

  return {
    start: DEFAULT_START_HOUR * (1 - expandAmount),
    end:
      DEFAULT_END_HOUR +
      (MAX_HOUR - DEFAULT_END_HOUR) * expandAmount,
  };
}

function formatHour(hour: number): string {
  const normalized = ((hour % 24) + 24) % 24;

  if (normalized === 0) {
    return "12 AM";
  }

  if (normalized === 12) {
    return "12 PM";
  }

  if (normalized > 12) {
    return `${normalized - 12} PM`;
  }

  return `${normalized} AM`;
}

export function TimelineByAppointment({
  clinics,
  date,
}: TimelineByAppointmentProps) {
  const scrollRef =
    useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [now, setNow] = useState(() => new Date());
  const [containerWidth, setContainerWidth] = useState(0);
  const [rowHeights, setRowHeights] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Each ClinicTimelineRow computes its own required height (based on how
   * many overlapping appointments it needs to stack), which this parent
   * has no other way to know without duplicating that clinic's data fetch.
   * Rows report it back here so, with only a couple of clinics, they can
   * flex-grow to fill the section's height instead of leaving a big empty
   * gap - while a row with many overlaps is never compressed below what it
   * actually needs.
   */
  const handleRowHeightChange = useCallback(
    (clinicId: number, height: number) => {
      setRowHeights((current) => {
        if (current[clinicId] === height) {
          return current;
        }

        return { ...current, [clinicId]: height };
      });
    },
    [],
  );

  /**
   * Measures the scroll container's real width so the grid can fill
   * whatever screen it's on - from a laptop to a 75" wall display -
   * instead of rendering at a fixed pixel size and leaving the rest of a
   * large screen empty.
   */
  useEffect(() => {
    const element = scrollRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const scale = getScaleForContainerWidth(containerWidth);
  const gutterWidth = Math.round(GUTTER_WIDTH_BASE * scale);
  const hourAxisHeight = Math.round(
    HOUR_AXIS_HEIGHT_BASE * scale,
  );

  /**
   * At zoom = 1 (the default), the grid fills exactly the width available
   * after the gutter - no horizontal scroll needed on any screen size.
   * Zooming in goes beyond that fit (more detail, scrolls); zooming out
   * widens the visible range toward the full day while shrinking density,
   * so the whole day stays comfortably within the container rather than
   * overflowing it.
   */
  const availableContentWidth =
    containerWidth > 0
      ? Math.max(200, containerWidth - gutterWidth)
      : DEFAULT_HOUR_SPAN * FALLBACK_PX_PER_HOUR;

  const zoomMin = getZoomMin(availableContentWidth);
  const clampedZoom = Math.min(
    ZOOM_MAX,
    Math.max(zoomMin, zoom),
  );

  const { start: visibleStart, end: visibleEnd } = useMemo(
    () => getVisibleHourRange(clampedZoom, zoomMin),
    [clampedZoom, zoomMin],
  );

  const pxPerHour =
    (availableContentWidth / DEFAULT_HOUR_SPAN) * clampedZoom;
  const contentWidth = (visibleEnd - visibleStart) * pxPerHour;

  const hourMarkers = useMemo(() => {
    const firstHour = Math.ceil(visibleStart);
    const lastHour = Math.floor(visibleEnd);

    return Array.from(
      { length: lastHour - firstHour + 1 },
      (_, index) => firstHour + index,
    );
  }, [visibleStart, visibleEnd]);

  /**
   * The grid's time axis is clinic-local time, not the visitor's browser
   * timezone, so the "now" line has to be computed in the same zone the
   * cards are positioned in. All clinics currently share one timezone;
   * this takes the first one that has it set.
   */
  const clinicTimeZone =
    clinics.find((clinic) => clinic.timezone)?.timezone ??
    FALLBACK_TIME_ZONE;

  const nowMinutes = getMinutesSinceMidnightInTimeZone(
    now,
    clinicTimeZone,
  );
  const showNowLine =
    nowMinutes >= visibleStart * 60 &&
    nowMinutes <= visibleEnd * 60;
  const nowLeftPx =
    ((nowMinutes - visibleStart * 60) / 60) * pxPerHour;

  function zoomIn() {
    setZoom((current) =>
      Math.min(current + ZOOM_STEP, ZOOM_MAX),
    );
  }

  function zoomOut() {
    setZoom((current) =>
      Math.max(current - ZOOM_STEP, zoomMin),
    );
  }

  function resetZoom() {
    setZoom(ZOOM_DEFAULT);

    scrollRef.current?.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  }

  function scrollTimeline(
    direction: "left" | "right",
  ) {
    scrollRef.current?.scrollBy({
      left:
        direction === "left"
          ? -320
          : 320,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    /**
     * React registers onWheel as a passive listener, so calling
     * preventDefault() from a JSX handler can't stop the browser's own
     * Ctrl/Cmd+scroll page-zoom. Attaching a native, non-passive
     * listener here is the only way to actually intercept it.
     */
    function handleNativeWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();

      setZoom((current) => {
        const next =
          event.deltaY < 0
            ? current + ZOOM_STEP
            : current - ZOOM_STEP;

        return Math.min(
          ZOOM_MAX,
          Math.max(zoomMin, next),
        );
      });
    }

    scrollElement.addEventListener(
      "wheel",
      handleNativeWheel,
      { passive: false },
    );

    return () =>
      scrollElement.removeEventListener(
        "wheel",
        handleNativeWheel,
      );
  }, [zoomMin]);

  return (
    <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm 4xl:p-8">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-start 4xl:mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#2d2d2d] 3xl:text-2xl 5xl:text-3xl">
            Timeline by appointment
          </h3>

          <p className="mt-1 text-sm text-[#777777] 3xl:text-base 5xl:text-lg">
            All clinics, 7 AM to 6 PM by default — scroll or zoom out to see the full day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 3xl:gap-3">
          <button
            type="button"
            onClick={() => scrollTimeline("left")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e4ddd0] bg-[#fbfaf7] text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] 3xl:h-11 3xl:w-11"
            aria-label="Scroll timeline left"
          >
            <ChevronLeft className="size-4 3xl:size-5" />
          </button>

          <button
            type="button"
            onClick={() => scrollTimeline("right")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e4ddd0] bg-[#fbfaf7] text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] 3xl:h-11 3xl:w-11"
            aria-label="Scroll timeline right"
          >
            <ChevronRight className="size-4 3xl:size-5" />
          </button>

          <span className="rounded-full bg-[#fff2df] px-3 py-1.5 text-xs font-bold text-[#b45309] 3xl:px-4 3xl:py-2 3xl:text-sm 5xl:text-base">
            Now {formatTimeInTimeZone(now, clinicTimeZone)}
          </span>

          <div className="flex rounded-md border border-[#e4ddd0] bg-[#fbfaf7] p-1">
            <button
              type="button"
              onClick={zoomOut}
              disabled={clampedZoom <= zoomMin}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-[#2d2d2d] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 3xl:h-9 3xl:w-9"
              aria-label="Zoom timeline out"
            >
              <Minus className="size-4 3xl:size-5" />
            </button>

            <button
              type="button"
              onClick={resetZoom}
              className="inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-bold text-[#6f5636] hover:bg-white 3xl:h-9 3xl:text-sm"
              aria-label="Reset timeline zoom"
            >
              <RotateCcw className="size-3.5 3xl:size-4" />
              {Math.round(clampedZoom * 100)}%
            </button>

            <button
              type="button"
              onClick={zoomIn}
              disabled={clampedZoom >= ZOOM_MAX}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-[#2d2d2d] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 3xl:h-9 3xl:w-9"
              aria-label="Zoom timeline in"
            >
              <Plus className="size-4 3xl:size-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-[70vh] overflow-x-auto rounded-xl border border-[#e4ddd0] bg-[#fbfaf7]"
      >
        <div
          style={{ width: gutterWidth + contentWidth }}
        >
          <div className="flex border-b border-[#e4ddd0] bg-white">
            <div
              className="sticky left-0 z-40 flex shrink-0 items-center border-r border-[#e4ddd0] bg-white px-3"
              style={{
                width: gutterWidth,
                height: hourAxisHeight,
              }}
            >
              <span className="text-xs font-bold uppercase tracking-wide text-[#8b6f47] 3xl:text-sm 5xl:text-base">
                {formatDateInTimeZone(now, clinicTimeZone)}
              </span>
            </div>

            <div
              className="relative"
              style={{
                width: contentWidth,
                height: hourAxisHeight,
              }}
            >
              {hourMarkers.map((hour) => (
                <span
                  key={hour}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-bold text-[#777777] 3xl:text-sm 5xl:text-base"
                  style={{
                    left: (hour - visibleStart) * pxPerHour,
                  }}
                >
                  {formatHour(hour)}
                </span>
              ))}
            </div>
          </div>

          <div
            className="relative flex flex-col"
            style={{
              minHeight: `calc(70vh - ${hourAxisHeight}px)`,
            }}
          >
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className="flex border-b border-[#e4ddd0]"
                style={{
                  flex: "1 1 0%",
                  minHeight:
                    rowHeights[clinic.id] ??
                    FALLBACK_ROW_HEIGHT_PX * scale,
                }}
              >
                <div
                  className="sticky left-0 z-40 flex shrink-0 items-center border-r border-[#e4ddd0] bg-white px-3"
                  style={{ width: gutterWidth }}
                >
                  <span className="truncate text-sm font-bold text-[#2d2d2d] 3xl:text-base 5xl:text-lg">
                    {clinic.name}
                  </span>
                </div>

                <div
                  className="relative"
                  style={{ width: contentWidth }}
                >
                  <ClinicTimelineRow
                    clinic={clinic}
                    date={date}
                    visibleStart={visibleStart}
                    pxPerHour={pxPerHour}
                    scale={scale}
                    onRowHeightChange={handleRowHeightChange}
                  />
                </div>
              </div>
            ))}

            <div
              className="pointer-events-none absolute inset-0"
              style={{ left: gutterWidth }}
            >
              {hourMarkers.map((hour) => (
                <div
                  key={hour}
                  className="absolute top-0 bottom-0 border-l border-[#e4ddd0]"
                  style={{
                    left: (hour - visibleStart) * pxPerHour,
                  }}
                />
              ))}

              {showNowLine && (
                <div
                  className="absolute top-0 bottom-0 z-30"
                  style={{ left: nowLeftPx }}
                >
                  <span className="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-[#dc2626]" />
                  <span className="block h-full w-px bg-[#dc2626]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
