// features/patients/send-sms-dialog.tsx

"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReportLink } from "@/features/patients/hooks/use-report-link";
import { useRescheduleLink } from "@/features/patients/hooks/use-reschedule-link";
import { useSendSms } from "@/features/patients/hooks/use-send-sms";
import { useSmsPrefill } from "@/features/patients/hooks/use-sms-prefill";

export type SmsPurpose =
  | "ask_for_review"
  | "directions"
  | "report"
  | "payment_link"
  | "waiting"
  | "reschedule";

type SendSmsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  purpose: SmsPurpose;
  patientName: string;
  patientPhone: string | null;
  paymentLink: string | null;
  clinicName: string | null;
};

function firstNameOf(patientName: string): string {
  return patientName.trim().split(/\s+/)[0] || "there";
}

function buildAskForReviewBody(
  patientName: string,
  googleReviewLink: string | null,
): string {
  const link = googleReviewLink ?? "[Google review link not available for this clinic]";

  return `Hi ${firstNameOf(patientName)}, thank you for choosing ScanX! We'd really appreciate it if you could leave us a quick review: ${link}`;
}

function buildDirectionsBody(
  clinicName: string | null,
  directionsLink: string | null,
): string {
  const location = clinicName ?? "ScanX";
  const link = directionsLink ?? "[directions link not available for this clinic]";

  return `${location}: ${link}`;
}

function buildReportBody(reportUrl: string | null): string {
  const link = reportUrl ?? "[report link not available yet]";

  return (
    "You can securely download your report using the button below.\n\n" +
    "Please review this report with your primary care provider or " +
    "referring clinician, who can explain the findings in the context " +
    "of your medical history.\n\n" +
    "📝 Note: Report download will expire in 7 days for security.\n\n" +
    link
  );
}

function buildPaymentLinkBody(
  patientName: string,
  paymentLink: string | null,
): string {
  const link = paymentLink ?? "[payment link not available for this appointment]";

  return `Hi ${firstNameOf(patientName)}, here's the payment link for your ScanX appointment: ${link}`;
}

function buildRescheduleBody(
  patientName: string,
  rescheduleUrl: string | null,
): string {
  const link = rescheduleUrl ?? "[reschedule link not available yet]";

  return `Hi ${firstNameOf(patientName)}, if you need to reschedule your ScanX appointment, you can do so here: ${link}`;
}

// Not personalized by name on purpose - it's a fixed front-desk template
// addressed generically, matching how it's used today.
const WAITING_BODY =
  "Hi, this is ScanX Health. We’re looking forward to seeing you today! " +
  "Have you arrived for your appointment yet? Once you get here, please " +
  "use the check-in link to let your sonographer know you've arrived. " +
  "If you're running a little behind, no worries, just send us your " +
  "estimated arrival time so we can plan accordingly and make your visit " +
  "as smooth as possible. Thank you, and we’ll see you soon!";

const PURPOSE_TITLE: Record<SmsPurpose, string> = {
  ask_for_review: "Ask for review",
  directions: "Send directions",
  report: "Text report link",
  payment_link: "Text payment link",
  waiting: "Text waiting message",
  reschedule: "Text reschedule link",
};

export function SendSmsDialog({
  open,
  onOpenChange,
  appointmentId,
  purpose,
  patientName,
  patientPhone,
  paymentLink,
  clinicName,
}: SendSmsDialogProps) {
  const [destinationNumber, setDestinationNumber] = useState("");
  const [body, setBody] = useState<string | null>(null);

  const smsPrefill = useSmsPrefill(
    appointmentId,
    open && (purpose === "directions" || purpose === "ask_for_review"),
  );
  const reportLink = useReportLink(appointmentId, open && purpose === "report");
  const rescheduleLink = useRescheduleLink(
    appointmentId,
    open && purpose === "reschedule",
  );
  const sendSmsMutation = useSendSms(appointmentId);

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
      setDestinationNumber(patientPhone ?? "");
      // null means "show the computed default" - the directions link isn't
      // known yet on this first render, so the default is recomputed below
      // from smsPrefill.data on every render until the user actually edits
      // the field (at which point `body` becomes non-null and wins).
      setBody(null);
    }
  }

  let defaultBody: string;

  switch (purpose) {
    case "ask_for_review":
      defaultBody = buildAskForReviewBody(
        patientName,
        smsPrefill.data?.googleReviewLink ?? null,
      );
      break;
    case "report":
      defaultBody = buildReportBody(reportLink.data?.url ?? null);
      break;
    case "payment_link":
      defaultBody = buildPaymentLinkBody(patientName, paymentLink);
      break;
    case "waiting":
      defaultBody = WAITING_BODY;
      break;
    case "directions":
      defaultBody = buildDirectionsBody(
        clinicName,
        smsPrefill.data?.directionsLink ?? null,
      );
      break;
    case "reschedule":
      defaultBody = buildRescheduleBody(
        patientName,
        rescheduleLink.data?.url ?? null,
      );
      break;
  }

  const displayedBody = body ?? defaultBody;

  const reportLinkUnavailable =
    purpose === "report" && (reportLink.isPending || reportLink.isError);

  const rescheduleLinkUnavailable =
    purpose === "reschedule" &&
    (rescheduleLink.isPending || rescheduleLink.isError);

  function handleSend() {
    sendSmsMutation.mutate(
      {
        purpose,
        destinationNumber,
        body: displayedBody,
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
          <DialogTitle>{PURPOSE_TITLE[purpose]}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="sms-destination-number"
              className="text-xs font-semibold uppercase text-[#999999]"
            >
              To
            </label>

            <input
              id="sms-destination-number"
              type="tel"
              value={destinationNumber}
              onChange={(event) => setDestinationNumber(event.target.value)}
              placeholder="e.g. (469) 800-6351"
              className="mt-1 w-full rounded-md border border-[#e4ddd0] px-3 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
            />
          </div>

          <div>
            <label
              htmlFor="sms-body"
              className="text-xs font-semibold uppercase text-[#999999]"
            >
              Message
            </label>

            <textarea
              id="sms-body"
              value={displayedBody}
              onChange={(event) => setBody(event.target.value)}
              rows={5}
              placeholder="Write your message…"
              className="mt-1 w-full resize-y rounded-md border border-[#e4ddd0] px-3 py-2 text-sm text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
            />

            <div className="mt-1 text-right text-xs text-[#999999]">
              {displayedBody.length} characters
            </div>

            {purpose === "report" && reportLink.isPending && (
              <div className="mt-1 text-xs text-[#999999]">
                Generating a download link…
              </div>
            )}

            {purpose === "report" && reportLink.isError && (
              <div className="mt-1 text-xs text-[#be123c]">
                {reportLink.error.message}
              </div>
            )}

            {purpose === "reschedule" && rescheduleLink.isPending && (
              <div className="mt-1 text-xs text-[#999999]">
                Generating a reschedule link…
              </div>
            )}

            {purpose === "reschedule" && rescheduleLink.isError && (
              <div className="mt-1 text-xs text-[#be123c]">
                {rescheduleLink.error.message}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={sendSmsMutation.isPending}
            className="rounded-md border border-[#e4ddd0] px-4 py-2 text-sm font-semibold text-[#2d2d2d] transition hover:bg-[#f5f1e8] disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={
              sendSmsMutation.isPending ||
              !destinationNumber.trim() ||
              !displayedBody.trim() ||
              reportLinkUnavailable ||
              rescheduleLinkUnavailable
            }
            className="rounded-md bg-[#0891b2] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0e7490] disabled:pointer-events-none disabled:opacity-50"
          >
            {sendSmsMutation.isPending ? "Sending…" : "Send"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
