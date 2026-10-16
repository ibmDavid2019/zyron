import { Marker } from "react-map-gl/mapbox";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LngLat } from "@/types/map";

interface EventMarkerProps {
  position: LngLat;
  label: string;
  selected?: boolean;
  onSelect: () => void;
}

export function EventMarker({ position, label, selected, onSelect }: EventMarkerProps) {
  return (
    <Marker longitude={position[0]} latitude={position[1]} anchor="bottom">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        aria-label={label}
        title={label}
        className={cn(
          "flex items-center justify-center rounded-full border shadow-lg transition-all hover:scale-105",
          selected
            ? "gap-1.5 border-warning bg-warning px-2.5 py-1.5 text-xs font-semibold text-white"
            : "size-7 border-border bg-card text-warning"
        )}
      >
        <CalendarDays className="size-3.5 shrink-0" />
        {selected && label}
      </button>
    </Marker>
  );
}
