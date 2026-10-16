// features/fax-portal/hooks/use-browser-call.ts

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Call, Device } from "@twilio/voice-sdk";

import { setCallActive, touchActivity } from "@/lib/auth/activity";

export type BrowserCallState =
  | "idle"
  | "starting"
  | "connecting"
  | "ringing"
  | "connected"
  | "ended";

/** Twilio's error code for "the user refused microphone access". */
const MICROPHONE_DENIED = 31208;

/** Token problems: the API key, its secret or the TwiML App do not match the account. */
const TOKEN_REJECTED = new Set([20101, 20102, 20104, 31204, 31205, 31206]);

export class BrowserCallError extends Error {}

function describe(error: unknown): string {
  const code = (error as { code?: number } | null)?.code;

  if (code === MICROPHONE_DENIED) {
    return "Allow microphone access in your browser, then try again.";
  }

  if ((error as { name?: string } | null)?.name === "NotFoundError") {
    return "No microphone was found on this computer.";
  }

  if (code !== undefined && TOKEN_REJECTED.has(code)) {
    return `Twilio rejected the calling token (error ${code}). Check that the API key, its secret and the TwiML App belong to the same Twilio account as the Account SID.`;
  }

  return code === undefined
    ? "The call could not be started. Please try again."
    : `The call could not be started (Twilio error ${code}).`;
}

export type BrowserCallEnd = {
  /** The call row the browser was given. */
  callId: number;
  /** Set when the call ended because something went wrong, not by hanging up. */
  error: BrowserCallError | null;
};

type Options = {
  /** Called when the call is over, however it ended. */
  onEnded?: (end: BrowserCallEnd) => void;
};

/**
 * One phone call from the browser (Twilio Voice SDK): the staff member talks
 * through the computer, and Twilio dials the patient from the organisation's
 * number. The SDK is loaded when a call starts, never on the server.
 */
export function useBrowserCall({ onEnded }: Options = {}) {
  const [state, setState] = useState<BrowserCallState>("idle");
  const [muted, setMuted] = useState(false);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const callIdRef = useRef<number | null>(null);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

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
    (error: BrowserCallError | null = null) => {
      const callId = callIdRef.current;

      // Twilio can report the end of a call more than once.
      if (callId === null) {
        return;
      }

      callIdRef.current = null;
      release();
      setMuted(false);
      setConnectedAt(null);
      setState("ended");
      onEndedRef.current?.({ callId, error });
    },
    [release],
  );

  // A page that is closed or navigated away from must not leave a call open.
  useEffect(() => release, [release]);

  /** Connects to Twilio with the token and the call row's id. Throws a
   *  BrowserCallError with a message fit to show when it cannot start. Errors
   *  after that (Twilio rejecting the token...) arrive through `onEnded`. */
  const start = useCallback(
    async (token: string, callId: number) => {
      setState("starting");
      callIdRef.current = callId;
      // Talking to a patient is not being idle: no automatic sign-out mid-call.
      setCallActive(true);

      try {
        const { Call: CallClass, Device: DeviceClass } = await import(
          "@twilio/voice-sdk"
        );

        const device = new DeviceClass(token, {
          closeProtection: true,
          codecPreferences: [CallClass.Codec.Opus, CallClass.Codec.PCMU],
        });
        deviceRef.current = device;

        // Token and connection problems are reported on the device.
        device.on("error", (error) => finish(new BrowserCallError(describe(error))));

        const call = await device.connect({
          params: { CallId: String(callId) },
        });
        callRef.current = call;
        setState("connecting");

        call.on("ringing", () => setState("ringing"));

        call.on("accept", () => {
          setState("connected");
          setConnectedAt(Date.now());
        });

        call.on("disconnect", () => finish());
        call.on("cancel", () => finish());
        call.on("reject", () => finish());
        call.on("error", (error) => finish(new BrowserCallError(describe(error))));
      } catch (error) {
        callIdRef.current = null;
        release();
        setState("idle");

        throw new BrowserCallError(describe(error));
      }
    },
    [finish, release],
  );

  const hangUp = useCallback(() => {
    if (callRef.current) {
      callRef.current.disconnect();
    } else {
      finish();
    }
  }, [finish]);

  const toggleMute = useCallback(() => {
    const call = callRef.current;

    if (!call) {
      return;
    }

    const next = !call.isMuted();
    call.mute(next);
    setMuted(next);
  }, []);

  const active =
    state === "starting" ||
    state === "connecting" ||
    state === "ringing" ||
    state === "connected";

  const seconds =
    connectedAt === null
      ? 0
      : Math.max(0, Math.floor((now - connectedAt) / 1000));

  return { state, active, muted, seconds, start, hangUp, toggleMute };
}
