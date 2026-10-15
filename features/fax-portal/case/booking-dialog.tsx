// features/fax-portal/case/booking-dialog.tsx

"use client";

import { useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { useBookingInfo } from "@/features/fax-portal/hooks/use-case";
import type { BookingMatch } from "@/features/fax-portal/types/fax-portal-types";
import { cn } from "@/lib/utils";

type BookingDialogProps = {
  referralId: number;
  patientName: string;
  isPending: boolean;
  onSubmit: (acuityAppointmentId: string) => void;
  onClose: () => void;
};

function describe(match: BookingMatch): string {
  const when = match.date ? format(new Date(match.date), "MMM d, yyyy") : "";
  const parts = [match.appointment_type, when, match.time].filter(Boolean);

  return parts.join(" · ") || "Appointment";
}

/**
 * Picks the Acuity appointment the patient booked. The candidates come from
 * the appointments we already hold (read only); if the right one is not
 * listed (it may not have synced yet), its Acuity ID can be typed in.
 */
export function BookingDialog({
  referralId,
  patientName,
  isPending,
  onSubmit,
  onClose,
}: BookingDialogProps) {
  const info = useBookingInfo(referralId);
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");

  const appointmentId = typed.trim() || selected;
  const matches = info.data?.matches ?? [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Appointment booked"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-[#2d2d2d]">Appointment booked</h2>

        <p className="mt-2 text-sm leading-6 text-[#666666]">
          Which Acuity appointment did {patientName} book?
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (appointmentId) {
              onSubmit(appointmentId);
            }
          }}
        >
          <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#6b6f78]">
            Appointments found for this patient
          </div>

          <div className="mt-2 flex flex-col gap-1.5">
            {info.isPending ? (
              <p role="status" className="text-sm text-[#6f5636]">
                Looking for appointments…
              </p>
            ) : info.data?.matches_unavailable || info.isError ? (
              <p className="text-xs text-[#b7791f]">
                {info.data?.matches_unavailable ??
                  "The appointment lookup is not available. Type the Acuity appointment ID below."}
              </p>
            ) : matches.length === 0 ? (
              <p className="text-xs text-[#6b6f78]">
                No matching appointment yet. It may not have synced; type the
                Acuity appointment ID below.
              </p>
            ) : (
              matches.map((match) => {
                const isSelected =
                  selected === match.appointment_id && !typed.trim();
                const disabled = match.already_linked || match.canceled;

                return (
                  <button
                    key={match.appointment_id}
                    type="button"
                    disabled={disabled}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelected(match.appointment_id);
                      setTyped("");
                    }}
                    className={cn(
                      "flex flex-col rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "border-[#8b6f47] bg-[#f1e7d8]"
                        : "border-[#e6dfd3] bg-white hover:bg-[#faf8f4]",
                      disabled && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <span className="font-semibold text-[#2d2d2d]">
                      {[match.first_name, match.last_name]
                        .filter(Boolean)
                        .join(" ") || "Appointment"}{" "}
                      <span className="font-normal text-[#6b6f78]">
                        · #{match.appointment_id}
                      </span>
                    </span>

                    <span className="text-xs text-[#6b6f78]">
                      {describe(match)}
                      {match.canceled && " · Cancelled"}
                      {match.already_linked &&
                        " · Already linked to another referral"}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[#6b6f78]">
            Or type the Acuity appointment ID
            <input
              value={typed}
              maxLength={50}
              onChange={(event) => setTyped(event.target.value)}
              placeholder="e.g. 1234567890"
              className="mt-1 w-full rounded-md border border-[#dddddd] bg-white px-3 py-2 text-sm font-normal normal-case text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
            />
          </label>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending || !appointmentId}>
              {isPending ? "Working…" : "Mark as booked"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
