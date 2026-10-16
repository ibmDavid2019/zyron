"use client";

import { Minus, Plus } from "lucide-react";
import type { MapRef } from "react-map-gl/mapbox";
import { cn } from "@/lib/utils";

export function MapControls({ mapInstance, className }: { mapInstance: MapRef | null; className?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg", className)}>
      <button
        type="button"
        onClick={() => mapInstance?.zoomIn({ duration: 200 })}
        aria-label="Aumentar zoom"
        className="flex size-10 items-center justify-center border-b border-border text-foreground transition-colors hover:bg-muted"
      >
        <Plus className="size-4.5" />
      </button>
      <button
        type="button"
        onClick={() => mapInstance?.zoomOut({ duration: 200 })}
        aria-label="Diminuir zoom"
        className="flex size-10 items-center justify-center text-foreground transition-colors hover:bg-muted"
      >
        <Minus className="size-4.5" />
      </button>
    </div>
  );
}
