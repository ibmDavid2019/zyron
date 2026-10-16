import type { Map as MapboxMap } from "mapbox-gl";

/**
 * Makes street-name labels easier to read on the base Mapbox styles: a bit
 * bigger at every zoom level and with a stronger white halo for contrast
 * against roads/terrain. Re-run this after every style change (switching
 * Mapa/Satélite/Terreno reloads the whole style and resets these tweaks).
 */
export function boostRoadLabelVisibility(map: MapboxMap) {
  let style: ReturnType<MapboxMap["getStyle"]>;
  try {
    style = map.getStyle();
  } catch {
    return;
  }
  if (!style?.layers) return;

  for (const layer of style.layers) {
    if (layer.type !== "symbol") continue;
    if (!/road.*label|street.*label/i.test(layer.id)) continue;

    try {
      const currentSize = map.getLayoutProperty(layer.id, "text-size") ?? 11;
      map.setLayoutProperty(layer.id, "text-size", ["*", 1.25, currentSize]);
      map.setPaintProperty(layer.id, "text-halo-width", 1.6);
      map.setPaintProperty(layer.id, "text-halo-color", "rgba(255, 255, 255, 0.95)");
    } catch {
      // Not every matching layer supports all of these properties — skip it.
    }
  }
}
