// features/calls/providers/dialer-provider.tsx

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { Call, Device } from "@twilio/voice-sdk";

import { dialCall, endCall } from "@/features/calls/api/calls-api";
import { describe as describeCallError } from "@/features/fax-portal/hooks/use-browser-call";
import { usePermission } from "@/hooks/use-permission";
import { ApiError } from "@/lib/api/api-error";
import { setCallActive, touchActivity } from "@/lib/auth/activity";
import { PERMISSIONS } from "@/lib/constants/permissions";

export type DialerStatus =
  | "idle"
  | "starting"
  | "calling"
  | "ringing"
  | "connected"
  | "ended"
  | "error";

type DialerContextValue = {
  status: DialerStatus;
  /** A call is being set up or is in progress. */
  active: boolean;
  /** The number being called (digits and "+"), empty when no call is active. */
  activeNumber: string;
  /** The last problem, shown until the next call starts or it is cleared. */
  error: string;
  muted: boolean;
  /** Seconds since the call connected. */
  seconds: number;
  lastDigit: string;
  canDial: boolean;
  /**
   * Places a call. `appointmentId` ties it to a patient's appointment. Resolves
   * to whether the call was started.
   */
  startCall: (number: string, appointmentId?: string) => Promise<boolean>;
  hangUp: () => void;
  sendDigit: (digit: string) => boolean;
  toggleMute: () => void;
  clearError: () => void;
};

const DialerContext = createContext<DialerContextValue | null>(null);

/** A phone number after removing spaces, dashes and brackets: +14155550123 or 4155550123. */
const DIAL_NUMBER = /^\+?\d{10,15}$/;
const DTMF_DIGIT = /^[0-9*#]$/;

export function cleanDialNumber(value: string): string {
  return value.replace(/[\s().-]/g, "");
}

export function isDialable(value: string): boolean {
  return DIAL_NUMBER.test(cleanDialNumber(value));
}

/**
 * The one phone call the signed-in person can have from the browser (Twilio
 * Voice SDK), kept above every page of the dashboard. A call therefore carries
 * on while they move between Command Center pages, and every page can show it
 * and hang it up (the call bar in the header).
 *
 * A call starts with the server (POST /calls/dial), which checks permission,
 * validates the number, and hands back a call id and a short-lived token. The
 * browser connects to Twilio with those, through the Web Dialer's TwiML App, so
 * the Web Dialer service dials and logs the call. When the call ends the browser
 * reports it (POST /calls/{id}/ended). The SDK is loaded when a call starts,
 * never on the server.
 */
export function DialerProvider({ children }: { children: ReactNode }) {
  const { hasPermission } = usePermission();
  const canDial = hasPermission(PERMISSIONS.CALLS_CREATE);

  const [status, setStatus] = useState<DialerStatus>("idle");
  const [activeNumber, setActiveNumber] = useState("");
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [lastDigit, setLastDigit] = useState("");
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const liveRef = useRef(false);
  // The Command Center call being placed, whether the browser got as far as
  // Twilio, and when the call connected - for the report when it ends.
  const callIdRef = useRef<number | null>(null);
  const reachedTwilioRef = useRef(false);
  const connectedAtRef = useRef<number | null>(null);

  // Ticks only while a call is connected, for the running time.
  useEffect(() => {
    if (connectedAt === null) {
      return;
    }

    const interval = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(interval);
  }, [connectedAt]);

  const release = useCallback(() => {
    deviceRef.current?.destroy();
    deviceRef.current = null;
    callRef.current = null;

    // The call is over: the idle timeout counts from now.
    setCallActive(false);
    touchActivity();
  }, []);

  const finish = useCallback(
    (problem: string | null = null) => {
      // Twilio can report the end of a call more than once.
      if (!liveRef.current) {
        return;
      }

      liveRef.current = false;
      release();

      // Tell the server how the call ended: it keeps its own record, and drops a
      // call that never reached Twilio.
      const callId = callIdRef.current;

      if (callId !== null) {
        const seconds =
          connectedAtRef.current === null
            ? 0
            : Math.max(0, Math.floor((Date.now() - connectedAtRef.current) / 1000));

        void endCall(callId, reachedTwilioRef.current, seconds).catch(() => undefined);
      }

      callIdRef.current = null;
      connectedAtRef.current = null;
      setMuted(false);
      setConnectedAt(null);
      setActiveNumber("");
      setLastDigit("");

      if (problem) {
        setError(problem);
        setStatus("error");
        // The person may be on another page: say so wherever they are.
        toast.error(problem);
      } else {
        setStatus("ended");
      }
    },
    [release],
  );

  // Signing out or closing the dashboard must not leave a call open.
  useEffect(() => release, [release]);

  const startCall = useCallback(
    async (number: string, appointmentId?: string): Promise<boolean> => {
      if (liveRef.current) {
        return false;
      }

      if (!canDial) {
        setError("You do not have permission to place calls.");
        return false;
      }

      const to = cleanDialNumber(number);

      if (!DIAL_NUMBER.test(to)) {
        setError("Enter a valid phone number, for example +14155550123.");
        setStatus("error");
        return false;
      }

      liveRef.current = true;
      callIdRef.current = null;
      reachedTwilioRef.current = false;
      connectedAtRef.current = null;
      setError("");
      setLastDigit("");
      setActiveNumber(to);
      setStatus("starting");
      // Talking to a patient is not being idle: no automatic sign-out mid-call.
      setCallActive(true);

      try {
        const dial = await dialCall(to, appointmentId);
        callIdRef.current = dial.call_id;

        const { Call: CallClass, Device: DeviceClass } = await import(
          "@twilio/voice-sdk"
        );

        const device = new DeviceClass(dial.token, {
          closeProtection: true,
          codecPreferences: [CallClass.Codec.Opus, CallClass.Codec.PCMU],
        });
        deviceRef.current = device;

        // Token and connection problems are reported on the device.
        device.on("error", (deviceError) => finish(describeCallError(deviceError)));

        setStatus("calling");

        // The Web Dialer's TwiML App sends these to the Web Dialer service,
        // which dials `to` and logs the call. `CcCallId` ties that record to
        // Command Center's own (the service keeps it with the call's events).
        const params: Record<string, string> = {
          to: dial.to,
          CcCallId: String(dial.call_id),
        };

        if (appointmentId) {
          params.appointment_id = appointmentId;
        }

        const call = await device.connect({ params });
        callRef.current = call;
        reachedTwilioRef.current = true;

        call.on("ringing", () => setStatus("ringing"));

        call.on("accept", () => {
          connectedAtRef.current = Date.now();
          setStatus("connected");
          setConnectedAt(Date.now());
        });

        call.on("disconnect", () => finish());
        call.on("cancel", () => finish());
        call.on("reject", () => finish());
        call.on("error", (callError) => finish(describeCallError(callError)));

        return true;
      } catch (startError) {
        if (startError instanceof ApiError) {
          // Our own API said no (not permitted, already on a call, not set up).
          finish(
            startError.status === 403
              ? "You do not have permission to place calls."
              : startError.message,
          );
        } else {
          finish(describeCallError(startError));
        }

        return false;
      }
    },
    [canDial, finish],
  );

  const hangUp = useCallback(() => {
    if (callRef.current) {
      callRef.current.disconnect();
    } else {
      finish();
    }
  }, [finish]);

  const sendDigit = useCallback((digit: string): boolean => {
    const call = callRef.current;

    if (!call || !DTMF_DIGIT.test(digit) || call.status() !== "open") {
      return false;
    }

    call.sendDigits(digit);
    setLastDigit(digit);

    return true;
  }, []);

  const toggleMute = useCallback(() => {
    const call = callRef.current;

    if (!call) {
      return;
    }

    const next = !call.isMuted();
    call.mute(next);
    setMuted(next);
  }, []);

  const clearError = useCallback(() => {
    setError("");
    setStatus((current) => (current === "error" ? "idle" : current));
  }, []);

  const active =
    status === "starting" ||
    status === "calling" ||
    status === "ringing" ||
    status === "connected";

  const seconds =
    connectedAt === null ? 0 : Math.max(0, Math.floor((now - connectedAt) / 1000));

  const value = useMemo<DialerContextValue>(
    () => ({
      status,
      active,
      activeNumber,
      error,
      muted,
      seconds,
      lastDigit,
      canDial,
      startCall,
      hangUp,
      sendDigit,
      toggleMute,
      clearError,
    }),
    [
      status,
      active,
      activeNumber,
      error,
      muted,
      seconds,
      lastDigit,
      canDial,
      startCall,
      hangUp,
      sendDigit,
      toggleMute,
      clearError,
    ],
  );

  return <DialerContext.Provider value={value}>{children}</DialerContext.Provider>;
}

export function useDialer(): DialerContextValue {
  const context = useContext(DialerContext);

  if (!context) {
    throw new Error("useDialer must be used inside DialerProvider.");
  }

  return context;
}
