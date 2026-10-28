// features/calls/calls-section.tsx

"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useCallEvents } from "@/features/calls/hooks/use-call-events";

const CallsLiveContext = createContext(false);

/**
 * Wraps every page of the Calls module: keeps one live-updates connection open
 * while the person is anywhere in it, and shares whether it is connected.
 */
export function CallsSection({ children }: { children: ReactNode }) {
  const { connected } = useCallEvents();

  return (
    <CallsLiveContext.Provider value={connected}>{children}</CallsLiveContext.Provider>
  );
}

export function useCallsLive(): boolean {
  return useContext(CallsLiveContext);
}
