"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

interface MapBottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Lets the drag handle toggle between the normal (70vh) and a taller (92vh) height — off by default so other sheets keep their fixed size. */
  expandable?: boolean;
}

/**
 * Docks selection details to the bottom of the screen on mobile (sheet) and
 * to the right edge of the map on desktop (side panel) — the same content,
 * repositioned by breakpoint rather than duplicated.
 */
export function MapBottomSheet({ open, onClose, children, expandable = false }: MapBottomSheetProps) {
  const [expanded, setExpanded] = useState(false);
  if (!open) return null;

  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-4 lg:slide-in-from-right-4 absolute inset-x-0 bottom-0 z-20 overflow-y-auto rounded-t-2xl border-t border-border bg-card shadow-2xl duration-200 lg:inset-x-auto lg:bottom-4 lg:right-4 lg:top-4 lg:max-h-none lg:w-80 lg:rounded-2xl lg:border ${
        expanded ? "max-h-[92vh]" : "max-h-[70vh]"
      }`}
    >
      <button
        type="button"
        onClick={expandable ? () => setExpanded((value) => !value) : undefined}
        aria-label={expandable ? (expanded ? "Recolher" : "Expandir") : undefined}
        className={`sticky top-0 flex w-full justify-center bg-card pb-1 pt-2.5 lg:hidden ${expandable ? "cursor-pointer" : "cursor-default"}`}
      >
        <span className="h-1 w-10 rounded-full bg-border" />
      </button>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <div className="px-5 pt-1" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}>
        {children}
      </div>
    </div>
  );
}
