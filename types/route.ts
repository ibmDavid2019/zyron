import type { ActivityType } from "@/types/activity";

/** Broader than ActivityType: routes and events also support trail outings. */
export type OutdoorActivityType = ActivityType | "trilha";

export type RouteDifficulty = "Fácil" | "Moderada" | "Difícil";

export interface TrailRoute {
  id: string;
  name: string;
  city: string;
  type: OutdoorActivityType;
  distanceKm: number;
  elevationM: number;
  difficulty: RouteDifficulty;
  routeVariant: 1 | 2 | 3;
  savedByCount: number;
}
