import type { LngLat } from "@/types/map";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const EARTH_RADIUS_M = 6371000;

export interface GeneratedRoute {
  id: string;
  name: string;
  path: LngLat[];
  distanceKm: number;
  profile: "walking" | "cycling";
}

function offsetPoint(center: LngLat, bearingDeg: number, distanceM: number): LngLat {
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (center[1] * Math.PI) / 180;
  const lng1 = (center[0] * Math.PI) / 180;
  const angularDistance = distanceM / EARTH_RADIUS_M;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return [(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

/** Requests a real, street-snapped loop from Mapbox Directions: start → 3 waypoints spread around the center → back to start. */
async function fetchLoop(
  center: LngLat,
  radiusM: number,
  profile: "walking" | "cycling"
): Promise<{ path: LngLat[]; distanceKm: number } | null> {
  if (!MAPBOX_TOKEN) return null;

  const waypoints = [center, offsetPoint(center, 20, radiusM), offsetPoint(center, 140, radiusM), offsetPoint(center, 260, radiusM), center];
  const coords = waypoints.map((p) => p.join(",")).join(";");

  try {
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}`);
    url.searchParams.set("geometries", "geojson");
    url.searchParams.set("overview", "full");
    url.searchParams.set("access_token", MAPBOX_TOKEN);

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) return null;

    return { path: route.geometry.coordinates as LngLat[], distanceKm: route.distance / 1000 };
  } catch {
    return null;
  }
}

// Walking loops stay short enough to cover on foot; cycling loops go wider
// and include more options since a bike covers the same radius much faster.
const WALK_LOOP_RADII_M = [1200, 2200, 3500];
const CYCLE_LOOP_RADII_M = [450, 1000, 2000, 3500, 5500, 8000];

/** Generates a few real, street-snapped loop routes starting and ending at the given position — actual roads, via the Mapbox Directions API. */
export async function generateNearbyRoutes(center: LngLat, profile: "walking" | "cycling" = "walking"): Promise<GeneratedRoute[]> {
  const radii = profile === "cycling" ? CYCLE_LOOP_RADII_M : WALK_LOOP_RADII_M;
  const results = await Promise.all(radii.map((radius) => fetchLoop(center, radius, profile)));

  return results
    .map((result, index) =>
      result
        ? {
            id: `generated-${profile}-${index}`,
            name: `Volta de ${result.distanceKm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`,
            path: result.path,
            distanceKm: Math.round(result.distanceKm * 10) / 10,
            profile,
          }
        : null
    )
    .filter((route): route is GeneratedRoute => route !== null);
}

// Empirically, a loop's real street-snapped distance runs roughly 7.5x its
// requested radius (three offset waypoints plus the return leg) — used to
// pick a radius that lands close to a target distance.
const RADIUS_TO_DISTANCE_RATIO = 7.5;

/**
 * A real, street-snapped loop of about `targetDistanceKm`, starting and
 * ending exactly at `center` — used to turn any route (including a fixed
 * catalog route far from the rider) into one that actually returns to
 * wherever the rider currently is, instead of ending somewhere else on the map.
 */
export async function generateLoopOfDistance(
  center: LngLat,
  targetDistanceKm: number,
  profile: "walking" | "cycling"
): Promise<LngLat[] | null> {
  const radiusM = Math.max(300, (targetDistanceKm * 1000) / RADIUS_TO_DISTANCE_RATIO);
  const result = await fetchLoop(center, radiusM, profile);
  return result?.path ?? null;
}
