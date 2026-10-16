import type { LngLat } from "@/types/map";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface NavigationStep {
  /** Portuguese turn instruction we build ourselves from Mapbox's maneuver type/modifier/street name — not a translated string from the API. */
  instructionPt: string;
  /** Length of this step, in meters. */
  distanceMeters: number;
  location: LngLat;
}

export interface NavigationRoute {
  path: LngLat[];
  steps: NavigationStep[];
}

interface MapboxManeuver {
  type?: string;
  modifier?: string;
  location?: [number, number];
}

interface MapboxStep {
  maneuver?: MapboxManeuver;
  distance?: number;
  name?: string;
}

interface MapboxLeg {
  steps?: MapboxStep[];
}

const MODIFIER_PT: Record<string, string> = {
  uturn: "Faça o retorno",
  "sharp right": "Vire fortemente à direita",
  right: "Vire à direita",
  "slight right": "Mantenha-se à direita",
  straight: "Siga em frente",
  "slight left": "Mantenha-se à esquerda",
  left: "Vire à esquerda",
  "sharp left": "Vire fortemente à esquerda",
};

function describeManeuver(type: string | undefined, modifier: string | undefined, streetName: string): string {
  const street = streetName ? ` na ${streetName}` : "";
  const turn = modifier ? (MODIFIER_PT[modifier] ?? "Siga em frente") : "Siga em frente";

  switch (type) {
    case "depart":
      return `Siga em frente${street}`;
    case "arrive":
      return "Você chegou ao seu destino";
    case "roundabout":
    case "rotary":
      return `Entre na rotatória${street}`;
    case "merge":
      return `Mantenha-se na via${street}`;
    case "end of road":
      return `${turn}${street}`;
    case "continue":
    case "new name":
      return `Continue${street}`;
    default:
      return `${turn}${street}`;
  }
}

/** Keeps the waypoint count under Mapbox's 25-coordinate cap for a Directions request. */
function downsampleWaypoints(path: LngLat[], maxPoints = 20): LngLat[] {
  if (path.length <= maxPoints) return path;
  const step = (path.length - 1) / (maxPoints - 1);
  const sampled: LngLat[] = [];
  for (let i = 0; i < maxPoints; i++) sampled.push(path[Math.round(i * step)]);
  return sampled;
}

/**
 * Real turn-by-turn steps from the Mapbox Directions API — actual street
 * names and turn directions for the given path, re-snapped to real roads.
 * Used to drive spoken GPS-style navigation while following a route.
 */
export async function fetchNavigationSteps(path: LngLat[], profile: "walking" | "cycling"): Promise<NavigationRoute | null> {
  if (!MAPBOX_TOKEN || path.length < 2) return null;

  const waypoints = downsampleWaypoints(path);
  const coords = waypoints.map((p) => p.join(",")).join(";");

  try {
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}`);
    url.searchParams.set("geometries", "geojson");
    url.searchParams.set("overview", "full");
    url.searchParams.set("steps", "true");
    url.searchParams.set("access_token", MAPBOX_TOKEN);

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) return null;

    const steps: NavigationStep[] = (route.legs as MapboxLeg[] | undefined ?? []).flatMap((leg) =>
      (leg.steps ?? []).map((step) => ({
        instructionPt: describeManeuver(step.maneuver?.type, step.maneuver?.modifier, step.name ?? ""),
        distanceMeters: step.distance ?? 0,
        location: (step.maneuver?.location as LngLat | undefined) ?? waypoints[0],
      }))
    );

    return { path: route.geometry.coordinates as LngLat[], steps };
  } catch {
    return null;
  }
}

export interface DirectionsResult {
  path: LngLat[];
  distanceKm: number;
  durationMin: number;
}

/**
 * A single point-to-point route from Mapbox Directions — for "how do I get
 * from here to this destination" previews (Explorar's search-a-destination
 * flow), as opposed to fetchNavigationSteps' turn-by-turn re-snap of an
 * already-known multi-point route.
 */
export async function fetchDirectionsToDestination(
  origin: LngLat,
  destination: LngLat,
  profile: "walking" | "cycling" = "walking"
): Promise<DirectionsResult | null> {
  if (!MAPBOX_TOKEN) return null;

  try {
    const coords = `${origin.join(",")};${destination.join(",")}`;
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}`);
    url.searchParams.set("geometries", "geojson");
    url.searchParams.set("overview", "full");
    url.searchParams.set("access_token", MAPBOX_TOKEN);

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) return null;

    return {
      path: route.geometry.coordinates as LngLat[],
      distanceKm: route.distance / 1000,
      durationMin: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}
