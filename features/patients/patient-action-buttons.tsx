// features/patients/patient-action-buttons.tsx

"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function ActionButton({
  label,
  className,
  onClick,
}: {
  label: string;
  className: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-md px-4 py-2 text-sm font-semibold text-white transition",
        className,
      )}
      onClick={onClick}
      title={onClick ? undefined : "Not yet wired to a backend action"}
    >
      {label}
    </button>
  );
}

export function ActionMenuButton({
  label,
  className,
  options,
}: {
  label: string;
  className: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          "rounded-md px-4 py-2 text-sm font-semibold text-white transition",
          className,
        )}
        onFocus={() => setOpen(true)}
        title="Not yet wired to a backend action"
      >
        {label}
      </button>

      {/*
       * top-full with no gap so the pointer never crosses dead space
       * between the button and the menu - a gap there would fire
       * onMouseLeave before the menu is reached, making it unclickable.
       */}
      {open && (
        <div className="absolute left-0 top-full z-40 min-w-[9rem] overflow-hidden rounded-md border border-[#e4ddd0] bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className="block w-full px-4 py-10 text-left text-lg font-semibold text-[#2d2d2d] transition hover:bg-[#fbfaf7]"
              title="Not yet wired to a backend action"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
