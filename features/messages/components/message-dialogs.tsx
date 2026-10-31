// features/messages/components/message-dialogs.tsx

"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMessagesActions } from "@/features/messages/hooks/use-messages-actions";
import { useInboxCatalog } from "@/features/messages/hooks/use-messages-queries";
import type { CatalogOption } from "@/features/messages/types/messages-types";
import { cn } from "@/lib/utils";

const fieldClasses =
  "h-11 w-full rounded-md border border-[#dddddd] bg-white px-3 text-sm text-[#2d2d2d] outline-none transition-[border-color,box-shadow] placeholder:text-[#aaaaaa] focus:border-[#8b6f47] focus:ring-4 focus:ring-[#8b6f47]/15 disabled:cursor-not-allowed disabled:bg-[#f5f5f5]";

const labelClasses =
  "mb-1.5 block text-xs font-semibold uppercase text-[#999999]";

type DialogProps = {
  onClose: () => void;
  /** Called with the conversation the message went to, so it can be opened. */
  onSent: (conversationId: string) => void;
};

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClasses}>
        {label} <span className="text-[#cc3333]">*</span>
      </label>
      {hint ? <p className="mb-1.5 text-xs text-[#999999]">{hint}</p> : null}
      {children}
    </div>
  );
}

function OptionsSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: CatalogOption[];
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClasses}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

type FormDialogProps = {
  title: string;
  description: string;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
};

/** The shell every send form shares: title, fields, an error line and Cancel / Send. */
function FormDialog({
  title,
  description,
  submitLabel,
  pending,
  error,
  onSubmit,
  onClose,
  children,
}: FormDialogProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <DialogContent showClose={!pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {children}

          {error ? (
            <p role="alert" className="text-sm font-semibold text-[#cc3333]">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-[#8b6f47] text-white hover:bg-[#6f5636]"
            >
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const PHONE_HINT = "Enter the phone number with the country code.";

// ---------------------------------------------------------------------
// New conversation
// ---------------------------------------------------------------------

export function NewConversationDialog({ onClose, onSent }: DialogProps) {
  const { start } = useMessagesActions();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!phone.trim()) {
      setError("Please enter a phone number.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setError(null);

    try {
      const sent = await start.mutateAsync({ phone, message });
      onSent(sent.conversation_id);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <FormDialog
      title="New conversation"
      description="Send a patient their first message (RCS, or SMS when RCS isn't available)."
      submitLabel="Send"
      pending={start.isPending}
      error={error}
      onSubmit={() => void submit()}
      onClose={onClose}
    >
      <Field label="Phone number" htmlFor="new-conv-phone" hint={PHONE_HINT}>
        <input
          id="new-conv-phone"
          type="tel"
          value={phone}
          disabled={start.isPending}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+14695550100"
          autoFocus
          className={fieldClasses}
        />
      </Field>

      <Field label="Message" htmlFor="new-conv-message">
        <textarea
          id="new-conv-message"
          value={message}
          disabled={start.isPending}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={1600}
          rows={4}
          placeholder="Type your first message…"
          className={cn(fieldClasses, "h-auto resize-none py-2")}
        />
      </Field>
    </FormDialog>
  );
}

// ---------------------------------------------------------------------
// Exam RCS card
// ---------------------------------------------------------------------

export function RcsCardDialog({ onClose, onSent }: DialogProps) {
  const catalog = useInboxCatalog();
  const { rcsCard } = useMessagesActions();

  const [exam, setExam] = useState("");
  const [title, setTitle] = useState("");
  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = rcsCard.isPending;

  async function submit() {
    if (!exam || !title || !patientName.trim() || !doctorName.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);

    try {
      const sent = await rcsCard.mutateAsync({
        exam,
        title,
        patientName: patientName.trim(),
        doctorName: doctorName.trim(),
        patientPhone: phone,
      });
      onSent(sent.conversation_id);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <FormDialog
      title="Send RCS card"
      description="Send a patient a predefined exam booking card."
      submitLabel="Send card"
      pending={busy}
      error={error ?? (catalog.isError ? catalog.error.message : null)}
      onSubmit={() => void submit()}
      onClose={onClose}
    >
      <Field label="Exam type" htmlFor="rcs-exam">
        <OptionsSelect
          id="rcs-exam"
          value={exam}
          onChange={setExam}
          options={catalog.data?.rcs_exams ?? []}
          placeholder={catalog.isLoading ? "Loading…" : "Select exam…"}
          disabled={busy}
        />
      </Field>

      <div className="grid grid-cols-[6rem_1fr] gap-3">
        <Field label="Title" htmlFor="rcs-title">
          <OptionsSelect
            id="rcs-title"
            value={title}
            onChange={setTitle}
            options={(catalog.data?.titles ?? []).map((value) => ({
              value,
              label: value,
            }))}
            placeholder="--"
            disabled={busy}
          />
        </Field>

        <Field label="Patient name" htmlFor="rcs-patient-name">
          <input
            id="rcs-patient-name"
            value={patientName}
            disabled={busy}
            onChange={(event) => setPatientName(event.target.value)}
            placeholder="e.g. John Smith"
            maxLength={100}
            className={fieldClasses}
          />
        </Field>
      </div>

      <Field label="Doctor name" htmlFor="rcs-doctor-name">
        <input
          id="rcs-doctor-name"
          value={doctorName}
          disabled={busy}
          onChange={(event) => setDoctorName(event.target.value)}
          placeholder="e.g. Dr. Sarah Johnson"
          maxLength={100}
          className={fieldClasses}
        />
      </Field>

      <Field label="Patient phone number" htmlFor="rcs-phone" hint={PHONE_HINT}>
        <input
          id="rcs-phone"
          type="tel"
          value={phone}
          disabled={busy}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+14695550100"
          className={fieldClasses}
        />
      </Field>
    </FormDialog>
  );
}

// ---------------------------------------------------------------------
// Missed-call card
// ---------------------------------------------------------------------

export function MissedCallCardDialog({ onClose, onSent }: DialogProps) {
  const catalog = useInboxCatalog();
  const { missedCallCard } = useMessagesActions();

  const [language, setLanguage] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = missedCallCard.isPending;

  async function submit() {
    if (!language || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);

    try {
      const sent = await missedCallCard.mutateAsync({ phone, language });
      onSent(sent.conversation_id);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <FormDialog
      title="Send missed call card"
      description="Send a patient a predefined “we missed your call” card."
      submitLabel="Send card"
      pending={busy}
      error={error ?? (catalog.isError ? catalog.error.message : null)}
      onSubmit={() => void submit()}
      onClose={onClose}
    >
      <Field label="Language" htmlFor="missed-call-language">
        <OptionsSelect
          id="missed-call-language"
          value={language}
          onChange={setLanguage}
          options={catalog.data?.languages ?? []}
          placeholder={catalog.isLoading ? "Loading…" : "Select language…"}
          disabled={busy}
        />
      </Field>

      <Field label="Patient phone number" htmlFor="missed-call-phone" hint={PHONE_HINT}>
        <input
          id="missed-call-phone"
          type="tel"
          value={phone}
          disabled={busy}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+14695550100"
          className={fieldClasses}
        />
      </Field>
    </FormDialog>
  );
}

// ---------------------------------------------------------------------
// Generic sales card
// ---------------------------------------------------------------------

export function GenericSalesCardDialog({ onClose, onSent }: DialogProps) {
  const catalog = useInboxCatalog();
  const { genericSalesCard } = useMessagesActions();

  const [exam, setExam] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const busy = genericSalesCard.isPending;

  async function submit() {
    if (!exam || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);

    try {
      const sent = await genericSalesCard.mutateAsync({ phone, exam });
      onSent(sent.conversation_id);
    } catch (failure) {
      setError((failure as Error).message);
    }
  }

  return (
    <FormDialog
      title="Send generic sales card"
      description="Send a patient a generic booking card for an exam type."
      submitLabel="Send card"
      pending={busy}
      error={error ?? (catalog.isError ? catalog.error.message : null)}
      onSubmit={() => void submit()}
      onClose={onClose}
    >
      <Field label="Exam type" htmlFor="generic-sales-exam">
        <OptionsSelect
          id="generic-sales-exam"
          value={exam}
          onChange={setExam}
          options={catalog.data?.generic_sales_exams ?? []}
          placeholder={catalog.isLoading ? "Loading…" : "Select exam…"}
          disabled={busy}
        />
      </Field>

      <Field label="Patient phone number" htmlFor="generic-sales-phone" hint={PHONE_HINT}>
        <input
          id="generic-sales-phone"
          type="tel"
          value={phone}
          disabled={busy}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+14695550100"
          className={fieldClasses}
        />
      </Field>
    </FormDialog>
  );
}
