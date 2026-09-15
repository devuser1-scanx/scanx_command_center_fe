// features/dashboard/admin/timeline-utils.ts

export type TimelineAppointment = {
  id: string;
  patient: string;
  exam: string;
  time: string;
  status: string;
  tone: "purple" | "green" | "pink" | "yellow" | "red" | "teal" | "blue";
  paid: boolean;
  durationMinutes: number;
};

/** Fixed accent color for the paid+checked-in dollar-sign marker (matches the "Checked In" status color). */
export const CHECKED_IN_ACCENT_HEX = "#04863B";

export type AppointmentLayout = {
  appointment: TimelineAppointment;
  laneIndex: number;
  laneCount: number;
};

export function parseTimeToMinutes(time: string): number {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  return hour * 60 + minute;
}

export function formatTime12Hour(time: string): string {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}:${minuteText.padStart(2, "0")} ${period}`;
}

/**
 * Per-status color styling.
 *  - `card`/`text`/`mutedText`/`cardBadge`: solid-fill timeline card (whole
 *    card is the status color, so text/badge are picked for contrast against
 *    it - dark colors get white text, the light "Completed"/"Confirmed"
 *    colors get dark text).
 *  - `badge`: the original light-tint/dark-text pill, for status labels
 *    shown on a plain white background elsewhere (patient search results,
 *    visit history) where a solid-color fill isn't appropriate.
 */
export function getStatusClasses(
  tone: TimelineAppointment["tone"],
) {
  switch (tone) {
    case "green": // Checked In
      return {
        card: "bg-[#04863B]",
        text: "text-white",
        mutedText: "text-white/80",
        cardBadge: "bg-white/20 text-white",
        badge: "bg-[#E1F0E7] text-[#04863B]",
      };

    case "pink": // Completed
      return {
        card: "bg-[#ED7087]",
        text: "text-[#2d2d2d]",
        mutedText: "text-[#2d2d2d]/70",
        cardBadge: "bg-black/10 text-[#2d2d2d]",
        badge: "bg-[#FDEEF1] text-[#B23955]",
      };

    case "yellow": // Confirmed
      return {
        card: "bg-[#FFE767]",
        text: "text-[#2d2d2d]",
        mutedText: "text-[#2d2d2d]/70",
        cardBadge: "bg-black/10 text-[#2d2d2d]",
        badge: "bg-[#FFFCED] text-[#8A6D00]",
      };

    case "red": // No Show
      return {
        card: "bg-[#C60D0D]",
        text: "text-white",
        mutedText: "text-white/80",
        cardBadge: "bg-white/20 text-white",
        badge: "bg-[#F8E2E2] text-[#C60D0D]",
      };

    case "teal": // Paid
      return {
        card: "bg-[#0D8A6A]",
        text: "text-white",
        mutedText: "text-white/80",
        cardBadge: "bg-white/20 text-white",
        badge: "bg-[#E2F1ED] text-[#0D8A6A]",
      };

    case "purple": // Cancelled
      return {
        card: "bg-[#8339B0]",
        text: "text-white",
        mutedText: "text-white/80",
        cardBadge: "bg-white/20 text-white",
        badge: "bg-[#F0E7F6] text-[#8339B0]",
      };

    case "blue": // Scheduled
    default:
      return {
        card: "bg-[#3B82C4]",
        text: "text-white",
        mutedText: "text-white/80",
        cardBadge: "bg-white/20 text-white",
        badge: "bg-[#E7F0F8] text-[#3B82C4]",
      };
  }
}

/**
 * Sweeps chronologically-sorted appointments into lanes so that any
 * appointments whose time ranges overlap are placed side by side instead
 * of stacking on top of each other. Appointments that don't overlap
 * anything still share the same cluster/lane-count math, so they just end
 * up with laneCount = 1 (full width/height, depending on which axis the
 * caller maps lanes onto).
 */
export function computeAppointmentLayout(
  sortedAppointments: TimelineAppointment[],
): AppointmentLayout[] {
  const result: AppointmentLayout[] = [];

  let columns: {
    endMinutes: number;
    entries: AppointmentLayout[];
  }[] = [];
  let clusterEntries: AppointmentLayout[] = [];
  let clusterEnd = -Infinity;

  function flushCluster() {
    if (clusterEntries.length === 0) {
      return;
    }

    const laneCount = columns.length;

    for (const entry of clusterEntries) {
      entry.laneCount = laneCount;
    }

    result.push(...clusterEntries);
    columns = [];
    clusterEntries = [];
  }

  for (const appointment of sortedAppointments) {
    const start = parseTimeToMinutes(appointment.time);
    const end = start + appointment.durationMinutes;

    if (start >= clusterEnd) {
      flushCluster();
      clusterEnd = -Infinity;
    }

    const availableColumn = columns.find(
      (column) => column.endMinutes <= start,
    );

    const entry: AppointmentLayout = {
      appointment,
      laneIndex: 0,
      laneCount: 1,
    };

    if (availableColumn) {
      availableColumn.endMinutes = end;
      availableColumn.entries.push(entry);
      entry.laneIndex = columns.indexOf(availableColumn);
    } else {
      entry.laneIndex = columns.length;
      columns.push({ endMinutes: end, entries: [entry] });
    }

    clusterEntries.push(entry);
    clusterEnd = Math.max(clusterEnd, end);
  }

  flushCluster();

  return result;
}
