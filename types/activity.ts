import type { LngLat } from "@/types/map";

export type ActivityType = "corrida" | "caminhada" | "ciclismo";

export type ActivityPrivacy = "publico" | "amigos" | "privado";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  /** ISO date string. */
  date: string;
  distanceKm: number;
  durationSeconds: number;
  calories: number;
  /** True when `calories` is a formula-based estimate rather than a real biometric measurement (which would need a heart-rate sensor and the user's weight/VO2max). */
  caloriesEstimated?: boolean;
  elevationM: number;
  /** "gps" when `elevationM` came from real altitude readings during recording; "estimate" when the device never reported altitude and it was derived from distance instead. Undefined for older/demo activities. */
  elevationSource?: "gps" | "estimate";
  /** The real GPS-recorded trajectory, when this activity came from a live recording — absent for demo/legacy activities. */
  path?: LngLat[];
  /** City the activity was recorded in, when known (e.g. via GPS reverse geocoding). */
  city?: string;
  privacy: ActivityPrivacy;
  /** Route shape variant used to pick a mock map illustration (1-3) — only relevant when `path` is absent. */
  routeVariant: 1 | 2 | 3;
  /** Pace in seconds/km per kilometer split, for the pace chart. */
  splitsSecondsPerKm: number[];
  likes: number;
  comments: number;
}
