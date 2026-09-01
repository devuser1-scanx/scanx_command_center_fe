// features/patients/send-fax-dialog.tsx

"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFaxReportLookup } from "@/features/patients/hooks/use-fax-report-lookup";
import { useSendFax } from "@/features/patients/hooks/use-send-fax";
import {
  FileSlot,
  ReportAttachmentField,
} from "@/features/patients/report-attachment-field";

type SendFaxDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  physicianFaxNo: string | null;
  patientName: string;
  examType: string | null;
};

const WESTFAX_EMAIL_DOMAIN = "westfax.com";

function buildFaxAddress(rawNumber: string | null): string {
  if (!rawNumber) {
    return "";
  }

  const digits = rawNumber.replace(/\D/g, "");

  return digits ? `${digits}@${WESTFAX_EMAIL_DOMAIN}` : "";
}

/**
 * Mirrors the backend's _build_fax_subject in app/services/fax.py:
 * "Firstname Lastname Fibroscan Report" for FibroScan / Liver Elastography,
 * "Firstname Lastname <exam type> Report" otherwise. This is only the
 * prefilled default - the user can edit it, and the backend recomputes the
 * same default itself if the field is left blank.
 */
function buildFaxSubject(patientName: string, examType: string | null): string {
  const namePart = patientName.trim();
  const type = (examType ?? "").trim();

  if (!namePart || !type) {
    return "";
  }

  const reportType = type.toLowerCase().includes("fibro") ? "Fibroscan" : type;

  return `${namePart} ${reportType} Report`;
}

export function SendFaxDialog({
  open,
  onOpenChange,
  appointmentId,
  physicianFaxNo,
  patientName,
  examType,
}: SendFaxDialogProps) {
  const [destinationAddress, setDestinationAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [reportRemoved, setReportRemoved] = useState(false);
  const [lookupCancelled, setLookupCancelled] = useState(false);
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
      setDestinationAddress(buildFaxAddress(physicianFaxNo));
      setSubject(buildFaxSubject(patientName, examType));
      setReportRemoved(false);
      setLookupCancelled(false);
      setPrimaryUploadFile(null);
      setSecondaryUploadFile(null);
    }
  }

  const reportFound = reportLookup.data?.found ?? false;
  const showDetectedReport = reportFound && !reportRemoved && !lookupCancelled;

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
        destinationNumber: destinationAddress,
        subject,
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
              htmlFor="fax-destination-address"
              className="text-xs font-semibold uppercase text-[#999999]"
            >
              Destination address
            </label>

            <input
              id="fax-destination-address"
              type="text"
              value={destinationAddress}
              onChange={(event) =>
                setDestinationAddress(event.target.value)
              }
              placeholder={`e.g. 4698006351@${WESTFAX_EMAIL_DOMAIN}`}
              className="mt-1 w-full rounded-md border border-[#e4ddd0] px-3 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
            />
          </div>

          <div>
            <label
              htmlFor="fax-subject"
              className="text-xs font-semibold uppercase text-[#999999]"
            >
              Subject
            </label>

            <input
              id="fax-subject"
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject"
              className="mt-1 w-full rounded-md border border-[#e4ddd0] px-3 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
            />
          </div>

          <ReportAttachmentField
            reportLookup={reportLookup}
            reportRemoved={reportRemoved}
            onRemoveReport={() => setReportRemoved(true)}
            lookupCancelled={lookupCancelled}
            onCancelLookup={() => setLookupCancelled(true)}
            primaryUploadFile={primaryUploadFile}
            onChoosePrimaryUploadFile={setPrimaryUploadFile}
          />

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
              !destinationAddress.trim() ||
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
