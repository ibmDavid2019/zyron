import { Marker } from "react-map-gl/mapbox";
import { ACTIVITY_TYPE_CONFIG } from "@/constants/activities";
import { cn } from "@/lib/utils";
import type { ActivityType } from "@/types/activity";
import type { LngLat } from "@/types/map";
import { formatDistance } from "@/utils/format";

interface ActivityMarkerProps {
  position: LngLat;
  type: ActivityType;
  distanceKm: number;
  selected?: boolean;
  onSelect: () => void;
}

export function ActivityMarker({ position, type, distanceKm, selected, onSelect }: ActivityMarkerProps) {
  const config = ACTIVITY_TYPE_CONFIG[type];

  return (
    <Marker longitude={position[0]} latitude={position[1]} anchor="bottom">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        aria-label={formatDistance(distanceKm)}
        title={formatDistance(distanceKm)}
        className={cn(
          "flex items-center justify-center rounded-full border shadow-lg transition-all hover:scale-105",
          selected
            ? "gap-1.5 border-brand bg-brand px-2.5 py-1.5 text-xs font-semibold text-brand-foreground"
            : "size-7 border-border bg-card text-brand"
        )}
      >
        <config.icon className="size-3.5 shrink-0" />
        {selected && formatDistance(distanceKm)}
      </button>
    </Marker>
  );
}
