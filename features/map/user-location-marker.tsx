import { Marker } from "react-map-gl/mapbox";
import type { LngLat } from "@/types/map";

export function UserLocationMarker({ position }: { position: LngLat }) {
  return (
    <Marker longitude={position[0]} latitude={position[1]} anchor="center">
      <span className="relative flex size-4">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
        <span className="relative flex size-4 items-center justify-center rounded-full border-2 border-white bg-brand shadow-lg" />
      </span>
    </Marker>
  );
}
