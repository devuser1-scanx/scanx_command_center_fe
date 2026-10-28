// features/calls/components/call-row.tsx

"use client";

import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react";

import { CallStatusPill } from "@/features/calls/components/call-status-pill";
import { formatDateTime } from "@/features/calls/components/calls-format";
import { isDialable, useDialer } from "@/features/calls/providers/dialer-provider";
import type { CallLog } from "@/features/calls/types/calls-types";
import { cn } from "@/lib/utils";

type CallRowProps = {
  call: CallLog;
  /** Shows the missed styling and a Call back button. */
  missed?: boolean;
};

export function CallRow({ call, missed = false }: CallRowProps) {
  const dialer = useDialer();
  const direction = (call.direction || "").toLowerCase();
  const Icon = missed
    ? PhoneMissed
    : direction === "inbound"
      ? PhoneIncoming
      : PhoneOutgoing;

  const number = call.patient_number ?? "";
  const canCallBack = missed && dialer.canDial && !dialer.active && isDialable(number);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border p-3",
        missed ? "border-[#f3c9c4] bg-[#fff7f6]" : "border-[#e4ddd0] bg-white",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            missed ? "bg-[#fdeaea] text-[#c0392b]" : "bg-[#efeae0] text-[#6f5636]",
          )}
        >
          <Icon className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#2d2d2d]">
            {call.display_name || "Unknown caller"}
          </p>

          <p className="truncate text-xs text-[#555555]">
            {call.patient_number || "No phone"}
          </p>

          <p className="truncate text-xs text-[#777777]">
            {direction || "unknown"} · {formatDateTime(call.created_at)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <CallStatusPill status={call.status} />

        {canCallBack && (
          <button
            type="button"
            onClick={() =>
              void dialer.startCall(number, call.appointment_id ?? undefined)
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-[#8b6f47] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6f5636]"
          >
            <Phone className="size-3.5" />
            Call back
          </button>
        )}
      </div>
    </div>
  );
}
