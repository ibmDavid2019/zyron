import type { LngLat } from "@/types/map";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/** Reverse-geocodes a GPS position to its city name via Mapbox, or null if unavailable. */
export async function reverseGeocodeCity(position: LngLat): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null;

  try {
    const url = new URL("https://api.mapbox.com/search/geocode/v6/reverse");
    url.searchParams.set("longitude", String(position[0]));
    url.searchParams.set("latitude", String(position[1]));
    url.searchParams.set("access_token", MAPBOX_TOKEN);
    url.searchParams.set("types", "place");
    url.searchParams.set("language", "pt");

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    const feature = data.features?.[0];
    const name: string | undefined = feature?.properties?.name;
    const region: string | undefined = feature?.properties?.context?.region?.region_code;
    if (!name) return null;

    return region ? `${name}, ${region}` : name;
  } catch {
    return null;
  }
}

/** Reverse-geocodes a GPS position to its neighborhood name via Mapbox, or null if unavailable. */
export async function reverseGeocodeNeighborhood(position: LngLat): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null;

  try {
    const url = new URL("https://api.mapbox.com/search/geocode/v6/reverse");
    url.searchParams.set("longitude", String(position[0]));
    url.searchParams.set("latitude", String(position[1]));
    url.searchParams.set("access_token", MAPBOX_TOKEN);
    url.searchParams.set("types", "neighborhood");
    url.searchParams.set("language", "pt");

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data = await response.json();
    const feature = data.features?.[0];
    return feature?.properties?.name ?? null;
  } catch {
    return null;
  }
}
