export type AchievementCategory = "distancia" | "frequencia" | "desafios" | "sequencia";

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  threshold: number;
  unit: string;
}
