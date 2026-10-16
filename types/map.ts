export type MapBaseStyle = "streets" | "satellite" | "outdoors";

export interface MapLayerVisibility {
  routes: boolean;
  activities: boolean;
  events: boolean;
}

/** [longitude, latitude], matching GeoJSON / Mapbox coordinate order. */
export type LngLat = [number, number];

export type MapMode = "view" | "explore" | "create-route" | "record";

export interface GpsTrackPoint {
  position: LngLat;
  timestamp: number;
  /** Meters above sea level, when the device's GPS chip reports it — null on hardware/browsers that don't supply altitude. */
  altitude: number | null;
}

export interface RouteGeo {
  path: LngLat[];
  rating: number;
}

export interface ActivityGeo {
  position: LngLat;
}

export interface EventGeo {
  position: LngLat;
}

export type MapSelection =
  | { type: "route"; id: string }
  | { type: "activity"; id: string }
  | { type: "event"; id: string }
  | { type: "generated"; id: string }
  | null;
