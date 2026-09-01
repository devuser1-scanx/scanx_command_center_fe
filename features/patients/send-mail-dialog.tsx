// features/patients/send-mail-dialog.tsx

"use client";

import { useState } from "react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFaxReportLookup } from "@/features/patients/hooks/use-fax-report-lookup";
import { useSendMail } from "@/features/patients/hooks/use-send-mail";
import {
  FileSlot,
  ReportAttachmentField,
} from "@/features/patients/report-attachment-field";

type SendMailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  physicianEmail: string | null;
  patientName: string;
  dob: string | null;
  examType: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitPatientName(patientName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = patientName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = parts;

  return { firstName, lastName: rest.join(" ") };
}

/**
 * firstname_lastname_DOB_Ultrasound_Report. Falls back to omitting DOB if
 * it isn't on file.
 */
function buildMailSubject(patientName: string, dob: string | null): string {
  const namePart = patientName.trim().replace(/\s+/g, "_");

  if (!namePart) {
    return "";
  }

  const dobPart = (dob ?? "").trim();

  return dobPart
    ? `${namePart}_${dobPart}_Ultrasound_Report`
    : `${namePart}_Ultrasound_Report`;
}

// Must match SCANX_LOGO_CONTENT_ID in app/integrations/gmail_client.py -
// the backend always attaches the actual logo bytes as an inline
// Content-ID image under this same id, regardless of what's in the body,
// so this <img> tag resolves to the real ScanX animated logo once sent.
const SCANX_LOGO_CONTENT_ID = "scanx-logo";

function buildMailBodyHtml(
  patientName: string,
  dob: string | null,
  examType: string | null,
): string {
  const { firstName, lastName } = splitPatientName(patientName);

  return `
<p>Hi,</p>
<p>Thanks for your time. Please find the attached ultrasound report for the patient listed below.</p>
<p>
First Name: ${escapeHtml(firstName)}<br>
Last Name: ${escapeHtml(lastName)}<br>
DOB: ${escapeHtml((dob ?? "").trim())}<br>
Examination: ${escapeHtml((examType ?? "").trim())}
</p>
<p>Please feel free to reach out if there are any questions.</p>
<p>Regards,<br><strong>ScanX Support Team</strong></p>
<p><img src="cid:${SCANX_LOGO_CONTENT_ID}" alt="ScanX" width="165" height="60" /></p>
<p>
<a href="https://www.scanx.care">www.scanx.care</a><br>
Clinic Ph: (469) 804-6999<br>
Clinic Fax: (469) 429-7432
</p>
`.trim();
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase text-[#999999]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-[#e4ddd0] px-3 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
      />
    </div>
  );
}

export function SendMailDialog({
  open,
  onOpenChange,
  appointmentId,
  physicianEmail,
  patientName,
  dob,
  examType,
}: SendMailDialogProps) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [reportRemoved, setReportRemoved] = useState(false);
  const [lookupCancelled, setLookupCancelled] = useState(false);
  const [primaryUploadFile, setPrimaryUploadFile] = useState<File | null>(
    null,
  );
  const [secondaryUploadFile, setSecondaryUploadFile] =
    useState<File | null>(null);

  const reportLookup = useFaxReportLookup(appointmentId, open);
  const sendMailMutation = useSendMail(appointmentId);

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
      setTo(physicianEmail ?? "");
      setCc("");
      setBcc("");
      setSubject(buildMailSubject(patientName, dob));
      setBodyHtml(buildMailBodyHtml(patientName, dob, examType));
      setReportRemoved(false);
      setLookupCancelled(false);
      setPrimaryUploadFile(null);
      setSecondaryUploadFile(null);
    }
  }

  const reportFound = reportLookup.data?.found ?? false;
  const showDetectedReport = reportFound && !reportRemoved && !lookupCancelled;

  function handleSend() {
    const files = [primaryUploadFile, secondaryUploadFile].filter(
      (file): file is File => file !== null,
    );

    sendMailMutation.mutate(
      {
        to,
        cc,
        bcc,
        subject,
        bodyHtml,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <TextField
            label="To"
            value={to}
            onChange={setTo}
            placeholder="recipient@example.com"
            type="email"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="CC"
              value={cc}
              onChange={setCc}
              placeholder="Optional, comma-separated"
            />

            <TextField
              label="BCC"
              value={bcc}
              onChange={setBcc}
              placeholder="Optional, comma-separated"
            />
          </div>

          <TextField label="Subject" value={subject} onChange={setSubject} />

          <div>
            <label className="text-xs font-semibold uppercase text-[#999999]">
              Body
            </label>

            <div className="mt-1">
              <RichTextEditor
                key={String(open)}
                content={bodyHtml}
                onChange={setBodyHtml}
              />
            </div>
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
            disabled={sendMailMutation.isPending}
            className="rounded-md border border-[#e4ddd0] px-4 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:bg-[#f5f1e8] disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={sendMailMutation.isPending || !to.trim()}
            className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] disabled:pointer-events-none disabled:opacity-50"
          >
            {sendMailMutation.isPending ? "Sending…" : "Send"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
