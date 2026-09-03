// app/(dashboard)/admin/dashboard/page.tsx

import { AdminDashboardBody } from "@/features/dashboard/admin/admin-dashboard-body";
import { DashboardStats } from "@/features/dashboard/admin/dashboard-stats";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-5 4xl:space-y-8">
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm 4xl:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#2d2d2d] 3xl:text-3xl 5xl:text-4xl">
              All Clinics — Live Patient Movement Board
            </h2>

            <p className="mt-1 text-sm text-[#777777] 3xl:text-base 5xl:text-lg">
              Patient cards update from check-in, call, payment, report and status events.
            </p>
          </div>

          <DashboardStats />
        </div>
      </section>

      <AdminDashboardBody />
    </div>
  );
}
