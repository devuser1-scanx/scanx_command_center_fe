// features/patients/patient-profile-view.tsx

"use client";

import Link from "next/link";

import { usePatientProfile } from "@/features/patients/hooks/use-patient-profile";
import { getStatusClasses } from "@/features/dashboard/admin/timeline-utils";
import { cn } from "@/lib/utils";

type PatientProfileViewProps = {
  appointmentId: string;
};

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `$${value.toFixed(2)}`;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-[#2d2d2d]">
        {title}
      </h3>

      <div className="mt-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-[#999999]">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#2d2d2d]">
        {value || "—"}
      </p>
    </div>
  );
}

export function PatientProfileView({
  appointmentId,
}: PatientProfileViewProps) {
  const profileQuery = usePatientProfile(appointmentId);

  if (profileQuery.isLoading) {
    return (
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <p className="text-sm text-[#777777]">
          Loading patient profile…
        </p>
      </section>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#cc3333]">
          {profileQuery.error?.message ??
            "Unable to load this patient's profile."}
        </p>

        <Link
          href="/admin/patients"
          className="mt-3 inline-block text-sm font-semibold text-[#8b6f47] hover:underline"
        >
          Back to Patients
        </Link>
      </section>
    );
  }

  const profile = profileQuery.data;
  const selectedVisit = profile.visits.find(
    (visit) =>
      visit.appointmentId === profile.selectedAppointmentId,
  );

  return (
    <div className="space-y-5">
      <Link
        href="/admin/patients"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8b6f47] hover:underline"
      >
        ← Back to Patients
      </Link>

      <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h2 className="text-2xl font-bold text-[#2d2d2d]">
              {profile.patient}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
              title="Not yet connected to a mail service"
            >
              Mail
            </button>

            <button
              type="button"
              className="rounded-md bg-[#8b6f47] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f5636]"
              title="Not yet connected to a fax service"
            >
              Fax
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
        <section className="rounded-2xl border border-[#e4ddd0] bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-[#2d2d2d]">
            Visit history
          </h3>

          <div className="mt-3 space-y-2">
            {profile.visits.map((visit) => {
              const classes = getStatusClasses(visit.tone);
              const isSelected =
                visit.appointmentId ===
                profile.selectedAppointmentId;

              return (
                <Link
                  key={visit.appointmentId}
                  href={`/admin/patients/${encodeURIComponent(visit.appointmentId)}`}
                  className={cn(
                    "block rounded-xl border p-3 transition",
                    isSelected
                      ? "border-[#8b6f47] bg-[#fbfaf7]"
                      : "border-[#e4ddd0] hover:border-[#8b6f47]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#2d2d2d]">
                      {visit.date}
                    </span>

                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        classes.badge,
                      )}
                    >
                      {visit.status}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-[#777777]">
                    {visit.exam}
                  </p>

                  <p className="text-xs text-[#777777]">
                    {visit.clinicName} · {visit.time}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="space-y-5">
          <SectionCard title="Selected visit">
            {selectedVisit ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field label="Date" value={selectedVisit.date} />
                <Field label="Time" value={selectedVisit.time} />
                <Field
                  label="Clinic"
                  value={selectedVisit.clinicName}
                />
                <Field label="Exam" value={selectedVisit.exam} />
                <Field
                  label="Appointment ID"
                  value={selectedVisit.appointmentId}
                />
                <Field
                  label="Status"
                  value={selectedVisit.status}
                />
              </div>
            ) : (
              <p className="text-sm text-[#777777]">
                Visit details unavailable.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Patient intake">
            {profile.intake ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field label="DOB" value={profile.intake.dob} />
                <Field
                  label="Gender"
                  value={profile.intake.gender}
                />
                <Field
                  label="Height"
                  value={
                    profile.intake.height
                      ? `${profile.intake.height} in`
                      : null
                  }
                />
                <Field
                  label="Weight"
                  value={
                    profile.intake.weight
                      ? `${profile.intake.weight} lb`
                      : null
                  }
                />
                <Field
                  label="Blood pressure"
                  value={
                    profile.intake.bloodPressureSys &&
                    profile.intake.bloodPressureDia
                      ? `${profile.intake.bloodPressureSys}/${profile.intake.bloodPressureDia}`
                      : null
                  }
                />
                <Field
                  label="Reason for exam"
                  value={profile.intake.reason}
                />
                <Field
                  label="Reason (other)"
                  value={profile.intake.reasonOther}
                />
                <Field
                  label="Referring physician"
                  value={profile.intake.physicianName}
                />
                <Field
                  label="Physician email"
                  value={profile.intake.physicianEmail}
                />
                <Field
                  label="Physician fax"
                  value={profile.intake.physicianFaxNo}
                />
                <Field
                  label="SMS consent"
                  value={profile.intake.smsConsentValue}
                />
                <Field
                  label="HIPAA acknowledged"
                  value={profile.intake.hippaResponse}
                />
                <Field
                  label="Terms accepted"
                  value={profile.intake.acceptTerms}
                />
              </div>
            ) : (
              <p className="text-sm text-[#777777]">
                No intake form on file for this visit.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Check-in">
            {profile.checkin ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field
                  label="Status"
                  value={profile.checkin.status}
                />
                <Field
                  label="Checked in at"
                  value={formatDateTime(
                    profile.checkin.checkinTime,
                  )}
                />
                <Field
                  label="Location"
                  value={profile.checkin.location}
                />
              </div>
            ) : (
              <p className="text-sm text-[#777777]">
                Not checked in yet.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Forms">
            {profile.forms.length === 0 ? (
              <p className="text-sm text-[#777777]">
                No forms on file for this visit.
              </p>
            ) : (
              <div className="space-y-2">
                {profile.forms.map((form, index) => (
                  <div
                    key={`${form.source}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-[#e4ddd0] bg-[#fbfaf7] p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#2d2d2d]">
                        {form.formType ?? "Intake form"}
                      </p>

                      <p className="text-xs text-[#777777]">
                        Sent {formatDateTime(form.sentAt)}
                        {form.submittedAt
                          ? ` · Submitted ${formatDateTime(form.submittedAt)}`
                          : ""}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-[#eaf1ff] px-2.5 py-1 text-[10px] font-bold uppercase text-[#2563eb]">
                      {form.status ?? "Unknown"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Communications">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Phone" value={profile.phone} />
              <Field label="Email" value={profile.email} />
            </div>
          </SectionCard>

          <SectionCard title="Reports & uploads">
            {profile.reports.length === 0 &&
            profile.uploads.length === 0 ? (
              <p className="text-sm text-[#777777]">
                No reports or uploads on file for this visit.
              </p>
            ) : (
              <div className="space-y-2">
                {profile.reports.map((report, index) => (
                  <div
                    key={`report-${index}`}
                    className="flex items-center justify-between rounded-xl border border-[#e4ddd0] bg-[#fbfaf7] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#2d2d2d]">
                        {report.fileName ?? "Report"}
                      </p>

                      <p className="text-xs text-[#777777]">
                        {formatDateTime(report.createdAt)}
                        {report.accessed
                          ? " · Accessed"
                          : " · Not accessed"}
                      </p>
                    </div>

                    {report.deliveryLink && (
                      <a
                        href={report.deliveryLink}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-md bg-[#8b6f47] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Open
                      </a>
                    )}
                  </div>
                ))}

                {profile.uploads.map((upload, index) => (
                  <div
                    key={`upload-${index}`}
                    className="flex items-center justify-between rounded-xl border border-[#e4ddd0] bg-[#fbfaf7] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#2d2d2d]">
                        {upload.fileName ?? "Upload"}
                      </p>

                      <p className="text-xs text-[#777777]">
                        {upload.fileType ?? "Unknown type"} ·{" "}
                        {formatDateTime(upload.uploadedAt)}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                        upload.verified
                          ? "bg-[#e6f7ed] text-[#16803c]"
                          : "bg-[#fff2df] text-[#b45309]",
                      )}
                    >
                      {upload.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Payment">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field
                label="Price"
                value={formatCurrency(profile.payment.price)}
              />
              <Field
                label="Amount paid"
                value={formatCurrency(
                  profile.payment.amountPaid,
                )}
              />
              <Field
                label="Paid"
                value={profile.payment.paid ? "Yes" : "No"}
              />
            </div>

            {profile.payment.paymentLink && (
              <a
                href={profile.payment.paymentLink}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-[#8b6f47] hover:underline"
              >
                Open payment link
              </a>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
