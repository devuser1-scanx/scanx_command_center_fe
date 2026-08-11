// features/dashboard/admin/timeline-utils.ts

export type TimelineAppointment = {
  id: string;
  patient: string;
  exam: string;
  time: string;
  status: string;
  tone: "orange" | "blue" | "green" | "red" | "purple";
  durationMinutes: number;
};

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

export function getStatusClasses(
  tone: TimelineAppointment["tone"],
) {
  switch (tone) {
    case "green":
      return {
        bar: "bg-[#16a34a]",
        badge: "bg-[#e6f7ed] text-[#16803c]",
      };

    case "red":
      return {
        bar: "bg-[#dc2626]",
        badge: "bg-[#ffeeee] text-[#cc3333]",
      };

    case "blue":
      return {
        bar: "bg-[#2563eb]",
        badge: "bg-[#eaf1ff] text-[#2563eb]",
      };

    case "purple":
      return {
        bar: "bg-[#7c3aed]",
        badge: "bg-[#f1eaff] text-[#7c3aed]",
      };

    case "orange":
    default:
      return {
        bar: "bg-[#d97706]",
        badge: "bg-[#fff2df] text-[#b45309]",
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
