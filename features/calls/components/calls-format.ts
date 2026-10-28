// features/calls/components/calls-format.ts

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) {
    return "0s";
  }

  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);

  return minutes === 0 ? `${rest}s` : `${minutes}m ${rest}s`;
}

/** 83 -> "01:23", for a call timer. */
export function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
