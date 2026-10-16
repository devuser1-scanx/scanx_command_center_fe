// components/auth/idle-timeout-guard.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useSessionPolicy } from "@/features/auth/hooks/use-session-policy";
import {
  SIGNED_OUT_STORAGE_KEY,
  broadcastSignedOut,
  getLastActivity,
  isCallActive,
  parseSignedOutBroadcast,
  rememberSignedOutReason,
  touchActivity,
} from "@/lib/auth/activity";
import { useAuthStore } from "@/lib/auth/auth-store";

/** Real input only. Background polling and timers never count as activity. */
const INPUT_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "touchstart",
  "wheel",
  "scroll",
] as const;

function clock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Automatic logoff. After the server's idle timeout with no real input (in any
 * tab) the user is signed out, with a warning first and a "Stay signed in"
 * button. A phone call in progress counts as activity. Signing out in one tab
 * signs out the others.
 */
export function IdleTimeoutGuard() {
  const policy = useSessionPolicy();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Read by the input listener, which must not restart whenever they change.
  const warningOpen = useRef(false);
  const signingOut = useRef(false);
  const signOutRef = useRef(logout.mutate);

  useEffect(() => {
    signOutRef.current = logout.mutate;
  }, [logout.mutate]);

  const idleMs = policy.idle_timeout_seconds * 1000;
  const warnMs =
    Math.min(policy.warning_seconds, policy.idle_timeout_seconds) * 1000;

  // Real input counts as activity (throttled to once a second). Once the
  // warning is showing, only the button does: moving the mouse must not hide
  // it before the person has seen it.
  useEffect(() => {
    touchActivity();

    let lastWrite = 0;

    function onInput() {
      if (warningOpen.current) {
        return;
      }

      const now = Date.now();

      if (now - lastWrite > 1000) {
        lastWrite = now;
        touchActivity();
      }
    }

    for (const name of INPUT_EVENTS) {
      window.addEventListener(name, onInput, { passive: true });
    }

    return () => {
      for (const name of INPUT_EVENTS) {
        window.removeEventListener(name, onInput);
      }
    };
  }, []);

  // The clock: warn, then sign out.
  useEffect(() => {
    const interval = setInterval(() => {
      if (signingOut.current) {
        return;
      }

      // Talking to a patient is not being idle.
      if (isCallActive()) {
        touchActivity();
        warningOpen.current = false;
        setSecondsLeft(null);

        return;
      }

      const idle = Date.now() - getLastActivity();

      if (idle >= idleMs) {
        signingOut.current = true;
        warningOpen.current = false;
        setSecondsLeft(null);
        rememberSignedOutReason("idle");
        broadcastSignedOut("idle");
        signOutRef.current();

        return;
      }

      if (idle >= idleMs - warnMs) {
        warningOpen.current = true;
        setSecondsLeft(Math.ceil((idleMs - idle) / 1000));
      } else {
        warningOpen.current = false;
        setSecondsLeft(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [idleMs, warnMs]);

  // Another tab signed out (idle or by hand): this one follows.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== SIGNED_OUT_STORAGE_KEY) {
        return;
      }

      const reason = parseSignedOutBroadcast(event.newValue);

      if (reason === null) {
        return;
      }

      if (reason !== "manual") {
        rememberSignedOutReason(reason);
      }

      signingOut.current = true;
      clearAuth();
      queryClient.clear();
    }

    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, [clearAuth, queryClient]);

  function stay() {
    touchActivity();
    warningOpen.current = false;
    setSecondsLeft(null);
  }

  if (secondsLeft === null) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="idle-title"
        aria-describedby="idle-description"
        className="w-full max-w-sm rounded-2xl border border-[#e4ddd0] bg-white p-6 shadow-xl"
      >
        <h2 id="idle-title" className="text-lg font-bold text-[#2d2d2d]">
          Still there?
        </h2>

        <p
          id="idle-description"
          className="mt-2 text-sm leading-6 text-[#666666]"
        >
          To protect patient information you will be signed out in{" "}
          <strong className="font-mono text-[#2d2d2d]">
            {clock(secondsLeft)}
          </strong>{" "}
          because there has been no activity. Anything not saved will be lost.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              signingOut.current = true;
              signOutRef.current();
            }}
          >
            Sign out now
          </Button>

          <Button type="button" autoFocus onClick={stay}>
            Stay signed in
          </Button>
        </div>
      </div>
    </div>
  );
}
