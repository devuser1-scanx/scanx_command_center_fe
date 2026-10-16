// features/auth/hooks/use-session-policy.ts

import { useQuery } from "@tanstack/react-query";

import { getSessionPolicy } from "@/features/auth/api/auth-api";
import type { SessionPolicy } from "@/features/auth/types/auth-types";

/**
 * What applies until the server's rules arrive (or if they cannot be loaded):
 * the same as the server's defaults, so the timer always runs.
 */
export const DEFAULT_SESSION_POLICY: SessionPolicy = {
  idle_timeout_seconds: 15 * 60,
  warning_seconds: 2 * 60,
  max_session_seconds: 12 * 60 * 60,
};

/** The automatic-logoff rules, set by the server and fetched once per session. */
export function useSessionPolicy(): SessionPolicy {
  const query = useQuery<SessionPolicy, Error>({
    queryKey: ["auth", "session-policy"],
    queryFn: getSessionPolicy,
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });

  return query.data ?? DEFAULT_SESSION_POLICY;
}
