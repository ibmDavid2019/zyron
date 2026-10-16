import { Marker } from "react-map-gl/mapbox";
import { OUTDOOR_TYPE_CONFIG } from "@/constants/activities";
import { cn } from "@/lib/utils";
import type { LngLat } from "@/types/map";
import type { OutdoorActivityType } from "@/types/route";

interface RouteMarkerProps {
  position: LngLat;
  type: OutdoorActivityType;
  label: string;
  selected?: boolean;
  onSelect: () => void;
}

export function RouteMarker({ position, type, label, selected, onSelect }: RouteMarkerProps) {
  const config = OUTDOOR_TYPE_CONFIG[type];

  return (
    <Marker longitude={position[0]} latitude={position[1]} anchor="bottom">
      <button
        type="button"
        onClick={(event) => {
          // Custom markers sit in the map's shared interaction container, so
          // a click here also bubbles into the map's own onClick — stop it
          // or the map handler immediately clears this selection again.
          event.stopPropagation();
          onSelect();
        }}
        aria-label={label}
        title={label}
        className={cn(
          "flex items-center justify-center rounded-full border shadow-lg transition-all hover:scale-105",
          selected
            ? "gap-1.5 border-brand bg-brand px-2.5 py-1.5 text-xs font-semibold text-brand-foreground"
            : "size-7 border-border bg-card text-foreground"
        )}
      >
        <config.icon className="size-3.5 shrink-0" />
        {selected && label}
      </button>
    </Marker>
  );
}
