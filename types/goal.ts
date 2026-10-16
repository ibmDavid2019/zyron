export interface Goal {
  label: string;
  targetKm: number;
  currentKm: number;
}

export interface RecommendedWorkout {
  title: string;
  distanceKm: number;
  estimatedMinutes: number;
  intensity: "Leve" | "Moderada" | "Intensa";
}
