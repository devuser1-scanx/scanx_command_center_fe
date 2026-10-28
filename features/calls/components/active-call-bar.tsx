// features/calls/components/active-call-bar.tsx

"use client";

import Link from "next/link";
import { Mic, MicOff, PhoneCall, PhoneOff } from "lucide-react";

import { formatClock } from "@/features/calls/components/calls-format";
import { useDialer, type DialerStatus } from "@/features/calls/providers/dialer-provider";
import { CALLS_ROUTES } from "@/lib/constants/routes";

const STATUS_LABEL: Partial<Record<DialerStatus, string>> = {
  starting: "Starting call…",
  calling: "Calling…",
  ringing: "Ringing…",
};

/**
 * Shown under the header on every page while a call is in progress, so the
 * person can see it and hang up wherever they are in Command Center.
 */
export function ActiveCallBar() {
  const dialer = useDialer();

  if (!dialer.active) {
    return null;
  }

  const connected = dialer.status === "connected";

  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#2d2d2d] px-3 py-2 text-white"
    >
      <Link
        href={CALLS_ROUTES.dialer}
        className="flex min-w-0 items-center gap-2 text-sm font-semibold hover:underline"
      >
        <PhoneCall className="size-4 shrink-0 text-[#e6c89a]" />
        <span className="truncate">{dialer.activeNumber}</span>
        <span className="font-normal text-[#d8d2c7]">
          {connected ? formatClock(dialer.seconds) : STATUS_LABEL[dialer.status]}
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {connected && (
          <button
            type="button"
            onClick={dialer.toggleMute}
            aria-pressed={dialer.muted}
            className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/20"
          >
            {dialer.muted ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
            {dialer.muted ? "Unmute" : "Mute"}
          </button>
        )}

        <button
          type="button"
          onClick={dialer.hangUp}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#c0392b] px-3 py-1.5 text-xs font-semibold transition hover:bg-[#a5301f]"
        >
          <PhoneOff className="size-3.5" />
          Hang up
        </button>
      </div>
    </div>
  );
}
