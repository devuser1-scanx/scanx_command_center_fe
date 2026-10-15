// components/layout/mobile-sidebar.tsx

"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { SidebarBody } from "@/components/layout/admin-sidebar";

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * The navigation for screens below the large breakpoint, where the fixed
 * sidebar is hidden: a menu that slides in over the page. It closes on
 * Escape, on a tap outside it, and when a link is followed.
 */
export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    // The page behind the menu must not scroll while it is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-[#111827] text-white shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute top-3 right-3 z-10 rounded-md p-2 text-[#d8d2c7] hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <SidebarBody onNavigate={onClose} />
      </aside>
    </div>
  );
}
