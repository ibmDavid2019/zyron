import { Marker } from "react-map-gl/mapbox";
import { Navigation } from "lucide-react";
import type { LngLat } from "@/types/map";

interface DirectionMarkerProps {
  position: LngLat;
  /** Degrees clockwise from north, or null before we have two GPS fixes to derive one from. */
  bearing: number | null;
}

/** Live position marker that rotates to point the way you're moving — used instead of the plain dot while following a route. */
export function DirectionMarker({ position, bearing }: DirectionMarkerProps) {
  return (
    <Marker longitude={position[0]} latitude={position[1]} anchor="center">
      <span className="relative flex size-9 items-center justify-center">
        <span className="absolute inline-flex size-9 animate-ping rounded-full bg-brand opacity-40" />
        <span
          className="relative flex size-9 items-center justify-center rounded-full border-2 border-white bg-brand text-brand-foreground shadow-lg transition-transform duration-300"
          style={{ transform: `rotate(${bearing ?? 0}deg)` }}
        >
          <Navigation className="size-4.5 fill-current" />
        </span>
      </span>
    </Marker>
  );
}
