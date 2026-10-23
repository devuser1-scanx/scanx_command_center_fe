// features/fax-portal/case/call-card.tsx

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, formatWhen } from "@/features/fax-portal/board/board-meta";
import { FaxBackDialog } from "@/features/fax-portal/case/fax-back-dialog";
import { DirectBookingDialog } from "@/features/fax-portal/case/direct-booking-dialog";
import {
  type BrowserCallState,
  BrowserCallError,
  useBrowserCall,
} from "@/features/fax-portal/hooks/use-browser-call";
import {
  useAbandonCall,
  useDialPatient,
  useDoNotCall,
  useRecordCallResult,
  useRefreshCase,
  useStartCall,
} from "@/features/fax-portal/hooks/use-case";
import { useMoveReferral } from "@/features/fax-portal/hooks/use-referral-actions";
import {
  CALL_LIMIT,
  type CallResultCode,
  type CallResultInput,
  type CaseDetail,
} from "@/features/fax-portal/types/fax-portal-types";
import { cn } from "@/lib/utils";

type CallCardProps = {
  detail: CaseDetail;
};

/**
 * "Book in Acuity with these details" opens the direct-booking dialog (pick an
 * open time, and Acuity books it). Off until that is rolled out.
 */
const DIRECT_BOOKING_ENABLED = false;

/** The small caption under each result button. */
const RESULT_HINT: Record<CallResultCode, string> = {
  booked: "closes case",
  no_answer: "counts",
  voicemail: "counts",
  busy: "counts",
  failed: "counts",
  callback_requested: "pick time",
  declined: "closes case",
  wrong_number: "to exception",
  other: "type a reason",
};

function formatPhone(e164: string | null, fallback: string | null): string {
  const digits = (e164 ?? "").replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return fallback ?? e164 ?? "No phone number";
}

/** What Twilio reports about the open call, in words. */
function liveCallText(detail: CaseDetail): string | null {
  if (detail.open_call_source !== "twilio") {
    return null;
  }

  switch (detail.open_call_status) {
    case null:
    case "starting":
    case "initiated":
      return "Starting the call…";
    case "ringing":
    case "in-progress":
      return "Calling the patient…";
    case "completed":
      return "Call ended";
    case "patient:completed":
    case "patient:answered":
      return "The patient answered";
    case "patient:no-answer":
      return "The patient did not answer";
    case "patient:busy":
      return "The patient's line was busy";
    case "patient:failed":
      return "The call to the patient failed";
    case "patient:canceled":
      return "The call ended before the patient answered";
    default:
      return null;
  }
}

/** What this browser's own call is doing, in words (more immediate than the
 *  server's view, which lags by a poll). */
function browserCallText(state: BrowserCallState, seconds: number): string | null {
  switch (state) {
    case "starting":
      return "Starting the call…";
    case "connecting":
      return "Connecting…";
    case "ringing":
      return "Calling the patient…";
    case "connected":
      return `Connected · ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    default:
      return null;
  }
}

/** Tomorrow at 10:00, in the browser's time, as a datetime-local value. */
function defaultCallback(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);

  return format(date, "yyyy-MM-dd'T'HH:mm");
}

function OutreachPlan({ detail, now }: { detail: CaseDetail; now: number }) {
  const qualifying = detail.calls
    .filter((call) => call.counts_toward_limit && call.result)
    .sort((a, b) => (a.attempt_number ?? 0) - (b.attempt_number ?? 0));

  const working = detail.can_call || detail.open_call_id !== null;
  const next = detail.outreach.next_action_at;

  return (
    <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Outreach plan">
      {Array.from({ length: CALL_LIMIT }, (_, index) => {
        const call = qualifying[index];
        const isNow = !call && index === qualifying.length && working;
        const isLast = index === CALL_LIMIT - 1;

        return (
          <li
            key={index}
            className={cn(
              "rounded-md border px-2 py-1.5 text-[11px]",
              call
                ? "border-[#f1c6c0] bg-[#fbe5e2]"
                : isNow
                  ? "border-[#ecd3a5] bg-[#fcf1dc]"
                  : "border-[#e6dfd3] bg-white",
            )}
          >
            <div className="text-xs font-bold text-[#1f2329]">
              {call
                ? `Call ${index + 1} · ${call.result_label}`
                : isNow
                  ? `Call ${index + 1} · ${next && new Date(next).getTime() > now ? "Next" : "Due now"}`
                  : `Call ${index + 1}${isLast ? " · last" : ""}`}
            </div>

            <div className="text-[#6b6f78]">
              {call
                ? formatWhen(call.started_at)
                : isNow && next
                  ? formatWhen(next)
                  : isLast
                    ? "If missed: Fax Provider Name Pending"
                    : ""}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function CallCard({ detail }: CallCardProps) {
  const startMutation = useStartCall(detail.id);
  const dialMutation = useDialPatient(detail.id);
  const abandonMutation = useAbandonCall(detail.id);
  const refresh = useRefreshCase(detail.id);
  const phone = useBrowserCall({
    onEnded: ({ callId, error }) => {
      if (error) {
        // Something went wrong (Twilio refused the connection...): say why, and
        // remove the call row if Twilio never picked it up, so it does not
        // count or block the next call.
        toast.error(error.message);
        abandonMutation.mutate(callId);
      } else {
        refresh();
      }
    },
  });
  const resultMutation = useRecordCallResult(detail.id);
  const doNotCall = useDoNotCall(detail.id);
  const move = useMoveReferral();

  const [now, setNow] = useState(() => Date.now());

  // Keeps "Next" / "Due now" correct between refreshes.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);

    return () => clearInterval(interval);
  }, []);

  const [showOther, setShowOther] = useState(false);
  const [otherReason, setOtherReason] = useState("");
  const [otherCounts, setOtherCounts] = useState(false);
  const [callbackFor, setCallbackFor] = useState(false);
  const [callbackAt, setCallbackAt] = useState(defaultCallback);
  const [directBookingFor, setDirectBookingFor] = useState(false);
  const [faxBackFor, setFaxBackFor] = useState(false);
  const [confirmDeclined, setConfirmDeclined] = useState(false);
  const [confirmDnc, setConfirmDnc] = useState(false);

  const inProgress = detail.open_call_id !== null;
  const canRecord = detail.can_call || inProgress;
  const busy =
    startMutation.isPending ||
    dialMutation.isPending ||
    resultMutation.isPending ||
    move.isPending;
  const qualifying = detail.outreach.qualifying_call_count;
  const liveText =
    browserCallText(phone.state, phone.seconds) ?? liveCallText(detail);
  const suggested =
    inProgress && !phone.active ? detail.suggested_result : null;

  const startedAt = detail.calls.find(
    (call) => call.id === detail.open_call_id,
  )?.started_at;

  /**
   * Records a result. If no call is waiting for one, the call is logged first
   * (a call made from the agent's own phone), so one click is enough.
   */
  async function submit(
    result: CallResultCode,
    extra: Omit<CallResultInput, "callId" | "result"> = {},
  ): Promise<boolean> {
    try {
      const callId =
        detail.open_call_id ?? (await startMutation.mutateAsync()).call_id;

      const response = await resultMutation.mutateAsync({
        callId,
        result,
        ...extra,
      });

      if (response.call_limit_reached && response.moved_to) {
        toast.warning(
          `That was call ${CALL_LIMIT} of ${CALL_LIMIT}. The referral moved to ${STATUS_LABELS[response.moved_to]}.`,
        );
      } else if (response.moved_to) {
        toast.success(`Saved. Moved to ${STATUS_LABELS[response.moved_to]}.`);
      } else {
        toast.success("Call result saved.");
      }

      return true;
    } catch {
      // The hooks already showed the reason and refreshed the case.
      return false;
    }
  }

  /**
   * Call patient: the server logs the call and hands back a token, then this
   * browser connects to Twilio, which dials the patient from the organisation's
   * number. While a call is live the same button hangs up.
   */
  async function handleDial() {
    if (phone.active) {
      phone.hangUp();

      return;
    }

    // A second click while the first is still being sent is ignored.
    if (dialMutation.isPending) {
      return;
    }

    let callId: number;
    let token: string;

    try {
      ({ call_id: callId, token } = await dialMutation.mutateAsync());
    } catch {
      // The hook already showed the reason and refreshed the case.
      return;
    }

    try {
      await phone.start(token, callId);
    } catch (error) {
      // Could not reach Twilio (microphone refused...): the call row is
      // removed so it does not count or block the next call.
      toast.error(
        error instanceof BrowserCallError
          ? error.message
          : "The call could not be started. Please try again.",
      );
      abandonMutation.mutate(callId);
    }
  }

  /** Marks the referral booked straight away: nothing is asked. The appointment
   *  is linked to it later (from Acuity), not typed in here. */
  async function markBooked() {
    if (move.isPending) {
      return;
    }

    try {
      await move.mutateAsync({
        referralId: detail.id,
        toStatus: "appointment_booked",
        rowVersion: detail.row_version,
        source: "button",
      });

      toast.success("Marked as booked.");
    } catch {
      // The hook already showed the reason.
    }
  }

  function handleResult(code: CallResultCode) {
    if (busy || !canRecord) {
      return;
    }

    if (code === "other") {
      setShowOther((current) => !current);
    } else if (code === "callback_requested") {
      setCallbackFor(true);
    } else if (code === "declined") {
      setConfirmDeclined(true);
    } else {
      void submit(code);
    }
  }

  const blockedNotice =
    !canRecord && detail.call_blocked_reason
      ? detail.call_blocked_reason
      : null;

  return (
    <div className="rounded-lg border border-[#e6dfd3] bg-white p-4">
      <h3 className="mb-3 text-sm font-bold text-[#1f2329]">Call</h3>

      <div className="flex flex-wrap items-center gap-3 rounded-lg bg-[#1d2430] px-4 py-3.5 text-white">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[#9aa3b2]">
            ScanX click-to-call
          </div>

          <div className="font-mono text-lg font-semibold">
            {formatPhone(detail.phone_e164, detail.fields.phone)}
          </div>
        </div>

        <div
          className={cn(
            "font-mono text-[13px] font-semibold",
            inProgress || phone.active ? "text-[#f3c969]" : "text-[#9fe0b8]",
          )}
        >
          {inProgress || phone.active
            ? (liveText ??
              `In progress${startedAt ? ` · since ${format(new Date(startedAt), "h:mm a")}` : ""}`)
            : detail.can_call
              ? "Ready"
              : "Not available"}
        </div>

        <div className="ml-auto">
          <Button
            type="button"
            // Never disabled: a click always goes to the server, which refuses
            // with the reason (no phone, closed, limit, call in progress...)
            // and the hook shows it.
            title={
              detail.dial_blocked_reason ??
              "Calls the patient from the organisation's number. You talk through this computer."
            }
            onClick={() => void handleDial()}
            className={
              phone.active
                ? "bg-[#c0392b] text-white hover:bg-[#a93226]"
                : "bg-[#1e8a4c] text-white"
            }
          >
            {phone.active
              ? "Hang up"
              : dialMutation.isPending
                ? "Starting…"
                : "Call patient"}
          </Button>

          {phone.state === "connected" && (
            <Button
              type="button"
              variant="outline"
              className="ml-2 border-[#4a5568] bg-transparent text-white hover:bg-[#2a3342] hover:text-white"
              onClick={phone.toggleMute}
            >
              {phone.muted ? "Unmute" : "Mute"}
            </Button>
          )}
        </div>
      </div>

      {detail.can_dial && !inProgress && (
        <p className="mt-2 text-[11px] text-[#6b6f78]">
          ScanX calls the patient from the organisation&apos;s number and you
          talk through this computer&apos;s microphone. When the call ends,
          pick the result below.
        </p>
      )}

      {detail.can_call && !detail.can_dial && detail.dial_blocked_reason && (
        <p className="mt-2 text-[11px] text-[#6b6f78]">
          {detail.dial_blocked_reason} You can also call the patient another
          way and pick the result below: it is logged and counted the same.
        </p>
      )}

      {suggested && (
        <p
          role="status"
          className="mt-2 rounded-md bg-[#eef3fb] px-3 py-2 text-xs text-[#2f5d9b]"
        >
          {liveText}. Suggested result:{" "}
          {detail.result_options.find((option) => option.code === suggested)
            ?.label ?? suggested}
          . Check it and pick the result below.
        </p>
      )}

      {blockedNotice && (
        <p
          role="status"
          className="mt-2 rounded-md bg-[#fcf1dc] px-3 py-2 text-xs text-[#b7791f]"
        >
          {blockedNotice}
        </p>
      )}

      <div className="mt-4 mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#6b6f78]">
        Outreach plan
        <span className="rounded-full bg-[#eef0f3] px-2 py-0.5 text-[10px] normal-case text-[#555b66]">
          {qualifying} of {CALL_LIMIT} unsuccessful calls
        </span>
      </div>

      <OutreachPlan detail={detail} now={now} />

      <div className="mt-4 mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#6b6f78]">
        Record result
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3" role="group" aria-label="Call result">
        {detail.result_options.map((option) => (
          <button
            key={option.code}
            type="button"
            disabled={!canRecord || busy}
            aria-pressed={option.code === "other" ? showOther : undefined}
            onClick={() => handleResult(option.code)}
            className={cn(
              "rounded-md border bg-white px-2 py-2 text-center text-[11.5px] font-semibold transition-colors hover:bg-[#f5f1e8] disabled:cursor-not-allowed disabled:opacity-45",
              option.code === "other" && showOther
                ? "border-[#8b6f47] bg-[#f1e7d8]"
                : option.code === suggested
                  ? "border-[#2f6fc0] bg-[#eef3fb] ring-1 ring-[#2f6fc0]"
                  : "border-[#e6dfd3]",
            )}
          >
            {option.label}
            <span className="block text-[10px] font-normal text-[#6b6f78]">
              {option.code === suggested
                ? "suggested"
                : RESULT_HINT[option.code]}
            </span>
          </button>
        ))}
      </div>

      {showOther && canRecord && (
        <div className="mt-2 flex flex-col gap-2 rounded-md border border-[#e6dfd3] bg-[#faf8f4] p-3">
          <label
            htmlFor="other-reason"
            className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6f78]"
          >
            What happened on the call?
          </label>

          <textarea
            id="other-reason"
            value={otherReason}
            maxLength={2000}
            onChange={(event) => setOtherReason(event.target.value)}
            placeholder="e.g. Patient is travelling until Oct 20 and asked us to text then"
            className="min-h-14 w-full resize-y rounded-md border border-[#e6dfd3] bg-white px-2 py-1.5 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
          />

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-[#2d2d2d]">
              <input
                type="checkbox"
                checked={otherCounts}
                onChange={(event) => setOtherCounts(event.target.checked)}
              />
              Counts toward the {CALL_LIMIT}-call limit
            </label>

            <Button
              type="button"
              size="sm"
              className="ml-auto"
              disabled={busy || !otherReason.trim()}
              onClick={async () => {
                const saved = await submit("other", {
                  otherReason: otherReason.trim(),
                  countsTowardLimit: otherCounts,
                });

                if (saved) {
                  setShowOther(false);
                  setOtherReason("");
                  setOtherCounts(false);
                }
              }}
            >
              Save result
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {/* Books the appointment in Acuity from here (the direct-booking
            dialog). Switched off until that is rolled out: set
            DIRECT_BOOKING_ENABLED to true. */}
        <Button
          type="button"
          size="sm"
          disabled={!DIRECT_BOOKING_ENABLED}
          title={
            DIRECT_BOOKING_ENABLED
              ? "Books the appointment in Acuity right here: pick an open time."
              : "Coming soon."
          }
          onClick={() => setDirectBookingFor(true)}
          className="bg-[#2f6fc0] text-white"
        >
          Book in Acuity with these details
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!detail.is_open}
          onClick={() => void markBooked()}
        >
          Mark booked
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!detail.is_open}
          title="Tells the referring physician by fax that the patient could not be reached"
          onClick={() => setFaxBackFor(true)}
        >
          Fax referring physician
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={detail.do_not_call || !detail.phone_e164}
          onClick={() => setConfirmDnc(true)}
          className="text-[#c0392b]"
        >
          {detail.do_not_call ? "Number blocked" : "Do not call"}
        </Button>
      </div>

      {callbackFor && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) {
              setCallbackFor(false);
            }
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-label="Callback requested"
            className="w-full max-w-sm rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xl"
            onSubmit={async (event) => {
              event.preventDefault();

              const saved = await submit("callback_requested", {
                callbackAt: new Date(callbackAt).toISOString(),
              });

              if (saved) {
                setCallbackFor(false);
              }
            }}
          >
            <h2 className="text-lg font-bold text-[#2d2d2d]">
              Callback requested
            </h2>

            <p className="mt-2 text-sm text-[#666666]">
              When did the patient ask to be called back? This call does not
              count toward the {CALL_LIMIT}-call limit.
            </p>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[#6b6f78]">
              Call back at
              <input
                type="datetime-local"
                required
                value={callbackAt}
                onChange={(event) => setCallbackAt(event.target.value)}
                className="mt-1 w-full rounded-md border border-[#dddddd] bg-white px-3 py-2 text-sm font-normal text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
              />
            </label>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setCallbackFor(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={busy || !callbackAt}>
                {busy ? "Working…" : "Save callback"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {faxBackFor && (
        <FaxBackDialog
          referralId={detail.id}
          open
          onOpenChange={setFaxBackFor}
        />
      )}

      {directBookingFor && (
        <DirectBookingDialog
          referralId={detail.id}
          patientName={
            [detail.fields.first_name, detail.fields.last_name]
              .filter(Boolean)
              .join(" ") || "the patient"
          }
          examName={detail.exam_1?.name ?? null}
          clinicName={detail.clinic?.name ?? null}
          email={detail.fields.email}
          onClose={() => setDirectBookingFor(false)}
        />
      )}

      <ConfirmDialog
        open={confirmDeclined}
        title="Patient declined?"
        description="This closes the referral as Declined. It will leave the board."
        confirmLabel="Mark as declined"
        isPending={busy}
        onOpenChange={setConfirmDeclined}
        onConfirm={async () => {
          const saved = await submit("declined");

          if (saved) {
            setConfirmDeclined(false);
          }
        }}
      />

      <ConfirmDialog
        open={confirmDnc}
        title="Block this number?"
        description="The number is blocked for all calls and texts on every referral, and this referral is closed as Declined."
        confirmLabel="Do not call"
        isPending={doNotCall.isPending}
        onOpenChange={setConfirmDnc}
        onConfirm={async () => {
          try {
            await doNotCall.mutateAsync();
            setConfirmDnc(false);
          } catch {
            // The hook already showed the reason.
          }
        }}
      />
    </div>
  );
}
