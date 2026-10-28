// features/calls/calls-patients-view.tsx

"use client";

import { useState, type FormEvent } from "react";
import { Clock, Phone, PhoneOff, Search } from "lucide-react";

import { CallsPageHeader } from "@/features/calls/components/calls-page-header";
import { CallStatusPill } from "@/features/calls/components/call-status-pill";
import { formatDateTime } from "@/features/calls/components/calls-format";
import {
  useCallPatientSearch,
  usePatientCallHistory,
} from "@/features/calls/hooks/use-calls-queries";
import { isDialable, useDialer } from "@/features/calls/providers/dialer-provider";
import type { CallPatient } from "@/features/calls/types/calls-types";

export function CallsPatientsView() {
  const dialer = useDialer();
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selected, setSelected] = useState<CallPatient | null>(null);

  const searchQuery = useCallPatientSearch(submitted);
  const historyQuery = usePatientCallHistory(selected?.phone ?? null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelected(null);
    setSubmitted(input.trim());
  }

  const patients = searchQuery.data?.results ?? [];

  return (
    <div className="space-y-5">
      <CallsPageHeader
        title="Patients"
        subtitle="Search existing patients and view call history."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">Patient search</h3>
          <p className="text-sm text-[#777777]">Search by name, phone or email.</p>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Search patient by name, phone or email…"
              aria-label="Search patients"
              className="min-w-0 flex-1 rounded-md border border-[#dddddd] bg-white px-4 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
            />

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-[#8b6f47] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f5636]"
            >
              <Search className="size-4" />
              Search
            </button>
          </form>

          {searchQuery.isLoading && (
            <p className="mt-4 text-sm text-[#777777]">Searching patients…</p>
          )}

          {searchQuery.isError && (
            <p role="alert" className="mt-4 text-sm text-[#c0392b]">
              {searchQuery.error.message}
            </p>
          )}

          {!submitted && (
            <p className="mt-4 rounded-xl border border-dashed border-[#dddddd] p-4 text-center text-sm text-[#777777]">
              Enter a name, phone number or email to search.
            </p>
          )}

          {submitted && searchQuery.isSuccess && patients.length === 0 && (
            <p className="mt-4 rounded-xl border border-dashed border-[#dddddd] p-4 text-center text-sm text-[#777777]">
              No patients found.
            </p>
          )}

          <div className="mt-4 space-y-2">
            {patients.map((patient) => (
              <div
                key={patient.appointment_id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#e4ddd0] p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#2d2d2d]">
                    {patient.full_name || "Unnamed patient"}
                  </p>
                  <p className="truncate text-xs text-[#555555]">
                    {patient.phone || "No phone"} · {patient.email || "No email"}
                  </p>
                  <p className="truncate text-xs text-[#777777]">
                    {patient.appointment_type || "No exam"} ·{" "}
                    {patient.clinic_name || patient.location || "No clinic"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={!patient.phone}
                    onClick={() => setSelected(patient)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#dddddd] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Clock className="size-3.5" />
                    History
                  </button>

                  {dialer.canDial && (
                    <button
                      type="button"
                      disabled={
                        dialer.active || !patient.phone || !isDialable(patient.phone)
                      }
                      onClick={() =>
                        void dialer.startCall(patient.phone ?? "", patient.appointment_id)
                      }
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#8b6f47] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#6f5636] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Phone className="size-3.5" />
                      Call
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-[#2d2d2d]">Patient call history</h3>

          <div className="mt-4 rounded-xl border border-[#e4ddd0] p-4">
            <p className="text-xs text-[#777777]">Current call</p>

            {dialer.active ? (
              <>
                <p className="text-xl font-bold text-[#2d2d2d]">{dialer.activeNumber}</p>
                <p className="text-xs capitalize text-[#777777]">
                  Status: {dialer.status}
                </p>

                <button
                  type="button"
                  onClick={dialer.hangUp}
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a5301f]"
                >
                  <PhoneOff className="size-4" />
                  Hang up
                </button>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-[#2d2d2d]">No active call</p>
                <p className="text-xs text-[#777777]">
                  Start a call from a patient result.
                </p>
              </>
            )}
          </div>

          {dialer.error && !dialer.active && (
            <p role="alert" className="mt-3 text-sm text-[#c0392b]">
              {dialer.error}
            </p>
          )}

          {!selected && (
            <p className="mt-4 text-sm text-[#777777]">
              Select a patient and click History.
            </p>
          )}

          {selected && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-[#2d2d2d]">
                {selected.full_name || "Unnamed patient"}
              </p>
              <p className="text-xs text-[#777777]">{selected.phone}</p>

              {historyQuery.isLoading && (
                <p className="mt-3 text-sm text-[#777777]">Loading history…</p>
              )}

              {historyQuery.isError && (
                <p role="alert" className="mt-3 text-sm text-[#c0392b]">
                  {historyQuery.error.message}
                </p>
              )}

              {historyQuery.isSuccess && historyQuery.data.history.length === 0 && (
                <p className="mt-3 rounded-xl border border-dashed border-[#dddddd] p-4 text-center text-sm text-[#777777]">
                  No call history found.
                </p>
              )}

              <div className="mt-3 space-y-2">
                {historyQuery.data?.history.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#e4ddd0] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2d2d2d]">
                        {call.display_name || "Unknown caller"}
                      </p>
                      <p className="truncate text-xs text-[#555555]">
                        {call.patient_number}
                      </p>
                      <p className="truncate text-xs text-[#777777]">
                        {call.direction} · {formatDateTime(call.created_at)}
                      </p>
                    </div>

                    <CallStatusPill status={call.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
