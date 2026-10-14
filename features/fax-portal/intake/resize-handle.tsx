// features/fax-portal/intake/resize-handle.tsx

"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

type ResizeHandleProps = {
  /** "vertical" is a bar between two columns; "horizontal" a bar under a panel. */
  orientation: "vertical" | "horizontal";
  label: string;
  className?: string;
  /** Pointer went down: a good moment to remember the starting size. */
  onResizeStart: () => void;
  /** Distance dragged since the pointer went down, in pixels. */
  onResize: (deltaPx: number) => void;
  onResizeEnd: () => void;
  /** Arrow keys: -1 shrinks, 1 grows. */
  onStep: (direction: -1 | 1) => void;
};

/**
 * A drag handle with keyboard support. The pointer is captured, so the drag
 * keeps working when it passes over the PDF (an iframe, which would
 * otherwise swallow the mouse events).
 */
export function ResizeHandle({
  orientation,
  label,
  className,
  onResizeStart,
  onResize,
  onResizeEnd,
  onStep,
}: ResizeHandleProps) {
  const startRef = useRef<number | null>(null);
  const isVertical = orientation === "vertical";

  function position(event: PointerEvent<HTMLDivElement>): number {
    return isVertical ? event.clientX : event.clientY;
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startRef.current = position(event);
    onResizeStart();
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (startRef.current !== null) {
      onResize(position(event) - startRef.current);
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startRef.current === null) {
      return;
    }

    startRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onResizeEnd();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const shrink = isVertical ? "ArrowLeft" : "ArrowUp";
    const grow = isVertical ? "ArrowRight" : "ArrowDown";

    if (event.key === shrink || event.key === grow) {
      event.preventDefault();
      onStep(event.key === grow ? 1 : -1);
    }
  }

  return (
    <div
      role="separator"
      aria-orientation={isVertical ? "vertical" : "horizontal"}
      aria-label={label}
      title={`${label} (drag, or use the arrow keys)`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={cn(
        "group flex shrink-0 touch-none items-center justify-center rounded outline-none transition-colors hover:bg-[#e9dfcd] focus-visible:bg-[#e9dfcd] active:bg-[#d9c9a8]",
        isVertical ? "cursor-col-resize" : "cursor-row-resize",
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full bg-[#c9bda5] group-hover:bg-[#8b6f47] group-focus-visible:bg-[#8b6f47]",
          isVertical ? "h-10 w-1" : "h-1 w-10",
        )}
      />
    </div>
  );
}
