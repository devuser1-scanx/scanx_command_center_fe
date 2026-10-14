// features/fax-portal/board/board-meta.ts

import { format, isToday, isTomorrow } from "date-fns";

import type {
  BoardCard,
  ReferralStatusCode,
} from "@/features/fax-portal/types/fax-portal-types";

export const COLUMN_META: Record<
  ReferralStatusCode,
  { color: string; subtitle?: string }
> = {
  review_required: {
    color: "#b7791f",
    subtitle: "Every new fax starts here",
  },
  ready_for_contact: { color: "#2f6fc0" },
  follow_up_due: { color: "#c0392b" },
  callback_requested: { color: "#6b4fc8" },
  fax_provider_name_pending: {
    color: "#8b6a3e",
    subtitle: "5 calls made",
  },
  didnt_respond: { color: "#7a808c", subtitle: "Case closed" },
  appointment_booked: { color: "#1e8a4c" },
  not_referral: { color: "#9aa0aa", subtitle: "Marked in Intake Review" },
  declined: { color: "#9aa0aa" },
  exception: { color: "#c0392b", subtitle: "Needs attention" },
};

export const MAX_CALL_ATTEMPTS = 5;

/** "4m", "5h", "3d" - how long ago something happened. */
export function formatAge(iso: string, now = Date.now()): string {
  const minutes = Math.max(
    0,
    Math.round((now - new Date(iso).getTime()) / 60_000),
  );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (minutes < 24 * 60) {
    return `${Math.round(minutes / 60)}h`;
  }

  return `${Math.round(minutes / (24 * 60))}d`;
}

/** "3:30 PM", "Tomorrow 10:00 AM" or "Oct 9, 3:30 PM". */
export function formatWhen(iso: string): string {
  const date = new Date(iso);
  const time = format(date, "h:mm a");

  if (isToday(date)) {
    return time;
  }

  if (isTomorrow(date)) {
    return `Tomorrow ${time}`;
  }

  return format(date, "MMM d, h:mm a");
}

export type ChipTone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "teal"
  | "grey";

export const CHIP_CLASSES: Record<ChipTone, string> = {
  blue: "bg-[#e3eefb] text-[#2f6fc0]",
  green: "bg-[#e2f4e9] text-[#1e8a4c]",
  amber: "bg-[#fcf1dc] text-[#b7791f]",
  red: "bg-[#fbe5e2] text-[#c0392b]",
  violet: "bg-[#eee9fb] text-[#6b4fc8]",
  teal: "bg-[#dff2f2] text-[#147d82]",
  grey: "bg-[#eef0f3] text-[#555b66]",
};

export type CardChip = { label: string; tone: ChipTone };

/** The small status chip on a card, derived from its state. */
export function getCardChip(
  card: BoardCard,
  now = Date.now(),
): CardChip | null {
  if (card.status === "review_required") {
    if (card.is_urgent) {
      return { label: "Urgent", tone: "red" };
    }

    return card.possible_duplicate
      ? { label: "Possible duplicate", tone: "violet" }
      : null;
  }

  if (card.status === "appointment_booked") {
    return card.booked_source === "nightly_check"
      ? { label: "Found by nightly check", tone: "teal" }
      : { label: "Booked", tone: "green" };
  }

  if (card.due_at) {
    const dueMs = new Date(card.due_at).getTime();

    if (dueMs <= now) {
      const overdue = now - dueMs;

      return overdue >= 60 * 60_000
        ? { label: `Overdue ${formatAge(card.due_at, now)}`, tone: "red" }
        : { label: "Due now", tone: "red" };
    }

    return card.status === "callback_requested"
      ? { label: formatWhen(card.due_at), tone: "violet" }
      : { label: `Due ${formatWhen(card.due_at)}`, tone: "amber" };
  }

  if (card.status === "ready_for_contact") {
    return { label: "Ready", tone: "blue" };
  }

  if (card.is_urgent) {
    return { label: "Urgent", tone: "red" };
  }

  return null;
}

/** Statuses where the 5 attempt dots are meaningful. */
export function showsAttempts(status: ReferralStatusCode): boolean {
  return status !== "review_required" && status !== "not_referral";
}
