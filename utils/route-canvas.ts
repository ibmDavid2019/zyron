import type { LngLat } from "@/types/map";
import { boundsOf } from "@/utils/geo";
import { simplifyPath } from "@/utils/static-map";

/** Caps route complexity for on-canvas drawing — matches the point budget already used for the Mapbox static-image overlay in utils/static-map.ts. */
const MAX_ROUTE_POINTS = 200;

/**
 * Projects a real GPS path into pixel coordinates inside a `width`x`height`
 * box, preserving aspect ratio (never stretching the route) and centering
 * it within the box with the given padding. Returns an empty array for a
 * path too short to draw a line.
 */
export function projectPathToBox(
  path: LngLat[],
  width: number,
  height: number,
  padding: number
): [number, number][] {
  if (path.length < 2) return [];
  const simplified = simplifyPath(path, MAX_ROUTE_POINTS);
  const [[minLng, minLat], [maxLng, maxLat]] = boundsOf(simplified);

  const boxW = Math.max(width - padding * 2, 1);
  const boxH = Math.max(height - padding * 2, 1);

  // Longitude degrees compress with latitude — correct for that so a route
  // recorded far from the equator isn't visually distorted.
  const midLatRad = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const lngSpan = Math.max((maxLng - minLng) * Math.cos(midLatRad), 1e-9);
  const latSpan = Math.max(maxLat - minLat, 1e-9);

  const scale = Math.min(boxW / lngSpan, boxH / latSpan);
  const drawnW = lngSpan * scale;
  const drawnH = latSpan * scale;
  const offsetX = padding + (boxW - drawnW) / 2;
  const offsetY = padding + (boxH - drawnH) / 2;

  return simplified.map(([lng, lat]) => {
    const x = offsetX + (lng - minLng) * Math.cos(midLatRad) * scale;
    // Canvas y grows downward; latitude grows northward — flip it.
    const y = offsetY + (maxLat - lat) * scale;
    return [x, y];
  });
}
