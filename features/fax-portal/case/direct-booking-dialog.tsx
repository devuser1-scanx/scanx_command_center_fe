// features/fax-portal/case/direct-booking-dialog.tsx

"use client";

import { useState } from "react";
import { addMonths, format, parseISO, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useDirectBook,
  useDirectBookingDates,
  useDirectBookingTimes,
} from "@/features/fax-portal/hooks/use-case";
import { cn } from "@/lib/utils";

type DirectBookingDialogProps = {
  referralId: number;
  patientName: string;
  examName: string | null;
  clinicName: string | null;
  /** The email already on the card; when there is none it can be typed here. */
  email: string | null;
  onClose: () => void;
};

/**
 * Books the appointment in Acuity itself: pick one of the open days and times
 * (taken live from Acuity), and the referral is marked Appointment Booked. No
 * payment is taken here; it is collected at check-in.
 */
export function DirectBookingDialog({
  referralId,
  patientName,
  examName,
  clinicName,
  email,
  onClose,
}: DirectBookingDialogProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [typedEmail, setTypedEmail] = useState("");

  const monthKey = format(month, "yyyy-MM");
  const dates = useDirectBookingDates(referralId, monthKey);
  const times = useDirectBookingTimes(referralId, date);
  const book = useDirectBook(referralId);

  const isCurrentMonth = monthKey === format(new Date(), "yyyy-MM");

  async function submit() {
    if (!time) {
      return;
    }

    try {
      const result = await book.mutateAsync({
        time,
        email: email ? null : typedEmail.trim() || null,
      });

      toast.success(
        `Booked for ${result.when_label}. Acuity appointment #${result.appointment_id}.`,
      );
      onClose();
    } catch {
      // The hook already showed the reason (the time may have just been taken).
      setTime(null);
      void times.refetch();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !book.isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Book the appointment"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-[#2d2d2d]">
          Book the appointment
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#666666]">
          {patientName} ·{" "}
          <strong>{examName ?? "No exam chosen"}</strong>
          {clinicName ? ` · ${clinicName}` : ""}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#6b6f78]">
            Open days
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Previous month"
              disabled={isCurrentMonth}
              onClick={() => {
                setMonth((current) => addMonths(current, -1));
                setDate(null);
                setTime(null);
              }}
            >
              <ChevronLeft className="size-4" />
            </Button>

            <span className="min-w-28 text-center text-sm font-semibold text-[#2d2d2d]">
              {format(month, "MMMM yyyy")}
            </span>

            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Next month"
              onClick={() => {
                setMonth((current) => addMonths(current, 1));
                setDate(null);
                setTime(null);
              }}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {dates.isPending ? (
            <p role="status" className="text-sm text-[#6f5636]">
              Looking for open days…
            </p>
          ) : dates.isError ? (
            <p role="alert" className="text-xs text-[#c0392b]">
              {dates.error.message}
            </p>
          ) : (dates.data ?? []).length === 0 ? (
            <p className="text-xs text-[#6b6f78]">
              No open days this month. Try the next month.
            </p>
          ) : (
            (dates.data ?? []).map((day) => (
              <button
                key={day}
                type="button"
                aria-pressed={date === day}
                onClick={() => {
                  setDate(day);
                  setTime(null);
                }}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-sm transition-colors",
                  date === day
                    ? "border-[#8b6f47] bg-[#f1e7d8] font-semibold"
                    : "border-[#e6dfd3] bg-white hover:bg-[#faf8f4]",
                )}
              >
                {format(parseISO(day), "EEE d")}
              </button>
            ))
          )}
        </div>

        {date && (
          <>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#6b6f78]">
              Open times on {format(parseISO(date), "EEEE, MMM d")}
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {times.isPending ? (
                <p role="status" className="text-sm text-[#6f5636]">
                  Looking for open times…
                </p>
              ) : times.isError ? (
                <p role="alert" className="text-xs text-[#c0392b]">
                  {times.error.message}
                </p>
              ) : (times.data ?? []).length === 0 ? (
                <p className="text-xs text-[#6b6f78]">
                  No open times that day. Pick another day.
                </p>
              ) : (
                (times.data ?? []).map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    aria-pressed={time === slot.time}
                    onClick={() => setTime(slot.time)}
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-sm transition-colors",
                      time === slot.time
                        ? "border-[#8b6f47] bg-[#f1e7d8] font-semibold"
                        : "border-[#e6dfd3] bg-white hover:bg-[#faf8f4]",
                    )}
                  >
                    {slot.label}
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {!email && (
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[#6b6f78]">
            Patient email (optional)
            <input
              type="email"
              value={typedEmail}
              maxLength={150}
              onChange={(event) => setTypedEmail(event.target.value)}
              placeholder="Without one, Acuity cannot email the confirmation"
              className="mt-1 w-full rounded-md border border-[#dddddd] bg-white px-3 py-2 text-sm font-normal normal-case text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
            />
          </label>
        )}

        <p className="mt-4 rounded-md bg-[#faf7f2] px-3 py-2 text-xs leading-relaxed text-[#6b6f78]">
          Booked directly in Acuity: no payment is taken here, it is collected
          at check-in. The consent checkboxes on Acuity&apos;s form are
          submitted as accepted.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={book.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={book.isPending || !time}
            onClick={() => void submit()}
          >
            {book.isPending ? "Booking…" : "Book appointment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
