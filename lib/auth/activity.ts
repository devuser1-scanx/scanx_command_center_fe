// lib/auth/activity.ts

/**
 * Shared bookkeeping for automatic logoff (idle timeout).
 *
 * "Activity" is real user input only: never the page's own background
 * polling, which would keep an unattended session alive forever. The last
 * activity time is kept in localStorage, so a person working in one tab keeps
 * every other tab of the app signed in too, and a sign-out in one tab reaches
 * the rest.
 */

const LAST_ACTIVITY_KEY = "scanx.lastActivity";
const SIGNED_OUT_KEY = "scanx.signedOut";
const SIGNED_OUT_REASON_KEY = "scanx.signedOutReason";

export type SignedOutReason = "idle" | "expired";

/** Used when localStorage is unavailable (private window, blocked storage). */
let lastActivityInMemory = 0;

/** A phone call from the browser is in progress: that is not "idle". */
let callActive = false;

export const SIGNED_OUT_STORAGE_KEY = SIGNED_OUT_KEY;

/** Records that the person is here, right now. */
export function touchActivity(): void {
  lastActivityInMemory = Date.now();

  try {
    window.localStorage.setItem(
      LAST_ACTIVITY_KEY,
      String(lastActivityInMemory),
    );
  } catch {
    // The in-memory time still protects this tab.
  }
}

/** When the person last did something, in any tab (milliseconds). */
export function getLastActivity(): number {
  let stored = 0;

  try {
    stored = Number(window.localStorage.getItem(LAST_ACTIVITY_KEY)) || 0;
  } catch {
    // Fall back to this tab's own time.
  }

  return Math.max(stored, lastActivityInMemory);
}

export function setCallActive(active: boolean): void {
  callActive = active;

  if (active) {
    touchActivity();
  }
}

export function isCallActive(): boolean {
  return callActive;
}

/** Remembers why the person was signed out, to say so on the sign-in page. */
export function rememberSignedOutReason(reason: SignedOutReason): void {
  try {
    // The first reason stands: a failed request after an idle sign-out must not
    // turn "inactivity" into a vaguer "expired".
    if (!window.sessionStorage.getItem(SIGNED_OUT_REASON_KEY)) {
      window.sessionStorage.setItem(SIGNED_OUT_REASON_KEY, reason);
    }
  } catch {
    // The message is a courtesy.
  }
}

/** The reason left by the last sign-out, if any; read once. */
export function takeSignedOutReason(): SignedOutReason | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const reason = window.sessionStorage.getItem(SIGNED_OUT_REASON_KEY);
    window.sessionStorage.removeItem(SIGNED_OUT_REASON_KEY);

    return reason === "idle" || reason === "expired" ? reason : null;
  } catch {
    return null;
  }
}

/** Tells the app's other tabs this one signed out (`reason:timestamp`). */
export function broadcastSignedOut(reason: SignedOutReason | "manual"): void {
  try {
    window.localStorage.setItem(SIGNED_OUT_KEY, `${reason}:${Date.now()}`);
  } catch {
    // Other tabs then sign out on their own idle timer or failed refresh.
  }
}

/** The reason in another tab's sign-out broadcast. */
export function parseSignedOutBroadcast(
  value: string | null,
): SignedOutReason | "manual" | null {
  const reason = value?.split(":")[0];

  return reason === "idle" || reason === "expired" || reason === "manual"
    ? reason
    : null;
}
