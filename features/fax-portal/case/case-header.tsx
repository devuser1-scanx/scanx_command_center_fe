// features/fax-portal/case/case-header.tsx

"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  COLUMN_META,
  formatWhen,
} from "@/features/fax-portal/board/board-meta";
import {
  useAcuityAppointmentTypes,
  useAcuityCalendars,
} from "@/features/fax-portal/hooks/use-acuity";
import { useUpdateCase } from "@/features/fax-portal/hooks/use-case";
import {
  CALL_LIMIT,
  type CaseDetail,
  type CaseUpdate,
} from "@/features/fax-portal/types/fax-portal-types";
import { cn } from "@/lib/utils";

type CaseHeaderProps = {
  detail: CaseDetail;
  onViewFax: () => void;
};

type Draft = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  reason: string;
  reason_other: string;
  address: string;
  physician_name: string;
  physician_fax_no: string;
  physician_email: string;
  clinicId: string;
  examId: string;
};

const TEXT_KEYS = [
  "first_name",
  "last_name",
  "phone",
  "email",
  "gender",
  "dob",
  "reason",
  "reason_other",
  "address",
  "physician_name",
  "physician_fax_no",
  "physician_email",
] as const;

const GENDERS = ["Male", "Female", "Other"];

function toDraft(detail: CaseDetail): Draft {
  const f = detail.fields;

  return {
    first_name: f.first_name ?? "",
    last_name: f.last_name ?? "",
    phone: f.phone ?? "",
    email: f.email ?? "",
    gender: f.gender ?? "",
    dob: f.dob ?? "",
    reason: f.reason ?? "",
    reason_other: f.reason_other ?? "",
    address: f.address ?? "",
    physician_name: f.physician_name ?? "",
    physician_fax_no: f.physician_fax_no ?? "",
    physician_email: f.physician_email ?? "",
    clinicId: detail.clinic ? String(detail.clinic.acuity_calendar_id) : "",
    examId: detail.exam_1 ? String(detail.exam_1.acuity_appointment_type_id) : "",
  };
}

function buildUpdate(detail: CaseDetail, draft: Draft): CaseUpdate | null {
  const saved = toDraft(detail);
  const update: CaseUpdate = { row_version: detail.row_version };
  let changed = false;

  for (const key of TEXT_KEYS) {
    if (draft[key].trim() !== saved[key].trim()) {
      update[key] = draft[key].trim() === "" ? null : draft[key].trim();
      changed = true;
    }
  }

  if (draft.clinicId !== saved.clinicId) {
    update.acuity_calendar_id = draft.clinicId ? Number(draft.clinicId) : null;
    changed = true;
  }

  if (draft.examId !== saved.examId) {
    update.exam_1_id = draft.examId ? Number(draft.examId) : null;
    update.exam_1_fax_text = null;
    changed = true;
  }

  return changed ? update : null;
}

const INPUT =
  "w-full rounded-md border bg-white px-2.5 py-1.5 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47] disabled:bg-[#f5f1e8] disabled:text-[#777777]";

function Field({
  id,
  label,
  required,
  missing,
  className,
  children,
}: {
  id?: string;
  label: string;
  required?: boolean;
  /** Highlighted in amber: not on the fax, ask the patient on the call. */
  missing?: boolean;
  className?: string;
  children: (inputClass: string) => React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6f78]"
      >
        {label}
        {required ? " *" : ""}
      </label>

      {children(
        cn(
          INPUT,
          missing
            ? "border-[#b7791f] bg-[#fffaf0]"
            : "border-[#e6dfd3]",
        ),
      )}
    </div>
  );
}

export function CaseHeader({ detail, onViewFax }: CaseHeaderProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(detail));
  const update = useUpdateCase(detail.id);
  const calendars = useAcuityCalendars();
  const clinicIdNumber = draft.clinicId ? Number(draft.clinicId) : null;
  const types = useAcuityAppointmentTypes(clinicIdNumber);

  const editable = detail.is_open;
  const pendingUpdate = buildUpdate(detail, draft);
  const typeList = useMemo(() => types.data ?? [], [types.data]);
  const calendarList = useMemo(() => calendars.data ?? [], [calendars.data]);

  // The reasons the chosen exam's Acuity form offers.
  const reasonOptions =
    typeList.find((t) => String(t.acuity_appointment_type_id) === draft.examId)
      ?.reason_options ?? [];

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (!pendingUpdate) {
      return;
    }

    try {
      await update.mutateAsync(pendingUpdate);
    } catch {
      // The hook already showed the reason.
    }
  }

  const name =
    [detail.fields.first_name, detail.fields.last_name]
      .filter(Boolean)
      .join(" ") || "Unknown patient";
  const columnColor = COLUMN_META[detail.status].color;
  const qualifying = detail.outreach.qualifying_call_count;

  const chosenExam = detail.exam_1;
  const examMissingFromList =
    chosenExam &&
    !typeList.some(
      (t) => t.acuity_appointment_type_id === chosenExam.acuity_appointment_type_id,
    );

  return (
    <section
      aria-label="Booking details"
      className="rounded-lg border border-[#e6dfd3] bg-white p-5"
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#1f2329]">{name}</h2>

          <p className="mt-0.5 text-xs text-[#6b6f78]">
            Referral #{detail.id} · received {formatWhen(detail.created_at)} via
            WestFax
            {detail.assignee ? ` · assigned to ${detail.assignee.name}` : " · unassigned"}
          </p>
        </div>

        <div className="ml-auto flex flex-wrap gap-1.5">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
            style={{ backgroundColor: columnColor }}
          >
            {detail.status_label}
          </span>

          <span className="rounded-full bg-[#eef0f3] px-2.5 py-1 text-[11px] font-semibold text-[#555b66]">
            Attempt {Math.min(qualifying + 1, CALL_LIMIT)} of {CALL_LIMIT}
          </span>

          {detail.do_not_call ? (
            <span className="rounded-full bg-[#fbe5e2] px-2.5 py-1 text-[11px] font-semibold text-[#c0392b]">
              Do not call
            </span>
          ) : detail.sms_opted_out ? (
            <span className="rounded-full bg-[#fbe5e2] px-2.5 py-1 text-[11px] font-semibold text-[#c0392b]">
              Opted out of texts
            </span>
          ) : (
            <span className="rounded-full bg-[#dff2f2] px-2.5 py-1 text-[11px] font-semibold text-[#147d82]">
              Texts allowed
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 mb-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-[#6b6f78]">
        Booking details · the same fields as the Acuity booking form
        <span className="ml-auto text-[11px] font-normal normal-case italic">
          Filled from the referral fax. Amber fields are missing: ask the
          patient on the call.
        </span>
      </div>

      {!editable && (
        <p className="mb-2 rounded-md bg-[#fcf1dc] px-3 py-2 text-xs text-[#b7791f]">
          This referral is closed, so the details can no longer be edited. A
          manager can reopen it from the board.
        </p>
      )}

      <form
        className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <Field id="cs-first" label="First name" required missing={!draft.first_name.trim()}>
          {(cls) => (
            <input
              id="cs-first"
              value={draft.first_name}
              disabled={!editable}
              maxLength={100}
              onChange={(e) => set("first_name", e.target.value)}
              className={cls}
            />
          )}
        </Field>

        <Field id="cs-last" label="Last name" required missing={!draft.last_name.trim()}>
          {(cls) => (
            <input
              id="cs-last"
              value={draft.last_name}
              disabled={!editable}
              maxLength={100}
              onChange={(e) => set("last_name", e.target.value)}
              className={cls}
            />
          )}
        </Field>

        <Field id="cs-phone" label="Phone" missing={!draft.phone.trim()}>
          {(cls) => (
            <input
              id="cs-phone"
              value={draft.phone}
              disabled={!editable}
              maxLength={20}
              onChange={(e) => set("phone", e.target.value)}
              className={cn(cls, "font-mono")}
            />
          )}
        </Field>

        <Field id="cs-email" label="Email" missing={!draft.email.trim()}>
          {(cls) => (
            <input
              id="cs-email"
              type="email"
              value={draft.email}
              disabled={!editable}
              maxLength={150}
              placeholder="Ask patient"
              onChange={(e) => set("email", e.target.value)}
              className={cls}
            />
          )}
        </Field>

        <Field id="cs-exam" label="Appointment type" missing={!draft.examId}>
          {(cls) => (
            <select
              id="cs-exam"
              value={draft.examId}
              disabled={!editable}
              onChange={(e) => {
                set("examId", e.target.value);

                // A reason the new exam does not offer is dropped.
                const offered =
                  typeList.find(
                    (t) => String(t.acuity_appointment_type_id) === e.target.value,
                  )?.reason_options ?? [];

                if (
                  draft.reason &&
                  !offered.some(
                    (option) =>
                      option.toLowerCase() === draft.reason.toLowerCase(),
                  )
                ) {
                  set("reason", "");
                }
              }}
              className={cls}
            >
              <option value="">Choose an exam</option>

              {chosenExam && examMissingFromList && (
                <option value={chosenExam.acuity_appointment_type_id}>
                  {chosenExam.name} (no longer in Acuity)
                </option>
              )}

              {typeList.map((type) => (
                <option
                  key={type.acuity_appointment_type_id}
                  value={type.acuity_appointment_type_id}
                  disabled={!type.available_at_calendar}
                >
                  {type.name}
                  {type.available_at_calendar ? "" : " (not offered at this clinic)"}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="cs-clinic" label="Location" missing={!draft.clinicId}>
          {(cls) => (
            <select
              id="cs-clinic"
              value={draft.clinicId}
              disabled={!editable}
              onChange={(e) => set("clinicId", e.target.value)}
              className={cls}
            >
              <option value="">Choose a location</option>

              {detail.clinic &&
                !calendarList.some(
                  (c) => c.acuity_calendar_id === detail.clinic?.acuity_calendar_id,
                ) && (
                  <option value={detail.clinic.acuity_calendar_id}>
                    {detail.clinic.name} (no longer in Acuity)
                  </option>
                )}

              {calendarList.map((calendar) => (
                <option
                  key={calendar.acuity_calendar_id}
                  value={calendar.acuity_calendar_id}
                >
                  {calendar.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="cs-gender" label="Gender" missing={!draft.gender}>
          {(cls) => (
            <select
              id="cs-gender"
              value={draft.gender}
              disabled={!editable}
              onChange={(e) => set("gender", e.target.value)}
              className={cls}
            >
              <option value="">Not stated</option>
              {draft.gender && !GENDERS.includes(draft.gender) && (
                <option value={draft.gender}>{draft.gender}</option>
              )}
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="cs-dob" label="Date of birth" missing={!draft.dob}>
          {(cls) => (
            <input
              id="cs-dob"
              type="date"
              value={draft.dob}
              disabled={!editable}
              onChange={(e) => set("dob", e.target.value)}
              className={cn(cls, "font-mono")}
            />
          )}
        </Field>

        <Field
          id="cs-reason"
          label="Reason for the appointment"
          missing={!draft.reason.trim()}
          className="sm:col-span-2"
        >
          {(cls) =>
            draft.examId && reasonOptions.length === 0 ? (
              // This exam's Acuity form has no reason list: whatever is on the
              // card is shown, but nothing can be chosen.
              <input
                id="cs-reason"
                value={draft.reason}
                disabled
                placeholder="This exam has no reason options"
                className={cls}
              />
            ) : (
              <select
                id="cs-reason"
                value={draft.reason}
                disabled={!editable || !draft.examId}
                onChange={(e) => set("reason", e.target.value)}
                className={cls}
              >
                <option value="">
                  {draft.examId ? "Choose a reason" : "Choose the exam first"}
                </option>

                {draft.reason &&
                  !reasonOptions.some(
                    (option) =>
                      option.toLowerCase() === draft.reason.toLowerCase(),
                  ) && (
                    <option value={draft.reason}>
                      {draft.reason} (not offered for this exam)
                    </option>
                  )}

                {reasonOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )
          }
        </Field>

        <Field
          id="cs-reason-other"
          label="Other reasons"
          missing={
            draft.reason.toLowerCase() === "other" && !draft.reason_other.trim()
          }
          className="sm:col-span-2"
        >
          {(cls) => (
            <input
              id="cs-reason-other"
              value={draft.reason_other}
              disabled={!editable}
              placeholder="Write anything here (required if the reason is Other)"
              onChange={(e) => set("reason_other", e.target.value)}
              className={cls}
            />
          )}
        </Field>

        <Field
          id="cs-address"
          label="Patient address"
          className="sm:col-span-2 xl:col-span-4"
        >
          {(cls) => (
            <input
              id="cs-address"
              value={draft.address}
              disabled={!editable}
              maxLength={500}
              placeholder="Not on the fax"
              onChange={(e) => set("address", e.target.value)}
              className={cls}
            />
          )}
        </Field>

        <Field
          id="cs-physician"
          label="Family / referring physician"
          missing={!draft.physician_name.trim()}
        >
          {(cls) => (
            <input
              id="cs-physician"
              value={draft.physician_name}
              disabled={!editable}
              maxLength={255}
              onChange={(e) => set("physician_name", e.target.value)}
              className={cls}
            />
          )}
        </Field>

        <Field
          id="cs-physician-fax"
          label="Physician fax #"
          missing={!draft.physician_fax_no.trim()}
        >
          {(cls) => (
            <input
              id="cs-physician-fax"
              value={draft.physician_fax_no}
              disabled={!editable}
              maxLength={255}
              onChange={(e) => set("physician_fax_no", e.target.value)}
              className={cn(cls, "font-mono")}
            />
          )}
        </Field>

        <Field
          id="cs-physician-email"
          label="Physician email address"
          missing={!draft.physician_email.trim()}
        >
          {(cls) => (
            <input
              id="cs-physician-email"
              type="email"
              value={draft.physician_email}
              disabled={!editable}
              maxLength={255}
              placeholder="Not on fax"
              onChange={(e) => set("physician_email", e.target.value)}
              className={cls}
            />
          )}
        </Field>

        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6b6f78]">
            Doctor order
          </span>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-sm font-semibold text-[#2d2d2d]">
              Referral fax
              {detail.fax.page_count ? ` · ${detail.fax.page_count} pages` : ""}
            </span>

            <Button type="button" variant="outline" size="xs" onClick={onViewFax}>
              View
            </Button>
          </div>
        </div>

        {detail.exam_2 && (
          <p className="text-[11px] text-[#6b6f78] sm:col-span-2 xl:col-span-4">
            Also ordered on the fax: {detail.exam_2.name}
          </p>
        )}

        {pendingUpdate && editable && (
          <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-4">
            <Button type="submit" size="sm" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save changes"}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={update.isPending}
              onClick={() => setDraft(toDraft(detail))}
            >
              Discard
            </Button>

            <span className="text-[11px] text-[#6b6f78]">
              You have unsaved changes.
            </span>
          </div>
        )}
      </form>
    </section>
  );
}
