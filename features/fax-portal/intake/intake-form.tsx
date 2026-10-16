// features/fax-portal/intake/intake-form.tsx

"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TextPromptDialog } from "@/features/fax-portal/board/board-dialogs";
import {
  useAcuityAppointmentTypes,
  useAcuityCalendars,
  useAcuityStatus,
  useRefreshAcuity,
} from "@/features/fax-portal/hooks/use-acuity";
import { useUpdateIntake } from "@/features/fax-portal/hooks/use-intake";
import { useMoveReferral } from "@/features/fax-portal/hooks/use-referral-actions";
import type {
  AcuityAppointmentType,
  IntakeDetail,
  IntakeUpdate,
} from "@/features/fax-portal/types/fax-portal-types";
import { cn } from "@/lib/utils";

type IntakeFormProps = {
  detail: IntakeDetail;
  /** Called once the referral has left Review Required (released or rejected). */
  onDone: (referralId: number) => void;
};

type Draft = {
  first_name: string;
  last_name: string;
  dob: string;
  phone: string;
  gender: string;
  physician_name: string;
  physician_fax_no: string;
  address: string;
  reason: string;
  reason_other: string;
  clinicId: string;
  exam1Id: string;
  exam2Id: string;
  exam1FaxText: string | null;
  exam2FaxText: string | null;
};

const GENDER_OPTIONS = ["Male", "Female", "Other"];

const FIELD_CLASS =
  "w-full rounded-md border border-[#dddddd] bg-white px-2.5 py-1.5 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47] disabled:bg-[#f5f1e8] disabled:text-[#777777]";

/** What is saved on the server right now. */
function savedDraft(detail: IntakeDetail): Draft {
  const f = detail.fields;

  return {
    first_name: f.first_name ?? "",
    last_name: f.last_name ?? "",
    dob: f.dob ?? "",
    phone: f.phone ?? "",
    gender: f.gender ?? "",
    physician_name: f.physician_name ?? "",
    physician_fax_no: f.physician_fax_no ?? "",
    address: f.address ?? "",
    reason: f.reason ?? "",
    reason_other: f.reason_other ?? "",
    clinicId: detail.clinic ? String(detail.clinic.acuity_calendar_id) : "",
    exam1Id: detail.exam_1 ? String(detail.exam_1.acuity_appointment_type_id) : "",
    exam2Id: detail.exam_2 ? String(detail.exam_2.acuity_appointment_type_id) : "",
    exam1FaxText: detail.exam_1?.fax_text ?? null,
    exam2FaxText: detail.exam_2?.fax_text ?? null,
  };
}

/**
 * The starting form: the saved values, with the clinic and exams the fax
 * text pointed to preselected where nothing is saved yet. These are only
 * suggestions until the reviewer saves or releases.
 */
function initialDraft(detail: IntakeDetail): Draft {
  const draft = savedDraft(detail);
  const s = detail.suggestions;

  if (!detail.clinic && s.clinic) {
    draft.clinicId = String(s.clinic.acuity_calendar_id);
  }

  if (!detail.exam_1 && s.exam_1) {
    draft.exam1Id = String(s.exam_1.acuity_appointment_type_id);
    draft.exam1FaxText = s.exam_1.fax_text;
  }

  if (!detail.exam_2 && s.exam_2) {
    draft.exam2Id = String(s.exam_2.acuity_appointment_type_id);
    draft.exam2FaxText = s.exam_2.fax_text;
  }

  return draft;
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

/** Only what differs from the saved values, ready to send. */
function buildUpdate(detail: IntakeDetail, draft: Draft): IntakeUpdate | null {
  const saved = savedDraft(detail);
  const update: IntakeUpdate = { row_version: detail.row_version };
  let changed = false;

  for (const key of [
    "first_name",
    "last_name",
    "dob",
    "phone",
    "gender",
    "physician_name",
    "physician_fax_no",
    "address",
    "reason",
    "reason_other",
  ] as const) {
    if (draft[key].trim() !== saved[key].trim()) {
      update[key] = blankToNull(draft[key]);
      changed = true;
    }
  }

  if (draft.clinicId !== saved.clinicId) {
    update.acuity_calendar_id = draft.clinicId ? Number(draft.clinicId) : null;
    changed = true;
  }

  if (draft.exam1Id !== saved.exam1Id) {
    update.exam_1_id = draft.exam1Id ? Number(draft.exam1Id) : null;
    update.exam_1_fax_text = draft.exam1Id ? draft.exam1FaxText : null;
    changed = true;
  }

  if (draft.exam2Id !== saved.exam2Id) {
    update.exam_2_id = draft.exam2Id ? Number(draft.exam2Id) : null;
    update.exam_2_fax_text = draft.exam2Id ? draft.exam2FaxText : null;
    changed = true;
  }

  return changed ? update : null;
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-x-3">
      <label
        htmlFor={htmlFor}
        className="pt-2 text-[11px] font-semibold text-[#6b6f78]"
      >
        {label}
      </label>

      <div className="min-w-0">
        {children}

        {hint && <div className="mt-1 text-[10.5px] text-[#6b6f78]">{hint}</div>}
      </div>
    </div>
  );
}

function examHint(
  faxText: string | null,
  exam: AcuityAppointmentType | undefined,
  suggested: boolean,
) {
  const details = exam
    ? [
        exam.duration_min ? `${exam.duration_min} min` : null,
        exam.price ? `$${exam.price}` : null,
        exam.category,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  if (!faxText && !details && !suggested) {
    return null;
  }

  return (
    <>
      {suggested && (
        <span className="mr-1 font-semibold text-[#c0392b]">
          Suggested from the fax.
        </span>
      )}
      {faxText && <>On fax: &ldquo;{faxText}&rdquo;</>}
      {faxText && details ? " · " : null}
      {details}
    </>
  );
}

export function IntakeForm({ detail, onDone }: IntakeFormProps) {
  const [draft, setDraft] = useState<Draft>(() => initialDraft(detail));
  const [showNotReferral, setShowNotReferral] = useState(false);

  const calendars = useAcuityCalendars();
  const clinicIdNumber = draft.clinicId ? Number(draft.clinicId) : null;

  // Distance from the patient's saved address to each clinic, nearest first.
  // (Absent from an older backend that has not been updated yet.)
  const distances = detail.suggestions.clinic_distances ?? [];
  const distanceNote =
    distances.length > 0 ? (
      <span className="mt-0.5 block">
        From the patient&apos;s address (by ZIP code):{" "}
        {distances
          .map((d) => `${d.name} ${Math.round(d.miles)} mi`)
          .join(" · ")}
      </span>
    ) : null;

  // Comprehend's per-document "PHI Summary", for this patient's documents.
  const patientSummaries = detail.fax.documents.filter(
    (document) => document.for_patient && document.summary,
  );
  const types = useAcuityAppointmentTypes(clinicIdNumber);
  const acuityStatus = useAcuityStatus();
  const refresh = useRefreshAcuity();
  const update = useUpdateIntake(detail.id);
  const move = useMoveReferral();

  const editable = detail.status === "review_required";
  const pending = update.isPending || move.isPending;

  const saved = useMemo(() => savedDraft(detail), [detail]);
  const pendingUpdate = buildUpdate(detail, draft);
  const dirty = pendingUpdate !== null;

  const typeList = useMemo(() => types.data ?? [], [types.data]);
  const calendarList = useMemo(() => calendars.data ?? [], [calendars.data]);
  const typeById = useMemo(
    () => new Map(typeList.map((t) => [String(t.acuity_appointment_type_id), t])),
    [typeList],
  );
  const selectedCalendar = calendarList.find(
    (c) => String(c.acuity_calendar_id) === draft.clinicId,
  );

  const noAcuityData =
    !calendars.isPending &&
    !types.isPending &&
    calendarList.length === 0 &&
    typeList.length === 0;

  // The reasons Exam 1's Acuity form offers, and whether "Other" still needs
  // its explanation (the text box itself is always open).
  const reasonOptions = typeById.get(draft.exam1Id)?.reason_options ?? [];
  const otherNeedsText =
    draft.reason.toLowerCase() === "other" && !draft.reason_other.trim();

  const missing: string[] = [];

  if (!draft.clinicId) {
    missing.push("a clinic");
  }

  if (!draft.exam1Id) {
    missing.push("Exam 1");
  }

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  /** Exams the saved card has but the current list no longer offers. */
  function examOptions(slot: 1 | 2) {
    const chosen = slot === 1 ? detail.exam_1 : detail.exam_2;
    const chosenId = chosen ? String(chosen.acuity_appointment_type_id) : null;
    const listed = chosenId ? typeById.has(chosenId) : true;

    return (
      <>
        <option value="">{slot === 1 ? "Choose an exam" : "None"}</option>

        {chosen && !listed && chosenId && (
          <option value={chosenId}>{chosen.name} (no longer in Acuity)</option>
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
      </>
    );
  }

  function offeredHere(id: string): boolean {
    if (!id) {
      return true;
    }

    return typeById.get(id)?.available_at_calendar ?? true;
  }

  /** Saves any pending corrections; resolves to the card's current version. */
  async function saveIfNeeded(): Promise<number> {
    if (!pendingUpdate) {
      return detail.row_version;
    }

    const result = await update.mutateAsync(pendingUpdate);

    return result.row_version;
  }

  async function handleSave() {
    if (otherNeedsText) {
      toast.error("Say what the Other reason is.");

      return;
    }

    try {
      await saveIfNeeded();
      toast.success("Changes saved.");
    } catch {
      // useUpdateIntake already showed the reason.
    }
  }

  async function handleRelease() {
    if (missing.length > 0) {
      toast.error(`Choose ${missing.join(" and ")} before releasing to Sales.`);

      return;
    }

    if (!offeredHere(draft.exam1Id) || !offeredHere(draft.exam2Id)) {
      toast.error("An exam you chose is not offered at that clinic.");

      return;
    }

    if (otherNeedsText) {
      toast.error("Say what the Other reason is.");

      return;
    }

    try {
      const rowVersion = await saveIfNeeded();

      // Awaited rather than using per-call callbacks: saving a correction
      // reloads the referral and re-creates this form, and callbacks of an
      // unmounted component would be dropped.
      await move.mutateAsync({
        referralId: detail.id,
        toStatus: "ready_for_contact",
        rowVersion,
        source: "button",
      });

      toast.success("Released to Sales.");
      onDone(detail.id);
    } catch {
      // The save or the move failed; the reason is already shown and the
      // referral stays where it is.
    }
  }

  async function handleNotReferral(reason: string) {
    try {
      await move.mutateAsync({
        referralId: detail.id,
        toStatus: "not_referral",
        rowVersion: detail.row_version,
        source: "button",
        reason,
      });

      setShowNotReferral(false);
      toast.success("Marked as not a referral.");
      onDone(detail.id);
    } catch {
      // The reason is already shown; the dialog stays open.
    }
  }

  const syncedAt = acuityStatus.data?.last_run_at
    ? format(new Date(acuityStatus.data.last_run_at), "MMM d, h:mm a")
    : null;

  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-[#e6dfd3] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold text-[#1f2329]">
          Extracted by Comprehend
        </h3>

        {detail.is_urgent && (
          <span className="rounded-full bg-[#fbe5e2] px-2 py-0.5 text-[10px] font-semibold text-[#c0392b]">
            Urgent
          </span>
        )}

        {detail.duplicate_of_referral_id !== null && (
          <span
            title={`Same phone and last name as referral #${detail.duplicate_of_referral_id}`}
            className="rounded-full bg-[#eee9fb] px-2 py-0.5 text-[10px] font-semibold text-[#6b4fc8]"
          >
            Possible duplicate of #{detail.duplicate_of_referral_id}
          </span>
        )}
      </div>

      {!editable && (
        <p className="mb-3 rounded-md bg-[#fcf1dc] px-3 py-2 text-xs text-[#b7791f]">
          This referral has already left Review Required, so it can no longer be
          edited here.
        </p>
      )}

      <form
        className="flex flex-col gap-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          void handleRelease();
        }}
      >
        <Field label="Patient name" htmlFor="ir-first">
          <div className="grid grid-cols-2 gap-2">
            <input
              id="ir-first"
              aria-label="First name"
              placeholder="First name"
              value={draft.first_name}
              disabled={!editable}
              maxLength={100}
              onChange={(e) => set("first_name", e.target.value)}
              className={FIELD_CLASS}
            />
            <input
              aria-label="Last name"
              placeholder="Last name"
              value={draft.last_name}
              disabled={!editable}
              maxLength={100}
              onChange={(e) => set("last_name", e.target.value)}
              className={FIELD_CLASS}
            />
          </div>
        </Field>

        <Field label="Date of birth" htmlFor="ir-dob">
          <input
            id="ir-dob"
            type="date"
            value={draft.dob}
            disabled={!editable}
            onChange={(e) => set("dob", e.target.value)}
            className={cn(
              FIELD_CLASS,
              !draft.dob && editable && "border-[#c0392b] bg-[#fff7f6]",
            )}
          />
        </Field>

        <Field label="Phone" htmlFor="ir-phone">
          <input
            id="ir-phone"
            value={draft.phone}
            disabled={!editable}
            maxLength={20}
            onChange={(e) => set("phone", e.target.value)}
            className={FIELD_CLASS}
          />
        </Field>

        <Field label="Gender" htmlFor="ir-gender">
          <select
            id="ir-gender"
            value={draft.gender}
            disabled={!editable}
            onChange={(e) => set("gender", e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">Not stated</option>
            {draft.gender && !GENDER_OPTIONS.includes(draft.gender) && (
              <option value={draft.gender}>{draft.gender}</option>
            )}
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="PHI summary"
          hint={<>From Comprehend &ldquo;PHI Summary&rdquo; · read-only</>}
        >
          {patientSummaries.length > 0 ? (
            <div
              role="note"
              aria-label="Comprehend PHI summary"
              className="max-h-56 space-y-2.5 overflow-auto rounded-md border border-[#e6dfd3] bg-[#faf7f2] px-2.5 py-2 text-xs leading-relaxed text-[#1f2329]"
            >
              {patientSummaries.map((document) => (
                <div key={document.idx}>
                  {document.name && (
                    <div className="font-semibold text-[#6f5636]">
                      {document.name}
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{document.summary}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[#e6dfd3] px-2.5 py-2 text-xs text-[#6b6f78]">
              No summary from Comprehend.
            </div>
          )}
        </Field>

        <Field
          label="Exam 1"
          htmlFor="ir-exam1"
          hint={examHint(
            draft.exam1FaxText,
            typeById.get(draft.exam1Id),
            draft.exam1Id !== saved.exam1Id &&
              draft.exam1Id ===
                String(detail.suggestions.exam_1?.acuity_appointment_type_id ?? ""),
          )}
        >
          <select
            id="ir-exam1"
            value={draft.exam1Id}
            disabled={!editable}
            onChange={(e) => {
              set("exam1Id", e.target.value);
              set("exam1FaxText", null);

              // A reason the new exam does not offer is dropped.
              const offered =
                typeById.get(e.target.value)?.reason_options ?? [];

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
            className={cn(
              FIELD_CLASS,
              !draft.exam1Id && editable && "border-[#c0392b] bg-[#fff7f6]",
            )}
          >
            {examOptions(1)}
          </select>
        </Field>

        <Field
          label="Exam 2"
          htmlFor="ir-exam2"
          hint={examHint(
            draft.exam2FaxText,
            typeById.get(draft.exam2Id),
            draft.exam2Id !== saved.exam2Id &&
              draft.exam2Id ===
                String(detail.suggestions.exam_2?.acuity_appointment_type_id ?? ""),
          )}
        >
          <select
            id="ir-exam2"
            value={draft.exam2Id}
            disabled={!editable}
            onChange={(e) => {
              set("exam2Id", e.target.value);
              set("exam2FaxText", null);
            }}
            className={FIELD_CLASS}
          >
            {examOptions(2)}
          </select>
        </Field>

        {/* The card holds one reason, and it follows Exam 1 (each exam's
            Acuity form has its own list). Hidden when Exam 1 has none. */}
        {(!draft.exam1Id || reasonOptions.length > 0) && (
          <Field
            label="Reason for the appointment"
            htmlFor="ir-reason"
            hint={
              draft.exam1Id
                ? "The options Acuity asks for this exam."
                : "Choose Exam 1 first."
            }
          >
            <select
              id="ir-reason"
              value={draft.reason}
              disabled={!editable || !draft.exam1Id}
              onChange={(e) => set("reason", e.target.value)}
              className={FIELD_CLASS}
            >
              <option value="">Choose a reason</option>

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
          </Field>
        )}

        <Field
          label="Other reasons"
          htmlFor="ir-reason-other"
          hint={
            otherNeedsText ? (
              <span className="font-semibold text-[#c0392b]">
                Say what the &ldquo;Other&rdquo; reason is.
              </span>
            ) : (
              "Anything else about the reason for the appointment."
            )
          }
        >
          <textarea
            id="ir-reason-other"
            rows={2}
            value={draft.reason_other}
            disabled={!editable}
            maxLength={2000}
            placeholder="Write anything here"
            onChange={(e) => set("reason_other", e.target.value)}
            className={cn(
              FIELD_CLASS,
              "resize-y",
              otherNeedsText && editable && "border-[#c0392b] bg-[#fff7f6]",
            )}
          />
        </Field>

        <Field label="Referring provider" htmlFor="ir-provider">
          <input
            id="ir-provider"
            value={draft.physician_name}
            disabled={!editable}
            maxLength={255}
            onChange={(e) => set("physician_name", e.target.value)}
            className={FIELD_CLASS}
          />
        </Field>

        <Field label="Provider fax" htmlFor="ir-provider-fax">
          <input
            id="ir-provider-fax"
            value={draft.physician_fax_no}
            disabled={!editable}
            maxLength={255}
            onChange={(e) => set("physician_fax_no", e.target.value)}
            className={FIELD_CLASS}
          />
        </Field>

        <Field
          label="Clinic"
          htmlFor="ir-clinic"
          hint={
            selectedCalendar ? (
              <>
                {draft.clinicId !== saved.clinicId &&
                  draft.clinicId ===
                    String(detail.suggestions.clinic?.acuity_calendar_id ?? "") && (
                    <span className="mr-1 font-semibold text-[#c0392b]">
                      {detail.suggestions.clinic?.reason}.
                    </span>
                  )}
                {selectedCalendar.location}
                {distanceNote}
              </>
            ) : (
              <>
                No clinic on the fax. Choose one from the Acuity locations.
                {distanceNote}
              </>
            )
          }
        >
          <select
            id="ir-clinic"
            value={draft.clinicId}
            disabled={!editable}
            onChange={(e) => set("clinicId", e.target.value)}
            className={cn(
              FIELD_CLASS,
              !draft.clinicId && editable && "border-[#c0392b] bg-[#fff7f6]",
            )}
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
        </Field>

        <Field label="Patient address" htmlFor="ir-address">
          <textarea
            id="ir-address"
            rows={2}
            value={draft.address}
            disabled={!editable}
            maxLength={500}
            placeholder="Not on the fax"
            onChange={(e) => set("address", e.target.value)}
            className={cn(FIELD_CLASS, "resize-y")}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6b6f78]">
          <span className="italic">
            Exam and clinic lists come from Acuity (appointment types and
            calendars), loaded through the Command Center server.{" "}
            {syncedAt ? `Synced ${syncedAt}.` : "Not synced yet."}
          </span>

          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={refresh.isPending}
            onClick={() => refresh.mutate()}
          >
            {refresh.isPending ? "Refreshing…" : "Refresh from Acuity"}
          </Button>
        </div>

        {noAcuityData && (
          <p className="rounded-md bg-[#fcf1dc] px-3 py-2 text-xs text-[#b7791f]">
            No clinics or exams have been loaded from Acuity yet. Click
            &ldquo;Refresh from Acuity&rdquo; so they can be chosen.
          </p>
        )}

        {acuityStatus.data?.last_status === "failed" && (
          <p className="rounded-md bg-[#fbe5e2] px-3 py-2 text-xs text-[#c0392b]">
            The last Acuity sync failed: {acuityStatus.data.last_error}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-[#f0ebe2] pt-3">
          <Button
            type="submit"
            disabled={!editable || pending}
            title={
              missing.length > 0
                ? `Choose ${missing.join(" and ")} first`
                : undefined
            }
          >
            {pending ? "Working…" : "Release to Sales"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={!editable || pending}
            onClick={() => setShowNotReferral(true)}
          >
            Not a referral
          </Button>

          {dirty && editable && (
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => void handleSave()}
            >
              Save changes
            </Button>
          )}

          {missing.length > 0 && editable && (
            <span className="text-[11px] text-[#c0392b]">
              Choose {missing.join(" and ")} to release.
            </span>
          )}
        </div>
      </form>

      {showNotReferral && (
        <TextPromptDialog
          title="Not a referral"
          description="Move this fax to Not Referrals."
          label="Why is this not a referral?"
          placeholder="e.g. Lab report, marketing fax"
          multiline
          maxLength={2000}
          confirmLabel="Mark as not a referral"
          isPending={move.isPending}
          onClose={() => setShowNotReferral(false)}
          onSubmit={handleNotReferral}
        />
      )}
    </div>
  );
}
