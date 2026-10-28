// features/calls/components/call-status-pill.tsx

import { cn } from "@/lib/utils";

/** Twilio call statuses, grouped by how a person should read them. */
function toneOf(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-[#e6f7ed] text-[#16803c]";

    case "initiated":
    case "queued":
    case "ringing":
    case "in-progress":
    case "answered":
      return "bg-[#e8f0ff] text-[#2b5bd7]";

    case "no-answer":
    case "busy":
      return "bg-[#fff4e5] text-[#b45f06]";

    case "failed":
    case "canceled":
    case "cancelled":
      return "bg-[#fdeaea] text-[#c0392b]";

    default:
      return "bg-[#efeae0] text-[#6b6459]";
  }
}

export function CallStatusPill({ status }: { status: string | null }) {
  const label = status || "unknown";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        toneOf(label),
      )}
    >
      {label}
    </span>
  );
}
