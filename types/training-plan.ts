export type TrainingLevel = "Iniciante" | "Intermediário" | "Avançado";

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  goal: string;
  level: TrainingLevel;
  durationWeeks: number;
  sessionsPerWeek: number;
}
