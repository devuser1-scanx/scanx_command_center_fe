// features/dashboard/admin/admin-dashboard-body.tsx

"use client";

import { useState } from "react";

import { TimelineByAppointment } from "@/features/dashboard/admin/timeline-by-appointment";
import { useClinics } from "@/features/dashboard/admin/hooks/use-clinics";

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function AdminDashboardBody() {
  const clinicsQuery = useClinics();
  const [date, setDate] = useState(todayIsoDate);

  if (clinicsQuery.isError) {
    return (
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold text-[#2d2d2d]">
          Timeline by appointment
        </h3>

        <p className="mt-2 text-sm font-semibold text-[#cc3333]">
          Unable to load clinics: {clinicsQuery.error.message}
        </p>
      </section>
    );
  }

  if (clinicsQuery.isLoading || !clinicsQuery.data) {
    return (
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <h3 className="text-xl font-bold text-[#2d2d2d]">
          Timeline by appointment
        </h3>

        <p className="mt-2 text-sm text-[#777777]">
          Loading clinics…
        </p>
      </section>
    );
  }

  return (
    <TimelineByAppointment
      clinics={clinicsQuery.data}
      date={date}
      onDateChange={setDate}
    />
  );
}
