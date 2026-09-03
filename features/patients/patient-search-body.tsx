// features/patients/patient-search-body.tsx

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { usePatientSearch } from "@/features/patients/hooks/use-patient-search";
import { getStatusClasses } from "@/features/dashboard/admin/timeline-utils";
import { cn } from "@/lib/utils";

type PatientSearchBodyProps = {
  initialQuery: string;
};

export function PatientSearchBody({
  initialQuery,
}: PatientSearchBodyProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialQuery);

  const searchQuery = usePatientSearch({
    q: initialQuery || undefined,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = inputValue.trim();

    router.push(
      trimmed
        ? `/patients?q=${encodeURIComponent(trimmed)}`
        : "/patients",
    );
  }

  function handleClear() {
    setInputValue("");
    router.push("/patients");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-[#2d2d2d]">
          Patients
        </h2>

        <p className="mt-1 text-sm text-[#777777]">
          Search by phone number, appointment ID, or patient name.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-wrap gap-2"
        >
          <input
            value={inputValue}
            onChange={(event) =>
              setInputValue(event.target.value)
            }
            placeholder="Search patient / phone / appointment ID"
            className="min-w-0 flex-1 rounded-md border border-[#dddddd] bg-white px-4 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
          />

          <button
            type="submit"
            className="rounded-md bg-[#2d2d2d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
          >
            Search
          </button>

          {initialQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-[#dddddd] bg-white px-4 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:border-[#8b6f47] hover:text-[#8b6f47]"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-[#2d2d2d]">
          {initialQuery
            ? `Results for "${initialQuery}"`
            : "Today's patients — all clinics"}
        </h3>

        {searchQuery.isLoading && (
          <p className="mt-4 text-sm text-[#777777]">
            Loading…
          </p>
        )}

        {searchQuery.isError && (
          <p className="mt-4 text-sm font-semibold text-[#cc3333]">
            {searchQuery.error.message}
          </p>
        )}

        {searchQuery.data && searchQuery.data.length === 0 && (
          <p className="mt-4 text-sm text-[#777777]">
            No patients found.
          </p>
        )}

        <div className="mt-4 divide-y divide-[#e4ddd0]">
          {searchQuery.data?.map((patient) => {
            const classes = getStatusClasses(
              patient.latestTone,
            );

            return (
              <Link
                key={
                  patient.phone ??
                  patient.latestAppointmentId
                }
                href={`/patients/${encodeURIComponent(patient.latestAppointmentId)}`}
                className="-mx-2 flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-4 transition hover:bg-[#fbfaf7]"
              >
                <div className="min-w-0">
                  <p className="font-bold text-[#2d2d2d]">
                    {patient.patient}
                  </p>

                  <p className="text-sm text-[#777777]">
                    {patient.phone ?? "No phone on file"}
                    {" · "}
                    {patient.appointmentCount}{" "}
                    {patient.appointmentCount === 1
                      ? "visit"
                      : "visits"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-[#2d2d2d]">
                    {patient.latestExam}
                  </p>

                  <p className="text-xs text-[#777777]">
                    {patient.latestClinicName}
                    {" · "}
                    {patient.latestTime}
                  </p>
                </div>

                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                    classes.badge,
                  )}
                >
                  {patient.latestStatus}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
