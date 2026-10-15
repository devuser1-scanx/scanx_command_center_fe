// features/fax-portal/board/board-dialogs.tsx

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { FaxPortalAgent } from "@/features/fax-portal/types/fax-portal-types";

/**
 * Small modal shell matching components/shared/confirm-dialog.tsx.
 */
function DialogShell({
  title,
  description,
  isPending,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  isPending: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
        aria-label={title}
        className="w-full max-w-md rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-[#2d2d2d]">{title}</h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-[#666666]">{description}</p>
        )}

        {children}
      </div>
    </div>
  );
}

function DialogActions({
  confirmLabel,
  isPending,
  disabled,
  onCancel,
}: {
  confirmLabel: string;
  isPending: boolean;
  disabled?: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="mt-6 flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={onCancel}
      >
        Cancel
      </Button>

      <Button type="submit" disabled={isPending || disabled}>
        {isPending ? "Working…" : confirmLabel}
      </Button>
    </div>
  );
}

type TextPromptDialogProps = {
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  confirmLabel: string;
  isPending: boolean;
  onSubmit: (value: string) => void;
  onClose: () => void;
};

/**
 * Asks for one required piece of text: the "not a referral" reason, the
 * reopen note, or the Acuity appointment id.
 */
export function TextPromptDialog({
  title,
  description,
  label,
  placeholder,
  multiline = false,
  maxLength,
  confirmLabel,
  isPending,
  onSubmit,
  onClose,
}: TextPromptDialogProps) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();

  const fieldClass =
    "mt-1 w-full rounded-md border border-[#dddddd] bg-white px-3 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]";

  return (
    <DialogShell
      title={title}
      description={description}
      isPending={isPending}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (trimmed) {
            onSubmit(trimmed);
          }
        }}
      >
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[#6b6f78]">
          {label}

          {multiline ? (
            <textarea
              autoFocus
              value={value}
              maxLength={maxLength}
              placeholder={placeholder}
              onChange={(event) => setValue(event.target.value)}
              rows={3}
              className={fieldClass}
            />
          ) : (
            <input
              autoFocus
              value={value}
              maxLength={maxLength}
              placeholder={placeholder}
              onChange={(event) => setValue(event.target.value)}
              className={fieldClass}
            />
          )}
        </label>

        <DialogActions
          confirmLabel={confirmLabel}
          isPending={isPending}
          disabled={!trimmed}
          onCancel={onClose}
        />
      </form>
    </DialogShell>
  );
}

type ReassignDialogProps = {
  patientName: string;
  currentUserId: number | null;
  agents: FaxPortalAgent[];
  isLoadingAgents: boolean;
  isPending: boolean;
  onSubmit: (assignedUserId: number | null) => void;
  onClose: () => void;
};

export function ReassignDialog({
  patientName,
  currentUserId,
  agents,
  isLoadingAgents,
  isPending,
  onSubmit,
  onClose,
}: ReassignDialogProps) {
  const [selected, setSelected] = useState<string>(
    currentUserId === null ? "" : String(currentUserId),
  );

  const unchanged =
    (selected === "" ? null : Number(selected)) === currentUserId;

  return (
    <DialogShell
      title="Reassign referral"
      description={`Choose who works ${patientName}.`}
      isPending={isPending}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(selected === "" ? null : Number(selected));
        }}
      >
        <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-[#6b6f78]">
          Sales agent
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            disabled={isLoadingAgents}
            className="mt-1 w-full rounded-md border border-[#dddddd] bg-white px-3 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
          >
            <option value="">Unassigned</option>

            {agents.map((agent) => (
              <option key={agent.user_id} value={agent.user_id}>
                {agent.name}
                {agent.accepting_new ? "" : " (not taking new cards)"}
              </option>
            ))}
          </select>
        </label>

        {!isLoadingAgents && agents.length === 0 && (
          <p className="mt-2 text-xs text-[#b7791f]">
            No sales agents are set up yet.
          </p>
        )}

        <DialogActions
          confirmLabel="Reassign"
          isPending={isPending}
          disabled={unchanged}
          onCancel={onClose}
        />
      </form>
    </DialogShell>
  );
}
