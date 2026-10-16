import type { OutdoorActivityType } from "@/types/route";

export interface SportEvent {
  id: string;
  name: string;
  type: OutdoorActivityType;
  date: string;
  location: string;
  distanceKm: number;
  participantsCount: number;
}
