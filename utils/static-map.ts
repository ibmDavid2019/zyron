import type { LngLat } from "@/types/map";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function encodeSignedNumber(num: number): string {
  let sgn = num << 1;
  if (num < 0) sgn = ~sgn;
  let output = "";
  while (sgn >= 0x20) {
    output += String.fromCharCode((0x20 | (sgn & 0x1f)) + 63);
    sgn >>= 5;
  }
  output += String.fromCharCode(sgn + 63);
  return output;
}

/** Google/Mapbox polyline encoding (precision 5) for a [lng, lat][] path. */
function encodePolyline(path: LngLat[]): string {
  const factor = 1e5;
  let output = "";
  let prevLat = 0;
  let prevLng = 0;
  for (const [lng, lat] of path) {
    const lat5 = Math.round(lat * factor);
    const lng5 = Math.round(lng * factor);
    output += encodeSignedNumber(lat5 - prevLat);
    output += encodeSignedNumber(lng5 - prevLng);
    prevLat = lat5;
    prevLng = lng5;
  }
  return output;
}

/** Keeps the overlay URL short: Mapbox's Static Images API caps the whole request around 8KB. Also reused to cap point counts for the share-editor canvas route drawing (see utils/route-canvas.ts). */
export function simplifyPath(path: LngLat[], maxPoints: number): LngLat[] {
  if (path.length <= maxPoints) return path;
  const step = path.length / maxPoints;
  const sampled: LngLat[] = [];
  for (let i = 0; i < maxPoints; i++) sampled.push(path[Math.floor(i * step)]);
  sampled.push(path[path.length - 1]);
  return sampled;
}

/**
 * A real Mapbox Static Images API thumbnail — actual street basemap with the
 * route line drawn on top, auto-framed to fit it — used for route-card
 * previews instead of a decorative illustration.
 */
export function staticRouteMapUrl(path: LngLat[], width = 400, height = 200, color = "22c55e"): string | null {
  if (!MAPBOX_TOKEN || path.length < 2) return null;
  const encoded = encodePolyline(simplifyPath(path, 100));
  const overlay = `path-3+${color}-0.9(${encodeURIComponent(encoded)})`;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlay}/auto/${width}x${height}@2x?padding=30&access_token=${MAPBOX_TOKEN}`;
}
