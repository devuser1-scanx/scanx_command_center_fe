// hooks/use-stored-number.ts

import { useCallback, useState } from "react";

type Options = {
  min: number;
  max: number;
};

function clamp(value: number, { min, max }: Options): number {
  return Math.min(max, Math.max(min, value));
}

function readStored(key: string, options: Options): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw === null ? Number.NaN : Number(raw);

    return Number.isFinite(parsed) ? clamp(parsed, options) : null;
  } catch {
    // Storage can be unavailable (private windows, blocked site data).
    return null;
  }
}

/**
 * A number the user can change and that is remembered on this device
 * (a panel size, for example). Falls back to `fallback` when nothing valid
 * is stored or storage is unavailable.
 */
export function useStoredNumber(
  key: string,
  fallback: number,
  options: Options,
) {
  const { min, max } = options;

  const [value, setValue] = useState<number>(() =>
    typeof window === "undefined"
      ? fallback
      : (readStored(key, { min, max }) ?? fallback),
  );

  const update = useCallback(
    (next: number) => {
      const clamped = clamp(next, { min, max });

      setValue(clamped);

      try {
        window.localStorage.setItem(key, String(clamped));
      } catch {
        // Not remembered; the size still applies for this visit.
      }
    },
    [key, min, max],
  );

  return [value, update] as const;
}
