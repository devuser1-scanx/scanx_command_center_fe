// features/patients/send-fax-dialog.tsx

"use client";

import { useRef, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFaxReportLookup } from "@/features/patients/hooks/use-fax-report-lookup";
import { useSendFax } from "@/features/patients/hooks/use-send-fax";

type SendFaxDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  physicianFaxNo: string | null;
};

const MAX_DISPLAY_FILE_NAME_LENGTH = 32;

/**
 * Shortens a filename for display only - never used for the actual upload,
 * which always keeps the real File object/name. Keeps the extension
 * visible so the file type is still obvious once truncated.
 */
function truncateDisplayFileName(
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

function FileSlot({
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

export function SendFaxDialog({
  open,
  onOpenChange,
  appointmentId,
  physicianFaxNo,
}: SendFaxDialogProps) {
  const [destinationNumber, setDestinationNumber] = useState("");
  const [reportRemoved, setReportRemoved] = useState(false);
  const [primaryUploadFile, setPrimaryUploadFile] = useState<File | null>(
    null,
  );
  const [secondaryUploadFile, setSecondaryUploadFile] =
    useState<File | null>(null);

  const reportLookup = useFaxReportLookup(appointmentId, open);
  const sendFaxMutation = useSendFax(appointmentId);

  /**
   * Reset the form each time the dialog transitions to open.
   *
   * Adjusted during render (rather than in a useEffect) per React's
   * guidance for resetting state when a prop changes - see
   * https://react.dev/learn/you-might-not-need-an-effect
   */
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setDestinationNumber(physicianFaxNo ?? "");
      setReportRemoved(false);
      setPrimaryUploadFile(null);
      setSecondaryUploadFile(null);
    }
  }

  const reportFound = reportLookup.data?.found ?? false;
  const showDetectedReport = reportFound && !reportRemoved;

  const hasAttachment =
    showDetectedReport ||
    primaryUploadFile !== null ||
    secondaryUploadFile !== null;

  function handleSend() {
    const files = [primaryUploadFile, secondaryUploadFile].filter(
      (file): file is File => file !== null,
    );

    sendFaxMutation.mutate(
      {
        destinationNumber,
        includeReport: showDetectedReport,
        files,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send fax</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="fax-destination-number"
              className="text-xs font-semibold uppercase text-[#999999]"
            >
              Destination number
            </label>

            <input
              id="fax-destination-number"
              type="tel"
              value={destinationNumber}
              onChange={(event) =>
                setDestinationNumber(event.target.value)
              }
              placeholder="Enter a fax number"
              className="mt-1 w-full rounded-md border border-[#e4ddd0] px-3 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
            />
          </div>

          {reportLookup.isLoading ? (
            <div>
              <p className="text-xs font-semibold uppercase text-[#999999]">
                Report
              </p>

              <p className="mt-1 text-sm text-[#777777]">
                Checking for a report…
              </p>
            </div>
          ) : showDetectedReport ? (
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
                  onClick={() => setReportRemoved(true)}
                  className="shrink-0 text-xs font-semibold text-[#8b6f47] hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <FileSlot
              label="Report"
              file={primaryUploadFile}
              onChoose={setPrimaryUploadFile}
              onRemove={() => setPrimaryUploadFile(null)}
            />
          )}

          <FileSlot
            label="Additional file (optional)"
            file={secondaryUploadFile}
            onChoose={setSecondaryUploadFile}
            onRemove={() => setSecondaryUploadFile(null)}
          />
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={sendFaxMutation.isPending}
            className="rounded-md border border-[#e4ddd0] px-4 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:bg-[#f5f1e8] disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={
              sendFaxMutation.isPending ||
              !destinationNumber.trim() ||
              !hasAttachment
            }
            className="rounded-md bg-[#8b6f47] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f5636] disabled:pointer-events-none disabled:opacity-50"
          >
            {sendFaxMutation.isPending ? "Sending…" : "Send"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
