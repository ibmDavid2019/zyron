import { Layer, Source } from "react-map-gl/mapbox";
import type { LngLat } from "@/types/map";

interface RouteLineProps {
  id: string;
  path: LngLat[];
  color?: string;
  width?: number;
  dashed?: boolean;
}

/** Renders a GeoJSON LineString as a colored route line on the map. */
export function RouteLine({ id, path, color = "#2E6BFF", width = 4, dashed = false }: RouteLineProps) {
  return (
    <Source
      id={`route-source-${id}`}
      type="geojson"
      data={{
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: path },
      }}
    >
      <Layer
        id={`route-line-${id}`}
        type="line"
        layout={{ "line-cap": "round", "line-join": "round" }}
        paint={{
          "line-color": color,
          "line-width": width,
          ...(dashed ? { "line-dasharray": [0.2, 1.6] } : {}),
        }}
      />
    </Source>
  );
}
