// features/calls/dialer-view.tsx

"use client";

import { useState } from "react";
import { Delete, Mic, MicOff, Phone, PhoneOff, X } from "lucide-react";

import { CallsPageHeader } from "@/features/calls/components/calls-page-header";
import { formatClock } from "@/features/calls/components/calls-format";
import { useDialer } from "@/features/calls/providers/dialer-provider";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

const STATUS_TEXT: Record<string, string> = {
  idle: "Idle",
  starting: "Starting",
  calling: "Calling",
  ringing: "Ringing",
  connected: "Connected",
  ended: "Call ended",
  error: "Error",
};

const secondaryButton =
  "inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-[#dddddd] bg-white px-3 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-50";

export function DialerView() {
  const dialer = useDialer();
  const [number, setNumber] = useState("+1");
  const connected = dialer.status === "connected";

  function pressKey(key: string) {
    dialer.clearError();

    // Once connected the keypad sends tones to the other side's phone menu.
    if (connected) {
      dialer.sendDigit(key);
      return;
    }

    // Before that it dials digits; "*" and "#" are only for tones.
    if (/^\d$/.test(key)) {
      setNumber((current) => `${current}${key}`);
    }
  }

  function handleInput(value: string) {
    dialer.clearError();
    setNumber(value.replace(/[^\d+]/g, ""));
  }

  return (
    <div className="space-y-5">
      <CallsPageHeader
        title="Web dialer"
        subtitle="Dial patients or manual numbers from the browser."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">Dial pad</h3>

          <p className="text-sm text-[#777777]">
            {connected
              ? "Call connected. The keypad now sends tones."
              : "Type a number or use the keypad."}
          </p>

          <input
            value={number}
            onChange={(event) => handleInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !dialer.active) {
                void dialer.startCall(number);
              }
            }}
            placeholder="Enter phone number"
            aria-label="Phone number"
            inputMode="tel"
            disabled={dialer.active}
            className="mt-4 w-full rounded-xl border border-[#dddddd] bg-white px-4 py-3 text-center text-xl font-semibold text-[#2d2d2d] outline-none focus:border-[#8b6f47] disabled:bg-[#f5f1e8]"
          />

          <div className="mt-4 grid grid-cols-3 gap-2">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => pressKey(key)}
                // Digits edit the number until a call starts; "*" and "#" and
                // every key during set-up do nothing. Once connected, every key
                // sends a tone.
                disabled={!connected && (dialer.active || !/^\d$/.test(key))}
                title={connected ? `Send tone ${key}` : `Add ${key}`}
                className={cn(
                  "rounded-full border py-3 text-lg font-semibold transition disabled:opacity-40",
                  connected
                    ? "border-[#8b6f47] bg-[#f5f1e8] text-[#6f5636] hover:bg-[#ebe3d3]"
                    : "border-[#e4ddd0] bg-white text-[#2d2d2d] hover:border-[#8b6f47]",
                )}
              >
                {key}
              </button>
            ))}
          </div>

          {!connected && (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={dialer.active}
                onClick={() => setNumber((current) => current.slice(0, -1))}
                className={secondaryButton}
              >
                <Delete className="size-4" />
                Backspace
              </button>

              <button
                type="button"
                disabled={dialer.active}
                onClick={() => {
                  setNumber("");
                  dialer.clearError();
                }}
                className={secondaryButton}
              >
                <X className="size-4" />
                Clear
              </button>
            </div>
          )}

          {dialer.active ? (
            <button
              type="button"
              onClick={dialer.hangUp}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#c0392b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a5301f]"
            >
              <PhoneOff className="size-4" />
              Hang up
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void dialer.startCall(number)}
              disabled={!dialer.canDial}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#8b6f47] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6f5636] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Phone className="size-4" />
              Call
            </button>
          )}

          {dialer.error && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-[#f3c9c4] bg-[#fff7f6] p-3 text-sm text-[#c0392b]"
            >
              {dialer.error}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">Active call</h3>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-[#e4ddd0] p-4">
              <p className="text-xs text-[#777777]">Selected number</p>
              <p className="text-xl font-bold text-[#2d2d2d]">
                {dialer.activeNumber || number || "No number entered"}
              </p>
            </div>

            <div className="rounded-xl border border-[#e4ddd0] p-4">
              <p className="text-xs text-[#777777]">Call status</p>
              <p
                className={cn(
                  "text-xl font-bold",
                  dialer.status === "connected" && "text-[#16803c]",
                  dialer.status === "error" && "text-[#c0392b]",
                  (dialer.status === "idle" || dialer.status === "ended") &&
                    "text-[#9a9285]",
                )}
              >
                {STATUS_TEXT[dialer.status]}
                {connected && (
                  <span className="ml-2 text-base font-semibold text-[#555555]">
                    {formatClock(dialer.seconds)}
                  </span>
                )}
              </p>
            </div>

            <div className="rounded-xl border border-[#e4ddd0] p-4">
              <p className="text-xs text-[#777777]">Keypad mode</p>
              <p className="text-xl font-bold text-[#2d2d2d]">
                {connected ? "Tones (phone menus)" : "Number entry"}
              </p>

              {connected && dialer.lastDigit && (
                <p className="mt-1 text-xs text-[#777777]">
                  Last tone sent: <strong>{dialer.lastDigit}</strong>
                </p>
              )}
            </div>

            {connected && (
              <button
                type="button"
                onClick={dialer.toggleMute}
                aria-pressed={dialer.muted}
                className={secondaryButton}
              >
                {dialer.muted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                {dialer.muted ? "Unmute" : "Mute"}
              </button>
            )}
          </div>

          <p className="mt-4 text-xs text-[#777777]">
            Keypad tones work only after the call connects. Before that, the keypad
            edits the number. The call carries on if you open another page; use the
            bar at the top to hang up.
          </p>
        </section>
      </div>
    </div>
  );
}
