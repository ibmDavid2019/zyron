import type { ActivityType } from "@/types/activity";
import type { LngLat } from "@/types/map";

const KEY = "zyron:follow-route";

export interface FollowRoute {
  name: string;
  /** Target distance, in km — only used to build a fresh loop when `path` isn't provided. */
  distanceKm: number;
  type: ActivityType;
  /** A real, already-known path to follow as-is (e.g. directions to a searched destination) — when omitted, /map builds a fresh loop of `distanceKm` from wherever the rider actually starts instead. */
  path?: LngLat[];
}

/** One-shot handoff from a route's "Usar esta rota" button to /map's recording mode — written just before navigating, consumed once on arrival so it never lingers into an unrelated session. */
export function stashFollowRoute(route: FollowRoute) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(route));
}

export function takeFollowRoute(): FollowRoute | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
