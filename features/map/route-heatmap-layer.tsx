import { Layer, Source } from "react-map-gl/mapbox";
import type { LngLat } from "@/types/map";

interface RouteHeatmapLayerProps {
  points: LngLat[];
}

/**
 * Density heatmap built from the points currently on screen (route paths +
 * generated routes + mock activity locations) — reflects this app's current
 * dataset, not real aggregated multi-user traffic.
 */
export function RouteHeatmapLayer({ points }: RouteHeatmapLayerProps) {
  return (
    <Source
      id="route-heatmap-source"
      type="geojson"
      data={{
        type: "FeatureCollection",
        features: points.map((point) => ({
          type: "Feature" as const,
          properties: {},
          geometry: { type: "Point" as const, coordinates: point },
        })),
      }}
    >
      <Layer
        id="route-heatmap-layer"
        type="heatmap"
        paint={{
          "heatmap-weight": 0.6,
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 1, 16, 2.5],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "rgba(46,107,255,0)",
            0.3, "rgba(46,107,255,0.35)",
            0.6, "rgba(34,197,94,0.55)",
            1, "rgba(250,204,21,0.85)",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 12, 16, 28],
          "heatmap-opacity": 0.75,
        }}
      />
    </Source>
  );
}
