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
import { useSendSms } from "@/features/patients/hooks/use-send-sms";
import { useSmsPrefill } from "@/features/patients/hooks/use-sms-prefill";

export type SmsPurpose = "ask_for_review" | "directions";

type SendSmsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  purpose: SmsPurpose;
  patientName: string;
  patientPhone: string | null;
};

function firstNameOf(patientName: string): string {
  return patientName.trim().split(/\s+/)[0] || "there";
}

function buildAskForReviewBody(patientName: string): string {
  return `Hi ${firstNameOf(patientName)}, thank you for choosing ScanX! We'd really appreciate it if you could leave us a quick review: [insert your Google review link]`;
}

function buildDirectionsBody(
  patientName: string,
  directionsLink: string | null,
): string {
  const link = directionsLink ?? "[directions link not available for this clinic]";

  return `Hi ${firstNameOf(patientName)}, here are directions to our clinic: ${link}`;
}

const PURPOSE_TITLE: Record<SmsPurpose, string> = {
  ask_for_review: "Ask for review",
  directions: "Send directions",
};

export function SendSmsDialog({
  open,
  onOpenChange,
  appointmentId,
  purpose,
  patientName,
  patientPhone,
}: SendSmsDialogProps) {
  const [destinationNumber, setDestinationNumber] = useState("");
  const [body, setBody] = useState<string | null>(null);

  const smsPrefill = useSmsPrefill(
    appointmentId,
    open && purpose === "directions",
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

  const defaultBody =
    purpose === "ask_for_review"
      ? buildAskForReviewBody(patientName)
      : buildDirectionsBody(patientName, smsPrefill.data?.directionsLink ?? null);

  const displayedBody = body ?? defaultBody;

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
              !displayedBody.trim()
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
