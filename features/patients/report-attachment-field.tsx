// features/patients/report-attachment-field.tsx

"use client";

import { useRef } from "react";

import type { FaxReportLookupResult } from "@/features/patients/api/patients-api";
import type { UseQueryResult } from "@tanstack/react-query";

const MAX_DISPLAY_FILE_NAME_LENGTH = 32;

/**
 * Shortens a filename for display only - never used for the actual upload,
 * which always keeps the real File object/name. Keeps the extension
 * visible so the file type is still obvious once truncated.
 */
export function truncateDisplayFileName(
  name: string,
  maxLength = MAX_DISPLAY_FILE_NAME_LENGTH,
): string {
  if (name.length <= maxLength) {
    return name;
  }

  const lastDotIndex = name.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0 && lastDotIndex < name.length - 1;
  const extension = hasExtension ? name.slice(lastDotIndex) : "";
  const baseName = hasExtension ? name.slice(0, lastDotIndex) : name;

  const keepLength = Math.max(maxLength - extension.length - 1, 1);

  return `${baseName.slice(0, keepLength)}…${extension}`;
}

export function FileSlot({
  label,
  file,
  onChoose,
  onRemove,
}: {
  label: string;
  file: File | null;
  onChoose: (file: File | null) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-[#999999]">
        {label}
      </p>

      <div className="mt-1 flex items-center justify-between gap-2 rounded-md border border-[#e4ddd0] px-3 py-2">
        <span
          className="min-w-0 truncate text-sm text-[#999999]"
          title={file?.name}
        >
          {file ? truncateDisplayFileName(file.name) : "No file chosen"}
        </span>

        {file ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-xs font-semibold text-[#8b6f47] hover:underline"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-md bg-[#f5f1e8] px-3 py-1 text-xs font-semibold text-[#2d2d2d] transition hover:bg-[#e4ddd0]"
          >
            Choose File
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          onChange={(event) => {
            onChoose(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
          className="hidden"
        />
      </div>
    </div>
  );
}

type ReportAttachmentFieldProps = {
  reportLookup: UseQueryResult<FaxReportLookupResult, Error>;
  reportRemoved: boolean;
  onRemoveReport: () => void;
  lookupCancelled: boolean;
  onCancelLookup: () => void;
  primaryUploadFile: File | null;
  onChoosePrimaryUploadFile: (file: File | null) => void;
};

/**
 * The "Report" slot shared by the fax and mail popups: shows a loading
 * state (cancellable) while checking, the auto-detected report as a
 * removable chip if found, or a manual upload control if not found /
 * removed / the lookup was cancelled.
 */
export function ReportAttachmentField({
  reportLookup,
  reportRemoved,
  onRemoveReport,
  lookupCancelled,
  onCancelLookup,
  primaryUploadFile,
  onChoosePrimaryUploadFile,
}: ReportAttachmentFieldProps) {
  const reportFound = reportLookup.data?.found ?? false;
  const showDetectedReport = reportFound && !reportRemoved && !lookupCancelled;

  if (reportLookup.isLoading && !lookupCancelled) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase text-[#999999]">
          Report
        </p>

        <div className="mt-1 flex items-center justify-between gap-2 rounded-md border border-[#e4ddd0] px-3 py-2">
          <span className="text-sm text-[#777777]">
            Checking for a report…
          </span>

          <button
            type="button"
            onClick={onCancelLookup}
            aria-label="Cancel checking for a report"
            className="shrink-0 rounded-md p-1 text-[#999999] transition hover:bg-[#f5f1e8] hover:text-[#2d2d2d]"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (showDetectedReport) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase text-[#999999]">
          Report
        </p>

        <div className="mt-1 flex items-center justify-between gap-2 rounded-md border border-[#e4ddd0] bg-[#fbfaf7] px-3 py-2">
          <span
            className="min-w-0 truncate text-sm text-[#2d2d2d]"
            title={reportLookup.data?.fileName ?? undefined}
          >
            {reportLookup.data?.fileName
              ? truncateDisplayFileName(reportLookup.data.fileName)
              : null}
          </span>

          <button
            type="button"
            onClick={onRemoveReport}
            className="shrink-0 text-xs font-semibold text-[#8b6f47] hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <FileSlot
      label="Report"
      file={primaryUploadFile}
      onChoose={onChoosePrimaryUploadFile}
      onRemove={() => onChoosePrimaryUploadFile(null)}
    />
  );
}
